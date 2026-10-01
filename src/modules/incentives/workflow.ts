import { claimSchema, type Claim } from './model.ts'
import { readClaims, replaceClaim, CLAIM_STORAGE_KEY } from './repository.ts'
import { policyById, quoteClaim, requireAccount, validateAssignments } from '../configuration/store.ts'
import { decimalUnits } from '../activities/profiles.ts'
import type { DemoUser } from '../activities/model.ts'

function current(id: string, expected: number) {
  const items = readClaims(), item = items.find(claim => claim.id === id)
  if (!item || item.version !== expected) throw new Error('Klaim tidak ditemukan atau berubah di tab lain. Muat ulang sebelum melanjutkan.')
  return { items, item }
}
function commit(items: Claim[], item: Claim, user: DemoUser, description: string) {
  requireAccount(user)
  const at = new Date().toISOString()
  return replaceClaim(items, claimSchema.parse({ ...item, version: item.version + 1, updatedAt: at, history: [...item.history, { at, actor: user.name, description }] }))
}
export async function administerClaim(id: string, user: DemoUser, expected: number, action: 'START_CHECK' | 'ASSIGN', reviewerIds: string[] = []) {
  if (user.role !== 'OPERATOR') throw new Error('Administrasi klaim hanya untuk Operator.')
  const { items, item } = current(id, expected)
  if (action === 'START_CHECK') {
    if (!['SUBMITTED', 'PENDING_POLICY_REVIEW'].includes(item.status)) throw new Error('Klaim belum siap untuk verifikasi administrasi.')
    return commit(items, { ...item, status: 'ADMIN_CHECK' }, user, 'Verifikasi administrasi klaim dimulai.')
  }
  if (item.status !== 'ADMIN_CHECK' || !item.submissions.length) throw new Error('Penugasan hanya setelah verifikasi administrasi pada versi pengajuan yang tersedia.')
  const quote = quoteClaim(item.values, item.ruleVersionId)
  if (!quote.policy || quote.amount === null) throw new Error(quote.reason)
  validateAssignments(reviewerIds, item.ownerId, quote.policy.reviewerCount)
  return commit(items, { ...item, reviewerIds, ruleVersionId: quote.policy.id, quotedAmount: quote.amount, status: 'UNDER_REVIEW', reviewDrafts: [] }, user, `Reviewer ditugaskan, quote ${quote.amount.toFixed(2)} menggunakan ${quote.policy.reference} v${quote.policy.version} (simulasi).`)
}
export function claimDecisionAllowed(claim: Claim, user: DemoUser) {
  const policy = policyById(claim.ruleVersionId), version = claim.submissions.at(-1)?.version
  return !!policy && policy.kind === 'SK' && policy.scope === claim.categoryCode && policy.periodId === claim.periodId && claim.status === 'REVIEW_COMPLETED' && user.id !== claim.ownerId && (policy.authority === 'LPPM' ? user.role === 'LPPM' : user.role === 'REVIEWER' && claim.reviewerIds.includes(user.id)) && claim.reviewerIds.length === policy.reviewerCount && claim.reviewerIds.every(id => claim.reviews.some(r => r.reviewerId === id && r.submissionVersion === version))
}
export async function decideClaim(id: string, user: DemoUser, expected: number, decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED', reason: string) {
  const { items, item } = current(id, expected)
  if (!claimDecisionAllowed(item, user) || !reason.trim()) throw new Error('Keputusan memerlukan semua pemeriksaan versi aktif, otoritas SK/SOP, dan alasan.')
  const quote = quoteClaim(item.values, item.ruleVersionId)
  if (quote.amount === null || !quote.policy) throw new Error(quote.reason)
  return commit(items, { ...item, status: decision, note: reason, quotedAmount: quote.amount, approvedAmount: decision === 'APPROVED' ? quote.amount : null }, user, `Keputusan ${decision} menurut ${quote.policy.reference} v${quote.policy.version}: ${reason}`)
}
export async function adjustClaim(id: string, user: DemoUser, expected: number, amount: string, reason: string) {
  const { items, item } = current(id, expected), policy = policyById(item.ruleVersionId), cents = decimalUnits(amount, 2)
  if (user.role !== 'OPERATOR' || item.status !== 'APPROVED' || item.batchId || !policy?.allowAdjustment || !reason.trim()) throw new Error('Koreksi nominal hanya untuk Operator berizin menurut SK/SOP, klaim approved belum masuk batch, dan wajib alasan.')
  if (cents === null || cents <= 0n || cents > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Nominal koreksi harus positif dengan maksimal dua desimal.')
  const next = Number(cents) / 100, at = new Date().toISOString()
  return commit(items, { ...item, approvedAmount: next, adjustments: [...item.adjustments, { at, actor: user.name, before: item.approvedAmount, after: next, reason }] }, user, `Nominal disetujui dikoreksi dari ${item.approvedAmount} menjadi ${next}: ${reason}`)
}
export async function batchClaims(selected: { id: string; version: number }[], user: DemoUser) {
  requireAccount(user)
  if (user.role !== 'OPERATOR' || !selected.length || new Set(selected.map(s => s.id)).size !== selected.length) throw new Error('Pilih klaim approved yang berbeda; pembentukan batch hanya untuk Operator.')
  const items = readClaims(), batchId = `BATCH-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, at = new Date().toISOString()
  for (const selection of selected) {
    const item = items.find(c => c.id === selection.id), policy = item && policyById(item.ruleVersionId)
    if (!item || item.version !== selection.version || item.status !== 'APPROVED' || item.batchId || item.approvedAmount === null || !policy || policy.kind !== 'SK' || policy.scope !== item.categoryCode || policy.periodId !== item.periodId) throw new Error('Ada klaim berubah, belum disetujui, sudah masuk batch, atau SK tidak tersedia. Muat ulang.')
  }
  const result = items.map(item => selected.some(s => s.id === item.id) ? claimSchema.parse({ ...item, status: 'BATCHED', batchId, batchSnapshot: { id: batchId, amount: item.approvedAmount!, at, actor: user.name }, updatedAt: at, version: item.version + 1, history: [...item.history, { at, actor: user.name, description: `Masuk ${batchId}; batch administratif, bukan pembayaran.` }] }) : item)
  try { localStorage.setItem(CLAIM_STORAGE_KEY, JSON.stringify(result)) }
  catch { throw new Error('Batch belum tersimpan. Penyimpanan browser penuh atau tidak tersedia.') }
  return batchId
}
