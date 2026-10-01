import { activitySchema, type Activity, type DemoUser, type Domain, type Role, type ActivityStatus } from './model.ts'

export const demoUsers: Record<Role, DemoUser> = {
  DOSEN: { id: 'dosen-1', name: 'Dr. Ratna Puspitasari, M.T.', initials: 'RP', role: 'DOSEN', studyProgram: 'S1 Teknik Informatika', academicId: 'DEMO-001' },
  REVIEWER: { id: 'reviewer-1', name: 'Dr. Budi Santoso, M.Kom.', initials: 'BS', role: 'REVIEWER', studyProgram: 'S1 Teknik Informatika', academicId: 'DEMO-002' },
  OPERATOR: { id: 'operator-1', name: 'Dina Rahmawati, S.Ak.', initials: 'DR', role: 'OPERATOR', studyProgram: 'LPPM ULBI', academicId: 'DEMO-003' },
  LPPM: { id: 'lppm-1', name: 'Dr. Ahmad Pratama, M.T.', initials: 'AP', role: 'LPPM', studyProgram: 'LPPM ULBI', academicId: 'DEMO-004' },
  ADMIN: { id: 'admin-1', name: 'Administrator Demo', initials: 'AD', role: 'ADMIN', studyProgram: 'ULBI', academicId: 'DEMO-005' },
}

export const schemes = [
  { id: 'research-internal-2026-v1', label: 'Hibah Internal', domain: 'RESEARCH', fundingSource: 'INTERNAL' },
  { id: 'research-government-2026-v1', label: 'Hibah Pemerintah', domain: 'RESEARCH', fundingSource: 'GOVERNMENT' },
  { id: 'research-industry-2026-v1', label: 'Kerja Sama Industri', domain: 'RESEARCH', fundingSource: 'INDUSTRY' },
  { id: 'community-internal-2026-v1', label: 'Hibah Internal', domain: 'COMMUNITY_SERVICE', fundingSource: 'INTERNAL' },
  { id: 'community-government-2026-v1', label: 'Hibah Pemerintah', domain: 'COMMUNITY_SERVICE', fundingSource: 'GOVERNMENT' },
  { id: 'community-industry-2026-v1', label: 'Hibah Industri', domain: 'COMMUNITY_SERVICE', fundingSource: 'INDUSTRY' },
  { id: 'innovation-internal-2026-v1', label: 'Hibah Internal', domain: 'INNOVATION', fundingSource: 'INTERNAL' },
  { id: 'innovation-government-2026-v1', label: 'Dorongan Teknologi', domain: 'INNOVATION', fundingSource: 'GOVERNMENT' },
] as const

export const demoLecturers = [demoUsers.DOSEN, demoUsers.REVIEWER, { id: 'dosen-2', name: 'Dr. Andi Setiawan, M.T.', studyProgram: 'D4 Logistik Bisnis', academicId: 'DEMO-006' }]

const seedRows: [string, Domain, ActivityStatus, number, number, boolean?][] = [
  ['Optimasi Rute Distribusi Logistik Menggunakan Algoritma Ant Colony', 'RESEARCH', 'REVISION_REQUIRED', 0, 28],
  ['Sistem Deteksi Dini Kerusakan Kendaraan Logistik Berbasis Internet of Things', 'RESEARCH', 'UNDER_REVIEW', 0, 25],
  ['Pemberdayaan UMKM melalui Digitalisasi Pengelolaan Persediaan', 'COMMUNITY_SERVICE', 'IN_PROGRESS', 3, 22],
  ['Prototipe Sistem Pelacakan Rantai Dingin untuk Produk Farmasi', 'INNOVATION', 'DRAFT', 6, 20],
  ['Analisis Ketahanan Rantai Pasok pada Industri Logistik Nasional', 'RESEARCH', 'COMPLETED', 1, 18],
  ['Model Prediksi Permintaan Pengiriman Barang Berbasis Machine Learning', 'RESEARCH', 'DRAFT', 0, 16],
  ['Pengembangan Platform Kolaborasi Riset dan Inovasi Logistik', 'RESEARCH', 'ADMIN_CHECK', 2, 14],
  ['Pendampingan Literasi Digital bagi Pelaku Usaha di Bandung', 'COMMUNITY_SERVICE', 'OUTPUT_PENDING', 3, 12],
  ['Pengukuran Emisi Karbon pada Aktivitas Last Mile Delivery', 'RESEARCH', 'EXTERNAL_TRACKING', 1, 10],
  ['Perancangan Gudang Cerdas dengan Sistem Manajemen Energi Terintegrasi', 'RESEARCH', 'PROGRESS_SUBMITTED', 0, 8],
  ['Pengembangan Teknologi Kemasan Ramah Lingkungan untuk Ekspor', 'INNOVATION', 'SUBMITTED', 7, 7, true],
  ['Evaluasi Kualitas Layanan Logistik pada Kawasan Industri', 'RESEARCH', 'NEEDS_CORRECTION', 0, 6, true],
  ['Pelatihan Pemasaran Digital bagi Kelompok Usaha Desa', 'COMMUNITY_SERVICE', 'FINAL_SUBMITTED', 4, 5, true],
  ['Rancang Bangun Sistem Sortasi Paket Berbasis Computer Vision', 'RESEARCH', 'REVIEW_COMPLETED', 2, 4, true],
  ['Studi Kelayakan Distribusi Produk Pertanian Berbasis Koperasi', 'RESEARCH', 'APPROVED', 0, 3, true],
  ['Model Penjadwalan Transportasi Multimoda untuk Efisiensi Distribusi', 'RESEARCH', 'REJECTED', 1, 2, true],
  ['Pemodelan Jaringan Pengiriman untuk Wilayah Kepulauan', 'RESEARCH', 'WITHDRAWN', 0, 1, true],
]

export const seedActivities: Activity[] = seedRows.map(([title, domain, status, schemeIndex, day, other], index) => {
  const scheme = schemes[schemeIndex]
  const at = `2026-09-${String(day).padStart(2, '0')}T03:00:00.000Z`
  const ownerName = other ? 'Dr. Andi Setiawan, M.T.' : demoUsers.DOSEN.name
  return activitySchema.parse({
    id: `activity-${index + 1}`, code: `APT-2026-${domain === 'RESEARCH' ? 'R' : domain === 'COMMUNITY_SERVICE' ? 'P' : 'I'}-${String(index + 1).padStart(4, '0')}`,
    title, domain, ownerId: other ? 'dosen-2' : 'dosen-1', ownerName, scheme: scheme.label, schemeVersionId: scheme.id,
    year: 2026, fundingSource: scheme.fundingSource, studyProgram: other ? 'D4 Logistik Bisnis' : 'S1 Teknik Informatika', status,
    createdAt: at, updatedAt: at, submittedAt: status === 'DRAFT' ? null : at, requestedAmount: status === 'DRAFT' ? null : 15000000,
    approvedAmount: ['IN_PROGRESS', 'COMPLETED', 'OUTPUT_PENDING', 'PROGRESS_SUBMITTED', 'FINAL_SUBMITTED', 'APPROVED'].includes(status) ? 12000000 : null,
    reviewerIds: [1, 4, 11, 13, 15].includes(index) ? ['reviewer-1'] : [],
    summary: 'Data simulasi kegiatan dosen ULBI untuk menunjukkan pencatatan, pemantauan tahap kegiatan, dan pengelolaan luaran. Isi ini bukan proposal atau keputusan resmi.',
    note: status === 'REVISION_REQUIRED' ? 'Perjelas metode pengumpulan data dan keterkaitannya dengan target luaran. Catatan reviewer ini merupakan simulasi.' : status === 'NEEDS_CORRECTION' ? 'Dokumen pendukung perlu dilengkapi. Catatan ini merupakan simulasi.' : '',
    version: status === 'DRAFT' ? 1 : 2,
    plannedOutputs: status === 'DRAFT' ? [] : [{ title: domain === 'RESEARCH' ? 'Artikel ilmiah' : domain === 'COMMUNITY_SERVICE' ? 'Dokumentasi kegiatan dan produk mitra' : 'Prototipe produk', achieved: status === 'COMPLETED' }],
    history: [{ at, actor: ownerName, description: status === 'DRAFT' ? 'Draft simulasi dibuat.' : 'Pengajuan simulasi dicatat.' }],
  })
})

export const announcements = [
  { id: 'period', category: 'Periode pengajuan', title: 'Pengajuan hibah internal 2026 dibuka', date: '2026-09-01', body: 'Periode contoh berlangsung 1 September sampai 31 Oktober 2026. Jadwal ini hanya untuk demonstrasi frontend.' },
  { id: 'incentive', category: 'Insentif Kepakaran', title: 'Form Kepakaran 2026 tersedia sebagai referensi', date: '2026-10-01', body: 'Sepuluh template telah tersedia dalam dokumen proyek. Tarif, kelayakan, dan SOP masih menunggu konfigurasi SK yang disahkan.' },
  { id: 'archive', category: 'Informasi aplikasi', title: 'Bedakan rencana luaran dan capaian', date: '2026-09-24', body: 'Rencana mencatat target. Capaian mencatat hasil yang telah tersedia beserta buktinya. Karya Cipta nantinya disimpan langsung tanpa approval.' },
]
