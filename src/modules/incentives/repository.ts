import { z } from 'zod'
import type { DemoUser } from '../activities/model.ts'
import { ensureFiles } from '../activities/files.ts'
import { seedClaims } from './data.ts'
import { claimSchema, claimValuesSchema, incentiveManifest, outputYearFor, periodFor, templateFor, textAnswer, type Claim, type ClaimRepository, type ClaimValues } from './model.ts'
import { canEditClaim, canReviewClaim, claimFiles, claimIssues, claimWindowOpen, duplicateClaim, reviewIssues } from './rules.ts'

export const CLAIM_STORAGE_KEY = 'aptimas.demo.claims.v1'
function read(): Claim[] {
  const stored = localStorage.getItem(CLAIM_STORAGE_KEY)
  if (!stored) return structuredClone(seedClaims)
  try { return z.array(claimSchema).parse(JSON.parse(stored)) }
  catch { throw new Error('Data klaim lokal tidak dapat dibaca. Pulihkan contoh klaim melalui konfirmasi; perubahan klaim yang rusak akan terhapus.') }
}
function write(claims: Claim[]) {
  try { localStorage.setItem(CLAIM_STORAGE_KEY, JSON.stringify(claims)) }
  catch { throw new Error('Klaim belum tersimpan. Penyimpanan browser penuh atau tidak tersedia. Pertahankan formulir dan coba kembali.') }
}
function checkVersion(claim: Claim, expected?: number) { if (expected !== undefined && claim.version !== expected) throw new Error('Klaim berubah di tab lain. Pertahankan salinan isian, lalu muat ulang sebelum menyimpan kembali.') }
function replace(claims: Claim[], claim: Claim) { write(claims.some(item => item.id === claim.id) ? claims.map(item => item.id === claim.id ? claim : item) : [claim, ...claims]); return claim }
async function save(input: ClaimValues, user: DemoUser, id: string | undefined, expected: number | undefined, submit: boolean) {
  if (user.role !== 'DOSEN') throw new Error('Hanya Dosen dapat menyimpan klaim miliknya.')
  const values = claimValuesSchema.parse(input), template = templateFor(values.categoryCode), errors = claimIssues(values, user, submit)
  if (errors.length || !template) throw new Error(errors[0]?.message ?? 'Template tidak tersedia.')
  if (submit) await ensureFiles(claimFiles(values, true))
  const claims = read(), previous = id ? claims.find(item => item.id === id) : undefined
  if (id && (!previous || !canEditClaim(previous, user))) throw new Error('Klaim ini tidak dapat diubah oleh akun aktif.')
  if (previous) {
    checkVersion(previous, expected)
    if (previous.categoryCode !== values.categoryCode || previous.periodId !== values.periodId || previous.templateVersionId !== `${incentiveManifest.schemaVersion}:${template.code}`) throw new Error('Kategori, periode, dan versi template pada klaim sudah dibekukan. Buat klaim baru untuk menggantinya.')
  }
  if (submit && !claimWindowOpen(values.periodId)) throw new Error('Window periode simulasi ditutup. Draft tetap dapat disimpan.')
  if (submit && duplicateClaim(claims, values, user.id, id)) throw new Error('Judul karya ini sudah diajukan oleh pengusul pada tahun luaran yang sama. Periksa klaim sebelumnya.')
  const at = new Date().toISOString(), identity = { id: user.id, name: user.name, academicId: user.academicId, studyProgram: user.studyProgram }
  const status = submit ? previous?.status === 'REVISION_REQUIRED' ? 'ADMIN_CHECK' : textAnswer(values, 'publication_status') === 'LOA' ? 'PENDING_POLICY_REVIEW' : 'SUBMITTED' : previous?.status ?? 'DRAFT'
  return replace(claims, claimSchema.parse({ ...previous, id: previous?.id ?? crypto.randomUUID(), code: previous?.code ?? `IK-${periodFor(values.periodId)!.year}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, ownerId: user.id, identity, categoryCode: template.code, templateVersionId: `${incentiveManifest.schemaVersion}:${template.code}`, periodId: values.periodId, title: textAnswer(values, 'work_title').trim(), outputYear: outputYearFor(values), status, values, reviewerIds: previous?.reviewerIds ?? [], note: previous?.note ?? '', version: (previous?.version ?? 0) + 1,
    createdAt: previous?.createdAt ?? at, updatedAt: at, submittedAt: submit ? at : previous?.submittedAt ?? null, ruleVersionId: null, quotedAmount: null, approvedAmount: null, batchId: null,
    submissions: submit ? [...(previous?.submissions ?? []), { version: (previous?.submissions.length ?? 0) + 1, at, identity, values: structuredClone(values) }] : previous?.submissions ?? [],
    reviewDrafts: submit ? [] : previous?.reviewDrafts ?? [], reviews: previous?.reviews ?? [],
    history: [...(previous?.history ?? []), { at, actor: user.name, description: submit ? previous?.status === 'REVISION_REQUIRED' ? 'Revisi klaim diajukan (simulasi).' : status === 'PENDING_POLICY_REVIEW' ? 'Klaim LOA dicatat; kelayakan menunggu kebijakan.' : 'Klaim diajukan (simulasi).' : 'Draft klaim disimpan.' }],
  }))
}
export const mockClaimRepository: ClaimRepository = {
  async list() { return read() },
  async saveDraft(values, user, id, expected) { return save(values, user, id, expected, false) },
  async submit(values, user, id, expected) { return save(values, user, id, expected, true) },
  async saveReview(id, input, user, expected, finish) {
    const claims = read(), previous = claims.find(item => item.id === id)
    if (!previous || !canReviewClaim(previous, user)) throw new Error('Review hanya dapat disimpan reviewer yang ditugaskan saat klaim Dalam review.')
    checkVersion(previous, expected)
    const parsed = claimSchema.shape.reviewDrafts.element.parse(input), errors = reviewIssues(previous, parsed, user, finish)
    if (errors.length) throw new Error(errors[0])
    const at = new Date().toISOString()
    return replace(claims, claimSchema.parse({ ...previous, updatedAt: at, version: previous.version + 1, status: finish ? 'REVIEW_COMPLETED' : previous.status,
      reviewDrafts: [...previous.reviewDrafts.filter(item => item.reviewerId !== user.id), structuredClone(parsed)],
      reviews: finish ? [...previous.reviews, { ...structuredClone(parsed), at, actor: user.name, version: previous.reviews.length + 1 }] : previous.reviews,
      history: [...previous.history, { at, actor: user.name, description: finish ? 'Pemeriksaan butir selesai; keputusan final menunggu SK/SOP.' : 'Draft checklist reviewer disimpan.' }],
    }))
  },
  async reset() { localStorage.removeItem(CLAIM_STORAGE_KEY) },
}
