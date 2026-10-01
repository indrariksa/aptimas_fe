import { z } from 'zod'
import { demoUsers, schemes } from '../activities/data.ts'
import { fileSchema, roles, type DemoUser } from '../activities/model.ts'
import { ensureFiles } from '../activities/files.ts'
import { decimalUnits, profileFor } from '../activities/profiles.ts'
import { isEvidence, isIssue, templateFor, textAnswer, type ClaimValues } from '../incentives/model.ts'
import { fieldVisible } from '../incentives/rules.ts'

export const CONFIG_KEY = 'aptimas.demo.configuration.v1'
export const accountSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(3).max(200), initials: z.string().min(1).max(5), role: z.enum(roles), studyProgram: z.string().trim().min(1).max(200), academicId: z.string().trim().min(1).max(100), active: z.boolean() })
export type Account = z.infer<typeof accountSchema>
export const periodSchema = z.object({ id: z.string().min(1), label: z.string().trim().min(3).max(200), year: z.number().int().min(2000).max(2100), minimumPublicationYear: z.number().int().min(2000).max(2100), opensOn: z.iso.date(), closesOn: z.iso.date() }).refine(p => p.minimumPublicationYear <= p.year && p.opensOn <= p.closesOn, 'Tahun atau rentang periode tidak valid.')
export type IncentivePeriod = z.infer<typeof periodSchema>
const windowSchema = z.tuple([z.iso.date(), z.iso.date()]).refine(([open, close]) => open <= close, 'Tanggal tutup harus sesudah tanggal buka.')
export const policySchema = z.object({
  id: z.string(), version: z.number().int().positive(), kind: z.enum(['SK', 'WORKFLOW']), scope: z.string().min(1), periodId: z.string(), label: z.string().trim().min(3).max(200), reference: z.string().max(200), sopReference: z.string().max(200), effectiveFrom: z.iso.date(), effectiveTo: z.iso.date(), files: z.array(fileSchema).max(10), attested: z.boolean(), status: z.enum(['DRAFT', 'PUBLISHED']), reviewerCount: z.number().int().min(1).max(5), authority: z.enum(['REVIEWER', 'LPPM']), allowLOA: z.boolean(), allowAdjustment: z.boolean(), allowMilestones: z.boolean(), requiredKeys: z.array(z.string()).max(100),
  rates: z.array(z.object({ position: z.string().max(2), field: z.string().max(100), value: z.string().max(200), amount: z.string().max(20) })).max(100),
  rubric: z.array(z.object({ id: z.string().min(1), label: z.string().trim().min(1).max(200), weight: z.number().int().min(1).max(100), maximum: z.number().int().min(1).max(100) })).max(30),
  profile: z.object({ maxWords: z.number().int().min(10).max(10000), summaryWords: z.number().int().min(10).max(5000), budgetCap: z.string(), categories: z.array(z.string().max(100)).max(30).default([]), outputKinds: z.array(z.string().max(100)).max(30).default([]), windows: z.object({ proposal: windowSchema, revision: windowSchema, report: windowSchema, output: windowSchema }) }),
  createdAt: z.string().datetime(), publishedAt: z.string().datetime().nullable(), revisionTarget: z.enum(['ADMIN_CHECK', 'UNDER_REVIEW']).default('ADMIN_CHECK'),
}).refine(p => p.effectiveFrom <= p.effectiveTo, 'Masa berlaku tidak valid.')
export type Policy = z.infer<typeof policySchema>
const auditSchema = z.object({ at: z.string().datetime(), actor: z.string(), description: z.string() })
export const configSchema = z.object({ version: z.number().int().nonnegative(), accounts: z.array(accountSchema), periods: z.array(periodSchema), policies: z.array(policySchema), audit: z.array(auditSchema) })
export type ConfigurationData = z.infer<typeof configSchema>
export function initialConfig(): ConfigurationData {
  return { version: 0, accounts: [...Object.values(demoUsers).map(user => ({ ...user, active: true })), { id: 'dosen-2', name: 'Dr. Andi Setiawan, M.T.', initials: 'AS', role: 'DOSEN', studyProgram: 'D4 Logistik Bisnis', academicId: 'DEMO-006', active: true }, { id: 'reviewer-2', name: 'Dr. Sari Wijaya, M.T.', initials: 'SW', role: 'REVIEWER', studyProgram: 'D4 Logistik Bisnis', academicId: 'DEMO-007', active: true }], periods: [{ id: 'incentive-2026-demo-v1', label: 'Insentif Kepakaran 2026', year: 2026, minimumPublicationYear: 2026, opensOn: '2026-09-01', closesOn: '2026-12-31' }], policies: [], audit: [] }
}
export function readConfig(): ConfigurationData {
  const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(CONFIG_KEY)
  if (!stored) return initialConfig()
  try { return configSchema.parse(JSON.parse(stored)) }
  catch { throw new Error('Konfigurasi lokal tidak dapat dibaca. Kebijakan diblokir; gunakan pemulihan konfigurasi oleh Administrator.') }
}
function writeConfig(data: ConfigurationData) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(configSchema.parse(data))) }
  catch { throw new Error('Konfigurasi belum tersimpan. Penyimpanan browser penuh atau tidak tersedia.') }
}
function adminConfig(user: DemoUser, expected: number) {
  requireAccount(user)
  if (user.role !== 'ADMIN') throw new Error('Pengelolaan konfigurasi hanya untuk Administrator.')
  const config = readConfig()
  if (config.version !== expected) throw new Error('Konfigurasi berubah di tab lain. Muat ulang sebelum menyimpan.')
  return config
}
function persist(config: ConfigurationData, user: DemoUser, description: string) {
  config.version++; config.audit.push({ at: new Date().toISOString(), actor: user.name, description }); writeConfig(config); return config
}
export function newPolicy(kind: Policy['kind'], scope: string, periodId = 'incentive-2026-demo-v1'): Policy {
  const baseline = kind === 'WORKFLOW' ? profileFor(scope, null) : undefined
  return { id: '', version: 1, kind, scope, periodId: kind === 'SK' ? periodId : '', label: '', reference: '', sopReference: '', effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', files: [], attested: false, status: 'DRAFT', reviewerCount: 1, authority: kind === 'SK' ? 'REVIEWER' : 'LPPM', allowLOA: false, allowAdjustment: false, allowMilestones: false, requiredKeys: [], rates: [], rubric: [], profile: { maxWords: 500, summaryWords: 300, budgetCap: '100000000', categories: [...(baseline?.categories ?? [])], outputKinds: [...(baseline?.outputKinds ?? [])], windows: { proposal: ['2026-09-01', '2026-10-31'], revision: ['2026-09-01', '2026-12-31'], report: ['2026-09-01', '2026-12-31'], output: ['2026-09-01', '2026-12-31'] } }, createdAt: new Date().toISOString(), publishedAt: null, revisionTarget: 'ADMIN_CHECK' }
}
export function latestPolicy(kind: Policy['kind'], scope: string, periodId = '', date = new Date().toISOString().slice(0, 10)) {
  return readConfig().policies.filter(p => p.status === 'PUBLISHED' && p.kind === kind && p.scope === scope && p.periodId === periodId && p.effectiveFrom <= date && p.effectiveTo >= date).sort((a, b) => b.version - a.version)[0]
}
export function policyById(id: string | null) { return id ? readConfig().policies.find(p => p.id === id && p.status === 'PUBLISHED') : undefined }
export function policyIssues(policy: Policy): string[] {
  const errors: string[] = []
  if (!policy.reference.trim() || !policy.sopReference.trim() || !policy.attested || !policy.files.length) errors.push('Isi nomor dokumen dan SOP, unggah dokumen sumber, dan konfirmasikan otorisasinya untuk simulasi.')
  if (policy.files.some(file => file.purpose !== 'policy')) errors.push('Dokumen harus berasal dari unggahan konfigurasi.')
  if (policy.kind === 'SK') {
    const template = templateFor(policy.scope)
    if (!template || !readConfig().periods.some(p => p.id === policy.periodId)) errors.push('Kategori atau periode belum tersedia.')
    if (!policy.rates.length) errors.push('Tambahkan tarif dari SK, tanpa nominal contoh otomatis.')
    const selectors = new Set<string>()
    for (const rate of policy.rates) {
      const amount = decimalUnits(rate.amount, 2)
      if (amount === null || amount <= 0n || amount > BigInt(Number.MAX_SAFE_INTEGER)) errors.push('Tarif harus positif dengan maksimal dua desimal dan dalam batas perhitungan demo.')
      if (rate.position && !/^[1-9]\d?$/.test(rate.position)) errors.push('Posisi penulis harus bilangan bulat positif atau kosong untuk semua posisi.')
      if (rate.field && !template?.fields.some(f => f.actor === 'APPLICANT' && f.options?.length && f.key === rate.field && f.options.includes(rate.value))) errors.push('Kondisi tarif harus memakai pilihan pada formulir sumber.')
      if (!rate.field && rate.value) errors.push('Pilih field kondisi untuk nilai tersebut.')
      const selector = `${rate.position}:${rate.field}:${rate.value}`
      if (selectors.has(selector)) errors.push('Kondisi tarif duplikat.'); selectors.add(selector)
    }
    if (policy.requiredKeys.some(key => !template?.fields.some(f => f.actor === 'APPLICANT' && f.key === key))) errors.push('Butir wajib di luar template.')
  } else {
    if (!schemes.some(s => s.id === policy.scope)) errors.push('Skema tidak tersedia.')
    if (policy.authority !== 'LPPM') errors.push('Keputusan kegiatan harus menggunakan otoritas Ka. LPPM.')
    if (!policy.rubric.length || policy.rubric.reduce((sum, r) => sum + r.weight, 0) !== 100 || new Set(policy.rubric.map(r => r.id)).size !== policy.rubric.length) errors.push('Isi rubrik dengan ID unik dan total bobot 100%.')
    for (const list of [policy.profile.categories, policy.profile.outputKinds]) if (!list.filter(s => s.trim()).length || new Set(list.map(s => s.trim().toLowerCase())).size !== list.length) errors.push('Komponen RAB dan jenis luaran memerlukan daftar unik yang tidak kosong.')
    const cap = decimalUnits(policy.profile.budgetCap, 2)
    if (cap === null || cap <= 0n || cap > BigInt(Number.MAX_SAFE_INTEGER)) errors.push('Pagu profil harus positif dengan maksimal dua desimal.')
  }
  return [...new Set(errors)]
}
export async function savePolicy(input: Policy, user: DemoUser, expected: number, publish: boolean) {
  const value = policySchema.parse(input), before = readConfig().policies.find(p => p.id === value.id)
  value.profile.categories = value.profile.categories.map(s => s.trim()).filter(Boolean)
  value.profile.outputKinds = value.profile.outputKinds.map(s => s.trim()).filter(Boolean)
  if (before?.status === 'PUBLISHED') throw new Error('Versi terbit tidak dapat diubah. Buat versi baru.')
  if (value.id && !before) throw new Error('Draft konfigurasi tidak ditemukan.')
  if (before && (before.kind !== value.kind || before.scope !== value.scope || before.periodId !== value.periodId)) throw new Error('Lingkup draft dibekukan. Buat draft baru untuk lingkup lain.')
  if (publish) { const errors = policyIssues(value); if (errors.length) throw new Error(errors.join(' ')); await ensureFiles(value.files) }
  const config = adminConfig(user, expected)
  const result: Policy = { ...value, id: before?.id ?? crypto.randomUUID(), version: before?.version ?? Math.max(0, ...config.policies.filter(p => p.kind === value.kind && p.scope === value.scope && p.periodId === value.periodId).map(p => p.version)) + 1, status: publish ? 'PUBLISHED' : 'DRAFT', publishedAt: publish ? new Date().toISOString() : null }
  config.policies = [...config.policies.filter(p => p.id !== result.id), result]
  persist(config, user, `${publish ? 'Menerbitkan' : 'Menyimpan draft'} ${result.kind === 'SK' ? 'SK' : 'SOP/profil'} ${result.label} v${result.version} (simulasi).`)
  return result
}
export function saveAccount(input: Account, user: DemoUser, expected: number) {
  const config = adminConfig(user, expected), account = accountSchema.parse(input)
  if (config.accounts.some(a => a.id !== account.id && a.academicId.toLowerCase() === account.academicId.toLowerCase())) throw new Error('Identitas akun sudah digunakan.')
  if (account.id === user.id && (!account.active || account.role !== 'ADMIN')) throw new Error('Akun Administrator aktif tidak dapat dinonaktifkan atau dialihkan perannya sendiri.')
  config.accounts = [...config.accounts.filter(a => a.id !== account.id), account]
  return persist(config, user, `Memperbarui akun ${account.name}, peran ${account.role}, ${account.active ? 'aktif' : 'nonaktif'}.`)
}
export function savePeriod(input: IncentivePeriod, user: DemoUser, expected: number) {
  const config = adminConfig(user, expected), period = periodSchema.parse(input)
  const previous = config.periods.find(p => p.id === period.id)
  if (previous && JSON.stringify(previous) !== JSON.stringify(period)) throw new Error('Periode tersimpan dibekukan. Buat periode dengan ID baru agar klaim lama tetap konsisten.')
  config.periods = [...config.periods.filter(p => p.id !== period.id), period]
  return persist(config, user, `Mencatat periode ${period.label} (${period.id}).`)
}
export function resetConfig(user: DemoUser) { if (user.role !== 'ADMIN') throw new Error('Hanya Administrator dapat memulihkan konfigurasi.'); localStorage.removeItem(CONFIG_KEY) }
export function requireAccount(user: DemoUser) {
  if (!readConfig().accounts.some(a => a.active && a.id === user.id && a.role === user.role)) throw new Error('Akun tidak aktif atau perannya telah berubah. Muat ulang sesi demo sebelum melanjutkan.')
}
export function validateAssignments(ids: string[], ownerId: string, count: number) {
  const users = readConfig().accounts
  if (ids.length !== count || new Set(ids).size !== ids.length || ids.some(id => id === ownerId || !users.some(u => u.id === id && u.role === 'REVIEWER' && u.active))) throw new Error(`Pilih ${count} reviewer aktif yang berbeda dan bukan pengusul.`)
}
export function requiredClaimIssues(policy: Policy, values: ClaimValues) {
  return policy.requiredKeys.filter(key => {
    const field = templateFor(values.categoryCode)?.fields.find(f => f.key === key)
    if (field && !fieldVisible(field, values)) return false
    const answer = values.answers[key]
    return isEvidence(answer) ? !(answer.url.trim() || answer.files.length || answer.receipt.trim()) : isIssue(answer) ? !answer.publicationYear.trim() : Array.isArray(answer) ? !answer.length || answer.some(name => !name.trim()) : !textAnswer(values, key).trim()
  }).map(key => ({ key, message: `Lengkapi ${templateFor(values.categoryCode)?.fields.find(f => f.key === key)?.sourceLabel ?? key} sesuai SK.` }))
}
export function quoteClaim(values: ClaimValues, boundPolicyId?: string | null, at?: string) {
  const policy = boundPolicyId ? policyById(boundPolicyId) : latestPolicy('SK', values.categoryCode, values.periodId, at)
  if (!policy || policy.kind !== 'SK' || policy.scope !== values.categoryCode || policy.periodId !== values.periodId) return { policy: undefined, amount: null, reason: 'Menunggu Konfigurasi SK' }
  if (textAnswer(values, 'publication_status') === 'LOA' && !policy.allowLOA) return { policy, amount: null, reason: 'SK ini belum mengizinkan klaim LOA.' }
  const errors = requiredClaimIssues(policy, values)
  if (errors.length) return { policy, amount: null, reason: errors.map(e => e.message).join(' ') }
  const position = textAnswer(values, 'applicant_author_position') || values.authorPosition
  const rates = policy.rates.filter(rate => (!rate.position || rate.position === position) && (!rate.field || textAnswer(values, rate.field) === rate.value))
  if (rates.length !== 1) return { policy, amount: null, reason: rates.length ? 'Kondisi tarif tumpang tindih; Administrator perlu membuat versi SK baru.' : 'Belum ada tarif untuk kombinasi kategori dan posisi penulis ini.' }
  const cents = decimalUnits(rates[0].amount, 2)
  return { policy, amount: cents !== null && cents <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(cents) / 100 : null, reason: 'Simulasi berdasarkan SK yang diinput Administrator.' }
}
