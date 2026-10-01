import { demoUsers } from '../activities/data.ts'
import { claimSchema, emptyReview, initialClaimValues, isEvidence, isIssue, outputYearFor, textAnswer, templates, incentiveManifest, type Claim, type ClaimStatus } from './model.ts'
import { fieldVisible } from './rules.ts'

const states: ClaimStatus[] = ['UNDER_REVIEW', 'REVISION_REQUIRED', 'UNDER_REVIEW', 'DRAFT', 'SUBMITTED', 'ADMIN_CHECK', 'REVIEW_COMPLETED', 'DRAFT', 'UNDER_REVIEW', 'SUBMITTED']
export const seedClaims: Claim[] = templates.map((template, index) => {
  const other = [4, 6, 9].includes(index), user = other ? { ...demoUsers.DOSEN, id: 'dosen-2', name: 'Dr. Andi Setiawan, M.T.', academicId: 'DEMO-006', studyProgram: 'D4 Logistik Bisnis' } : demoUsers.DOSEN
  const values = initialClaimValues(template.code, user), at = `2026-09-${String(25 - index).padStart(2, '0')}T03:00:00.000Z`
  template.fields.filter(field => field.actor === 'APPLICANT').forEach(field => {
    const answer = values.answers[field.key]
    if (isEvidence(answer)) values.answers[field.key] = { ...answer, mode: field.options ? 'Softfile' : '', url: `https://example.org/aptimas-demo/${template.code.toLowerCase()}/${field.key}`, accessedAt: '2026-09-25', verificationNote: 'Tautan contoh, bukan bukti nyata.' }
    else if (isIssue(answer)) values.answers[field.key] = { volume: '12', issue: '2', pages: '20–35', publicationYear: '2026' }
    else if (field.control === 'integer') values.answers[field.key] = field.key === 'publication_year' ? '2026' : '130'
    else if (field.control === 'decimal-string') values.answers[field.key] = '0.15'
    else if (field.control === 'yes-no') values.answers[field.key] = ['is_predatory', 'is_discontinued'].includes(field.key) ? 'Tidak' : 'Ya'
    else if (field.control === 'select') values.answers[field.key] = field.key === 'publication_status' ? index === 2 ? 'LOA' : 'Publish' : field.options?.[0] ?? ''
    else if (field.control === 'text') values.answers[field.key] = field.key === 'work_title' ? `${template.label}: Kajian Kolaborasi dan Inovasi Logistik ${index + 1}` : field.key === 'affiliation_text' ? user.studyProgram + ', ULBI' : field.key === 'isbn_eisbn' ? '978-0-000-00000-0 (contoh)' : field.key === 'issn_eissn' || field.key === 'issn_isbn' ? '0000-0000 (contoh)' : 'Isian demonstrasi, bukan data publikasi nyata.'
  })
  values.outputYear = '2026'
  const status = states[index], assigned = ['UNDER_REVIEW', 'REVIEW_COMPLETED', 'REVISION_REQUIRED'].includes(status)
  const claim = claimSchema.parse({ id: `claim-${index + 1}`, code: `IK-2026-${String(index + 1).padStart(4, '0')}`, ownerId: user.id, identity: { id: user.id, name: user.name, academicId: user.academicId, studyProgram: user.studyProgram }, categoryCode: template.code, templateVersionId: `${incentiveManifest.schemaVersion}:${template.code}`, periodId: values.periodId, title: textAnswer(values, 'work_title'), outputYear: outputYearFor(values), status, values,
    reviewerIds: assigned ? ['reviewer-1'] : [], note: status === 'REVISION_REQUIRED' ? 'Perjelas rujukan sertifikat dan bukti korespondensi. Catatan ini contoh perbaikan, bukan keputusan resmi.' : '', version: 1, createdAt: at, updatedAt: at, submittedAt: status === 'DRAFT' ? null : at,
    ruleVersionId: null, quotedAmount: null, approvedAmount: null, batchId: null,
    submissions: status === 'DRAFT' ? [] : [{ version: 1, at, identity: { id: user.id, name: user.name, academicId: user.academicId, studyProgram: user.studyProgram }, values: structuredClone(values) }], reviewDrafts: [], reviews: [], history: [{ at, actor: user.name, description: 'Contoh klaim insentif dicatat (simulasi).' }],
  })
  if (status === 'UNDER_REVIEW') {
    const draft = emptyReview(claim, 'reviewer-1')
    template.fields.filter(field => field.reviewerSuitabilityField && fieldVisible(field, values)).slice(0, 2).forEach(field => { draft.checks[field.fieldId] = 'Ya' })
    claim.reviewDrafts = [draft]
  }
  return claim
})
