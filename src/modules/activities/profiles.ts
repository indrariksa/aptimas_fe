import { schemes } from './data.ts'
import type { Activity, DemoUser, DraftValues, Domain } from './model.ts'
import { latestPolicy, policyById } from '../configuration/store.ts'

export const wizardSteps = ['Identitas', 'Tim Pengusul', 'Substansi', 'Pendanaan & Jadwal', 'Dokumen', 'Rencana Luaran', 'Pratinjau']
export const sectionLabels: Record<string, string> = {
  latar_belakang: 'Latar belakang', rumusan_masalah: 'Rumusan masalah', tujuan: 'Tujuan', kebaruan: 'Kebaruan', state_of_art: 'State of the art', roadmap: 'Roadmap penelitian', metodologi: 'Metodologi',
  analisis_situasi: 'Analisis situasi mitra', permasalahan_prioritas: 'Permasalahan prioritas', solusi: 'Solusi yang ditawarkan', target_pemberdayaan: 'Target pemberdayaan dan penerima manfaat', metode_pelaksanaan: 'Metode pelaksanaan', partisipasi_mitra: 'Partisipasi mitra', evaluasi: 'Evaluasi', keberlanjutan: 'Keberlanjutan',
  riwayat_riset: 'Riwayat riset dan bukti kesiapan', aspek_teknis: 'Kelayakan teknis', pasar: 'Kelayakan pasar', legal: 'Aspek legal', finansial: 'Kelayakan finansial', risiko: 'Risiko dan mitigasi', model_bisnis: 'Model bisnis', roadmap_hilirisasi: 'Roadmap hilirisasi', strategi_adopsi: 'Strategi adopsi', proyeksi_dampak: 'Proyeksi dampak',
}
const domainSections: Record<Domain, string[]> = {
  RESEARCH: ['latar_belakang', 'rumusan_masalah', 'tujuan', 'kebaruan', 'state_of_art', 'roadmap', 'metodologi'],
  COMMUNITY_SERVICE: ['analisis_situasi', 'permasalahan_prioritas', 'solusi', 'target_pemberdayaan', 'metode_pelaksanaan', 'partisipasi_mitra', 'evaluasi', 'keberlanjutan'],
  INNOVATION: ['tujuan', 'metodologi'],
}
export const documentLabels: Record<string, string> = { proposal: 'Proposal substansi', partner: 'Surat kemitraan / LoI / MoU', technical: 'Lampiran teknis produk', tkt: 'Bukti TKT', location: 'Bukti lokasi / peta', originality: 'Surat orisinalitas', supporting: 'Dokumen pendukung', report: 'Laporan', output: 'Bukti capaian' }

// Profil demo berversi; ganti dengan profil terbitan LPPM saat aturan resmi tersedia.
export const formProfiles = Object.fromEntries(schemes.map(scheme => [scheme.id, {
  id: `${scheme.id}-profile-v1`, schemeVersionId: scheme.id, domain: scheme.domain,
  maxWords: 500, summaryWords: 300, keywordMin: 3, keywordMax: 5, maxMonths: 24, budgetCap: 100_000_000,
  categories: scheme.domain === 'COMMUNITY_SERVICE' ? ['Bahan kegiatan', 'Pelatihan', 'Perjalanan', 'Publikasi & dokumentasi'] : scheme.domain === 'INNOVATION' ? ['Bahan prototipe', 'Pengujian', 'Peralatan', 'Perjalanan', 'Pendaftaran KI'] : ['Bahan', 'Pengumpulan data', 'Analisis data', 'Sewa peralatan', 'Perjalanan', 'Publikasi & KI'],
  sections: scheme.domain === 'INNOVATION' && scheme.fundingSource === 'GOVERNMENT' ? ['riwayat_riset', 'aspek_teknis', 'pasar', 'legal', 'finansial', 'risiko', 'model_bisnis', 'roadmap_hilirisasi', 'strategi_adopsi', 'proyeksi_dampak'] : domainSections[scheme.domain],
  requireTkt: scheme.domain === 'INNOVATION' && scheme.fundingSource === 'GOVERNMENT',
  requirePartner: scheme.domain === 'COMMUNITY_SERVICE',
  documents: ['proposal', ...(scheme.domain === 'COMMUNITY_SERVICE' && scheme.fundingSource !== 'INTERNAL' ? ['partner'] : []), ...(scheme.domain === 'INNOVATION' && scheme.fundingSource === 'GOVERNMENT' ? ['technical', 'tkt'] : [])],
  outputKinds: scheme.domain === 'RESEARCH' ? ['Artikel ilmiah', 'Buku', 'Kekayaan intelektual', 'Produk riset'] : scheme.domain === 'COMMUNITY_SERVICE' ? ['Publikasi', 'Produk mitra', 'Dampak pemberdayaan', 'Dokumentasi kegiatan'] : ['Prototipe', 'Produk siap adopsi', 'Kekayaan intelektual', 'Model bisnis'],
  windows: { proposal: ['2026-09-01', '2026-10-31'], revision: ['2026-09-01', '2026-12-31'], report: ['2026-09-01', '2026-12-31'], output: ['2026-09-01', '2026-12-31'] },
  revisionTarget: 'UNDER_REVIEW' as const,
}]))
export function profileFor(id: string, versionId?: string | null) {
  const baseline = formProfiles[id], policy = versionId === undefined ? latestPolicy('WORKFLOW', id) : policyById(versionId)
  if (!policy || policy.kind !== 'WORKFLOW' || policy.scope !== id) return baseline
  const cap = decimalUnits(policy.profile.budgetCap, 2)
  return { ...baseline, id: policy.id, maxWords: policy.profile.maxWords, summaryWords: policy.profile.summaryWords, budgetCap: cap === null ? baseline.budgetCap : Number(cap) / 100, windows: policy.profile.windows }
}
export function words(value: string) { return value.trim() ? value.trim().split(/\s+/).length : 0 }
export function keywordList(value: string) { return value.split(',').map(item => item.trim()).filter(Boolean) }
export function decimalUnits(value: string, precision: number): bigint | null {
  if (!new RegExp(`^\\d{1,12}(?:\\.\\d{1,${precision}})?$`).test(value)) return null
  const [whole, fraction = ''] = value.split('.')
  return BigInt(whole) * 10n ** BigInt(precision) + BigInt(fraction.padEnd(precision, '0'))
}
export function lineCents(item: DraftValues['proposal']['budget'][number]): number | null {
  const price = decimalUnits(item.price, 2), quantity = decimalUnits(item.quantity, 3)
  if (price === null || quantity === null || quantity <= 0n) return null
  const amount = (price * quantity + 500n) / 1000n
  return amount > BigInt(Number.MAX_SAFE_INTEGER) ? null : Number(amount)
}
export function budgetCents(items: DraftValues['proposal']['budget']) {
  let total = 0
  for (const item of items) { const amount = lineCents(item); if (amount === null || !Number.isSafeInteger(total + amount)) return null; total += amount }
  return total
}
export function windowOpen(id: string, stage: 'proposal' | 'revision' | 'report' | 'output', now = new Date(), versionId?: string | null) {
  const window = profileFor(id, versionId)?.windows[stage]
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return !!window && date >= window[0] && date <= window[1]
}
export function canRecord(activity: Activity, user: DemoUser, stage: 'report' | 'output') {
  return user.role === 'DOSEN' && activity.ownerId === user.id && windowOpen(activity.schemeVersionId, stage, new Date(), activity.profileVersionId) && (stage === 'report' ? activity.status === 'IN_PROGRESS' : ['IN_PROGRESS', 'PROGRESS_SUBMITTED', 'FINAL_SUBMITTED', 'OUTPUT_PENDING'].includes(activity.status))
}
export type ProposalIssue = { path: string; message: string; step: number }
export function proposalIssues(values: DraftValues, user: DemoUser, versionId?: string | null): ProposalIssue[] {
  const issues: ProposalIssue[] = []
  const add = (path: string, message: string, step: number) => issues.push({ path, message, step })
  const profile = profileFor(values.schemeVersionId, versionId), scheme = schemes.find(item => item.id === values.schemeVersionId)
  if (!profile || !scheme) { add('schemeVersionId', 'Pilih skema yang tersedia.', 0); return issues }
  const p = values.proposal
  if (values.title.trim().length < 8) add('title', 'Judul minimal 8 karakter untuk pengajuan.', 0)
  if (!values.summary.trim() || words(values.summary) > profile.summaryWords) add('summary', `Isi ringkasan, maksimal ${profile.summaryWords} kata.`, 0)
  const keywords = keywordList(p.keywords)
  if (keywords.length < profile.keywordMin || keywords.length > profile.keywordMax || new Set(keywords.map(item => item.toLocaleLowerCase('id-ID'))).size !== keywords.length) add('proposal.keywords', `Isi ${profile.keywordMin}–${profile.keywordMax} kata kunci unik, pisahkan dengan koma.`, 0)
  if (!p.scienceCluster.trim()) add('proposal.scienceCluster', 'Pilih rumpun ilmu.', 0)
  if (!Number.isInteger(p.duration) || p.duration < 1 || p.duration > profile.maxMonths) add('proposal.duration', `Durasi 1–${profile.maxMonths} bulan.`, 0)
  if (p.externalUrl && !/^https:\/\//i.test(p.externalUrl)) add('proposal.externalUrl', 'Tautan eksternal harus menggunakan HTTPS.', 0)
  if (p.externalUrl) { try { const url = new URL(p.externalUrl); if (!url.hostname || url.username || url.password) throw new Error(); } catch { add('proposal.externalUrl', 'Tautan HTTPS tidak valid.', 0) } }
  const team = new Set([user.academicId.toLocaleLowerCase('id-ID').trim()])
  p.members.forEach((member, index) => {
    const key = member.academicId.trim().toLocaleLowerCase('id-ID')
    if (!key || team.has(key)) add(`proposal.members.${index}.academicId`, 'Identitas anggota wajib dan tidak boleh duplikat dengan ketua/anggota lain.', 1)
    team.add(key)
    for (const field of ['name', 'affiliation'] as const) if (!member[field].trim()) add(`proposal.members.${index}.${field}`, 'Lengkapi data anggota.', 1)
  })
  if (profile.requirePartner && !p.partners.length) add('proposal.partners', 'Tambahkan minimal satu mitra PKM.', 1)
  p.partners.forEach((partner, index) => {
    for (const field of ['name', 'kind', 'address', 'region'] as const) if (!partner[field].trim()) add(`proposal.partners.${index}.${field}`, 'Lengkapi informasi mitra.', 1)
    if (partner.contact.trim() && !partner.consent) add(`proposal.partners.${index}.consent`, 'Konfirmasikan izin berbagi kontak atau kosongkan kontak mitra.', 1)
  })
  profile.sections.forEach(key => { if (!(p.sections[key] ?? '').trim() || words(p.sections[key] ?? '') > profile.maxWords) add(`proposal.sections.${key}`, `Isi ${sectionLabels[key].toLowerCase()}, maksimal ${profile.maxWords} kata.`, 2) })
  if (scheme.domain === 'INNOVATION') {
    for (const key of ['name', 'kind', 'description', 'benefit', 'sector'] as const) if (!p.product[key].trim()) add(`proposal.product.${key}`, 'Lengkapi informasi produk.', 2)
    if (profile.requireTkt && (!/^[1-9]$/.test(p.product.tktCurrent) || !/^[1-9]$/.test(p.product.tktTarget) || Number(p.product.tktTarget) < Number(p.product.tktCurrent))) add('proposal.product.tktTarget', 'Isi TKT 1–9; target tidak boleh lebih rendah dari TKT saat ini.', 2)
  }
  if (!p.budget.length) add('proposal.budget', 'Tambahkan minimal satu item RAB.', 3)
  p.budget.forEach((item, index) => {
    if (!profile.categories.includes(item.category)) add(`proposal.budget.${index}.category`, 'Pilih komponen RAB sesuai profil.', 3)
    for (const key of ['description', 'unit'] as const) if (!item[key].trim()) add(`proposal.budget.${index}.${key}`, 'Kolom ini wajib diisi.', 3)
    if (lineCents(item) === null) add(`proposal.budget.${index}.quantity`, 'Volume harus positif (maks. 3 desimal), harga nonnegatif (maks. 2 desimal). Gunakan titik desimal.', 3)
    if (item.year < 1 || item.year > Math.ceil(p.duration / 12)) add(`proposal.budget.${index}.year`, 'Tahun harus sesuai durasi kegiatan.', 3)
  })
  const total = budgetCents(p.budget)
  if (total === null || total > profile.budgetCap * 100) add('proposal.budget', `Total RAB melampaui pagu simulasi Rp${profile.budgetCap.toLocaleString('id-ID')} atau angka tidak valid.`, 3)
  if (!p.schedule.length) add('proposal.schedule', 'Tambahkan jadwal kegiatan.', 3)
  p.schedule.forEach((item, index) => { if (!item.title.trim() || item.year < 1 || item.start < 1 || item.end > 12 || item.end < item.start || (item.year - 1) * 12 + item.end > p.duration) add(`proposal.schedule.${index}.title`, 'Isi kegiatan dan rentang bulan yang sesuai durasi.', 3) })
  profile.documents.forEach(purpose => { if (!p.files.some(file => file.purpose === purpose)) add('proposal.files', `Lengkapi ${documentLabels[purpose].toLowerCase()}.`, 4) })
  if (!p.outputs.length) add('proposal.outputs', 'Tambahkan minimal satu target luaran.', 5)
  p.outputs.forEach((item, index) => { if (!item.title.trim() || !profile.outputKinds.includes(item.kind) || !item.target.trim() || item.quantity < 1 || item.year < 2026 || item.year > 2026 + Math.ceil(p.duration / 12) - 1) add(`proposal.outputs.${index}.title`, 'Lengkapi jenis, judul, jumlah, status target dan tahun sesuai durasi.', 5) })
  return issues
}
