import { z } from 'zod'
import { activitySchema, activityReviewSchema, fileSchema, type Activity, type ActivityReview, type DemoUser } from './model.ts'
import { readActivities, replaceActivity } from './repository.ts'
import { ensureFiles } from './files.ts'
import { decimalUnits } from './profiles.ts'
import { latestPolicy, policyById, requireAccount, validateAssignments, type Policy } from '../configuration/store.ts'
import { httpsUrl } from '../incentives/rules.ts'

export function reviewStage(activity: Activity): ActivityReview['stage'] { return activity.status === 'PROGRESS_SUBMITTED' ? 'PROGRESS_REPORT' : activity.status === 'FINAL_SUBMITTED' ? 'FINAL_REPORT' : activity.status === 'OUTPUT_PENDING' ? 'OUTPUT' : 'PROPOSAL' }
export function stageVersion(activity: Activity, stage = reviewStage(activity)) { return stage === 'PROPOSAL' ? activity.submissions.at(-1)?.version ?? 0 : stage === 'OUTPUT' ? activity.outputHistory.length : activity.reports.filter(report => report.kind === stage).at(-1)?.version ?? 0 }
export function activityPolicy(activity: Activity) { const bound = activity.workflowPolicyId ?? activity.profileVersionId; return bound ? policyById(bound) : latestPolicy('WORKFLOW', activity.schemeVersionId) }
function current(id: string, expected: number) {
  const items = readActivities(), item = items.find(activity => activity.id === id)
  if (!item) throw new Error('Kegiatan tidak ditemukan.')
  if (item.version !== expected) throw new Error('Kegiatan berubah di tab lain. Muat ulang sebelum melanjutkan.')
  return { items, item }
}
function commit(items: Activity[], item: Activity, user: DemoUser, description: string) {
  requireAccount(user)
  const at = new Date().toISOString()
  return replaceActivity(items, activitySchema.parse({ ...item, version: item.version + 1, updatedAt: at, history: [...item.history, { at, actor: user.name, description }] }))
}
function configured(activity: Activity): Policy {
  const policy = activityPolicy(activity)
  if (!policy || policy.kind !== 'WORKFLOW' || policy.scope !== activity.schemeVersionId) throw new Error('SOP dan rubrik untuk skema ini belum diterbitkan. Keputusan diblokir.')
  return policy
}
export async function administerActivity(id: string, user: DemoUser, expected: number, action: 'START_CHECK' | 'CORRECTION' | 'ASSIGN', note: string, reviewerIds: string[] = []) {
  if (user.role !== 'OPERATOR') throw new Error('Verifikasi dan penugasan hanya untuk Operator.')
  const { items, item } = current(id, expected)
  if (action === 'START_CHECK') {
    if (item.status !== 'SUBMITTED' || item.fundingSource !== 'INTERNAL') throw new Error('Kegiatan belum siap diperiksa administrasi internal.')
    return commit(items, { ...item, status: 'ADMIN_CHECK' }, user, 'Pemeriksaan administrasi dimulai.')
  }
  if (action === 'CORRECTION') {
    if (item.status !== 'ADMIN_CHECK' || !note.trim()) throw new Error('Catatan perbaikan wajib pada tahap administrasi.')
    return commit(items, { ...item, status: 'NEEDS_CORRECTION', note: note.trim(), reviewDrafts: [] }, user, `Dikembalikan untuk perbaikan administrasi: ${note.trim()}`)
  }
  if (!['ADMIN_CHECK', 'PROGRESS_SUBMITTED', 'FINAL_SUBMITTED', 'OUTPUT_PENDING'].includes(item.status) || !stageVersion(item)) throw new Error('Penugasan memerlukan versi proposal/laporan/bukti luaran yang tersimpan.')
  const policy = configured(item)
  if (reviewStage(item) !== 'PROPOSAL' && !policy.allowMilestones) throw new Error('Pemeriksaan milestone belum diaktifkan pada SOP.')
  validateAssignments(reviewerIds, item.ownerId, policy.reviewerCount)
  return commit(items, { ...item, workflowPolicyId: policy.id, reviewerIds, status: item.status === 'ADMIN_CHECK' ? 'UNDER_REVIEW' : item.status, reviewDrafts: [], assignments: [...item.assignments, { stage: reviewStage(item), submissionVersion: stageVersion(item), policyId: policy.id, reviewerIds, at: new Date().toISOString(), actor: user.name }] }, user, `Reviewer ditugaskan pada ${reviewStage(item)} v${stageVersion(item)} menggunakan ${policy.reference} v${policy.version}.`)
}
export function activityReviewIssues(item: Activity, review: ActivityReview, user: DemoUser, finish: boolean) {
  const policy = configured(item), errors: string[] = []
  if (user.role !== 'REVIEWER' || user.id === item.ownerId || !item.reviewerIds.includes(user.id) || !['UNDER_REVIEW', 'PROGRESS_SUBMITTED', 'FINAL_SUBMITTED', 'OUTPUT_PENDING'].includes(item.status)) errors.push('Review hanya untuk reviewer yang ditugaskan pada tahap aktif.')
  if (review.reviewerId !== user.id || review.stage !== reviewStage(item) || review.submissionVersion !== stageVersion(item) || review.policyId !== policy.id) errors.push('Review harus menunjuk versi dan SOP pemeriksaan saat ini.')
  if (Object.entries(review.scores).some(([key, score]) => !policy.rubric.some(r => r.id === key && score <= r.maximum))) errors.push('Skor di luar rubrik atau melampaui nilai maksimal.')
  if (finish && (!review.comment.trim() || !review.recommendation || policy.rubric.some(r => review.scores[r.id] === undefined))) errors.push('Lengkapi skor rubrik, komentar, dan rekomendasi.')
  if (item.reviews.some(r => r.reviewerId === user.id && r.stage === review.stage && r.submissionVersion === review.submissionVersion)) errors.push('Pemeriksaan versi ini sudah dikunci.')
  return errors
}
export async function saveActivityReview(id: string, input: ActivityReview, user: DemoUser, expected: number, finish: boolean) {
  const { items, item } = current(id, expected), review = activityReviewSchema.parse(input), errors = activityReviewIssues(item, review, user, finish)
  if (errors.length) throw new Error(errors.join(' '))
  const policy = configured(item), reviews = finish ? [...item.reviews, { ...review, at: new Date().toISOString(), actor: user.name }] : item.reviews
  const complete = item.reviewerIds.length === policy.reviewerCount && item.reviewerIds.every(reviewerId => reviews.some(r => r.reviewerId === reviewerId && r.stage === review.stage && r.submissionVersion === review.submissionVersion))
  return commit(items, { ...item, reviewDrafts: [...item.reviewDrafts.filter(r => !(r.reviewerId === user.id && r.stage === review.stage)), review], reviews, status: finish && complete && review.stage === 'PROPOSAL' ? 'REVIEW_COMPLETED' : item.status }, user, finish ? `Pemeriksaan ${review.stage} v${review.submissionVersion} diselesaikan; keputusan terpisah oleh Ka. LPPM.` : 'Draft penilaian reviewer disimpan.')
}
export async function decideActivity(id: string, user: DemoUser, expected: number, decision: 'APPROVE' | 'REJECT' | 'REVISION' | 'ACCEPT_MILESTONE' | 'START', reason: string, amount = '') {
  const { items, item } = current(id, expected), policy = configured(item)
  if (!reason.trim()) throw new Error('Alasan keputusan wajib diisi.')
  if (decision === 'START') {
    if (user.role !== 'OPERATOR' || item.status !== 'APPROVED') throw new Error('Pelaksanaan hanya dapat dimulai Operator setelah persetujuan.')
    return commit(items, { ...item, status: 'IN_PROGRESS' }, user, `Pelaksanaan dimulai: ${reason}`)
  }
  if (user.role !== 'LPPM' || policy.authority !== 'LPPM' || user.id === item.ownerId) throw new Error('Keputusan memerlukan otoritas Ka. LPPM sesuai SOP.')
  const stage = reviewStage(item), version = stageVersion(item)
  if (!version || item.reviewerIds.length !== policy.reviewerCount || !item.reviewerIds.every(reviewerId => item.reviews.some(r => r.reviewerId === reviewerId && r.stage === stage && r.submissionVersion === version && r.policyId === policy.id))) throw new Error('Seluruh reviewer harus menyelesaikan pemeriksaan versi aktif.')
  if (decision === 'ACCEPT_MILESTONE') {
    if (!policy.allowMilestones || !['PROGRESS_SUBMITTED', 'FINAL_SUBMITTED', 'OUTPUT_PENDING'].includes(item.status)) throw new Error('Milestone ini belum dapat diterima menurut SOP.')
    if (stage === 'OUTPUT' && item.plannedOutputs.some((_, index) => !item.realizations.some(r => r.planIndex === index && ['PUBLISHED', 'REGISTERED', 'ACHIEVED'].includes(r.status)))) throw new Error('Lengkapi capaian setiap target luaran sebelum menyelesaikan kegiatan.')
    return commit(items, { ...item, status: stage === 'PROGRESS_REPORT' ? 'IN_PROGRESS' : stage === 'FINAL_REPORT' ? 'OUTPUT_PENDING' : 'COMPLETED', plannedOutputs: stage === 'OUTPUT' ? item.plannedOutputs.map(p => ({ ...p, achieved: true })) : item.plannedOutputs, reviewerIds: [], reviewDrafts: [] }, user, `Milestone ${stage} diterima: ${reason}`)
  }
  if (item.status !== 'REVIEW_COMPLETED' || stage !== 'PROPOSAL') throw new Error('Keputusan proposal hanya setelah semua pemeriksaan selesai.')
  let approvedAmount = item.approvedAmount
  if (decision === 'APPROVE') {
    const cents = decimalUnits(amount, 2), cap = decimalUnits(policy.profile.budgetCap, 2)
    if (cents === null || cap === null || cents > cap || cents > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Isi dana disetujui dengan maksimal dua desimal dan tidak melebihi pagu SOP.')
    approvedAmount = Number(cents) / 100
  }
  return commit(items, { ...item, status: decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : 'REVISION_REQUIRED', approvedAmount, note: reason, reviewDrafts: [] }, user, `Keputusan ${decision} menurut ${policy.reference} v${policy.version}: ${reason}`)
}
const externalSchema = z.object({ status: z.string().trim().min(3).max(200), url: z.string().max(2000), evidenceDate: z.iso.date(), files: z.array(fileSchema).min(1).max(10), funded: z.boolean() })
export async function recordExternalStatus(id: string, input: z.infer<typeof externalSchema>, user: DemoUser, expected: number) {
  const values = externalSchema.parse(input)
  if (user.role !== 'OPERATOR') throw new Error('Pencatatan status eksternal hanya untuk Operator.')
  if ((values.url && !httpsUrl(values.url)) || values.files.some(file => file.purpose !== 'external') || values.evidenceDate > new Date().toISOString().slice(0, 10)) throw new Error('Gunakan tautan HTTPS, tanggal bukti tidak di masa depan, dan unggahan bukti eksternal.')
  await ensureFiles(values.files)
  const { items, item } = current(id, expected)
  if (item.fundingSource === 'INTERNAL' || !['SUBMITTED', 'EXTERNAL_TRACKING'].includes(item.status)) throw new Error('Pencatatan eksternal tidak diizinkan pada status ini.')
  if (values.funded && !configured(item).allowMilestones) throw new Error('SOP milestone perlu diaktifkan sebelum membuka pelaksanaan.')
  const at = new Date().toISOString()
  return commit(items, { ...item, workflowPolicyId: values.funded ? configured(item).id : item.workflowPolicyId, status: values.funded ? 'IN_PROGRESS' : 'EXTERNAL_TRACKING', externalUpdates: [...item.externalUpdates, { ...values, at, actor: user.name, sourceOfTruth: 'EXTERNAL_MANUAL' }] }, user, `Status eksternal dilaporkan manual: ${values.status}.`)
}
