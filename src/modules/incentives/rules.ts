import { csvCell } from '../activities/rules.ts'
import { latestPolicy, policyById, requiredClaimIssues } from '../configuration/store.ts'
import type { DemoUser } from '../activities/model.ts'
import { claimStatusLabels, templates, isEvidence, isIssue, isSelection, outputYearFor, periodFor, templateFor, textAnswer, type ClaimStatus, type Claim, type ClaimReview, type ClaimValues, type TemplateField } from './model.ts'

export function visibleClaims(claims: Claim[], user: DemoUser) {
  if (user.role === 'DOSEN') return claims.filter(claim => claim.ownerId === user.id)
  if (user.role === 'REVIEWER') return claims.filter(claim => claim.reviewerIds.includes(user.id))
  return claims.filter(claim => claim.status !== 'DRAFT' || user.role === 'ADMIN')
}
export function canEditClaim(claim: Claim, user: DemoUser) { return user.role === 'DOSEN' && claim.ownerId === user.id && ['DRAFT', 'REVISION_REQUIRED'].includes(claim.status) }
export function canReviewClaim(claim: Claim, user: DemoUser) { return user.role === 'REVIEWER' && claim.ownerId !== user.id && claim.reviewerIds.includes(user.id) && claim.status === 'UNDER_REVIEW' && !claim.reviews.some(r => r.reviewerId === user.id && r.submissionVersion === claim.submissions.at(-1)?.version) }
export function fieldVisible(field: TemplateField, values: ClaimValues) {
  if (!field.showWhen || field.showWhen.startsWith('Hardfile:')) return true
  if (field.showWhen.startsWith('affiliation_declared')) return textAnswer(values, 'affiliation_declared') === 'Ya'
  if (field.showWhen.startsWith('publication_status')) return textAnswer(values, 'publication_status') === 'LOA'
  if (field.showWhen.startsWith('access_mode == Online')) return textAnswer(values, 'access_mode') === 'Online'
  if (field.showWhen.startsWith('access_mode == Offline')) return textAnswer(values, 'access_mode') === 'Offline'
  throw new Error('Kondisi field baru belum dipetakan pada renderer.')
}
export function httpsUrl(value: string) {
  try { const url = new URL(value); return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password }
  catch { return false }
}
function normalizeName(name: string) { return name.split(',')[0].replace(/^(?:(?:dr|prof)\.?\s+)+/i, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID') }
export type ClaimIssue = { key: string; message: string }
export function claimIssues(values: ClaimValues, user: DemoUser, submit = false, policyId?: string | null): ClaimIssue[] {
  const errors: ClaimIssue[] = [], template = templateFor(values.categoryCode), period = periodFor(values.periodId)
  const add = (key: string, message: string) => errors.push({ key, message })
  if (!template) { add('categoryCode', 'Template kategori belum tersedia.'); return errors }
  if (!period) add('periodId', 'Pilih periode yang tersedia.')
  const allowed = new Set(template.fields.filter(field => field.actor === 'APPLICANT').map(field => field.key))
  if (values.authorPosition && (values.categoryCode !== 'BOOK' || !/^[1-9]\d?$/.test(values.authorPosition))) add('authorPosition', 'Metadata posisi tambahan hanya berlaku untuk buku dan harus bilangan bulat positif.')
  Object.keys(values.answers).forEach(key => { if (!allowed.has(key)) add(key, 'Field identitas/reviewer atau field di luar template tidak boleh diubah oleh pengusul.') })
  const title = textAnswer(values, 'work_title').trim()
  if (!title || title.length > 500) add('work_title', 'Isi satu judul karya, maksimal 500 karakter.')
  for (const field of template.fields.filter(item => item.actor === 'APPLICANT')) {
    const answer = values.answers[field.key], active = fieldVisible(field, values), text = typeof answer === 'string' ? answer.trim() : ''
    if (answer === undefined || answer === '') continue
    const evidenceControl = ['https-URL', 'private-file-upload / URL when source permits'].includes(field.control)
    if (evidenceControl) {
      if (!isEvidence(answer)) { add(field.key, 'Format bukti tidak sesuai template.'); continue }
      if (active && answer.url && !httpsUrl(answer.url)) add(field.key, 'Tautan bukti harus berupa HTTPS tanpa kredensial.')
      if (answer.mode && !field.options?.includes(answer.mode)) add(field.key, 'Pilih jenis bukti sesuai sumber.')
      if (answer.files.some(file => file.purpose !== `claim:${field.fieldId}`)) add(field.key, 'Lampiran tidak sesuai butir klaim ini.')
      continue
    }
    if (field.control === 'ordered-repeatable-authors') { if (!Array.isArray(answer) || (submit && answer.some(name => !name.trim()))) add(field.key, 'Isi nama penulis sesuai urutan, atau hapus baris kosong.'); continue }
    if (field.control === 'group:volume,issue,pages,publicationYear') { if (!isIssue(answer) || (answer.publicationYear && !/^\d{4}$/.test(answer.publicationYear))) add(field.key, 'Isi tahun terbit dengan empat digit.'); continue }
    if (field.control === 'select' && isSelection(answer)) {
      if (!field.options?.includes('Lainnya (isi manual)') || (answer.selection && !field.options.includes(answer.selection))) add(field.key, 'Pilihan tidak sesuai template sumber.')
      if (submit && active && answer.selection === 'Lainnya (isi manual)' && !answer.detail.trim()) add(field.key, 'Isi nama portal untuk pilihan Lainnya.')
      continue
    }
    if (typeof answer !== 'string') { add(field.key, 'Jenis isian tidak sesuai template.'); continue }
    if (!active || !text) continue
    if (field.options && !field.options.includes(text)) add(field.key, 'Pilihan harus mengikuti daftar pada template sumber.')
    if (['integer', 'positive-integer + verify-against-authors'].includes(field.control) && (!/^\d{1,9}$/.test(text) || Number(text) < 1)) add(field.key, 'Gunakan bilangan bulat positif.')
    if (field.control === 'decimal-string' && !/^\d{1,12}(?:\.\d{1,6})?$/.test(text)) add(field.key, 'Gunakan angka desimal nonnegatif dengan titik, maksimal enam desimal.')
  }
  if (submit) {
    const policy = policyId ? policyById(policyId) : latestPolicy('SK', values.categoryCode, values.periodId)
    if (policy) errors.push(...requiredClaimIssues(policy, values))
    const year = outputYearFor(values)
    if (year === null || (period && (year < period.minimumPublicationYear || year > period.year))) add('outputYear', `Tahun luaran untuk periode contoh harus ${period?.minimumPublicationYear ?? 2026}–${period?.year ?? 2026}. Ketentuan LOA menunggu SOP.`)
    const position = textAnswer(values, 'applicant_author_position') || values.authorPosition, authors = values.answers.authors
    if (position && (!Array.isArray(authors) || !authors[Number(position) - 1] || normalizeName(authors[Number(position) - 1]) !== normalizeName(user.name))) add('applicant_author_position', 'Posisi harus menunjuk nama pengusul pada daftar penulis.')
  }
  return errors
}
export function claimWindowOpen(periodId: string, now = new Date()) {
  const period = periodFor(periodId), date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return !!period && date >= period.opensOn && date <= period.closesOn
}
export function claimFiles(values: ClaimValues, activeOnly = false) {
  return (templateFor(values.categoryCode)?.fields ?? []).filter(field => !activeOnly || fieldVisible(field, values)).flatMap(field => { const answer = values.answers[field.key]; return isEvidence(answer) && (!activeOnly || answer.mode !== 'Hardfile') ? answer.files : [] })
}
export function reviewIssues(claim: Claim, review: ClaimReview, user: DemoUser, finish: boolean) {
  const template = templateFor(claim.categoryCode), latest = claim.submissions.at(-1), errors: string[] = []
  if (!template || !latest || review.submissionVersion !== latest.version || review.reviewerId !== user.id) return ['Review harus menunjuk versi pengajuan terbaru dan reviewer yang aktif.']
  const fields = template.fields.filter(field => field.reviewerSuitabilityField)
  for (const key of Object.keys(review.checks)) if (!fields.some(field => field.fieldId === key)) errors.push('Butir checklist tidak sesuai template sumber.')
  if (finish && fields.some(field => fieldVisible(field, latest.values) && !review.checks[field.fieldId])) errors.push('Lengkapi Kesesuaian Ya/Tidak untuk semua butir yang berlaku.')
  if (finish && !review.comment.trim()) errors.push('Isi komentar pemeriksaan sebelum menyelesaikan review.')
  return errors
}
export function duplicateClaim(claims: Claim[], values: ClaimValues, ownerId: string, id?: string) {
  const title = textAnswer(values, 'work_title').trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID')
  return claims.find(claim => claim.id !== id && claim.ownerId === ownerId && claim.outputYear === outputYearFor(values) && !['DRAFT', 'REJECTED', 'WITHDRAWN'].includes(claim.status) && claim.title.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID') === title)
}

export const emptyClaimFilters = { q: '', category: '', year: '', status: '' as ClaimStatus | '', studyProgram: '' }
export function filterClaims(claims: Claim[], filters: typeof emptyClaimFilters) {
  const query = filters.q.trim().toLocaleLowerCase('id-ID')
  return claims.filter(claim => (!query || `${claim.title} ${claim.code} ${claim.identity.name}`.toLocaleLowerCase('id-ID').includes(query)) && (!filters.category || claim.categoryCode === filters.category) && (!filters.year || String(claim.outputYear) === filters.year) && (!filters.status || claim.status === filters.status) && (!filters.studyProgram || claim.identity.studyProgram === filters.studyProgram))
}
export function claimCsv(claims: Claim[]) {
  const rows = [['Kode', 'Kategori', 'Judul', 'Pengusul', 'NIDN/NUPTK', 'Prodi', 'Tahun luaran', 'Status', 'Quote SK', 'Nominal disetujui', 'Versi SK', 'Batch', 'Versi template', 'Tanggal pengajuan', 'Status terbit', 'Posisi penulis', 'Pemeriksaan', 'Komentar reviewer', 'Metadata kategori', 'Catatan admin', 'Sumber data'], ...claims.map(claim => [claim.code, templates.find(template => template.code === claim.categoryCode)?.label, claim.title, claim.identity.name, claim.identity.academicId, claim.identity.studyProgram, claim.outputYear, claimStatusLabels[claim.status], claim.quotedAmount === null ? 'Menunggu Konfigurasi SK' : claim.quotedAmount.toFixed(2), claim.approvedAmount === null ? 'Belum diputuskan' : claim.approvedAmount.toFixed(2), claim.ruleVersionId, claim.batchId, claim.templateVersionId, claim.submittedAt, textAnswer(claim.values, 'publication_status'), textAnswer(claim.values, 'applicant_author_position') || claim.values.authorPosition, claim.reviews.map(r => `${r.actor}: v${r.submissionVersion}, Ya ${Object.values(r.checks).filter(v => v === 'Ya').length}, Tidak ${Object.values(r.checks).filter(v => v === 'Tidak').length}`).join(' | '), claim.reviews.map(r => r.comment).join(' | '), JSON.stringify(claim.values.answers), claim.note, 'DATA SIMULASI'])]
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')
}
