import { z } from 'zod'

export const roles = ['DOSEN', 'REVIEWER', 'OPERATOR', 'LPPM', 'ADMIN'] as const
export type Role = typeof roles[number]
export const roleLabels: Record<Role, string> = { DOSEN: 'Dosen', REVIEWER: 'Reviewer', OPERATOR: 'Operator', LPPM: 'Ka. LPPM', ADMIN: 'Administrator' }
export const domains = ['RESEARCH', 'COMMUNITY_SERVICE', 'INNOVATION'] as const
export type Domain = typeof domains[number]
export const domainLabels: Record<Domain, string> = { RESEARCH: 'Penelitian', COMMUNITY_SERVICE: 'Pengabdian kepada Masyarakat', INNOVATION: 'Inovasi' }
export const domainPaths: Record<Domain, string> = { RESEARCH: 'research', COMMUNITY_SERVICE: 'community-service', INNOVATION: 'innovation' }
export const statuses = ['DRAFT', 'SUBMITTED', 'ADMIN_CHECK', 'NEEDS_CORRECTION', 'UNDER_REVIEW', 'REVIEW_COMPLETED', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'PROGRESS_SUBMITTED', 'FINAL_SUBMITTED', 'OUTPUT_PENDING', 'COMPLETED', 'WITHDRAWN', 'EXTERNAL_TRACKING'] as const
export type ActivityStatus = typeof statuses[number]
export const statusLabels: Record<ActivityStatus, string> = {
  DRAFT: 'Draft', SUBMITTED: 'Diajukan', ADMIN_CHECK: 'Verifikasi administrasi', NEEDS_CORRECTION: 'Perbaikan administrasi', UNDER_REVIEW: 'Dalam review', REVIEW_COMPLETED: 'Review selesai', REVISION_REQUIRED: 'Perlu revisi', APPROVED: 'Disetujui', REJECTED: 'Ditolak', IN_PROGRESS: 'Sedang berjalan', PROGRESS_SUBMITTED: 'Laporan kemajuan diajukan', FINAL_SUBMITTED: 'Laporan akhir diajukan', OUTPUT_PENDING: 'Menunggu luaran', COMPLETED: 'Selesai', WITHDRAWN: 'Ditarik', EXTERNAL_TRACKING: 'Pencatatan eksternal',
}

export interface DemoUser { id: string; name: string; initials: string; role: Role; studyProgram: string; academicId: string }

export const fileSchema = z.object({ id: z.string().uuid(), name: z.string().min(1), size: z.number().int().positive(), type: z.string(), purpose: z.string().min(1), uploadedAt: z.string().datetime() })
export type LocalFile = z.infer<typeof fileSchema>
export const proposalSchema = z.object({
  keywords: z.string().max(500).default(''), scienceCluster: z.string().max(100).default(''), duration: z.number().int().min(1).max(24).default(12),
  externalSystem: z.enum(['', 'BIMA', 'HILIRISET', 'OTHER']).default(''), externalId: z.string().max(128).default(''), externalUrl: z.string().max(1000).default(''), externalStatus: z.string().max(200).default(''), evidenceDate: z.union([z.literal(''), z.iso.date()]).default(''),
  members: z.array(z.object({ academicId: z.string().max(100), name: z.string().max(200), affiliation: z.string().max(200), role: z.enum(['DOSEN', 'MAHASISWA', 'EKSTERNAL']) })).max(30).default([]),
  partners: z.array(z.object({ name: z.string().max(200), kind: z.string().max(100), address: z.string().max(500), contact: z.string().max(200), region: z.string().max(200), role: z.string().max(500), resources: z.string().max(500), consent: z.boolean() })).max(30).default([]),
  sections: z.record(z.string(), z.string().max(20000)).default({}),
  product: z.object({ name: z.string(), kind: z.string(), description: z.string(), benefit: z.string(), sector: z.string(), tktCurrent: z.string(), tktTarget: z.string(), ipStatus: z.string(), ipNumber: z.string() }).default({ name: '', kind: '', description: '', benefit: '', sector: '', tktCurrent: '', tktTarget: '', ipStatus: '', ipNumber: '' }),
  budget: z.array(z.object({ category: z.string(), description: z.string().max(500), unit: z.string().max(50), quantity: z.string(), price: z.string(), year: z.number().int() })).max(100).default([]),
  schedule: z.array(z.object({ title: z.string().max(300), year: z.number().int(), start: z.number().int(), end: z.number().int() })).max(100).default([]),
  files: z.array(fileSchema).max(30).default([]),
  outputs: z.array(z.object({ title: z.string().max(300), kind: z.string(), quantity: z.number().int(), target: z.string().max(200), year: z.number().int() })).max(30).default([]),
})
export type Proposal = z.infer<typeof proposalSchema>
export const draftSchema = z.object({
  title: z.string().trim().min(1, 'Isi judul sebelum menyimpan draft.').max(500, 'Judul maksimal 500 karakter.'),
  schemeVersionId: z.string().min(1, 'Pilih skema kegiatan.'),
  year: z.literal('2026', { error: 'Periode pengajuan aktif adalah tahun 2026.' }),
  summary: z.string().trim().max(3000, 'Ringkasan maksimal 3.000 karakter.'),
  proposal: proposalSchema.default(() => proposalSchema.parse({})),
})
export type DraftValues = z.infer<typeof draftSchema>
export type DraftInput = z.input<typeof draftSchema>
export const reportSchema = z.object({ kind: z.enum(['PROGRESS_REPORT', 'FINAL_REPORT']), summary: z.string().trim().min(20, 'Ringkasan laporan minimal 20 karakter.').max(5000), progress: z.number().int().min(0).max(100), files: z.array(fileSchema).min(1, 'Unggah laporan PDF.').max(10) })
export type ReportInput = z.infer<typeof reportSchema>
export const realizationSchema = z.object({ id: z.string(), planIndex: z.number().int().nonnegative(), title: z.string().trim().min(3).max(300), status: z.enum(['DRAFT', 'SUBMITTED', 'PUBLISHED', 'REGISTERED', 'ACHIEVED']), date: z.iso.date({ error: 'Isi tanggal capaian yang valid.' }), note: z.string().max(2000), files: z.array(fileSchema).min(1, 'Unggah bukti capaian.').max(10), updatedAt: z.string().datetime().optional() })
export type Realization = z.infer<typeof realizationSchema>

export const activitySchema = z.object({
  id: z.string().min(1), code: z.string().min(1), ownerId: z.string().min(1), ownerName: z.string().min(1),
  title: z.string().trim().min(1).max(500), domain: z.enum(domains), scheme: z.string().min(1), schemeVersionId: z.string().min(1),
  year: z.number().int().min(2000).max(2100), studyProgram: z.string().min(1),
  fundingSource: z.enum(['INTERNAL', 'GOVERNMENT', 'INDUSTRY']), status: z.enum(statuses),
  createdAt: z.string().datetime(), updatedAt: z.string().datetime(), submittedAt: z.string().datetime().nullable(),
  requestedAmount: z.number().nonnegative().nullable(), approvedAmount: z.number().nonnegative().nullable(),
  reviewerIds: z.array(z.string()), summary: z.string(), note: z.string(), version: z.number().int().positive(),
  plannedOutputs: z.array(z.object({ title: z.string(), achieved: z.boolean() })),
  history: z.array(z.object({ at: z.string().datetime(), actor: z.string(), description: z.string() })),
  proposal: proposalSchema.nullable().default(null),
  submissions: z.array(z.object({ version: z.number().int().positive(), kind: z.enum(['PROPOSAL', 'PROPOSAL_REVISION']), at: z.string().datetime(), actor: z.string(), values: draftSchema })).default([]),
  reports: z.array(reportSchema.extend({ version: z.number().int().positive(), at: z.string().datetime(), actor: z.string() })).default([]),
  realizations: z.array(realizationSchema).default([]),
  outputHistory: z.array(z.object({ version: z.number().int().positive(), at: z.string().datetime(), actor: z.string(), values: realizationSchema })).default([]),
})
export type Activity = z.infer<typeof activitySchema>

export interface ActivityFilters { q: string; domain: Domain | ''; year: string; scheme: string; status: ActivityStatus | ''; studyProgram: string }
export const emptyFilters: ActivityFilters = { q: '', domain: '', year: '2026', scheme: '', status: '', studyProgram: '' }

export interface ActivityRepository {
  list(): Promise<Activity[]>
  saveDraft(values: DraftInput, user: DemoUser, id?: string, expectedVersion?: number): Promise<Activity>
  submit(values: DraftInput, user: DemoUser, id?: string, expectedVersion?: number): Promise<Activity>
  saveReport(id: string, values: ReportInput, user: DemoUser, expectedVersion: number): Promise<Activity>
  saveRealization(id: string, values: Realization, user: DemoUser, expectedVersion: number): Promise<Activity>
  reset(): Promise<void>
}
