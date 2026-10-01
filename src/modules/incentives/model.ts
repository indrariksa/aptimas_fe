import { z } from 'zod'
import manifest from '../../../docs/APTIMAS_Insentif_FormSchema_2026_DRAFT_v1.1.json' with { type: 'json' }
import { fileSchema, type DemoUser } from '../activities/model.ts'
import { readConfig } from '../configuration/store.ts'

const fieldSchema = z.object({ fieldId: z.string(), key: z.string(), sourceLabel: z.string(), sourceHint: z.string().nullable(), sourceSheet: z.string(), sourceRow: z.number().int(), control: z.enum(['readonly-profile + snapshot-on-submit', 'text', 'ordered-repeatable-authors', 'select', 'integer', 'private-file-upload / URL when source permits', 'https-URL', 'group:volume,issue,pages,publicationYear', 'positive-integer + verify-against-authors', 'yes-no', 'decimal-string']), options: z.array(z.string()).nullable(), showWhen: z.string().nullable(), requiredOnSubmit: z.literal('TBD_FROM_SK_OR_SOP'), reviewerSuitabilityField: z.boolean(), actor: z.enum(['APPLICANT', 'REVIEWER', 'SYSTEM_PROFILE']) })
export const incentiveManifest = z.object({ schemaVersion: z.string(), templateCount: z.literal(10), templates: z.array(z.object({ code: z.string(), label: z.string(), sourceSheet: z.string(), effectiveYear: z.number().int(), status: z.string(), fields: z.array(fieldSchema) })).length(10) }).parse(manifest)
export const templates = incentiveManifest.templates
export type Template = typeof templates[number]
export type TemplateField = z.infer<typeof fieldSchema>
export function templateFor(code: string) { return templates.find(item => item.code === code) }

export const incentivePeriods = [{ id: 'incentive-2026-demo-v1', label: 'Insentif Kepakaran 2026', year: 2026, minimumPublicationYear: manifest.commonDataPolicy.minimumOutputYearInWorkbook, opensOn: '2026-09-01', closesOn: '2026-12-31', policyStatus: 'NOT_CONFIGURED' }] as const
export function getIncentivePeriods() { return readConfig().periods }
export function periodFor(id: string) { return getIncentivePeriods().find(item => item.id === id) }
export const unavailableCategories = ['Jurnal nasional nonterakreditasi', 'Review proposal internal', 'Monev internal', 'HAKI']
export const claimStatuses = ['DRAFT', 'SUBMITTED', 'PENDING_POLICY_REVIEW', 'ADMIN_CHECK', 'UNDER_REVIEW', 'REVIEW_COMPLETED', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED', 'BATCHED', 'WITHDRAWN'] as const
export type ClaimStatus = typeof claimStatuses[number]
export const claimStatusLabels: Record<ClaimStatus, string> = { DRAFT: 'Draft', SUBMITTED: 'Diajukan', PENDING_POLICY_REVIEW: 'Menunggu kebijakan LOA', ADMIN_CHECK: 'Verifikasi administrasi', UNDER_REVIEW: 'Dalam review', REVIEW_COMPLETED: 'Pemeriksaan selesai', REVISION_REQUIRED: 'Perlu revisi', APPROVED: 'Disetujui', REJECTED: 'Ditolak', BATCHED: 'Masuk batch', WITHDRAWN: 'Ditarik' }
const evidenceSchema = z.object({ mode: z.enum(['', 'Hardfile', 'Softfile']).default(''), url: z.string().max(2000).default(''), accessedAt: z.union([z.literal(''), z.iso.date()]).default(''), verificationNote: z.string().max(2000).default(''), receipt: z.string().max(1000).default(''), files: z.array(fileSchema).max(10).default([]) }).strict()
export type Evidence = z.infer<typeof evidenceSchema>
export const emptyEvidence = (): Evidence => evidenceSchema.parse({})
const issueSchema = z.object({ volume: z.string().max(100), issue: z.string().max(100), pages: z.string().max(100), publicationYear: z.string().max(4) }).strict()
export type IssueDetails = z.infer<typeof issueSchema>
const selectionSchema = z.object({ selection: z.string().max(200), detail: z.string().max(500) }).strict()
export const answerSchema = z.union([z.string().max(5000), z.array(z.string().max(200)).max(30), issueSchema, evidenceSchema, selectionSchema])
export type Answer = z.infer<typeof answerSchema>
export const claimValuesSchema = z.object({ categoryCode: z.string().min(1), periodId: z.string().min(1), outputYear: z.string().max(4), authorPosition: z.string().max(2).default(''), answers: z.record(z.string(), answerSchema) }).strict()
export type ClaimValues = z.infer<typeof claimValuesSchema>
const identitySchema = z.object({ id: z.string(), name: z.string(), academicId: z.string(), studyProgram: z.string() })
const reviewSchema = z.object({ submissionVersion: z.number().int().nonnegative(), reviewerId: z.string(), checks: z.record(z.string(), z.enum(['Ya', 'Tidak'])), comment: z.string().max(5000), recommendation: z.enum(['', 'CONTINUE', 'CORRECTION_NEEDED']) })
export type ClaimReview = z.infer<typeof reviewSchema>
export const claimSchema = z.object({
  id: z.string(), code: z.string(), ownerId: z.string(), identity: identitySchema, categoryCode: z.string(), templateVersionId: z.string(), periodId: z.string(), title: z.string().min(1).max(500), outputYear: z.number().int().nullable(),
  status: z.enum(claimStatuses), values: claimValuesSchema, reviewerIds: z.array(z.string()), note: z.string(), version: z.number().int().positive(),
  createdAt: z.string().datetime(), updatedAt: z.string().datetime(), submittedAt: z.string().datetime().nullable(),
  ruleVersionId: z.string().nullable(), quotedAmount: z.number().nonnegative().nullable(), approvedAmount: z.number().nonnegative().nullable(), batchId: z.string().nullable(),
  submissions: z.array(z.object({ version: z.number().int().positive(), at: z.string().datetime(), identity: identitySchema, values: claimValuesSchema })),
  reviewDrafts: z.array(reviewSchema), reviews: z.array(reviewSchema.extend({ version: z.number().int().positive(), at: z.string().datetime(), actor: z.string() })),
  history: z.array(z.object({ at: z.string().datetime(), actor: z.string(), description: z.string() })),
  adjustments: z.array(z.object({ at: z.string().datetime(), actor: z.string(), before: z.number().nullable(), after: z.number(), reason: z.string() })).default([]),
  batchSnapshot: z.object({ id: z.string(), amount: z.number(), at: z.string().datetime(), actor: z.string() }).nullable().default(null),
})
export type Claim = z.infer<typeof claimSchema>
export const emptyReview = (claim: Claim, reviewerId: string): ClaimReview => ({ submissionVersion: claim.submissions.at(-1)?.version ?? 0, reviewerId, checks: {}, comment: '', recommendation: '' })
export interface ClaimRepository {
  list(): Promise<Claim[]>
  saveDraft(values: ClaimValues, user: DemoUser, id?: string, expectedVersion?: number): Promise<Claim>
  submit(values: ClaimValues, user: DemoUser, id?: string, expectedVersion?: number): Promise<Claim>
  saveReview(id: string, review: ClaimReview, user: DemoUser, expectedVersion: number, finish: boolean): Promise<Claim>
  reset(): Promise<void>
}

export function isEvidence(answer: Answer | undefined): answer is Evidence { return !!answer && typeof answer === 'object' && !Array.isArray(answer) && 'files' in answer }
export function isIssue(answer: Answer | undefined): answer is IssueDetails { return !!answer && typeof answer === 'object' && !Array.isArray(answer) && 'publicationYear' in answer }
export function isSelection(answer: Answer | undefined): answer is z.infer<typeof selectionSchema> { return !!answer && typeof answer === 'object' && !Array.isArray(answer) && 'selection' in answer }
export function textAnswer(values: ClaimValues, key: string) { const answer = values.answers[key]; return typeof answer === 'string' ? answer : isSelection(answer) ? answer.selection : '' }
export function outputYearFor(values: ClaimValues) {
  const issue = values.answers.issue_details, year = textAnswer(values, 'publication_year') || (isIssue(issue) ? issue.publicationYear : '') || values.outputYear
  return /^\d{4}$/.test(year) ? Number(year) : null
}
export function initialClaimValues(code: string, user: DemoUser): ClaimValues {
  const template = templateFor(code)
  if (!template) throw new Error('Template klaim belum tersedia.')
  return { categoryCode: code, periodId: incentivePeriods[0].id, outputYear: '', authorPosition: code === 'BOOK' ? '1' : '', answers: Object.fromEntries(template.fields.filter(field => field.actor === 'APPLICANT').map(field => [field.key, field.control === 'ordered-repeatable-authors' ? [user.name] : field.control === 'group:volume,issue,pages,publicationYear' ? { volume: '', issue: '', pages: '', publicationYear: '' } : ['https-URL', 'private-file-upload / URL when source permits'].includes(field.control) ? emptyEvidence() : field.key === 'applicant_author_position' ? '1' : ''])) }
}
