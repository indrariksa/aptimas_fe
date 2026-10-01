import assert from 'node:assert/strict'
import { demoUsers, schemes } from '../src/modules/activities/data.ts'
import { storeFile, ensureFiles } from '../src/modules/activities/files.ts'
import { mockActivityRepository, readActivities } from '../src/modules/activities/repository.ts'
import { activityPolicy, administerActivity, decideActivity, saveActivityReview, recordExternalStatus } from '../src/modules/activities/workflow.ts'
import { profileFor } from '../src/modules/activities/profiles.ts'
import { canReadActivityStage, visibleActivities } from '../src/modules/activities/rules.ts'
import { draftSchema, proposalSchema, type ActivityReview } from '../src/modules/activities/model.ts'
import { CONFIG_KEY, newPolicy, policyIssues, quoteClaim, readConfig, resetConfig, saveAccount, savePeriod, savePolicy, validateAssignments } from '../src/modules/configuration/store.ts'
import { mockWorkRepository, WORK_KEY } from '../src/modules/creative-works/repository.ts'
import { mockClaimRepository } from '../src/modules/incentives/repository.ts'
import { adjustClaim, administerClaim, batchClaims, decideClaim } from '../src/modules/incentives/workflow.ts'
import { emptyReview, initialClaimValues, templateFor } from '../src/modules/incentives/model.ts'
import { claimIssues, fieldVisible } from '../src/modules/incentives/rules.ts'

export async function checkPhaseFour() {
  const memory = new Map<string, string>()
  const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) }
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
  const dosen = demoUsers.DOSEN, admin = demoUsers.ADMIN, operator = demoUsers.OPERATOR, lppm = demoUsers.LPPM, reviewer = demoUsers.REVIEWER, reviewer2 = readConfig().accounts.find(a => a.id === 'reviewer-2')!
  const evidence = await storeFile(new File(['%PDF-1.7 kebijakan untuk tes'], 'policy.pdf', { type: 'application/pdf' }), 'policy')
  assert.equal(readConfig().policies.length, 0)
  assert.throws(() => validateAssignments([reviewer.id, reviewer.id], dosen.id, 2))
  assert.throws(() => validateAssignments([dosen.id], dosen.id, 1))
  const account = { id: crypto.randomUUID(), name: 'Akun Pemeriksaan', initials: 'AP', role: 'DOSEN' as const, studyProgram: 'Prodi Uji', academicId: 'CHECK-001', active: true }
  assert.throws(() => saveAccount(account, dosen, 0))
  saveAccount(account, admin, readConfig().version)
  assert.throws(() => saveAccount(account, admin, 0), /tab lain/)
  assert.throws(() => saveAccount({ ...account, id: crypto.randomUUID() }, admin, readConfig().version), /sudah digunakan/)
  assert.throws(() => saveAccount({ ...readConfig().accounts.find(a => a.id === admin.id)!, active: false }, admin, readConfig().version))
  saveAccount({ ...account, active: false }, admin, readConfig().version)
  await assert.rejects(mockActivityRepository.saveDraft({ title: 'Draft akun yang dinonaktifkan', schemeVersionId: schemes[0].id, year: '2026', summary: '' }, account), /tidak aktif/)
  const period = { id: 'uji-2027', label: 'Periode Uji 2027', year: 2027, minimumPublicationYear: 2026, opensOn: '2026-09-01', closesOn: '2027-12-31' }
  savePeriod(period, admin, readConfig().version)
  assert.throws(() => savePeriod({ ...period, year: 2028 }, admin, readConfig().version), /dibekukan/)

  const sk = { ...newPolicy('SK', 'BOOK'), label: 'SK Uji (bukan kebijakan resmi)', reference: 'SK-TEST-001', sopReference: 'SOP-TEST-001', files: [evidence], attested: true, reviewerCount: 2, authority: 'LPPM' as const, allowAdjustment: true, requiredKeys: ['work_title', 'publisher_name'], rates: [{ position: '1', field: '', value: '', amount: '123456.78' }] }
  assert.deepEqual(policyIssues(sk), [])
  await assert.rejects(savePolicy(sk, dosen, readConfig().version, true))
  await assert.rejects(savePolicy({ ...sk, attested: false }, admin, readConfig().version, true))
  await assert.rejects(savePolicy({ ...sk, files: [{ ...evidence, id: crypto.randomUUID() }] }, admin, readConfig().version, true), /tidak tersedia/)
  const published = await savePolicy(sk, admin, readConfig().version, true)
  await assert.rejects(savePolicy({ ...published, label: 'Mengubah terbitan' }, admin, readConfig().version, false), /tidak dapat diubah/)
  const values = initialClaimValues('BOOK', dosen)
  values.answers.work_title = 'Klaim untuk pemeriksaan Fase Empat'; values.answers.publication_year = '2026'
  assert(claimIssues(values, dosen, true).some(e => e.key === 'publisher_name'))
  values.answers.publisher_name = 'Penerbit Uji'
  assert.equal(quoteClaim(values).amount, 123456.78)
  assert.equal(quoteClaim({ ...values, authorPosition: '2' }).amount, null)
  assert.equal(quoteClaim({ ...values, categoryCode: 'SCOPUS_JOURNAL' }).amount, null)
  const second = await savePolicy({ ...published, id: '', status: 'DRAFT', label: 'SK Uji v2', rates: [{ position: '1', field: '', value: '', amount: '765432.10' }] }, admin, readConfig().version, true)
  assert.equal(second.version, 2); assert.equal(quoteClaim(values).amount, 765432.10); assert.equal(quoteClaim(values, published.id).amount, 123456.78)
  const claim = await mockClaimRepository.submit(values, dosen)
  assert.equal(claim.ruleVersionId, second.id); assert.equal(claim.quotedAmount, 765432.10)
  await assert.rejects(administerClaim(claim.id, admin, claim.version, 'START_CHECK'))
  let current = await administerClaim(claim.id, operator, claim.version, 'START_CHECK')
  await assert.rejects(administerClaim(current.id, operator, current.version, 'ASSIGN', [reviewer.id]))
  current = await administerClaim(current.id, operator, current.version, 'ASSIGN', [reviewer.id, reviewer2.id])
  await assert.rejects(decideClaim(current.id, lppm, current.version, 'APPROVED', 'Belum diperiksa'))
  const review = emptyReview(current, reviewer.id)
  templateFor('BOOK')!.fields.filter(f => f.reviewerSuitabilityField && fieldVisible(f, values)).forEach(f => { review.checks[f.fieldId] = 'Ya' })
  review.comment = 'Pemeriksaan untuk pengujian simulasi.'
  current = await mockClaimRepository.saveReview(current.id, review, reviewer, current.version, true)
  assert.equal(current.status, 'UNDER_REVIEW')
  await assert.rejects(mockClaimRepository.saveReview(current.id, review, reviewer, current.version, true))
  current = await mockClaimRepository.saveReview(current.id, { ...review, reviewerId: reviewer2.id }, reviewer2, current.version, true)
  assert.equal(current.status, 'REVIEW_COMPLETED'); assert.equal(current.approvedAmount, null)
  await assert.rejects(decideClaim(current.id, reviewer, current.version, 'APPROVED', 'Bukan otoritas'))
  current = await decideClaim(current.id, lppm, current.version, 'APPROVED', 'Hasil uji dua reviewer sesuai SOP uji.')
  assert.equal(current.approvedAmount, 765432.10)
  const third = await savePolicy({ ...second, id: '', status: 'DRAFT', label: 'SK Uji v3', rates: [{ position: '1', field: '', value: '', amount: '1000000' }] }, admin, readConfig().version, true)
  assert.equal(quoteClaim(current.values, current.ruleVersionId).amount, 765432.10)
  await assert.rejects(adjustClaim(current.id, operator, current.version, '500000', ''))
  current = await adjustClaim(current.id, operator, current.version, '500000.25', 'Koreksi beralasan pada uji.')
  assert.equal(current.adjustments[0].before, 765432.10)
  assert.equal(current.adjustments[0].after, 500000.25)
  await assert.rejects(batchClaims([{ id: current.id, version: current.version - 1 }], operator))
  const batchId = await batchClaims([{ id: current.id, version: current.version }], operator)
  const batched = (await mockClaimRepository.list()).find(c => c.id === current.id)!
  assert.equal(batched.status, 'BATCHED'); assert.equal(batched.batchSnapshot!.amount, 500000.25); assert.equal(batched.batchSnapshot!.id, batchId)
  await assert.rejects(batchClaims([{ id: batched.id, version: batched.version }], operator))
  await assert.rejects(adjustClaim(batched.id, operator, batched.version, '1', 'Tidak boleh setelah batch'))
  const ambiguous = await savePolicy({ ...third, id: '', status: 'DRAFT', label: 'SK Uji Ambigu', rates: [{ position: '', field: '', value: '', amount: '100' }, { position: '1', field: '', value: '', amount: '200' }] }, admin, readConfig().version, true)
  assert.equal(quoteClaim(values, ambiguous.id).amount, null)
  const sintaPolicy = { ...newPolicy('SK', 'SINTA_JOURNAL'), label: 'SK SINTA Uji', reference: 'SK-SINTA-TEST', sopReference: 'SOP-TEST', files: [evidence], attested: true, requiredKeys: ['apc_evidence_url'], rates: [{ position: '', field: 'sinta_rank', value: 'SINTA 1', amount: '200' }] }
  const sintaSK = await savePolicy(sintaPolicy, admin, readConfig().version, true), sintaValues = initialClaimValues('SINTA_JOURNAL', dosen)
  sintaValues.answers.work_title = 'Artikel untuk uji pilihan tarif'; sintaValues.answers.sinta_rank = 'SINTA 1'; sintaValues.answers.publication_status = 'Publish'; sintaValues.answers.issue_details = { volume: '', issue: '', pages: '', publicationYear: '2026' }
  assert.equal(quoteClaim(sintaValues, sintaSK.id).amount, 200)
  sintaValues.answers.publication_status = 'LOA'; assert.equal(quoteClaim(sintaValues, sintaSK.id).amount, null)
  assert(claimIssues(sintaValues, dosen, true, sintaSK.id).some(issue => issue.key === 'apc_evidence_url'))

  const scheme = schemes[0], baseline = profileFor(scheme.id, null)
  const workflow = { ...newPolicy('WORKFLOW', scheme.id), label: 'SOP Uji', reference: 'SOP-ACT-TEST', sopReference: 'OTORITAS-TEST', files: [evidence], attested: true, reviewerCount: 2, allowMilestones: true, rubric: [{ id: 'test-method', label: 'Metode Uji', weight: 100, maximum: 5 }] }
  assert(policyIssues({ ...workflow, rubric: [{ ...workflow.rubric[0], weight: 50 }] }).length)
  const sop = await savePolicy(workflow, admin, readConfig().version, true)
  const proposalFile = await storeFile(new File(['%PDF-1.7 proposal uji'], 'proposal-check.pdf', { type: 'application/pdf' }), 'proposal')
  const proposal = draftSchema.parse({ title: 'Proposal untuk pemeriksaan Fase Empat', schemeVersionId: scheme.id, year: '2026', summary: 'Ringkasan kegiatan untuk pemeriksaan workflow berkonfigurasi.', proposal: { ...proposalSchema.parse({}), keywords: 'logistik, teknologi, model', scienceCluster: 'Komputer & Informatika', sections: Object.fromEntries(baseline.sections.map(key => [key, 'Substansi yang disimpan untuk pemeriksaan.'])), budget: [{ category: baseline.categories[0], description: 'Bahan', unit: 'paket', quantity: '1', price: '1000.25', year: 1 }], schedule: [{ title: 'Kegiatan', year: 1, start: 1, end: 12 }], files: [proposalFile], outputs: [{ title: 'Luaran Uji', kind: baseline.outputKinds[0], quantity: 1, target: 'Tercapai', year: 2026 }] } })
  let activity = await mockActivityRepository.submit(proposal, dosen)
  assert.equal(activity.profileVersionId, sop.id)
  activity = await administerActivity(activity.id, operator, activity.version, 'START_CHECK', '')
  activity = await administerActivity(activity.id, operator, activity.version, 'ASSIGN', '', [reviewer.id, reviewer2.id])
  const activityReview: ActivityReview = { reviewerId: reviewer.id, stage: 'PROPOSAL', submissionVersion: 1, policyId: sop.id, scores: { 'test-method': 4 }, comment: 'Komentar penilaian uji.', recommendation: 'CONTINUE' }
  await assert.rejects(saveActivityReview(activity.id, { ...activityReview, scores: { 'test-method': 6 } }, reviewer, activity.version, true))
  activity = await saveActivityReview(activity.id, activityReview, reviewer, activity.version, true)
  assert.equal(activity.status, 'UNDER_REVIEW')
  await assert.rejects(saveActivityReview(activity.id, activityReview, reviewer, activity.version, true))
  activity = await saveActivityReview(activity.id, { ...activityReview, reviewerId: reviewer2.id }, reviewer2, activity.version, true)
  assert.equal(activity.status, 'REVIEW_COMPLETED')
  await assert.rejects(decideActivity(activity.id, admin, activity.version, 'APPROVE', 'Bukan otoritas', '1000'))
  activity = await decideActivity(activity.id, lppm, activity.version, 'APPROVE', 'Persetujuan uji, bukan pencairan.', '1000.25')
  assert.equal(activity.approvedAmount, 1000.25)
  activity = await decideActivity(activity.id, operator, activity.version, 'START', 'Mulai pelaksanaan uji.')
  const newerSop = await savePolicy({ ...sop, id: '', status: 'DRAFT', label: 'SOP Uji Baru', profile: { ...sop.profile, budgetCap: '10', categories: ['Komponen RAB Baru'], outputKinds: ['Jenis Luaran Baru'] } }, admin, readConfig().version, true)
  assert.equal(profileFor(scheme.id, activity.profileVersionId).budgetCap, 100000000)
  assert.equal(profileFor(scheme.id).budgetCap, 10); assert.equal(activityPolicy(activity)!.id, sop.id)
  assert.deepEqual(profileFor(scheme.id).categories, ['Komponen RAB Baru'])
  assert.deepEqual(profileFor(scheme.id, activity.profileVersionId).categories, baseline.categories)
  const reportFile = await storeFile(new File(['%PDF-1.7 laporan uji'], 'report-check.pdf', { type: 'application/pdf' }), 'report')
  activity = await mockActivityRepository.saveReport(activity.id, { kind: 'PROGRESS_REPORT', summary: 'Ringkasan kemajuan pelaksanaan untuk pemeriksaan.', progress: 50, files: [reportFile] }, dosen, activity.version)
  assert.deepEqual(activity.reviewerIds, [])
  activity = await administerActivity(activity.id, operator, activity.version, 'ASSIGN', '', [reviewer.id, reviewer2.id])
  for (const actor of [reviewer, reviewer2]) activity = await saveActivityReview(activity.id, { ...activityReview, reviewerId: actor.id, stage: 'PROGRESS_REPORT' }, actor, activity.version, true)
  activity = await decideActivity(activity.id, lppm, activity.version, 'ACCEPT_MILESTONE', 'Kemajuan diterima pada uji.')
  assert.equal(activity.status, 'IN_PROGRESS')
  assert(visibleActivities([activity], reviewer).length === 1)
  assert(canReadActivityStage(activity, reviewer, 'PROPOSAL', 1))
  assert(!canReadActivityStage(activity, reviewer, 'PROPOSAL', 2))
  const external = readActivities().find(a => a.status === 'EXTERNAL_TRACKING')!
  const externalFile = await storeFile(new File(['%PDF-1.7 keputusan luar'], 'external-check.pdf', { type: 'application/pdf' }), 'external')
  const tracking = await recordExternalStatus(external.id, { status: 'Sedang dievaluasi di portal sumber', url: 'https://example.org/decision', evidenceDate: '2026-09-30', files: [externalFile], funded: false }, operator, external.version)
  assert.equal(tracking.status, 'EXTERNAL_TRACKING'); assert.equal(tracking.externalUpdates[0].sourceOfTruth, 'EXTERNAL_MANUAL')

  const workFile = await storeFile(new File(['%PDF-1.7 bukti karya'], 'work-check.pdf', { type: 'application/pdf' }), 'work')
  const workValues = { category: 'Produk Teknologi' as const, title: 'Produk untuk uji arsip', description: 'Deskripsi karya yang sudah dibuat untuk pemeriksaan arsip.', availableOn: '2026-09-30', contributors: [], producer: '', registration: '', url: 'https://example.org/work', linkedActivityId: activity.id, files: [workFile] }
  await assert.rejects(mockWorkRepository.save(workValues, operator))
  await assert.rejects(mockWorkRepository.save({ ...workValues, availableOn: '2027-01-01' }, dosen))
  let work = await mockWorkRepository.save(workValues, dosen)
  assert.equal(work.status, 'RECORDED'); assert.equal(work.snapshots.length, 1)
  await assert.rejects(mockWorkRepository.save(workValues, dosen), /sudah tercatat/)
  await assert.rejects(mockWorkRepository.save({ ...workValues, title: 'Edit asing' }, { ...dosen, id: 'another' }, work.id, work.version))
  work = await mockWorkRepository.save({ ...workValues, description: 'Deskripsi terbaru tanpa mengubah salinan pertama.' }, dosen, work.id, work.version)
  assert.equal(work.snapshots.length, 2); assert.equal(work.snapshots[0].values.description, workValues.description)
  await ensureFiles(work.snapshots[0].values.files)
  work = await mockWorkRepository.archive(work.id, dosen, work.version)
  assert.equal((await mockWorkRepository.list(dosen)).length, 0); assert.equal((await mockWorkRepository.list(reviewer)).length, 0)
  assert.equal((await mockWorkRepository.list(admin)).length, 1)
  await assert.rejects(mockWorkRepository.archive(work.id, operator, work.version, true))
  work = await mockWorkRepository.archive(work.id, admin, work.version, true)
  assert.equal(work.deletedAt, null); assert.equal((await mockWorkRepository.list(dosen)).length, 1)
  memory.set(CONFIG_KEY, 'corrupt'); assert.throws(readConfig, /tidak dapat dibaca/)
  resetConfig(admin); assert.equal(quoteClaim(values, published.id).amount, null)
  assert.equal((await mockWorkRepository.list(dosen)).length, 1)
  memory.set(WORK_KEY, 'corrupt'); await assert.rejects(mockWorkRepository.list(dosen), /tidak dapat dibaca/)
  assert(newerSop.id !== sop.id)
  Object.defineProperty(globalThis, 'localStorage', { value: { ...storage, setItem() { throw new Error('quota') } }, configurable: true })
  await assert.rejects(savePolicy({ ...sk, id: '', status: 'DRAFT' }, admin, readConfig().version, false), /belum tersimpan/)
  console.log('Cek Fase 4: SK/SOP berversi, dua reviewer, otoritas, nominal, batch atomik, profil historis, milestone, eksternal manual, dan arsip karya lulus.')
}
