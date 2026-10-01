import { z } from 'zod'
import { activitySchema, draftSchema, realizationSchema, reportSchema, type ActivityRepository, type Activity, type DemoUser, type DraftInput } from './model.ts'
import { schemes, seedActivities } from './data.ts'
import { canEditDraft } from './rules.ts'
import { budgetCents, canRecord, profileFor, proposalIssues, windowOpen } from './profiles.ts'
import { ensureFiles } from './files.ts'
import { latestPolicy, policyById, requireAccount } from '../configuration/store.ts'

export const ACTIVITY_STORAGE_KEY = 'aptimas.demo.activities.v1'
export { read as readActivities, replace as replaceActivity }
function read(): Activity[] {
  const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY)
  if (!stored) return structuredClone(seedActivities)
  try { return z.array(activitySchema).parse(JSON.parse(stored)) }
  catch { throw new Error('Data simulasi di browser tidak dapat dibaca. Pulihkan data demo melalui tombol di bawah. Draft lokal yang rusak akan terhapus.') }
}
function write(activities: Activity[]) {
  try { localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities)) }
  catch { throw new Error('Perubahan belum tersimpan. Penyimpanan browser tidak tersedia atau penuh. Pertahankan halaman ini dan coba kembali.') }
}
function checkVersion(activity: Activity, expected?: number) {
  if (expected !== undefined && activity.version !== expected) throw new Error('Data sudah berubah di tab lain. Simpan salinan isian Anda lalu muat ulang sebelum mencoba kembali.')
}
function replace(activities: Activity[], activity: Activity) { write(activities.some(item => item.id === activity.id) ? activities.map(item => item.id === activity.id ? activity : item) : [activity, ...activities]); return activity }

async function saveProposal(input: DraftInput, user: DemoUser, id: string | undefined, expectedVersion: number | undefined, submit: boolean) {
  requireAccount(user)
  if (user.role !== 'DOSEN') throw new Error('Hanya akun Dosen yang dapat menyimpan pengajuan.')
  const values = draftSchema.parse(input), scheme = schemes.find(item => item.id === values.schemeVersionId)
  if (!scheme) throw new Error('Skema tidak tersedia pada periode ini.')
  const frozenProfile = id ? read().find(item => item.id === id)?.profileVersionId : latestPolicy('WORKFLOW', scheme.id)?.id ?? null
  if (submit) {
    const issues = proposalIssues(values, user, frozenProfile)
    if (issues.length) throw new Error(issues[0].message)
    await ensureFiles(values.proposal.files)
  }
  const activities = read(), previous = id ? activities.find(item => item.id === id) : undefined
  if (id && (!previous || !canEditDraft(previous, user))) throw new Error('Pengajuan ini tidak dapat diubah oleh akun yang aktif.')
  if (previous) {
    checkVersion(previous, expectedVersion)
    if (previous.schemeVersionId !== scheme.id) throw new Error('Versi skema pada draft sudah dibekukan. Buat pengajuan baru untuk memilih skema lain.')
  }
  if (submit && !windowOpen(scheme.id, previous && previous.status !== 'DRAFT' ? 'revision' : 'proposal', new Date(), frozenProfile)) throw new Error('Window pengajuan/revisi simulasi sedang ditutup. Draft tetap dapat disimpan.')
  const at = new Date().toISOString(), correction = !!previous && previous.status !== 'DRAFT'
  const revisionTarget = policyById(previous?.workflowPolicyId ?? null)?.revisionTarget ?? profileFor(scheme.id, frozenProfile).revisionTarget
  const status = submit ? previous?.status === 'NEEDS_CORRECTION' ? 'ADMIN_CHECK' : correction ? revisionTarget : 'SUBMITTED' : previous?.status ?? 'DRAFT'
  const total = budgetCents(values.proposal.budget)
  const result = activitySchema.parse({
    ...previous, id: previous?.id ?? crypto.randomUUID(), code: previous?.code ?? `APT-2026-${scheme.domain === 'COMMUNITY_SERVICE' ? 'P' : scheme.domain[0]}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    title: values.title, summary: values.summary, ownerId: user.id, ownerName: user.name, studyProgram: user.studyProgram,
    domain: scheme.domain, schemeVersionId: scheme.id, scheme: scheme.label, fundingSource: scheme.fundingSource, year: 2026,
    status, createdAt: previous?.createdAt ?? at, updatedAt: at, submittedAt: submit ? at : previous?.submittedAt ?? null,
    requestedAmount: values.proposal.budget.length && total !== null ? total / 100 : null, approvedAmount: previous?.approvedAmount ?? null,
    reviewerIds: submit && correction && status === 'ADMIN_CHECK' ? [] : previous?.reviewerIds ?? [], note: previous?.note ?? '', version: (previous?.version ?? 0) + 1,
    proposal: values.proposal, plannedOutputs: values.proposal.outputs.map(item => ({ title: item.title, achieved: false })),
    profileVersionId: frozenProfile,
    reviewDrafts: submit ? [] : previous?.reviewDrafts ?? [],
    assignments: submit && correction && status === 'UNDER_REVIEW' && previous?.workflowPolicyId ? [...previous.assignments, { stage: 'PROPOSAL', submissionVersion: previous.submissions.length + 1, policyId: previous.workflowPolicyId, reviewerIds: previous.reviewerIds, at, actor: user.name }] : previous?.assignments ?? [],
    submissions: submit ? [...(previous?.submissions ?? []), { version: (previous?.submissions.length ?? 0) + 1, kind: correction ? 'PROPOSAL_REVISION' : 'PROPOSAL', at, actor: user.name, values: structuredClone(values) }] : previous?.submissions ?? [],
    history: [...(previous?.history ?? []), { at, actor: user.name, description: submit ? correction ? 'Revisi proposal diajukan (simulasi).' : 'Proposal diajukan (simulasi).' : previous ? 'Draft kegiatan disimpan.' : 'Draft kegiatan dibuat.' }],
  })
  return replace(activities, result)
}
export const mockActivityRepository: ActivityRepository = {
  async list() { return read() },
  async saveDraft(input, user, id, version) { return saveProposal(input, user, id, version, false) },
  async submit(input, user, id, version) { return saveProposal(input, user, id, version, true) },
  async saveReport(id, input, user, expectedVersion) {
    requireAccount(user)
    const values = reportSchema.parse(input)
    if (values.kind === 'FINAL_REPORT' && values.progress !== 100) throw new Error('Laporan akhir harus mencatat kemajuan 100%.')
    if (values.files.some(file => file.purpose !== 'report')) throw new Error('Pilih berkas laporan yang sesuai.')
    await ensureFiles(values.files)
    const activities = read(), previous = activities.find(item => item.id === id)
    if (!previous || !canRecord(previous, user, 'report')) throw new Error('Laporan hanya dapat diajukan pemilik saat kegiatan berjalan dan window dibuka.')
    checkVersion(previous, expectedVersion)
    const at = new Date().toISOString(), label = values.kind === 'PROGRESS_REPORT' ? 'Laporan kemajuan' : 'Laporan akhir'
    return replace(activities, activitySchema.parse({ ...previous, status: values.kind === 'PROGRESS_REPORT' ? 'PROGRESS_SUBMITTED' : 'FINAL_SUBMITTED', updatedAt: at, version: previous.version + 1,
      reviewerIds: [], reviewDrafts: [],
      reports: [...previous.reports, { ...values, version: previous.reports.filter(item => item.kind === values.kind).length + 1, at, actor: user.name }],
      history: [...previous.history, { at, actor: user.name, description: `${label} diajukan (simulasi).` }],
    }))
  },
  async saveRealization(id, input, user, expectedVersion) {
    requireAccount(user)
    const values = realizationSchema.parse(input)
    if (values.files.some(file => file.purpose !== 'output')) throw new Error('Pilih berkas bukti luaran yang sesuai.')
    await ensureFiles(values.files)
    const activities = read(), previous = activities.find(item => item.id === id)
    if (!previous || !canRecord(previous, user, 'output')) throw new Error('Capaian hanya dapat disimpan pemilik pada tahap dan window yang diizinkan.')
    if (!previous.plannedOutputs[values.planIndex]) throw new Error('Pilih target luaran yang tersedia.')
    if (values.id && !previous.realizations.some(item => item.id === values.id)) throw new Error('Capaian yang dipilih tidak ditemukan.')
    checkVersion(previous, expectedVersion)
    const at = new Date().toISOString(), entry = { ...values, id: values.id || crypto.randomUUID(), updatedAt: at }
    return replace(activities, activitySchema.parse({ ...previous, updatedAt: at, version: previous.version + 1,
      reviewerIds: previous.status === 'OUTPUT_PENDING' ? [] : previous.reviewerIds, reviewDrafts: previous.status === 'OUTPUT_PENDING' ? [] : previous.reviewDrafts,
      realizations: values.id ? previous.realizations.map(item => item.id === values.id ? entry : item) : [...previous.realizations, entry],
      outputHistory: [...previous.outputHistory, { version: previous.outputHistory.filter(item => item.values.id === entry.id).length + 1, at, actor: user.name, values: structuredClone(entry) }],
      history: [...previous.history, { at, actor: user.name, description: values.id ? 'Capaian luaran diperbarui (belum diverifikasi).' : 'Capaian luaran dicatat (belum diverifikasi).' }],
    }))
  },
  async reset() { localStorage.removeItem(ACTIVITY_STORAGE_KEY) },
}
