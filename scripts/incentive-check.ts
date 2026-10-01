import assert from 'node:assert/strict'
import { demoUsers } from '../src/modules/activities/data.ts'
import { storeFile, ensureFiles } from '../src/modules/activities/files.ts'
import { seedClaims } from '../src/modules/incentives/data.ts'
import { claimSchema, claimValuesSchema, emptyEvidence, emptyReview, initialClaimValues, incentiveManifest, isEvidence, outputYearFor, templates, textAnswer } from '../src/modules/incentives/model.ts'
import { canEditClaim, canReviewClaim, claimCsv, claimIssues, claimWindowOpen, emptyClaimFilters, fieldVisible, filterClaims, httpsUrl, reviewIssues, visibleClaims } from '../src/modules/incentives/rules.ts'
import { CLAIM_STORAGE_KEY, mockClaimRepository } from '../src/modules/incentives/repository.ts'

export async function checkIncentives() {
  const user = demoUsers.DOSEN, reviewer = demoUsers.REVIEWER, memory = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) }, configurable: true })
  assert.equal(incentiveManifest.templateCount, 10)
  assert.equal(templates.reduce((count, template) => count + template.fields.length, 0), 198)
  assert.equal(templates.flatMap(template => template.fields).filter(field => field.reviewerSuitabilityField).length, 158)
  seedClaims.forEach(claim => claimSchema.parse(claim))
  assert(seedClaims.every(claim => claim.quotedAmount === null && claim.approvedAmount === null && claim.batchId === null))
  for (const template of templates) {
    const initial = initialClaimValues(template.code, user)
    assert.deepEqual(Object.keys(initial.answers), template.fields.filter(field => field.actor === 'APPLICANT').map(field => field.key))
    const claim = seedClaims.find(item => item.categoryCode === template.code)!
    assert.deepEqual(claimIssues(claim.values, { ...user, ...claim.identity }, true), [], template.code)
  }
  assert(visibleClaims(seedClaims, user).every(claim => claim.ownerId === user.id))
  assert(visibleClaims(seedClaims, reviewer).every(claim => claim.reviewerIds.includes(reviewer.id)))
  assert(visibleClaims(seedClaims, demoUsers.OPERATOR).every(claim => claim.status !== 'DRAFT'))
  assert(claimWindowOpen('incentive-2026-demo-v1'))
  assert(!claimWindowOpen('incentive-2026-demo-v1', new Date('2027-01-01T05:00:00Z')))
  assert(!httpsUrl('javascript:alert(1)'))
  assert(!httpsUrl('https://name:password@example.org'))
  assert(httpsUrl('https://example.org/bukti'))

  const sinta = structuredClone(seedClaims.find(claim => claim.categoryCode === 'SINTA_JOURNAL')!.values), sintaTemplate = templates.find(template => template.code === 'SINTA_JOURNAL')!
  const affiliation = sintaTemplate.fields.find(field => field.key === 'affiliation_text')!, apc = sintaTemplate.fields.find(field => field.key === 'apc_evidence_url')!
  sinta.answers.affiliation_declared = 'Tidak'; assert(!fieldVisible(affiliation, sinta)); assert.equal(typeof sinta.answers.affiliation_text, 'string')
  sinta.answers.publication_status = 'Publish'; assert(!fieldVisible(apc, sinta))
  sinta.answers.publication_status = 'LOA'; assert(fieldVisible(apc, sinta))
  const popular = structuredClone(seedClaims.find(claim => claim.categoryCode === 'NATIONAL_POPULAR_WORK')!.values), popularTemplate = templates.find(template => template.code === popular.categoryCode)!
  popular.answers.access_mode = 'Online'
  assert(fieldVisible(popularTemplate.fields.find(field => field.key === 'popular_online_portal')!, popular))
  assert(!fieldVisible(popularTemplate.fields.find(field => field.key === 'popular_print_media')!, popular))
  popular.answers.popular_online_portal = { selection: 'Lainnya (isi manual)', detail: '' }
  assert(claimIssues(popular, user, true).some(issue => issue.key === 'popular_online_portal'))
  popular.answers.popular_online_portal = { selection: 'Lainnya (isi manual)', detail: 'Portal contoh' }
  assert(!claimIssues(popular, user, true).some(issue => issue.key === 'popular_online_portal'))
  const forged = { ...sinta, answers: { ...sinta.answers, reviewer_comment: 'Komentar buatan pengusul', applicant_name_with_title: 'Nama palsu' } }
  assert.equal(claimIssues(forged, user).filter(issue => ['reviewer_comment', 'applicant_name_with_title'].includes(issue.key)).length, 2)
  assert(!claimValuesSchema.safeParse({ ...sinta, quotedAmount: 0 }).success)
  sinta.answers.sinta_rank = 'SINTA 7'; assert(claimIssues(sinta, user).some(issue => issue.key === 'sinta_rank'))
  sinta.answers.sinta_rank = 'SINTA 6'; assert(!claimIssues(sinta, user).some(issue => issue.key === 'sinta_rank'))
  sinta.answers.authors = ['Penulis lain', 'Ratna Puspitasari']; sinta.answers.applicant_author_position = '1'
  assert(claimIssues(sinta, user, true).some(issue => issue.key === 'applicant_author_position'))
  sinta.answers.applicant_author_position = '2'; assert(!claimIssues(sinta, user, true).some(issue => issue.key === 'applicant_author_position'))

  const book = initialClaimValues('BOOK', user)
  book.answers.work_title = 'Buku demonstrasi baru yang belum pernah diajukan'
  book.answers.book_content_page_count = '100' // Batas 125 adalah petunjuk sumber, belum menjadi aturan penolakan resmi.
  await assert.rejects(mockClaimRepository.saveDraft(book, demoUsers.ADMIN))
  const draft = await mockClaimRepository.saveDraft(book, user)
  assert.equal(draft.outputYear, null)
  assert(filterClaims([draft], emptyClaimFilters).length === 1)
  assert(canEditClaim(draft, user))
  await assert.rejects(mockClaimRepository.submit(book, user, draft.id, draft.version), /Tahun luaran/)
  book.answers.publication_year = '2025'; assert(claimIssues(book, user, true).some(issue => issue.key === 'outputYear'))
  book.answers.publication_year = '2026'; assert.equal(outputYearFor(book), 2026)
  const file = await storeFile(new File(['%PDF-1.7 buku'], 'book.pdf', { type: 'application/pdf' }), 'claim:BOOK.complete_book_evidence')
  book.answers.complete_book_evidence = { ...emptyEvidence(), mode: 'Softfile', files: [file] }
  assert.deepEqual(claimIssues(book, user, true), [])
  const submitted = await mockClaimRepository.submit(book, user, draft.id, draft.version)
  assert.equal(submitted.status, 'SUBMITTED'); assert.equal(submitted.quotedAmount, null); assert.equal(submitted.approvedAmount, null)
  assert.equal(submitted.submissions[0].identity.name, user.name)
  await assert.rejects(mockClaimRepository.saveDraft(book, user, submitted.id, submitted.version))
  await assert.rejects(mockClaimRepository.submit(book, user), /sudah diajukan/)
  const correction = { ...submitted, status: 'REVISION_REQUIRED' as const }
  memory.set(CLAIM_STORAGE_KEY, JSON.stringify([correction]))
  book.answers.complete_book_evidence = { ...emptyEvidence(), mode: 'Hardfile', receipt: 'Penyerahan fisik contoh, belum dikonfirmasi.' }
  book.answers.publisher_name = 'Penerbit yang diperbarui'
  const corrected = await mockClaimRepository.saveDraft(book, user, correction.id, correction.version)
  assert.equal(corrected.status, 'REVISION_REQUIRED')
  assert(isEvidence(corrected.submissions[0].values.answers.complete_book_evidence))
  await ensureFiles((corrected.submissions[0].values.answers.complete_book_evidence as { files: typeof file[] }).files)
  await assert.rejects(mockClaimRepository.saveDraft(book, user, corrected.id, 0), /tab lain/)
  const revised = await mockClaimRepository.submit(book, user, corrected.id, corrected.version)
  assert.equal(revised.status, 'ADMIN_CHECK'); assert.equal(revised.submissions.length, 2)
  assert.equal(revised.submissions[0].values.answers.publisher_name, '')
  assert.equal(revised.submissions[1].values.answers.publisher_name, 'Penerbit yang diperbarui')
  const loa = initialClaimValues('SINTA_JOURNAL', user)
  loa.answers.work_title = 'Klaim LOA baru dengan kebijakan yang belum tersedia'
  loa.answers.issue_details = { volume: '', issue: '', pages: '', publicationYear: '2026' }
  loa.answers.publication_status = 'LOA'
  const pending = await mockClaimRepository.submit(loa, user)
  assert.equal(pending.status, 'PENDING_POLICY_REVIEW'); assert.equal(pending.quotedAmount, null)
  assert.equal(textAnswer(pending.values, 'publication_status'), 'LOA')
  const assigned = { ...revised, status: 'UNDER_REVIEW' as const, reviewerIds: [reviewer.id] }
  memory.set(CLAIM_STORAGE_KEY, JSON.stringify([assigned]))
  assert(canReviewClaim(assigned, reviewer)); assert(!canReviewClaim(assigned, { ...reviewer, id: 'unassigned' }))
  const review = emptyReview(assigned, reviewer.id)
  await assert.rejects(mockClaimRepository.saveReview(assigned.id, review, user, assigned.version, false))
  await assert.rejects(mockClaimRepository.saveReview(assigned.id, { ...review, reviewerId: 'spoof' }, reviewer, assigned.version, false))
  assert(reviewIssues(assigned, review, reviewer, true).length > 0)
  const savedReview = await mockClaimRepository.saveReview(assigned.id, review, reviewer, assigned.version, false)
  for (const field of templates[0].fields.filter(field => field.reviewerSuitabilityField && fieldVisible(field, assigned.values))) review.checks[field.fieldId] = 'Ya'
  review.comment = 'Butir sudah diperiksa; kebijakan dan tarif masih belum disahkan.'
  assert.equal(reviewIssues(assigned, { ...review, submissionVersion: 1 }, reviewer, true).length, 1)
  assert(reviewIssues(assigned, { ...review, checks: { ...review.checks, 'UNKNOWN.field': 'Ya' } }, reviewer, true).length > 0)
  const finished = await mockClaimRepository.saveReview(savedReview.id, review, reviewer, savedReview.version, true)
  assert.equal(finished.status, 'REVIEW_COMPLETED'); assert.equal(finished.reviews.length, 1)
  assert.equal(finished.reviews[0].submissionVersion, 2); assert.equal(finished.approvedAmount, null); assert.equal(finished.batchId, null)
  await assert.rejects(mockClaimRepository.saveReview(finished.id, review, reviewer, finished.version, false))
  const csv = claimCsv([{ ...finished, title: '=SUM(A1:A2)' }])
  assert(csv.includes("'=SUM(A1:A2)")); assert(csv.includes('Menunggu Konfigurasi SK'))
  assert.equal(filterClaims(seedClaims, { ...emptyClaimFilters, category: 'BOOK' }).length, 1)
  memory.set(CLAIM_STORAGE_KEY, 'invalid-json'); await assert.rejects(mockClaimRepository.list(), /tidak dapat dibaca/)
  await mockClaimRepository.reset(); assert.equal((await mockClaimRepository.list()).length, 10)
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => null, setItem() { throw new Error('quota') } }, configurable: true })
  await assert.rejects(mockClaimRepository.saveDraft(book, user), /belum tersimpan/)
  console.log('Cek 10 template insentif, kondisi field, aktor, berkas, versi revisi, checklist, duplikat, tahun, dan nominal null lulus.')
}
