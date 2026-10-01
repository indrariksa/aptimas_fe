import assert from 'node:assert/strict'
import { checkIncentives } from './incentive-check.ts'
import { seedActivities, demoUsers, schemes } from '../src/modules/activities/data.ts'
import { actionFor, activitySummary, canEditDraft, csvCell, filterActivities, visibleActivities } from '../src/modules/activities/rules.ts'
import { activitySchema, draftSchema, emptyFilters, proposalSchema, realizationSchema, type DraftValues } from '../src/modules/activities/model.ts'
import { ACTIVITY_STORAGE_KEY, mockActivityRepository } from '../src/modules/activities/repository.ts'
import { budgetCents, canRecord, lineCents, profileFor, proposalIssues, windowOpen } from '../src/modules/activities/profiles.ts'
import { FILE_LIMIT, downloadFile, ensureFiles, storeFile, validateFile } from '../src/modules/activities/files.ts'

seedActivities.forEach(item => activitySchema.parse(item))
const mine = visibleActivities(seedActivities, demoUsers.DOSEN)
assert(mine.every(item => item.ownerId === demoUsers.DOSEN.id))
assert(visibleActivities(seedActivities, demoUsers.REVIEWER).every(item => item.reviewerIds.includes('reviewer-1')))
assert(visibleActivities(seedActivities, demoUsers.OPERATOR).every(item => item.status !== 'DRAFT'))
const draft = mine.find(item => item.status === 'DRAFT' && item.domain === 'RESEARCH')!
assert(canEditDraft(draft, demoUsers.DOSEN))
assert(!canEditDraft(draft, demoUsers.REVIEWER))
assert(!canEditDraft({ ...draft, ownerId: 'another-owner' }, demoUsers.DOSEN))
assert.equal(activitySummary(mine).total, mine.length)
assert.equal(activitySummary(mine).correction, 1)
assert.equal(filterActivities(mine, { ...emptyFilters, q: '  ant colony  ', domain: 'RESEARCH' }).length, 1)
assert.equal(filterActivities(mine, { ...emptyFilters, q: 'tidak ada judul ini' }).length, 0)
assert.equal(filterActivities(mine, { ...emptyFilters, year: '2025' }).length, 0)
assert(actionFor(mine.find(item => item.status === 'REVISION_REQUIRED')!, demoUsers.DOSEN))
assert.equal(csvCell('=SUM(A1:A2)'), '"\'=SUM(A1:A2)"')
assert.equal(csvCell(' \t@CMD'), '"\' \t@CMD"')
assert.equal(csvCell('Judul "riset"'), '"Judul ""riset"""')
assert(!draftSchema.safeParse({ title: '   ', year: '2026', schemeVersionId: 'x', summary: '' }).success)

const memory = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) }, configurable: true })
const values = { title: 'Penelitian baru untuk demonstrasi', schemeVersionId: 'research-internal-2026-v1', year: '2026' as const, summary: '' }
await assert.rejects(mockActivityRepository.saveDraft(values, demoUsers.ADMIN))
const created = await mockActivityRepository.saveDraft(values, demoUsers.DOSEN)
assert.equal(created.status, 'DRAFT')
assert.equal(created.submittedAt, null)
assert.equal(created.approvedAmount, null)
assert((await mockActivityRepository.list()).some(item => item.id === created.id))
const updated = await mockActivityRepository.saveDraft({ ...values, title: 'Judul penelitian yang diperbarui' }, demoUsers.DOSEN, created.id)
assert.equal(updated.id, created.id)
assert.equal(updated.version, 2)
assert.equal(updated.history.length, 2)
await assert.rejects(mockActivityRepository.saveDraft(values, { ...demoUsers.DOSEN, id: 'another-owner' }, created.id))
memory.set(ACTIVITY_STORAGE_KEY, 'invalid-json')
await assert.rejects(mockActivityRepository.list(), /tidak dapat dibaca/)
await mockActivityRepository.reset()
assert.equal((await mockActivityRepository.list()).length, seedActivities.length)

// Waktu tetap menjaga window demo dapat diperiksa setelah 2026.
const NativeDate = Date
class DemoDate extends NativeDate { constructor(value?: string | number) { super(value ?? '2026-10-01T05:00:00.000Z') } }
Object.defineProperty(globalThis, 'Date', { value: DemoDate, configurable: true })
assert(windowOpen(schemes[0].id, 'proposal'))
assert(!windowOpen(schemes[0].id, 'proposal', new NativeDate('2026-11-01T05:00:00Z')))

// Double IndexedDB dibatasi pada transaksi Blob yang dipakai aplikasi.
const blobs = new Map<string, Blob>()
const database = {
  close() {},
  transaction() {
    const tx = { oncomplete: null as (() => void) | null, objectStore: () => ({
      put(blob: Blob, id: string) { blobs.set(id, blob); const request = { result: id }; queueMicrotask(() => tx.oncomplete?.()); return request },
      get(id: string) { const request = { result: blobs.get(id) }; queueMicrotask(() => tx.oncomplete?.()); return request },
    }) }
    return tx
  },
}
Object.defineProperty(globalThis, 'indexedDB', { value: { open() { const request = { result: database, onsuccess: null as (() => void) | null }; queueMicrotask(() => request.onsuccess?.()); return request } }, configurable: true })
const proposalFile = await storeFile(new File(['%PDF-1.7 demo'], 'proposal.pdf', { type: 'application/pdf' }), 'proposal')
await ensureFiles([proposalFile])
assert.throws(() => validateFile({ name: 'evil.html', type: 'text/html', size: 10 }, 'output'))
assert.throws(() => validateFile({ name: 'renamed.pdf', type: 'text/html', size: 10 }, 'proposal'))
assert.throws(() => validateFile({ name: 'too-big.pdf', type: 'application/pdf', size: FILE_LIMIT + 1 }, 'proposal'))
await assert.rejects(ensureFiles([{ ...proposalFile, id: crypto.randomUUID() }]), /tidak tersedia/)
await assert.rejects(downloadFile({ ...proposalFile, id: crypto.randomUUID() }), /tidak ditemukan/)

function completeValues(schemeId: string): DraftValues {
  const scheme = schemes.find(item => item.id === schemeId)!, profile = profileFor(schemeId)
  return draftSchema.parse({ title: 'Kegiatan lengkap untuk demonstrasi lokal', year: '2026', schemeVersionId: schemeId, summary: 'Ringkasan kegiatan untuk memeriksa validasi pengajuan yang lengkap.', proposal: {
    ...proposalSchema.parse({}), keywords: 'logistik, teknologi, kolaborasi', scienceCluster: 'Komputer & Informatika',
    sections: Object.fromEntries(profile.sections.map(key => [key, 'Substansi demonstrasi yang sesuai bagian kegiatan.'])),
    partners: profile.requirePartner ? [{ name: 'Kelompok UMKM', kind: 'UMKM', address: 'Alamat simulasi', region: 'Bandung', contact: '', consent: false, role: '', resources: '' }] : [],
    product: { name: 'Produk simulasi', kind: 'Prototipe', description: 'Deskripsi produk', benefit: 'Manfaat produk', sector: 'Logistik', tktCurrent: '4', tktTarget: '6', ipStatus: '', ipNumber: '' },
    budget: [{ category: profile.categories[0], description: 'Bahan pelaksanaan', unit: 'paket', quantity: '1.125', price: '12000.25', year: 1 }],
    schedule: [{ title: 'Pelaksanaan kegiatan', year: 1, start: 1, end: 12 }],
    files: profile.documents.map(purpose => ({ ...proposalFile, purpose })),
    outputs: [{ title: scheme.domain === 'RESEARCH' ? 'Artikel hasil kegiatan' : 'Produk hasil kegiatan', kind: profile.outputKinds[0], quantity: 1, target: 'Tercapai', year: 2026 }],
  } })
}
for (const scheme of schemes) assert.deepEqual(proposalIssues(completeValues(scheme.id), demoUsers.DOSEN), [], scheme.id)
const full = completeValues(schemes[0].id)
assert.equal(lineCents(full.proposal.budget[0]), 1350028)
assert.equal(lineCents({ ...full.proposal.budget[0], price: '0.10', quantity: '0.1' }), 1)
assert.equal(lineCents({ ...full.proposal.budget[0], price: '12.345' }), null)
assert.equal(lineCents({ ...full.proposal.budget[0], quantity: '-1' }), null)
assert.equal(budgetCents([{ ...full.proposal.budget[0], price: '999999999999', quantity: '999999999999' }]), null)
const invalid = structuredClone(full)
invalid.proposal.members = [{ academicId: demoUsers.DOSEN.academicId.toLowerCase(), name: 'Duplikat ketua', affiliation: 'ULBI', role: 'DOSEN' }]
invalid.proposal.keywords = 'Logistik, logistik, riset'
invalid.proposal.schedule[0].end = 13
invalid.proposal.budget[0].price = '100000001'
invalid.proposal.externalUrl = 'javascript:alert(1)'
const paths = proposalIssues(invalid, demoUsers.DOSEN).map(item => item.path)
for (const path of ['proposal.members.0.academicId', 'proposal.keywords', 'proposal.schedule.0.title', 'proposal.budget', 'proposal.externalUrl']) assert(paths.includes(path), path)
assert(!realizationSchema.safeParse({ id: '', planIndex: 0, title: 'Hasil penelitian', status: 'PUBLISHED', date: '2026-02-30', note: '', files: [proposalFile] }).success)

const completeDraft = await mockActivityRepository.saveDraft(full, demoUsers.DOSEN)
await assert.rejects(mockActivityRepository.submit(values, demoUsers.DOSEN, completeDraft.id, completeDraft.version))
await assert.rejects(mockActivityRepository.saveDraft(full, demoUsers.DOSEN, completeDraft.id, 0), /tab lain/)
const submitted = await mockActivityRepository.submit(full, demoUsers.DOSEN, completeDraft.id, completeDraft.version)
assert.equal(submitted.status, 'SUBMITTED')
assert.equal(submitted.requestedAmount, 13500.28)
assert.equal(submitted.approvedAmount, null)
assert.equal(submitted.submissions.length, 1)
await assert.rejects(mockActivityRepository.saveDraft(full, demoUsers.DOSEN, submitted.id, submitted.version))
const correction = { ...submitted, status: 'NEEDS_CORRECTION' as const }
memory.set(ACTIVITY_STORAGE_KEY, JSON.stringify([correction, ...seedActivities]))
const corrected = await mockActivityRepository.saveDraft({ ...full, summary: 'Isi revisi yang berbeda dengan versi pertama pengajuan.' }, demoUsers.DOSEN, correction.id, correction.version)
assert.equal(corrected.status, 'NEEDS_CORRECTION')
assert.equal(corrected.submissions[0].values.summary, full.summary)
const revised = await mockActivityRepository.submit({ ...full, summary: corrected.summary }, demoUsers.DOSEN, corrected.id, corrected.version)
assert.equal(revised.status, 'ADMIN_CHECK')
assert.equal(revised.submissions[1].kind, 'PROPOSAL_REVISION')
assert.equal(revised.submissions[1].version, 2)
assert.equal(revised.submissions[0].values.summary, full.summary)
for (const scheme of schemes.filter(item => item.domain !== 'RESEARCH')) {
  const item = await mockActivityRepository.saveDraft(completeValues(scheme.id), demoUsers.DOSEN)
  assert.equal(item.domain, scheme.domain)
  assert(canEditDraft(item, demoUsers.DOSEN))
}
const running = { ...revised, status: 'IN_PROGRESS' as const }
memory.set(ACTIVITY_STORAGE_KEY, JSON.stringify([running, ...seedActivities]))
const outputFile = await storeFile(new File(['bukti'], 'evidence.png', { type: 'image/png' }), 'output')
const realization = await mockActivityRepository.saveRealization(running.id, { ...emptyForTest(), files: [outputFile] }, demoUsers.DOSEN, running.version)
function emptyForTest() { return { id: '', planIndex: 0, title: 'Artikel hasil kegiatan', status: 'PUBLISHED' as const, date: '2026-10-01', note: 'Hasil simulasi yang belum diverifikasi.' } }
assert.equal(realization.status, 'IN_PROGRESS')
assert.equal(realization.realizations.length, 1)
assert.equal(realization.plannedOutputs[0].achieved, false)
const newEvidence = await storeFile(new File(['bukti terbaru'], 'updated-evidence.png', { type: 'image/png' }), 'output')
const editedOutput = await mockActivityRepository.saveRealization(realization.id, { ...realization.realizations[0], note: 'Bukti terbaru', files: [newEvidence] }, demoUsers.DOSEN, realization.version)
assert.equal(editedOutput.outputHistory.length, 2)
assert.equal(editedOutput.outputHistory[0].values.files[0].id, outputFile.id)
assert.equal(editedOutput.outputHistory[1].values.files[0].id, newEvidence.id)
assert.equal(editedOutput.outputHistory[1].version, 2)
await ensureFiles(editedOutput.outputHistory[0].values.files)
assert(canRecord(editedOutput, demoUsers.DOSEN, 'report'))
const reportFile = await storeFile(new File(['%PDF-1.7 report'], 'report.pdf', { type: 'application/pdf' }), 'report')
await assert.rejects(mockActivityRepository.saveReport(editedOutput.id, { kind: 'FINAL_REPORT', summary: 'Ringkasan laporan pelaksanaan kegiatan.', progress: 80, files: [reportFile] }, demoUsers.DOSEN, editedOutput.version), /100%/)
await assert.rejects(mockActivityRepository.saveReport(editedOutput.id, { kind: 'PROGRESS_REPORT', summary: 'Ringkasan laporan pelaksanaan kegiatan.', progress: 50, files: [reportFile] }, { ...demoUsers.DOSEN, id: 'another-owner' }, editedOutput.version))
const report = await mockActivityRepository.saveReport(editedOutput.id, { kind: 'PROGRESS_REPORT', summary: 'Ringkasan laporan pelaksanaan kegiatan.', progress: 50, files: [reportFile] }, demoUsers.DOSEN, editedOutput.version)
assert.equal(report.status, 'PROGRESS_SUBMITTED')
assert.equal(report.reports.length, 1)
assert.equal(report.reports[0].version, 1)
await assert.rejects(mockActivityRepository.saveReport(report.id, { kind: 'FINAL_REPORT', summary: 'Ringkasan laporan pelaksanaan kegiatan.', progress: 100, files: [reportFile] }, demoUsers.DOSEN, report.version))
const legacy = { ...seedActivities[0] } as Record<string, unknown>
delete legacy.proposal; delete legacy.submissions; delete legacy.reports; delete legacy.realizations
assert.equal(activitySchema.parse(legacy).proposal, null)
assert.deepEqual(activitySchema.parse(legacy).reports, [])
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => null, setItem() { throw new Error('quota') } }, configurable: true })
await assert.rejects(mockActivityRepository.saveDraft(values, demoUsers.DOSEN), /belum tersimpan/)
await checkIncentives()
Object.defineProperty(globalThis, 'Date', { value: NativeDate, configurable: true })
console.log('Cek scope, wizard 8 profil, RAB desimal, berkas, snapshot revisi, laporan, capaian, konflik versi, dan migrasi draft lulus.')
