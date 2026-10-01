# PRD APTIMAS BARU v1.1

Status: Draft validasi v1.1 | Pembaruan formulir Insentif Kepakaran 2026

| ATRIBUT | DESKRIPSI |
| --- | --- |
| Versi / status | v1.1 - PRD lengkap diperbarui menggunakan contoh Form Kepakaran 2026, tetap DRAFT validasi stakeholder |
| Tanggal acuan | 1 Oktober 2026 |
| Sistem lama | APTIMAS existing tetap berjalan; tidak diganti seketika |
| Sistem baru | APTIMAS baru; deployment dan database terpisah sampai fase cutover disetujui |
| Teknologi | Go + Fiber v3 / React + Vite / MySQL 8.x (usulan versi DB) |
| Pemakaian dokumen | Acuan pemilik proses, desainer FE, engineer BE, QA/UAT, dan AI coding agent (Codex) |

KEPUTUSAN YANG SUDAH DIBERIKAN

- Penelitian, PKM dan Inovasi mengelola perjalanan sejak pengajuan sampai luaran.
- Form Penelitian dan PKM merujuk pola BIMA; Inovasi merujuk Hiliriset, dengan komponen yang diseragamkan hanya jika relevan.
- Insentif Kepakaran dan Karya Cipta dimasukkan setelah hasil/karya ada; Insentif memiliki review, Karya Cipta tidak memiliki approval.
- Modul baru dikembangkan di aplikasi baru; legacy dan baru hidup berdampingan dengan migrasi bertahap.
CATATAN: Bagian bertanda RANCANGAN adalah spesifikasi implementasi yang diusulkan, bukan klaim bahwa sistem pemerintah memiliki field/UI/endpoint yang sama. Aturan SK insentif, format resmi terbaru dan SOP persetujuan tetap menunggu materi validasi.


# 1. Ringkasan produk dan prinsip desain

APTIMAS baru merupakan platform pengelolaan kegiatan akademik dan arsip capaian dosen. Produk melayani tiga domain berbasis proses (Penelitian, PKM, Inovasi), satu domain klaim berbasis bukti dengan template Excel 2026 (Insentif Kepakaran), serta satu domain arsip pascakarya (Karya Cipta). Fitur lama yang masih diperlukan tidak boleh terputus selama transisi.

| ASPEK | KEPUTUSAN PRODUK |
| --- | --- |
| Pengalaman pengguna | Satu pola navigasi, komponen formulir dan tampilan status; field kondisional per domain/skema. |
| Workflow | Penelitian/PKM/Inovasi memiliki lima milestone bisnis; proses review berbeda menurut skema dan sumber pendanaan. |
| Pengajuan eksternal | APTIMAS menjadi sistem pencatatan/manajemen internal. Tidak mengklaim mengirim otomatis ke BIMA/Hiliriset tanpa API resmi dan izin. |
| Karya Cipta | Create -> tersimpan/tercatat; tanpa status menunggu pemeriksaan, reviewer, approve atau reject. |
| Migrasi | Strangler rollout: aplikasi lama terus dipakai; modul baru diaktifkan per domain/periode; data dipindah secara terukur. |
| Integritas | Semua tindakan penting bertanda aktor, waktu, versi, dan asal data; aturan disimpan di server. |
| Batasan AI Codex | Implementasikan aturan yang tertulis; field/SOP bertanda TBD tidak dikarang atau dijadikan hardcoded approval. |


## 1.1 Tujuan dan tolok ukur

- Mengurangi input berulang untuk tiga domain kegiatan dengan komponen dan data umum yang dapat dipakai ulang.
- Menyediakan traceability kegiatan per tahap, perbaikan proposal dan jejak perubahan dokumen.
- Membuat klaim insentif dapat diperiksa, dihitung berdasarkan master SK berversi, dan direkap secara konsisten.
- Menyediakan arsip Karya Cipta yang dapat dicari dan dihubungkan ke luaran tanpa perlu persetujuan.
- Memindahkan pengguna/data dari legacy tanpa hilang riwayat dan tanpa memaksa cutover seluruh modul.

## 1.2 Yang tidak otomatis termasuk

- Pengiriman proposal, pembacaan akun, atau sinkronisasi langsung dengan BIMA/Hiliriset; menunggu kerja sama dan API resmi.
- Penggantian aplikasi lama atau migrasi penuh dalam satu rilis.
- Pencairan dana dan transfer insentif; batch ekspor tidak sama dengan pembayaran.
- Pengecekan jurnal/kuartil otomatis, AI reviewer, deteksi plagiarisme, dan pendaftaran KI otomatis ke DJKI.
- Aplikasi mobile native; frontend awal adalah web responsif.

# 2. Landasan referensi dan keterbatasan verifikasi

| KODE | SUMBER | PENGGUNAAN |
| --- | --- | --- |
| S-01 | Pengembangan APTIMAS.docx (diberikan klien) | Lima domain, jenis/subjenis, dan lima tahap kegiatan. |
| S-02 | MENU APTIMAS SAAT INI.docx (diberikan klien) | Inventaris fungsi legacy dan aktor yang sudah teridentifikasi. |
| S-03 | Screenshot dashboard, detail kegiatan, HAKI, grup user | Perilaku/tampilan contoh APTIMAS lama; bukan bukti semua modul telah lengkap. |
| S-04 | Screenshot kebutuhan tambahan Insentif Kepakaran | Klaim sesuai jenis, reviewer, tarif menurut SK/posisi, rekap dan batch. |
| S-05 | https://bima.kemdiktisaintek.go.id/ | Sistem rujukan untuk Penelitian/PKM; situs langsung tidak dapat dibaca menyeluruh saat penyusunan. |
| S-06 | Panduan Penelitian dan PKM Tahun 2026 (salinan panduan kementerian di institusi akademik) | Rujukan publik untuk konsep proposal, skema, RAB, seleksi, laporan dan luaran. |
| S-07 | https://hiliriset.kemdiktisaintek.go.id/ dan panduan Dorongan Teknologi 2025 | Rujukan Inovasi; contoh atribut khusus hilirisasi, tidak diasumsikan wajib di semua skema. |
| S-08 | Arahan klien 1 Oktober 2026 | Keseragaman form pragmatis, tanpa approval Karya Cipta, aplikasi baru dan migrasi bertahap. |
| S-09 | FORM KEPAKARAN 2026.xlsx (baru dilampirkan) | Satu Dashboard, 10 jenis formulir, identitas dosen, pilihan per kategori, kolom Kesesuaian reviewer dan instruksi pengumpulan 2026. |

Tautan dokumen publik: https://research.ui.ac.id/wp-content/uploads/sites/58/2025/12/Panduan-Penelitian-dan-Pengabdian-kepada-Masyarakat-Tahun-2026_compressed-1.pdf ; https://hiliriset.kemdiktisaintek.go.id/assets/guides/Panduan_Program_Hilirisasi_Riset_Prioritas_-_Dorongan_Teknologi_2025.pdf

CATATAN: Rujukan BIMA/Hiliriset adalah referensi desain lokal, BUKAN persyaratan kesetaraan antarmuka 1:1. Form portal yang memerlukan login dan lampiran resmi/versi tahun berikutnya harus dibandingkan melalui sesi validasi klien. Istilah "PKM" di dokumen ini berarti Pengabdian kepada Masyarakat, bukan Program Kreativitas Mahasiswa.

GLOSARIUM: BIMA = portal acuan Penelitian/PKM; Hiliriset = portal acuan Inovasi; KI/HAKI = kekayaan intelektual; SK = surat keputusan tarif; coexistence = aplikasi lama dan baru berjalan bersamaan dengan kepemilikan data yang jelas; profile = template konfigurasi per skema/tahun.


# 3. Lingkup modul dan taksonomi

| MODUL | MODEL PROSES | SUBKATEGORI AWAL |
| --- | --- | --- |
| Penelitian | Kegiatan end-to-end | Hibah Internal; Hibah Pemerintah; Kerja Sama Industri. |
| PKM | Kegiatan end-to-end | Hibah Internal; Hibah Pemerintah; Hibah Industri. |
| Inovasi | Kegiatan end-to-end | Hibah Internal; Hibah Pemerintah/Hiliriset (Sinergi, Kemitraan Internasional*, Dorongan Teknologi, Ajakan Industri, Kosa Bangsa, Kekayaan Intelektual); Hibah Pemerintah/Penguatan. |
| Insentif Kepakaran | Klaim setelah bukti tersedia | Menggunakan 10 template Excel 2026 (termasuk SINTA 1-6 dan prosiding nasional); kategori tambahan denah tetap tersedia sebagai master tetapi form/eligibility menunggu validasi SK/SOP. |
| Karya Cipta | Pencatatan hasil | Produk Barang; Produk Jasa; Produk Teknologi; Buku Chapter; Buku Populer; Karya Seni. |

CATATAN: * Dokumen asal menggunakan "Kimitraan Internasional"; label tampilan diusulkan "Kemitraan Internasional" setelah validasi. Nama kategori, kuartil, SINTA, dan penerimaan skema harus berasal dari tabel master dengan masa berlaku.


## 3.1 Bedakan sistem kegiatan dengan situs nasional

| JENIS SUMBER | PERILAKU DALAM APTIMAS BARU |
| --- | --- |
| Hibah internal | Pengusul dan LPPM melakukan proses internal sesuai tahapan, reviewer dan aturan yang dikonfigurasi. |
| Hibah pemerintah/industri | Dosen dapat menyimpan salinan data/form dan referensi pengajuan eksternal; status eksternal diinput manual terverifikasi jika belum ada integrasi. |
| Skema berubah tahunan | Schema form, checklist wajib, rubrik, jadwal dan master skema disimpan per tahun/versi, bukan hardcoded di frontend. |
| Data dari BIMA/Hiliriset | Kolom ID eksternal, URL rujukan dan bukti untuk jejak; APTIMAS tidak memalsukan status eksternal. |


# 4. Aktor, RBAC, dan batas akses

| AKTOR | PERMISSION UTAMA | BATASAN |
| --- | --- | --- |
| Dosen | Buat/edit draft milik sendiri; ajukan; perbaiki; unggah laporan/luaran; klaim insentif; catat karya; lihat riwayat. | Tidak mengubah keputusan dan tarif. |
| Anggota tim | Lihat kegiatan yang terdaftar, konfirmasi partisipasi bila diaktifkan. | Tidak mengganti ketua tanpa proses resmi. |
| Reviewer kegiatan | Akses penugasan, dokumen, formulir penilaian dan komentar. | Hanya berkas yang ditugaskan; tidak menyetujui pendanaan bila bukan otoritas. |
| Reviewer insentif | Periksa bukti, nominal dan komentar; keputusan atas klaim yang ditugaskan. | Tidak bisa mengubah tarif master sendiri. |
| Operator / Man RPKM | Verifikasi administrasi, assignment sesuai kewenangan, pendataan eksternal, laporan, ekspor klaim, batching. | Koreksi nominal wajib alasan, hak khusus dan audit. |
| Ka. LPPM | Monitoring, persetujuan kegiatan sesuai SOP yang diaktifkan, laporan agregat. | Scope sesuai skema dan keputusan lembaga. |
| Wadir 2 | Monitoring/persetujuan tertentu jika diwariskan dari kebijakan existing. | Tidak otomatis approver semua modul. |
| Tim/Sentra HAKI | Administrasi pengajuan HAKI pada legacy atau modul pengganti setelah siap. | Pisahkan catatan HAKI dari klaim insentif HAKI. |
| Admin sistem | Users, roles, permissions, master, template, periode, SK, audit teknis. | Pemisahan akun admin dan pelaksana disarankan. |
| Manajemen/read-only | Dashboard agregat dan ekspor menurut kewenangan. | Akses data pribadi/dokumen privat dibatasi. |


## 4.1 Matriks aksi minimum - seed policy

| RESOURCE | DOSEN | REVIEWER | OPERATOR | LPPM | ADMIN |
| --- | --- | --- | --- | --- | --- |
| Kegiatan draft | C/U sendiri | - | R terbatas | R terbatas | R audit |
| Kegiatan submit | C sendiri | - | R | R | R |
| Penilaian kegiatan | R hasil sendiri | C/U assigned | R/Assign* | R/Approve* | R |
| Laporan & luaran | C/U sendiri bila dibuka | R assigned* | R/cek* | R/cek* | R |
| Insentif klaim | C/U sendiri | R/C review assigned | R/rekap/batch | R report | R/master SK |
| Karya Cipta | C/U/D-logis sendiri | - | R/rekap | R report | R audit |
| HAKI existing | Sesuai legacy | - | Sesuai legacy | Sesuai legacy | Admin teknis |
| Master peran/SK | - | - | R/kelola* | R/kelola* | CRUD |

CATATAN: C=create, R=read, U=update; * butuh mandat/SOP. Semua permission dievaluasi di BE, termasuk pemeriksaan ownership dan assignment. Karya Cipta tidak memiliki reviewer maupun approver.


# 5. Desain formulir terpadu Penelitian, PKM dan Inovasi

RANCANGAN: satu komponen ActivityWizard digunakan pada ketiga domain. Komponen terdiri dari tab Identitas -> Tim -> Substansi -> Pendanaan & Jadwal -> Dokumen -> Rencana Luaran -> Pratinjau. Konfigurasi profile (domain, skema, tahun, versi) menentukan visibilitas, label, wajib/tidak wajib, opsi, berkas dan batas panjang. Form negara yang tidak relevan tetap berbeda tanpa memaksa pengguna mengisi kolom kosong.


## 5.1 Kontrak field inti (semua domain)

| FIELD | TYPE | WAJIB | ATURAN |
| --- | --- | --- | --- |
| domain | enum RESEARCH/COMMUNITY_SERVICE/INNOVATION | Ya | Tidak berubah setelah submit; memilih profile form. |
| scheme_id / scheme_version_id | UUID relasi master | Ya | Version freeze pada draft/submit sesuai policy. |
| period_id | UUID relasi | Ya | Hanya periode/skema aktif untuk pengajuan baru. |
| title | string <= 500 | Ya | Trim; tidak hanya spasi; batas kata skema via schema. |
| summary | rich text aman atau text | Ya* | Label ringkasan/abstrak; panjang tergantung skema. |
| keywords | array string | Ya* | Jumlah min/maks configurable; unik setelah normalisasi. |
| science_cluster_id | UUID/null | Sesuai profile | Rumpun ilmu master. |
| head_lecturer_id | UUID | Ya | Dosen aktif; pemilik atau delegasi sah. |
| members | array {lecturer_id,role,affiliation} | Ya* | Tidak boleh dosen duplikat pada tim sama. |
| institution / program_study_id | relasi/ref | Ya | Diambil dari master, snapshot pada submit. |
| duration_months | integer >0 | Ya* | Durasi mengikuti skema. |
| requested_amount | decimal(18,2) >=0 | Ya* | Server validasi batas pada profile. |
| approved_amount | decimal(18,2)/null | Tidak (otoritas) | Terpisah dari requested_amount; riwayat wajib. |
| funding_source | enum INTERNAL/GOVERNMENT/INDUSTRY/OTHER | Ya | Tentukan jalur review dan data eksternal. |
| external_system | enum BIMA/HILIRISET/OTHER/null | Kondisional | Nilai sistem acuan; tidak berarti sync. |
| external_submission_id | string <=128/null | Kondisional | Hanya bukti id eksternal bila tersedia. |
| external_url | https URL/null | Kondisional | Disimpan jika dapat diverifikasi. |
| proposal_file_ids | array file UUID | Ya saat submit* | Jenis dan jumlah ditentukan template. |
| substantive_sections | JSON per version | Sesuai profile | Field khusus memakai schema deklaratif. |
| planned_outputs | array jenis/target/tahun | Ya* | Tidak disamakan dengan realisasi luaran. |
| schedule_items | array kegiatan/bulan/tahun | Ya* | Multi-year disimpan dengan tahun relatif. |


## 5.2 Profile Penelitian - referensi pola BIMA

| SEKSI | FIELD TAMBAHAN RANCANGAN | KETENTUAN |
| --- | --- | --- |
| Substansi | latar_belakang; rumusan_masalah; tujuan; kebaruan; state_of_art; roadmap; metodologi | Field/batas kata dari template skema per tahun; judul/ringkasan tidak harus sama untuk semua skema. |
| RAB | items kategori, uraian, unit, volume, harga_satuan, subtotal, tahun | Hitung BE; kategori dan pagu dari aturan skema, bukan fixed. |
| Jadwal | matrix bulan x tahun untuk paket kegiatan | Validasi bulan 1-12 dan tahun sesuai durasi. |
| Luaran rencana | jenis, kuantitas, target status/tahun | Ketersediaan jenis output tergantung skema. |
| Dokumen | proposal substansi; surat/izin; bukti pendukung sesuai skema | Template berkas harus dirilis oleh admin. |
| Eksternal | external_submission_id, external_status_as_reported, evidence_date | Untuk hibah pemerintah/industri; tidak mengklaim status nasional real-time. |


## 5.3 Profile PKM - referensi pola BIMA

| SEKSI | FIELD TAMBAHAN RANCANGAN | KETENTUAN |
| --- | --- | --- |
| Mitra | nama_mitra, jenis_mitra, alamat, kontak, wilayah, persetujuan_berbagi | Mitra bisa >1; tandai PII/izin sesuai SOP. |
| Masalah & solusi | analisis_situasi, permasalahan_prioritas, solusi, target_pemberdayaan | Batas panjang bergantung skema. |
| Pelaksanaan | metode_pelaksanaan, partisipasi_mitra, evaluasi, keberlanjutan | Kegiatan/mitra dapat dimodelkan sebagai subentitas. |
| Luaran | publikasi, produk, dampak, bukti kegiatan, target penerima manfaat | Kolom aktual berdasarkan template PKM skema terkait. |
| Dokumen | surat kemitraan, bukti lokasi/peta, orisinalitas bila diwajibkan | Checklist per skema/versi; jangan seluruhnya diwajibkan global. |
| RAB/jadwal | RAB & jadwal reuse dari Penelitian | Jenis item khusus PKM bisa berbeda. |


## 5.4 Profile Inovasi - referensi pola Hiliriset

| SEKSI | FIELD TAMBAHAN RANCANGAN | KETENTUAN |
| --- | --- | --- |
| Produk | nama_produk, jenis_produk, deskripsi, manfaat, sektor_prioritas | Terpisah dari title proposal, karena satu proposal dapat mempunyai produk utama. |
| Kesiapan | tkt_current, tkt_target, bukti_tkt, riwayat_riset | RANCANGAN; wajib hanya bila profile menuntut. |
| Mitra hilirisasi | nama_mitra_industri, peran, komitmen, LoI/MoU, sumber daya | Opsional jika skema tidak perlu mitra. |
| Kelayakan | aspek_teknis, pasar, legal, finansial, risiko, model_bisnis | Mengacu contoh panduan Dorongan Teknologi 2025; ditampilkan kondisional. |
| Rencana | roadmap_hilirisasi, strategi_adopsi, proyeksi_dampak | Jangan dipaksakan pada Inovasi internal yang tak relevan. |
| KI & dokumen | status_ki, nomor_ki bila tersedia, lampiran teknis | Relasikan ke record HAKI bila sudah ada. |
| Skema Ajakan Industri | external_product_reference, jenis_kebutuhan_teknologi | Hanya bila skema memerlukan tautan produk/kebutuhan industri. |


## 5.5 Template forms as data - rancangan

- field_definitions menyimpan key, label, type, help_text, option_source, validator dan data sensitivity.
- form_profiles mengikat domain + scheme_version + stage + tanggal berlaku; form_profile_fields menyimpan order, section, required_condition, visible_condition, numeric/word/file constraints.
- Data umum wajib disimpan dalam kolom ternormalisasi; data khusus boleh JSON dengan validasi schema BE berversi. Hindari membiarkan frontend menjadi satu-satunya validator.
- Admin mengubah aturan pada draft profil baru, preview, lalu publish; profil yang dipakai pengajuan aktif tidak dapat dimodifikasi in-place.
- Saat kebijakan pemerintah berubah, buat profile version baru dan mapping, jangan memaksa perubahan data historis.

# 6. Lifecycle kegiatan dan aturan transisi

Lima tahap bisnis dari dokumen kebutuhan adalah PROPOSAL, PROPOSAL_REVISION, PROGRESS_REPORT, FINAL_REPORT, OUTPUT. Di atas tahapan tersebut, satu activity memiliki status lifecycle; setiap tahap memiliki submission, review, files dan historinya sendiri. Tahapan revisi hanya diaktifkan bila diperlukan; tahap setelah keputusan memerlukan gate sesuai SOP.

| DARI | AKSI / SYARAT | KE | AKTOR |
| --- | --- | --- | --- |
| DRAFT | submit proposal dan validator profile lolos | SUBMITTED | Dosen |
| SUBMITTED | tercatat masuk pemeriksaan admin bila alur internal | ADMIN_CHECK | Sistem/Operator |
| ADMIN_CHECK | validasi kelengkapan | UNDER_REVIEW atau NEEDS_CORRECTION | Operator |
| NEEDS_CORRECTION | resubmit versi baru sebelum tenggat | ADMIN_CHECK | Dosen |
| UNDER_REVIEW | penilaian dan komentar final sesuai rubrik | REVIEW_COMPLETED | Reviewer |
| REVIEW_COMPLETED | decision sesuai authority_config | APPROVED atau REJECTED atau REVISION_REQUIRED | LPPM/otoritas |
| REVISION_REQUIRED | submit revisi proposal sebagai submission versi baru | UNDER_REVIEW / ADMIN_CHECK* | Dosen |
| APPROVED | mulai pelaksanaan atau catat hibah diterima | IN_PROGRESS | Operator/otomatis* |
| IN_PROGRESS | upload laporan kemajuan saat window dibuka | PROGRESS_SUBMITTED | Dosen |
| PROGRESS_SUBMITTED | pemeriksaan milestone sesuai workflow | IN_PROGRESS | Reviewer/LPPM* |
| IN_PROGRESS | upload laporan akhir | FINAL_SUBMITTED | Dosen |
| FINAL_SUBMITTED | hasil diterima sesuai workflow | OUTPUT_PENDING | LPPM/Operator* |
| OUTPUT_PENDING | target luaran terisi/validasi | COMPLETED | LPPM/Operator* |
| STATUS ACTIVE | cancel/withdraw dengan alasan sebelum final | WITHDRAWN | Dosen/Operator* |
| EXTERNAL_TRACKING | update status BIMA/Hiliriset berdasar bukti | Tetap EXTERNAL_TRACKING / IN_PROGRESS | Operator |

CATATAN: Transisi berbintang dikonfigurasi per skema; tabel adalah BASELINE USULAN. Jalur hibah eksternal boleh mengabaikan reviewer internal dan hanya merekam dokumen serta hasil resmi; detail disahkan lewat SOP. Backend menolak aksi di luar whitelist transisi dan menulis status_history atomik.


## 6.1 Aturan pengajuan, versi, dan due date

- Simpan draft kapan saja; validasi lengkap dilakukan saat submit. Boleh autosave UI dengan debounce hanya pada draft.
- Setiap submit menghasilkan submission_version increment; file lama immutable dan tetap dapat diunduh auditor.
- Apabila profile skema belum memiliki rubrik/SOP disahkan, fitur approval dinonaktifkan (fail closed), bukan membuat persetujuan generik.
- Window tahap (buka/tutup, grace period, resubmission) diatur per periode dan skema; admin override membutuhkan alasan dan log.
- Kegiatan disetujui tidak otomatis berarti dana dicairkan. approved_amount bersumber keputusan berwenang dan dicatat terpisah.
- Kemajuan, akhir dan luaran dapat punya checklist serta review masing-masing, tetapi tidak wajib menggunakan reviewer identik.

## 6.2 Jalur kegiatan eksternal

1. Dosen memilih skema pemerintah/industri, mengisi metadata bersama dan mencatat sumber portal eksternal; sertakan tautan/kode pengajuan bila ada.
2. Jika sumber resmi mempunyai template berbeda, unggah proposal asal dan field khusus; APTIMAS tidak memaksa field internal yang tidak relevan.
3. Operator memeriksa bukti dan menginput status eksternal yang dilaporkan, timestamp, URL, dan dokumen keputusan. Field source_of_truth = EXTERNAL_MANUAL.
4. Setelah bukti pendanaan tersedia, APTIMAS membuka milestone laporan/luaran internal menurut skema yang dipilih; tidak menulis balik ke portal nasional.

# 7. Insentif Kepakaran - spesifikasi rinci (diperbarui dari Form Kepakaran 2026)

**Tujuan:** mengubah pengumpulan formulir Excel manual menjadi klaim per satu judul/karya di APTIMAS baru. Formulir Excel bukan data pembayaran, bukan SK tarif yang diverifikasi, dan tidak otomatis mengubah prosedur persetujuan. Dosen hanya mengajukan luaran/kepakaran yang sudah ada; proses review dan rekap dipisahkan dari proses penciptaan karya dan dari pembayaran.

**Referensi yang sudah tersedia:** `FORM KEPAKARAN 2026.xlsx` mempunyai satu Dashboard dan 10 sheet contoh kategori. Dashboard menyatakan satu dosen memakai satu workbook, satu judul per sheet, boleh banyak sheet untuk beberapa pengajuan, luaran minimal terbit pada 2026 untuk siklus tersebut, pengumpulan manual via folder Drive prodi, serta rujukan SK Insentif Kepakaran 2026 berbentuk tautan. **Dalam sistem baru:** satu judul = satu record klaim; satu dosen dapat mempunyai banyak klaim, tanpa perlu menyalin spreadsheet; alur pengumpulan via Drive adalah kondisi legacy, bukan kewajiban UI baru.

**Pemisahan fakta dan rancangan:** label, opsi, urutan serta pemeriksaan `Kesesuaian (Ya/Tidak)` diturunkan dari Excel. Jenis kontrol, pemetaan field key, tabel basis data, endpoint, validasi kondisional dan format ekspor merupakan rancangan implementasi. Nominal insentif, komposisi reviewer, perlakuan LOA dan kriteria kelayakan final tetap TBD sampai SK/SOP disetujui.

## 7.1 Identitas, struktur klaim dan prinsip form dinamis

| AREA | FIELD NORMALISASI | PERILAKU IMPLEMENTASI |
| --- | --- | --- |
| Identitas pengusul | `lecturerId`, `applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId` | Pilih dari profil terautentikasi; snapshot nama/nomor/prodi pada submit; jangan percaya userId dari payload. |
| Identitas klaim | `id`, `claimCode`, `categoryCode`, `formTemplateVersionId`, `title`, `outputYear`, `ownerId` | Satu judul/karya untuk satu klaim, banyak klaim per dosen/tahun; buat kode unik per kategori/periode. |
| Kontributor | `authors[]` terurut, `applicantAuthorPosition` | Dynamic repeatable; nomor posisi mesti menunjuk penulis yang sesuai, tidak mengarang aturan pembagian insentif. |
| Dokumen dan rujukan | `evidenceFiles[]`, `evidenceUrls[]`, `publisherUrl`, `correspondenceEvidence[]` sesuai template | Tautan HTTPS divalidasi sintaks; bukti sensitif private upload; template hanya menampilkan yang relevan. |
| Metadata terbit | `publicationStatus`, `publicationYear`, `volume`, `issue`, `pages`, `issn`, `isbn` sesuai kategori | Bedakan `Publish` dengan `LOA`; dokumen bukti APC hanya saat LOA bila dicantumkan dalam sheet. |
| Reviewer | `reviewAssignments[]`, `reviewItemChecks[]`, `reviewerComment`, `decision` | Tiap baris formulir memiliki kolom kesesuaian reviewer Ya/Tidak, bukan field yang boleh diisi dosen. |
| Finansial | `ruleVersionId`, `quotedAmount`, `approvedAmount`, `adjustmentReason`, `batchId` | Nominal dihitung BE hanya bila SK resmi diinput admin; biaya/APC adalah bukti, bukan nominal insentif. |

**Aturan wajib:** spreadsheet tidak menandai semua baris sebagai wajib. Jangan membuat seluruh field mandatory secara global. `requiredOnSubmit` dan larangan berdasarkan jawaban Ya/Tidak harus diputuskan dan dipublikasikan pada `incentiveFormTemplateVersion`, bersama SK/SOP. Identitas dan judul diperlukan untuk draft yang valid secara teknis; kondisi lain mengikuti profil yang dipublikasikan. Ketentuan tahun 2026 adalah aturan contoh untuk periode 2026, bukan filter hardcode semua tahun berikutnya.

## 7.2 Rekonsiliasi taksonomi denah vs Excel 2026

| SUMBER | JENIS | STATUS PEMETAAN |
| --- | --- | --- |
| Excel 2026 | Buku; SINTA 1-6; jurnal Scopus Q1-Q4; Copernicus; jurnal internasional nonterindeks; prosiding Scopus/WOS; prosiding internasional nonterindeks; prosiding nasional ISSN/ISBN; karya populer; karya internal | 10 template nyata; field berasal dari masing-masing sheet dan tercantum terinci pada 7.5. |
| Denah pengembangan | Selain kategori tumpang tindih, juga jurnal nasional tidak terakreditasi, review proposal internal, Monev internal, dan HAKI | Buat kategori master terpisah dengan `formStatus=NEEDS_TEMPLATE`; jangan menyalin field kategori lain atau mengklaim formulir 2026 tersedia. |
| Konflik yang harus diverifikasi | Denah: SINTA 1-4; Excel 2026: SINTA 1-6. Prosiding nasional muncul di Excel tetapi tidak eksplisit pada denah awal. | Izinkan master pilihan SINTA 1-6 untuk form draft contoh; kelayakan/pembayaran SINTA 5-6 dan prosiding nasional menunggu SK/otorisasi prodi. |

**Catatan:** spreadsheet tidak menyediakan template khusus untuk HaKI, Monev, reviewer hibah internal, atau jurnal nasional nonterakreditasi. Hindari merekayasa isian menjadi seolah-olah berasal dari workbook. Submodul tersebut tetap ada dalam product scope, tetapi template produksinya perlu disahkan.

## 7.3 Aturan periode, bukti dan surat

1. Pada contoh workbook tahun 2026, luaran yang dimohonkan untuk pencairan minimal terbit pada **2026**. Gunakan `incentivePeriods` dengan `minimumPublicationYear` dan rentang berlaku yang bisa diubah admin; jangan mengunci permanen angka 2026.
2. Beberapa sheet mengizinkan status `Publish` atau `LOA`, sementara Dashboard menyebut luaran telah terbit. Tampilkan LOA di form agar data Excel dapat dimigrasikan, tetapi **jangan otomatis menganggap LOA memenuhi syarat pencairan** sebelum SOP menjelaskan pengecualiannya. Permintaan dapat tetap berstatus `PENDING_POLICY_REVIEW` bila kebijakan belum ada.
3. Surat pernyataan Scopus/WOS dicantumkan eksplisit pada template **Jurnal Scopus** dan **Prosiding Scopus/WOS**. Tautan contoh workbook: https://docs.google.com/document/d/1WfQ8XUCxnHTkCqPtjT4z7kDj_wvnQ7g5/edit . Admin dapat mengunggah versi institusi dan menentukan kategorinya.
4. Buku mensyaratkan isian halaman isi minimal 125 dalam contoh Excel. Nilai ini dipakai sebagai **label petunjuk**; rule validasi penolakan ditentukan setelah SK disahkan. Bukti buku lengkap mendukung opsi hardfile (lacak tanda terima manual) atau softfile (unggah privat).
5. Jurnal Scopus memuat petunjuk Impact Factor minimal 0,10; simpan angka sebagai DECIMAL dan petunjuk dari spreadsheet, tetapi jangan mengesahkan kelayakan/pembayaran hanya dari angka itu sebelum SK diverifikasi. Data bibliometrik lain seperti kuartil dan SINTA adalah snapshot bukti, tidak disinkronkan otomatis.
6. Semua URL bukti diberi kolom `accessedAt`, `verificationNote`, dan file snapshot opsional. Kegagalan URL tidak otomatis menolak karya yang bukti file fisiknya sah berdasarkan SOP.

## 7.4 Alur dosen, reviewer, operator dan admin

| TAHAP | DOSEN / PENGUSUL | REVIEWER / OPERATOR / SISTEM |
| --- | --- | --- |
| Pilih kategori | Pilih periode dan salah satu kategori dari master | FE mengambil profil versi draft/published; kategori tanpa template resmi ditandai belum dapat diajukan. |
| Isi formulir | Profil identitas terisi; satu judul per klaim; isi field khusus dan bukti; simpan draft berkala | FE memakai komponen field shared + conditional; BE validasi schema version dan file ownership. |
| Submit | Periksa pratinjau, surat pernyataan jika perlu, lalu kirim | Snapshot data dan dokumen immutable; jalankan validasi tahun, duplikat, eligible bila policy tersedia. |
| Pemeriksaan administrasi | Lihat kekurangan atau permintaan revisi | Operator menugaskan reviewer sesuai SOP; reviewer hanya melihat klaim yang ditugaskan. |
| Review per butir | Tidak bisa mengisi `kesesuaian` sendiri | Reviewer memeriksa setiap baris pada template (`Ya`/`Tidak`), melampirkan komentar, lalu memberi keputusan terpisah jika aturan mengizinkan. |
| Revisi | Memperbaiki jawaban/bukti yang ditandai lalu submit versi baru | Checklist versi lama immutable; reviewer melihat diff dan memeriksa versi terbaru. |
| Rekap | Memantau hasil klaim | Operator ekspor Excel dan batch sesuai izin; batch tidak otomatis berarti dana dicairkan. |

### 7.4.1 Status klaim dan pengaman transisi

`DRAFT -> SUBMITTED -> ADMIN_CHECK -> UNDER_REVIEW -> REVIEW_COMPLETED -> APPROVED/REJECTED/REVISION_REQUIRED -> BATCHED` adalah **rancangan state configurable**, bukan pernyataan bahwa semua tahap digunakan institusi. Setiap transisi divalidasi backend terhadap aktor, assignment, deadline, dan status policy. Jika SK atau SOP belum terbit, sistem boleh menerima draft tetapi memblokir aksi quote final/approval/batch terkait dengan `POLICY_NOT_CONFIGURED`, tidak memakai tarif 0 sebagai jumlah riil.

## 7.5 Detail sepuluh template Excel (inventaris field sumber)

Tabel-tabel ini sengaja mempertahankan label workbook agar pengembang FE/BE dan klien mudah melakukan pemeriksaan silang. `Kontrol` adalah rekomendasi FE; `Keterangan` mengikuti opsi/catatan dari Excel jika ada. Seluruh baris pengajuan memiliki kolom reviewer `Kesesuaian: Ya/Tidak` pada file asal (diimplementasikan sebagai checklist versi klaim). Identitas awal nama bergelar, NIDN/NUPTK dan program studi sama di semua sheet dan otomatis diambil dari profil.

### 7.5.1 Buku (`BOOK`)

Sumber: sheet **BUKU**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Buku | `text` | Tidak dirinci pada Excel |
| 9 | Nama Penerbit | `text` | Tidak dirinci pada Excel |
| 10 | Penulis | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 11 | Jenis Buku | `select` | Pilihan: Buku Ajar, Buku Referensi, Buku Monograf |
| 12 | Jumlah Halaman (minimal 125 halaman dari isi buku) | `integer` | Tidak dirinci pada Excel |
| 13 | Tahun Terbit | `integer` | Tidak dirinci pada Excel |
| 14 | ISBN dan/atau E-ISBN | `text` | Tidak dirinci pada Excel |
| 15 | Bukti Buku Lengkap (Full Book dan bisa diakses seluruh isinya) | `private-file-upload / URL when source permits` | Pilihan: Hardfile, Softfile; UI usulan: Hardfile: offline receipt + metadata; Softfile: protected file upload |
| 16 | Website Penerbit | `https-URL` | Tidak dirinci pada Excel |
| 17 | Affiliasi Buku | `text` | Tidak dirinci pada Excel |
| 19 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

### 7.5.2 Jurnal terakreditasi SINTA (`SINTA_JOURNAL`)

Sumber: sheet **SINTA**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Artikel | `text` | Tidak dirinci pada Excel |
| 9 | Nama Penerbit Artikel (Publisher) | `text` | Tidak dirinci pada Excel |
| 10 | Terbitan Jurnal | `group:volume,issue,pages,publicationYear` | Volume = xx Halaman = xx - xx Nomor = xx Tahun = 20xx |
| 11 | Indeksasi Jurnal | `select` | Pilihan: SINTA 1, SINTA 2, SINTA 3, SINTA 4, SINTA 5, SINTA 6 |
| 12 | Nama Penulis (sesuai urutan) | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 13 | Posisi Pengusul Pada Urutan Penulis | `positive-integer + verify-against-authors` | Tidak dirinci pada Excel |
| 14 | Status Artikel | `select` | Pilihan: Publish, LOA |
| 15 | URL Artikel terpublish / URL bukti LOA | `https-URL` | Tidak dirinci pada Excel |
| 16 | URL Publisher | `https-URL` | Tidak dirinci pada Excel |
| 17 | URL Sertifikat Sinta Publisher | `https-URL` | Tidak dirinci pada Excel |
| 18 | Artikel ilmiah yang diusulkan adalah artikel yang tidak mendapatkan dana hibah internal dan eksternal sebelumnya | `yes-no` | Pilihan: Ya, Tidak |
| 19 | Mencantumkan nama Prodi dan atau Institusi pada artikel | `yes-no` | Pilihan: Ya, Tidak |
| 20 | Nama Prodi/Institusi yang tertera pada Artikel | `text` | Tidak dirinci pada Excel; UI usulan: affiliation_declared == Ya (preserve if previously answered) |
| 21 | URL Bukti APC apabila artikel masih LOA | `https-URL` | Tidak dirinci pada Excel; UI usulan: publication_status == LOA (only in categories having this field) |
| 22 | Bukti Korepondensi (dapat melampirkan gambar/link menuju gambar) | `private-file-upload / URL when source permits` | Tidak dirinci pada Excel |
| 24 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

### 7.5.3 Jurnal internasional terindeks Scopus (`SCOPUS_JOURNAL`)

Sumber: sheet **JURNAL SCOPUS**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Artikel | `text` | Tidak dirinci pada Excel |
| 9 | Nama Publisher Artikel | `text` | Tidak dirinci pada Excel |
| 10 | Terbitan Artikel | `group:volume,issue,pages,publicationYear` | Volume = xx Halaman = xx - xx Nomor = xx Tahun = 20xx |
| 11 | Indeksasi Artikel | `select` | Pilihan: Q1, Q2, Q3, Q4 |
| 12 | Nama Penulis (sesuai urutan) | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 13 | Posisi Pengusul Pada Urutan Penulis | `positive-integer + verify-against-authors` | Tidak dirinci pada Excel |
| 14 | Ditulis dengan menggunakan bahasa resmi PBB | `select` | Pilihan: Inggris, Arab, Perancis, Rusia, Spanyol, Tiongkok |
| 15 | Status Artikel | `select` | Pilihan: Publish, LOA |
| 16 | URL Artikel terpublish / URL bukti LOA | `https-URL` | Tidak dirinci pada Excel |
| 17 | URL Publisher Artikel | `https-URL` | Tidak dirinci pada Excel |
| 18 | URL Bukti APC apabila artikel masih LOA | `https-URL` | Tidak dirinci pada Excel; UI usulan: publication_status == LOA (only in categories having this field) |
| 19 | ISSN/e-ISSN | `text` | Tidak dirinci pada Excel |
| 20 | Terindeks oleh peringkat internasional (contoh SJR) atau basis data internasional (Scopus) | `yes-no` | Pilihan: Ya, Tidak |
| 21 | Nilai Impact Factor (minimal 0.10) | `decimal-string` | Tidak dirinci pada Excel |
| 22 | URL Ranking Jurnal pada Scopus yang menunjukkan Ranking (Quartile) | `https-URL` | Tidak dirinci pada Excel |
| 23 | Mencantumkan nama prodi dan atau Institusi | `yes-no` | Pilihan: Ya, Tidak |
| 24 | Nama Prodi/Institusi pada Artikel | `text` | Tidak dirinci pada Excel; UI usulan: affiliation_declared == Ya (preserve if previously answered) |
| 25 | Artikel ilmiah yang diusulkan adalah artikel yang tidak mendapatkan dana hibah internal dan eksternal sebelumnya | `yes-no` | Pilihan: Ya, Tidak |
| 26 | Termasuk artikel predator | `yes-no` | Pilihan: Ya, Tidak |
| 27 | Termasuk artikel discontinue | `yes-no` | Pilihan: Ya, Tidak |
| 28 | Bukti Korepondensi (dapat melampirkan gambar/link menuju gambar) | `private-file-upload / URL when source permits` | Tidak dirinci pada Excel |
| 29 | Surat Pernyataan Artikel Terindeks ScopusWOS Template Surat Pernyataan : https://docs.google.com/document/d/1WfQ... | `private-file-upload / URL when source permits` | Tidak dirinci pada Excel |
| 31 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

### 7.5.4 Jurnal internasional terindeks Copernicus (`COPERNICUS_JOURNAL`)

Sumber: sheet **JURNAL COPERNICUS**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Artikel | `text` | Tidak dirinci pada Excel |
| 9 | Nama Publisher Artikel | `text` | Tidak dirinci pada Excel |
| 10 | Terbitan Artikel | `group:volume,issue,pages,publicationYear` | Volume = xx Halaman = xx - xx Nomor = xx Tahun = 20xx |
| 11 | Nama Penulis (sesuai urutan) | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 12 | Posisi Pengusul Pada Urutan Penulis | `positive-integer + verify-against-authors` | Tidak dirinci pada Excel |
| 13 | Ditulis dengan menggunakan bahasa resmi PBB | `select` | Pilihan: Inggris, Arab, Perancis, Rusia, Spanyol, Tiongkok |
| 14 | Status Artikel | `select` | Pilihan: Publish, LOA |
| 15 | URL Artikel terpublish / URL bukti LOA | `https-URL` | Tidak dirinci pada Excel |
| 16 | URL Publisher Artikel | `https-URL` | Tidak dirinci pada Excel |
| 17 | URL Bukti APC apabila artikel masih LOA | `https-URL` | Tidak dirinci pada Excel; UI usulan: publication_status == LOA (only in categories having this field) |
| 18 | ISSN/e-ISSN | `text` | Tidak dirinci pada Excel |
| 19 | Terindeks oleh peringkat internasional Copernicus | `yes-no` | Pilihan: Ya, Tidak |
| 20 | URL Ranking Jurnal yang menunjukkan Indeks Copernicus | `https-URL` | Tidak dirinci pada Excel |
| 21 | Mencantumkan nama prodi dan atau Institusi | `yes-no` | Pilihan: Ya, Tidak |
| 22 | Nama Prodi/Institusi pada Artikel | `text` | Tidak dirinci pada Excel; UI usulan: affiliation_declared == Ya (preserve if previously answered) |
| 23 | Artikel ilmiah yang diusulkan adalah artikel yang tidak mendapatkan dana hibah internal dan eksternal sebelumnya | `yes-no` | Pilihan: Ya, Tidak |
| 24 | Termasuk artikel predator | `yes-no` | Pilihan: Ya, Tidak |
| 25 | Termasuk artikel discontinue | `yes-no` | Pilihan: Ya, Tidak |
| 27 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

### 7.5.5 Prosiding internasional Scopus/WOS (`SCOPUS_WOS_PROCEEDING`)

Sumber: sheet **PROOCEDING Scopus atau WOS**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Proceeding | `text` | Tidak dirinci pada Excel |
| 9 | Nama Publisher Proceeding | `text` | Tidak dirinci pada Excel |
| 10 | Terbitan Proceeding | `group:volume,issue,pages,publicationYear` | Volume = xx Halaman = xx - xx Nomor = xx Tahun = 20xx |
| 11 | Bahasa Pengantar Yang Digunakan | `select` | Pilihan: Inggris, Arab, Perancis, Rusia, Spanyol, Tiongkok |
| 12 | Nama Penulis (sesuai urutan) | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 13 | Posisi Pengusul Pada Urutan Penulis | `positive-integer + verify-against-authors` | Tidak dirinci pada Excel |
| 14 | Steering Commite terdiri dari para pakar yang berasal dari beberapa negara. | `yes-no` | Pilihan: Ya, Tidak |
| 15 | Pemakalah dan Peserta berasal dari berbagai negara (minimal 4 negara) | `yes-no` | Pilihan: Ya, Tidak |
| 16 | Proceeding terindex Scopus dan atau WOS | `yes-no` | Pilihan: Ya, Tidak |
| 17 | Mencantumkan nama prodi dan atau Institusi | `yes-no` | Pilihan: Ya, Tidak |
| 18 | Nama Prodi/Institusi pada Proceeding | `text` | Tidak dirinci pada Excel; UI usulan: affiliation_declared == Ya (preserve if previously answered) |
| 19 | Status Proceeding | `select` | Pilihan: Publish, LOA |
| 20 | URL Proceeding terpublish / URL bukti LOA | `https-URL` | Tidak dirinci pada Excel |
| 21 | URL Publisher Proceeding | `https-URL` | Tidak dirinci pada Excel |
| 22 | URL Bukti APC apabila proceeding masih LOA | `https-URL` | Tidak dirinci pada Excel; UI usulan: publication_status == LOA (only in categories having this field) |
| 23 | URL Ranking Proceeding pada Scopus/WOS yang menunjukkan Ranking | `https-URL` | Tidak dirinci pada Excel |
| 24 | Angka Impact Factor | `decimal-string` | Tidak dirinci pada Excel |
| 25 | Proceeding yang diusulkan adalah artikel yang tidak mendapatkan dana hibah internal dan eksternal sebelumnya | `yes-no` | Pilihan: Ya, Tidak |
| 26 | Termasuk artikel discontinue | `yes-no` | Pilihan: Ya, Tidak |
| 27 | Termasuk artikel predator | `yes-no` | Pilihan: Ya, Tidak |
| 28 | Surat Pernyataan Artikel Terindeks ScopusWOS Template Surat Pernyataan : https://docs.google.com/document/d/1WfQ... | `private-file-upload / URL when source permits` | Tidak dirinci pada Excel |
| 30 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

### 7.5.6 Prosiding internasional nonterindeks (`UNINDEXED_INT_PROCEEDING`)

Sumber: sheet **PROOCEDING INTER non Terindeks**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Proceeding | `text` | Tidak dirinci pada Excel |
| 9 | Nama Publisher Proceeding | `text` | Tidak dirinci pada Excel |
| 10 | Terbitan Proceeding | `group:volume,issue,pages,publicationYear` | Volume = xx Halaman = xx - xx Nomor = xx Tahun = 20xx |
| 11 | Bahasa Pengantar Yang Digunakan | `select` | Pilihan: Inggris, Arab, Perancis, Rusia, Spanyol, Tiongkok |
| 12 | Nama Penulis (sesuai urutan) | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 13 | Posisi Pengusul Pada Urutan Penulis | `positive-integer + verify-against-authors` | Tidak dirinci pada Excel |
| 14 | Steering Commite terdiri dari para pakar yang berasal dari beberapa negara. | `yes-no` | Pilihan: Ya, Tidak |
| 15 | Pemakalah dan Peserta berasal dari berbagai negara (minimal 4 negara) | `yes-no` | Pilihan: Ya, Tidak |
| 16 | Mencantumkan nama prodi dan atau Institusi | `yes-no` | Pilihan: Ya, Tidak |
| 17 | Nama Prodi/Institusi pada Proceeding | `text` | Tidak dirinci pada Excel; UI usulan: affiliation_declared == Ya (preserve if previously answered) |
| 18 | Status Proceeding | `select` | Pilihan: Publish, LOA |
| 19 | URL Proceeding terpublish / URL bukti LOA | `https-URL` | Tidak dirinci pada Excel |
| 20 | URL Publisher Proceeding | `https-URL` | Tidak dirinci pada Excel |
| 21 | URL Bukti APC apabila proceeding masih LOA | `https-URL` | Tidak dirinci pada Excel; UI usulan: publication_status == LOA (only in categories having this field) |
| 22 | Proceeding yang diusulkan adalah artikel yang tidak mendapatkan dana hibah internal dan eksternal sebelumnya | `yes-no` | Pilihan: Ya, Tidak |
| 23 | Termasuk artikel discontinue | `yes-no` | Pilihan: Ya, Tidak |
| 24 | Termasuk artikel predator | `yes-no` | Pilihan: Ya, Tidak |
| 27 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

### 7.5.7 Jurnal internasional nonterindeks (`UNINDEXED_INT_JOURNAL`)

Sumber: sheet **JURNAL INTER NON TERINDEKS**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Artikel | `text` | Tidak dirinci pada Excel |
| 9 | Nama Publisher Artikel | `text` | Tidak dirinci pada Excel |
| 10 | Terbitan Artikel | `group:volume,issue,pages,publicationYear` | Volume = xx Halaman = xx - xx Nomor = xx Tahun = 20xx |
| 11 | Nama Penulis (sesuai urutan) | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 12 | Posisi Pengusul Pada Urutan Penulis | `positive-integer + verify-against-authors` | Tidak dirinci pada Excel |
| 13 | Ditulis dengan menggunakan bahasa resmi PBB | `select` | Pilihan: Inggris, Arab, Perancis, Rusia, Spanyol, Tiongkok |
| 14 | Status Artikel | `select` | Pilihan: Publish, LOA |
| 15 | URL Artikel terpublish / URL bukti LOA | `https-URL` | Tidak dirinci pada Excel |
| 16 | URL Publisher Artikel | `https-URL` | Tidak dirinci pada Excel |
| 17 | URL Bukti APC apabila Artikel masih LOA | `https-URL` | Tidak dirinci pada Excel; UI usulan: publication_status == LOA (only in categories having this field) |
| 18 | ISSN/e-ISSN | `text` | Tidak dirinci pada Excel |
| 19 | Mencantumkan nama prodi dan atau Institusi | `yes-no` | Pilihan: Ya, Tidak |
| 20 | Nama Prodi/Institusi pada Artikel | `text` | Tidak dirinci pada Excel; UI usulan: affiliation_declared == Ya (preserve if previously answered) |
| 21 | Artikel ilmiah yang diusulkan adalah artikel yang tidak mendapatkan dana hibah internal dan eksternal sebelumnya | `yes-no` | Pilihan: Ya, Tidak |
| 23 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

### 7.5.8 Prosiding nasional ber-ISSN/ISBN (`NATIONAL_PROCEEDING`)

Sumber: sheet **PROOCEDING Nasional ISSN ISBN**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Proceeding | `text` | Tidak dirinci pada Excel |
| 9 | Nama Publisher Proceeding | `text` | Tidak dirinci pada Excel |
| 10 | Terbitan Proceeding | `group:volume,issue,pages,publicationYear` | Volume = xx Halaman = xx - xx Nomor = xx Tahun = 20xx |
| 11 | Nomor ISSN/ISBN | `text` | Tidak dirinci pada Excel |
| 12 | Bahasa Pengantar Yang Digunakan | `select` | Pilihan: Inggris, Indonesia |
| 13 | Nama Penulis (sesuai urutan) | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 14 | Posisi Pengusul Pada Urutan Penulis | `positive-integer + verify-against-authors` | Tidak dirinci pada Excel |
| 15 | Steering Commite terdiri dari para pakar yang berasal dari Indonesia. | `yes-no` | Pilihan: Ya, Tidak |
| 16 | Pemakalah dan Peserta berasal dari Indonesia | `yes-no` | Pilihan: Ya, Tidak |
| 17 | Mencantumkan nama prodi dan atau Institusi | `yes-no` | Pilihan: Ya, Tidak |
| 18 | Nama Prodi/Institusi pada Proceeding | `text` | Tidak dirinci pada Excel; UI usulan: affiliation_declared == Ya (preserve if previously answered) |
| 19 | Status Proceeding | `select` | Pilihan: Publish, LOA |
| 20 | URL Proceeding terpublish / URL bukti LOA | `https-URL` | Tidak dirinci pada Excel |
| 21 | URL Publisher Proceeding | `https-URL` | Tidak dirinci pada Excel |
| 22 | URL Bukti APC apabila proceeding masih LOA | `https-URL` | Tidak dirinci pada Excel; UI usulan: publication_status == LOA (only in categories having this field) |
| 23 | Proceeding yang diusulkan adalah artikel yang tidak mendapatkan dana hibah internal dan eksternal sebelumnya | `yes-no` | Pilihan: Ya, Tidak |
| 24 | Termasuk artikel discontinue | `yes-no` | Pilihan: Ya, Tidak |
| 25 | Termasuk artikel predator | `yes-no` | Pilihan: Ya, Tidak |
| 28 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

### 7.5.9 Karya pemikiran di media/penerbit populer (`NATIONAL_POPULAR_WORK`)

Sumber: sheet **KARYA DI PUBLISHER POPULER**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Karya | `text` | Tidak dirinci pada Excel |
| 9 | Nama Penerbit/Media Publikasi | `text` | Tidak dirinci pada Excel |
| 10 | Nama Penulis (sesuai urutan) | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 11 | Posisi Pengusul Pada Urutan Penulis | `positive-integer + verify-against-authors` | Tidak dirinci pada Excel |
| 12 | Bentuk Akses | `select` | Pilihan: Online, Offline |
| 13 | Media Akses | `select` | Pilihan: Kompas, The Jakarta Post, Republika, Tempo, Bisnis Indonesia, Jawa Pos, Pikiran Rakyat, Media Indonesia, Koran Populer Lainnya; UI usulan: access_mode == Of... |
| 14 | Portal Online | `select` | Pilihan: Online Marketing, Chip, Info Komputer, Supply Chain, Manajemen, Logistics, Majalah Pendidikan Lainnya, Lainnya (isi manual); UI usulan: access_mode == Onlin... |
| 15 | Status Karya | `select` | Pilihan: Publish, LOA, Surat Penerbitan |
| 16 | Mencantumkan nama prodi dan atau Institusi | `yes-no` | Pilihan: Ya, Tidak |
| 17 | Nama Prodi/Institusi pada Artikel | `text` | Tidak dirinci pada Excel; UI usulan: affiliation_declared == Ya (preserve if previously answered) |
| 18 | Melalui proses Editor/kurasi | `yes-no` | Pilihan: Ya, Tidak |
| 19 | Karya yang diusulkan adalah artikel yang tidak mendapatkan dana hibah internal dan eksternal sebelumnya | `yes-no` | Pilihan: Ya, Tidak |
| 21 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

### 7.5.10 Karya pemikiran di portal/jurnal internal (`INTERNAL_WORK`)

Sumber: sheet **KARYA DI INTERNAL**; form satu klaim per satu judul. Kolom pemeriksaan per butir hanya untuk reviewer.

| BARIS | FIELD DI EXCEL | KONTROL FE YANG DIUSULKAN | PILIHAN / KONDISI DARI SUMBER |
| --- | --- | --- | --- |
| 8 | Judul Karya | `text` | Tidak dirinci pada Excel |
| 9 | Nama Penerbit/Media Publikasi | `text` | Tidak dirinci pada Excel |
| 10 | Nama Penulis (sesuai urutan) | `ordered-repeatable-authors` | 1. 2. 3. dst. |
| 11 | Posisi Pengusul Pada Urutan Penulis | `positive-integer + verify-against-authors` | Tidak dirinci pada Excel |
| 12 | Bentuk Akses | `select` | Pilihan: Online, Offline |
| 13 | Status Karya | `select` | Pilihan: Publish, LOA, Surat Penerbitan |
| 14 | URL Bukti Karya / LOA | `https-URL` | Tidak dirinci pada Excel |
| 15 | Mencantumkan nama prodi dan atau Institusi | `yes-no` | Pilihan: Ya, Tidak |
| 16 | Nama Prodi/Institusi pada Artikel | `text` | Tidak dirinci pada Excel; UI usulan: affiliation_declared == Ya (preserve if previously answered) |
| 17 | Melalui proses Editor/kurasi | `yes-no` | Pilihan: Ya, Tidak |
| 18 | Artikel ilmiah yang diusulkan adalah artikel yang tidak mendapatkan dana hibah internal dan eksternal sebelumnya | `yes-no` | Pilihan: Ya, Tidak |
| 20 | Komentar Reviewer | `text` | Tidak dirinci pada Excel |

Kontrak tambahan: tiga field identitas (`applicantNameWithTitle`, `nidnOrNuptk`, `studyProgramId`); satu set `reviewItemChecks` terkait setiap butir pengajuan; `reviewerComment` dan tanda tangan/identitas reviewer ditampilkan hanya bagi reviewer. Tidak ada nominal eksplisit di sheet ini; nilai berasal dari SK resmi.

## 7.6 Aturan field shared, conditional, dan pemeriksaan konsistensi

| KONDISI | PERILAKU FE | VALIDASI / PENYIMPANAN BE |
| --- | --- | --- |
| `publicationStatus = LOA` | Field bukti LOA dan APC ditampilkan **hanya jika** ada pada template kategori. | `apcEvidenceUrl` disimpan terpisah dari nilai insentif; syarat LOA eligible menunggu SK. |
| `affiliationDeclared = Ya` | Nama prodi/institusi tertulis pada artikel/prosiding diminta pada template terkait. | Jangan hilangkan jawaban saat switch toggle; validasi wajib setelah aturan profil dipublikasi. |
| `bookType` | Pilihan Buku Ajar, Referensi, Monograf sesuai sheet Buku. | Kategori dan subkategori konsisten dengan snapshot versi template. |
| `completeBookEvidence = Hardfile` | Form mencatat serah-terima fisik; tidak memaksa unggah file buku lengkap jika administrasi menerima fisik. | Bukti tanda terima operator dan audit; tindakan fisik tidak dianggap dipenuhi otomatis. |
| `journalQuartile` | Q1-Q4 pada Scopus; `sintaRank` SINTA 1-6 pada SINTA. | Jangan otomatis menyimpulkan tarif/eligibility tanpa SK versi aktif. |
| `popularPrintMedia` / `popularOnlinePortal` | Pilihan sesuai sheet populer; sediakan opsi lain dengan text bila diizinkan. | Opsi media tetap data master/enum per template, bukan hardcode di beberapa komponen. |
| `authors[]` / `applicantAuthorPosition` | Penulis bisa ditambah, dihapus, diurutkan; posisi pengusul harus dalam rentang 1..N. | Snapshot daftar dan posisi pada submit; indeksasi posisi 1-based. |
| Pernyataan `No previous grant funding`, `isPredatory`, `isDiscontinued` | Tampil hanya pada template yang memang punya pertanyaan tersebut. | Simpan jawaban aktual; kebijakan penolakan tidak boleh dikarang dari label Ya/Tidak saja. |
| Reviewer `Ya/Tidak` per baris | Menampilkan kolom pemeriksaan berdasarkan urutan/label versi klaim, catatan keseluruhan. | Hanya reviewer assigned; satu check per `(assignmentId, claimVersionId, templateFieldId)` dan immutable setelah final. |

**Komponen frontend yang dapat digunakan ulang:** `IncentiveCategoryPicker`, `IncentiveClaimWizard`, `ApplicantIdentityPanel`, `OrderedAuthorsField`, `PublicationIssueGroup`, `PublicationStatusEvidence`, `InstitutionAffiliationField`, `PrivateEvidenceUpload`, `ReviewerComplianceGrid`, `ClaimRevisionDiff`, `SKQuotePanel`, `IncentiveExportFilters`.

## 7.7 Kontrak profil JSON untuk Codex

Tersedia artefak pendamping `APTIMAS_Insentif_FormSchema_2026_DRAFT_v1.1.json`: manifes konfigurasi kustom (BUKAN spesifikasi JSON Schema standar), berisi tepat sepuluh template dan semua label/baris asal; properti `fieldId`, `key`, `sourceLabel`, `sourceHint`, `control`, `options`, `showWhen`, `requiredOnSubmit`, `reviewerSuitabilityField`. Pseudotype `readonly-profile + snapshot-on-submit` berarti nilai didapat dari akun, bukan input bebas.

```json
{
  "code": "SINTA_JOURNAL",
  "label": "Jurnal terakreditasi SINTA",
  "effectiveYear": 2026,
  "status": "DRAFT_UNTIL_SK_SOP_VALIDATED",
  "fields": [
    {"key":"sinta_rank","control":"select","options":["SINTA 1","SINTA 2","SINTA 3","SINTA 4","SINTA 5","SINTA 6"],"requiredOnSubmit":"TBD_FROM_SK_OR_SOP"},
    {"key":"publication_status","control":"select","options":["Publish","LOA"],"requiredOnSubmit":"TBD_FROM_SK_OR_SOP"},
    {"key":"apc_evidence_url","control":"https-URL","showWhen":"publication_status == LOA (only in categories having this field)"}
  ]
}
```

**Aturan anti-duplikasi nama field:** `key` yang sama boleh dipakai lintas kategori untuk reuse komponen, tetapi konfigurasi validator dan wajib/tidak wajib terikat `templateVersionId + fieldId`. Tidak semua kategori mempunyai field yang sama. `fieldId` diturunkan dari `categoryCode + key` dan tidak boleh diganti saat versi template sudah pernah digunakan. Saat memublikasikan profil baru, copy lalu revisi dan simpan `supersedesVersionId`.

## 7.8 Model data tambahan Insentif Kepakaran

| TABEL | KOLOM PENTING | INDEX / ATURAN |
| --- | --- | --- |
| `incentive_periods` | id, year, minimumPublicationYear, opensAt, closesAt, ruleVersionId nullable | Satu periode dapat memiliki template berbeda; tahun dapat diperbarui tiap periode. |
| `incentive_categories` | id, code, label, parentId, enabledForSubmission, templateStatus | Tambahkan kategori spreadsheet dan denah, `NEEDS_TEMPLATE` untuk belum ada contoh. |
| `incentive_form_templates` | id, categoryId, periodId, version, status, fieldsSchemaJSON, sourceFile, publishedBy | Published immutable; versi aktif untuk submit. |
| `incentive_claims` | id, code, ownerId, periodId, categoryId, title, status, currentVersionId, fingerprint | Satu klaim = satu judul; owner dari token. |
| `incentive_claim_versions` | id, claimId, versionNo, templateId, answersJSONValidated, identitySnapshotJSON, submittedAt | Revision immutable; kontrol optimistik. |
| `incentive_authors` | id, claimVersionId, sequenceNo, authorName, lecturerId nullable, affiliation | Unique(claimVersionId, sequenceNo); posisi 1-based. |
| `incentive_evidence` | claimVersionId, templateFieldId, fileId nullable, url nullable, evidenceType | Authz dan checksum file; jangan publish private raw storage URL. |
| `incentive_review_assignments` | id, claimId, reviewerId, assignedAt, status | Reviewer hanya klaim ditugaskan; jumlah reviewer SOP TBD. |
| `incentive_review_item_checks` | assignmentId, claimVersionId, templateFieldId, suitability nullable, note, checkedAt | Unique(assignmentId, claimVersionId, templateFieldId); hanya `Ya/Tidak` saat terisi. |
| `incentive_review_decisions` | id, assignmentId, claimVersionId, decision, overallComment, decidedAt | Keputusan akhir harus terpisah dari checklist per field; otoritas final configurable. |
| `incentive_rule_versions` / `incentive_rules` | skNumber, effectiveDates, category, authorPosition, approvedFormula, currency | Tidak dapat publish rule tarif hingga SK sungguhan diotorisasi. |
| `incentive_quotes` | claimVersionId, ruleVersionId, inputsSnapshot, amount nullable, needsRules | Tarif tak diketahui = NULL + needsRules true, bukan nominal nol. |
| `incentive_batches` / `incentive_batch_items` | batchId, claimId, includedAmount, exportedAt | Batch administratif, tidak set `PAID`. |

**Constraints:** DECIMAL(18,2) untuk uang; integer/tahun bersifat bounded; atribut khusus pada JSON tervalidasi schema versi template oleh backend; index `(ownerId, periodId, status)` dan `(categoryId, periodId, status)`. Tambahkan audit `actorId`, `requestId`, `before/after redacted`, `at` untuk setiap perubahan status/angka/bukti.

## 7.9 Kontrak API tambahan (semua berada di `/api/v1`)

| METHOD | PATH | REQUEST / RESPONSE / GUARD |
| --- | --- | --- |
| GET | `/incentives/categories?periodId=` | Daftar kategori, `templateStatus`, `enabledForSubmission`, deskripsi; kategori belum memiliki template tidak bisa submit. |
| GET | `/incentives/form-templates/:categoryCode?periodId=` | Versi published, semua field, options, required rules dan bukti. |
| POST | `/incentives` | Body `{periodId, categoryCode, title}`; owner dari session; buat DRAFT dan freeze selected template version. |
| PATCH | `/incentives/:id/draft` | `{expectedVersion, answers, title}`; validasi partial, autosave, cegah edit klaim orang lain. |
| POST | `/incentives/:id/evidence` | `{templateFieldId, fileId/url, expectedVersion}`; akses privat, pembatasan mime/ukuran. |
| GET | `/incentives/:id/preview` | Bentuk form sesuai sumber beserta progress kelengkapan dan status policy. |
| POST | `/incentives/:id/submit` | Validasi published profile & status policy, snapshot version; idempotency key; `422` missing fields / `409` stale version. |
| GET | `/incentives/review-assignments?status=` | Hanya reviewer assigned/otoritas; pagination. |
| GET | `/incentives/review-assignments/:id/checklist` | Butir mengikuti label+urutan dari versi claim yang direview, tidak dari latest form. |
| PUT | `/incentives/review-assignments/:id/checks` | `{claimVersionId, checks:[{templateFieldId, suitability:'Ya'/'Tidak',note}]}`; hanya reviewer assigned. |
| POST | `/incentives/review-assignments/:id/decision` | `{claimVersionId, decision, overallComment}`; validasi checklist kelengkapan menurut SOP. |
| GET | `/incentives/:id/history` | Version data, perbaikan, bukti dan keputusan dengan redaksi data sensitif. |
| POST | `/incentives/quote` | Rule berversi, BE kalkulasi; tanpa SK `needsRules=true,amount=null`, tidak buat angka perkiraan. |
| GET | `/incentives/export.xlsx?periodId=&categoryCode=&status=&studyProgramId=` | Kolom rekap, pemeriksaan reviewer dan jejak periode; guard akses data. |
| POST | `/incentives/batches` | Otoritas saja, klaim approved, anti double batching, simpan jumlah snapshot. |
| POST | `/admin/incentive-form-templates/:id/publish` | Admin/pemilik proses; no schema mutation in-place setelah publish. |

**Contoh error kebijakan:** `HTTP 422 {"error":{"code":"POLICY_NOT_CONFIGURED","message":"SK atau SOP untuk kategori/periode ini belum disahkan."},"requestId":"..."}`. Periksa Idempotency-Key dan optimistic locking pada submit, keputusan, dan batch. Frontend boleh menampilkan `needsRules` sebelum submit, tetapi jangan menampilkan `Rp0` seolah itu tarif berlaku.

## 7.10 Ekspor rekap dan pemetaan ulang dari Excel

Ekspor dengan kolom terstruktur: nomor/kode klaim, periode, nama bergelar, NIDN/NUPTK (berdasarkan izin), prodi, kategori, judul, tahun luaran, status terbit (jika ada), urutan penulis, metadata kategori, tautan/bukti diakses berdasarkan hak, `reviewerChecksSummary`, komentar reviewer, hasil keputusan, tarif SK versi, nilai quote, approved amount, batch, dan catatan admin. Ekspor opsional format **lembar per kategori dan per judul** hanya jika klien memerlukan bentuk yang menyerupai Excel lama; record sumber selalu satu klaim satu judul di database. Jangan menyalin checklist pemeriksaan reviewer dari dokumen lama sebagai keputusan otomatis.

Untuk impor workbook historis dari Google Drive, buat importer dry-run yang membaca metadata saja, menampilkan hasil mapping sheet -> kategori -> klaim -> evidence, dan menampilkan error. **Jangan** otomatis memproses folder Drive atau menulis data Excel 2026 ke DB production tanpa izin, uji data pribadi, dan penetapan record owner. Link SK dalam Dashboard merupakan referensi dokumen untuk validasi, bukan bukti file SK sudah terlampir pada PRD.

## 7.11 Acceptance criteria dan test cases per formulir

| ID | PENGUJIAN | HASIL YANG DIHARAPKAN |
| --- | --- | --- |
| INC-09 | Kategori Buku dengan >1 penulis dan bukti hardfile | Authors urut dan posisi pengusul tersimpan; tanda terima fisik terpisah dari softfile; label 125 halaman sesuai contoh. |
| INC-10 | SINTA ranking 1-6 | Semua enam opsi muncul pada **form contoh**; SK menentukan apakah setiap ranking boleh disubmit/diinsentifkan pada periode. |
| INC-11 | Scopus status LOA vs Publish | URL APC kondisional jika LOA; kuartil, impact factor dan surat pernyataan ada; sistem tidak otomatis membayar LOA. |
| INC-12 | Copernicus | URL indeks Copernicus ada tanpa memaksa bukti kuartil Scopus. |
| INC-13 | Prosiding Scopus/WOS | Pertanyaan steering committee, minimal 4 negara, status indeks dan surat pernyataan tampil. |
| INC-14 | Prosiding internasional nonindeks | Pertanyaan negara tetap tampil, tetapi bukti indeks Scopus/WOS tidak diwajibkan. |
| INC-15 | Jurnal internasional nonindeks | Tampil bahasa PBB dan publikasi/LOA, tanpa memaksa impact factor. |
| INC-16 | Prosiding nasional ISSN/ISBN | Form dari Excel tersedia di master draft; eligibility submit menunggu SK; bahasa Inggris/Indonesia. |
| INC-17 | Karya populer | Pilihan media cetak/portal, akses online/offline, bukti proses kurasi muncul kondisional. |
| INC-18 | Karya internal | Tautan karya/LOA dan pertanyaan kurasi ada; tidak mewarisi pilihan media publik nasional. |
| INC-19 | Review checklist per-field | Setiap field pengajuan tervalidasi punya review check beridentitas stabil; dosen tidak dapat menulis status reviewer. |
| INC-20 | Satu dosen banyak judul | Dua klaim kategori sama pada tahun sama terpisah; satu klaim tidak memuat dua judul. |
| INC-21 | Tanpa SK aktif | Draft dapat dibuat, quote bernilai null dan approval/batch ditolak dengan alasan; tak ada tarif tebakan. |
| INC-22 | Revisi setelah komentar reviewer | Claim version bertambah, checklist versi sebelumnya immutable, reviewer tidak melihat data dari draft yang berubah diam-diam. |
| INC-23 | Akses data reviewer dan file | Unassigned reviewer dan dosen lain menerima 403/404; berkas privat tak bisa ditebak URL-nya. |
| INC-24 | Spreadsheet historis | Importer dry-run mendeteksi nama sheet/duplikat tahun, tidak melakukan pembayaran atau auto-approval. |

## 7.12 Konfirmasi produk yang masih diperlukan

- **SK/eligibility:** minta file SK Insentif Kepakaran 2026 versi final, bukan hanya URL dalam Excel, untuk tarif, batas usia luaran, pengecualian LOA, kuota, posisi penulis, ambang syarat dan daftar kategori benar-benar dibayar.
- **SOP reviewer:** apakah pemeriksaan `Ya/Tidak` wajib untuk semua baris; bolehkah `N/A`; apakah satu reviewer per klaim; siapa yang mengambil keputusan/pengesahan final setelah checklist.
- **Kategori belum ditemplatkan:** jurnal nasional nonterakreditasi, review hibah internal, Monev internal, HAKI: minta formulir/SOP tersendiri. Prosiding nasional dan SINTA 5-6 harus cocok dengan SK yang berlaku.
- **Bukti fisik:** siapa menerima buku hardfile dan bagaimana mencatat tanda terima; batas ukuran file/retensi softfile.
- **Periode/transisi:** apakah bukti LOA boleh tercatat tetapi tidak dibayar sampai Publish, apakah tahun 2026 berarti tahun terbit atau tahun pengajuan, dan bagaimana pengajuan lintas tahun ditangani.


# 8. Karya Cipta - arsip tanpa approval

Karya Cipta adalah arsip karya yang sudah dibuat. Tidak ada proses proposal, reviewer, persetujuan, penolakan, pending approval, atau status menunggu operator. Dosen memilih kategori dan langsung menyimpan record. Operator memiliki pencarian, rekap, serta kemampuan koreksi terbatas jika diberi izin.

| FIELD | TYPE / CONSTRAINT | DESKRIPSI |
| --- | --- | --- |
| work_id | UUID; generated | Identitas rekaman. |
| category_id | master | Barang/Jasa/Teknologi/Buku Chapter/Buku Populer/Karya Seni. |
| title, description | string/long text; required | Metadata karya. |
| created_or_published_on | date; required | Tanggal hasil tersedia. |
| contributors | array id/nama/role | Kontributor internal/eksternal. |
| publisher / producer | string; conditional | Bergantung kategori. |
| ISBN/registration/url | string/URL; conditional | Bisa kosong bila tak berlaku. |
| evidence_file_ids | array; required at least 1 (RANCANGAN) | Foto, sertifikat, dokumen atau bukti produk sesuai kategori. |
| linked_activity_id | UUID/null | Opsional dikaitkan luaran kegiatan. |
| created_by, updated_by | UUID; audit | Owner dan perubahannya. |

| AKSI | HASIL | LARANGAN |
| --- | --- | --- |
| Create + Save | Langsung RECORDED dan tampil di "Karya Saya". | Tidak ada approve/reject/reviewer. |
| Edit sendiri | Metadata terbarui; histori tersimpan. | Tidak menghapus jejak berkas lama. |
| Delete | Soft-delete dengan konfirmasi; restore admin. | Tidak menghapus berkas permanen di request UI. |
| Operator read/export | Filter kategori/prodi/tahun; ekspor sesuai izin. | Tidak mengubah ownership tanpa audit. |
| Link to output | Satu karya dapat ditautkan ke luaran; konflik duplikat tampil. | Tidak membuat klaim insentif otomatis. |


# 9. Legacy, HAKI, publikasi, dan koeksistensi

Aplikasi lama tetap online. Dari dokumen inventaris, fungsi lama mencakup Tim HAKI (status/riwayat), Ka. LPPM (Penelitian, PKM, persetujuan dan publikasi), Wadir 2, reviewer, operator, HAKI dosen, Publikasi Saya, Penelitian/Pengabdian, transaksi reviewer/periode, master dan manajemen users/groups. Beberapa menu disebut NOT FOUND pada inventaris, sehingga tidak diasumsikan berfungsi.

| FUNGSI EXISTING | STRATEGI TARGET | PERHATIAN |
| --- | --- | --- |
| Data Penelitian/PKM & status | Modul baru menggantikan setelah diuji per periode/cohort. | Deduplikasi, data approved_amount, unduh proposal dan review. |
| HAKI/form dan riwayat | Tetap legacy sampai migrasi HAKI dinyatakan siap; sediakan tautan navigasi sementara. | Form legacy memuat jenis/subjenis, file ciptaan, KTP/NPWP, surat, tim. |
| Publikasi Saya | Pertahankan legacy; rencana arsip publikasi terpisah dan relasi ke klaim. | Satu publikasi tidak berarti sudah berhak insentif. |
| Users/groups | Petakan identitas & role; pilih autentikasi tunggal kelak. | Jangan menyalin password hash tanpa audit. |
| Master reviewer/periode/dosen | Seed awal hanya setelah mapping disetujui. | Gunakan mapping kode legacy unik. |
| Dashboard & Excel | Bangun pelaporan baru secara bertahap; tandai cakupan datanya. | Jangan hitung total ganda jika sumber campuran. |


## 9.1 Aturan perpindahan data

- Jangan share koneksi DB produksi sebagai sumber tulis ganda. Legacy read-only extract via snapshot/CSV/replica atau API resmi jika tersedia.
- Setiap rekaman impor memiliki source_system, legacy_id, imported_at, source_updated_at, checksum dan migration_batch_id.
- Entity mapping memastikan satu legacy row tidak menjadi dua record baru; beri UNIQUE(source_system, entity_type, legacy_id).
- Tentukan pemilik write per periode/domain: LEGACY atau NEW. Selama koeksistensi, sistem non-owner hanya menampilkan link/read-only atau data replika bertanda freshness.
- Audit mismatch jumlah record, status, nilai dana, relasi dosen dan integritas lampiran; simpan laporan rekonsiliasi dan rollback script.
- Cutover dilakukan bertahap dan disetujui per modul; legacy baru boleh read-only/ditutup setelah UAT migrasi.

# 10. Menu, layar dan perilaku frontend

| ROUTE / PAGE (RANCANGAN) | ISI MINIMUM | PERAN |
| --- | --- | --- |
| /login | Login dan reset akun jika mekanisme diaktifkan. | Semua |
| /dashboard | Statistik berdasar role, periode/sumber data, action queue. | Semua |
| /activities?domain=... | Daftar, filter domain/skema/tahun/status/prodi, ekspor. | Sesuai akses |
| /activities/new/:domain | Wizard 7-tab dengan schema profile dan autosave draft. | Dosen |
| /activities/:id | Detail umum, status timeline, dokumen, tim, anggaran, review, milestone. | Pemilik/assigned |
| /reviews/activities | Penugasan review, formulir penilaian dan keputusan. | Reviewer/LPPM |
| /incentives/new | Kategori -> dynamic form -> bukti -> preview tarif -> submit. | Dosen |
| /incentives/:id | Detail klaim, reviewer, status, dokumen dan histori. | Pemilik/assigned |
| /incentives/review | Antrean, checklist kesesuaian tiap field (Ya/Tidak) dan formulir review insentif. | Reviewer |
| /incentives/recap | Filter, export XLSX, batch, alasan koreksi. | Operator |
| /creative-works | Karya Saya/arsip sesuai role, filter. | Dosen/Operator |
| /creative-works/new | Form ringkas pascakarya; tombol langsung Simpan Karya. | Dosen |
| /admin/config | Master, periode, workflow profiles, field profiles, tariff SK, template, user/role, audit. | Admin |
| /legacy | Link aman ke modul lama yang belum bermigrasi. | Sesuai akses |


## 10.1 UX wajib

- Setiap field wajib memberi indikator, contoh input dan validasi inline; error dari API dipetakan ke nama field yang tepat.
- Tidak menghilangkan data draft saat tab berpindah; tampilkan status autosave, changed/unsaved state, dan peringatan meninggalkan halaman.
- Tombol dan menu tersembunyi menurut permission FE tetapi BE tetap memvalidasi pada setiap request.
- Tampilan detail memperjelas "status APTIMAS" vs "status eksternal dilaporkan" dan "dana diajukan" vs "dana disetujui".
- Data tabel: debounced search, server-side pagination/sort/filter dan ekspor berdasarkan filter, bukan hanya halaman saat ini.
- Karya Cipta tidak memiliki komponen keputusan reviewer atau approval; jangan reuse approval wizard secara membabi buta.

# 11. Register kebutuhan fungsional dan acceptance criteria

| ID | FITUR | KRITERIA TERIMA |
| --- | --- | --- |
| FND-01 | Login, session dan multi-role | Pengguna tidak login menerima 401; tiap menu sesuai permission. |
| FND-02 | Ownership/assignment enforcement | User lain dan reviewer non-assigned menerima 403/404 sesuai kebijakan. |
| FND-03 | Master data dan skema berversi | Perubahan versi baru tidak mengubah record yang telah submit. |
| FND-04 | File private upload/download/version | Dokumen tidak tersedia via URL storage publik; metadata checksum ada. |
| FND-05 | Status/audit log append-only | Tiap transisi menyimpan aktor, timestamp, alasan dan old/new. |
| FND-06 | Notifikasi in-app + read state | Assignment/revisi/perubahan status membuat event sesuai penerima. |
| ACT-01 | Wizard bersama 3 domain | Ketiga domain reuse komponen dasar, konten kondisional sesuai profile. |
| ACT-02 | Draft dan submit | Submit tidak boleh jika field/file wajib belum lengkap. |
| ACT-03 | Tim/anggota | Tidak boleh duplikat dosen dalam satu tim; ketua hanya satu. |
| ACT-04 | Workflow server-state | Transition ilegal menghasilkan 409 dan tanpa mutasi parsial. |
| ACT-05 | Penugasan reviewer | Reviewer hanya melihat penugasan sendiri. |
| ACT-06 | Komentar dan keputusan | Keputusan tersimpan bersama versi proposal dan assignment. |
| ACT-07 | Perbaikan proposal | Resubmit menaikkan versi dan berkas lama tetap tersedia. |
| ACT-08 | Laporan kemajuan | Upload hanya pada window dan role yang sesuai. |
| ACT-09 | Laporan akhir | Upload dan pemeriksaan terekam per tahap. |
| ACT-10 | Realisasi luaran | Rencana vs bukti realisasi tidak dicampur. |
| ACT-11 | RAB terstruktur | Nilai subtotal/total dihitung BE dan tervalidasi. |
| ACT-12 | Jalur eksternal | Input id/URL/status eksternal manual memakai evidence/provenance. |
| ACT-13 | Laporan/filter | Agregat status/jumlah/dana konsisten dengan filter dan scope role. |
| INC-01 | Template 10 jenis kepakaran dari Excel 2026 + kategori tambahan denah yang belum memiliki form | Semua 10 sheet terpetakan field demi field; status NEEDS_TEMPLATE untuk kategori tanpa template; eligibility dari SK, bukan jumlah kategori di Excel. |
| INC-02 | Tarif berdasarkan SK berversi | Klaim menyimpan rule ID, snapshot dan hasil hitung server. |
| INC-03 | Quote & anti-tamper | Perubahan angka FE tidak mengubah hasil server. |
| INC-04 | Reviewer klaim | Komentar + keputusan assigned dan histori tersedia. |
| INC-05 | Revisi klaim | Jika aktif, berkas baru tersimpan versi baru. |
| INC-06 | Koreksi nominal beralasan | Hanya role khusus dan log old/new nominal. |
| INC-07 | Deteksi duplikat | Kandidat duplikat muncul; override bila policy berizin. |
| INC-08 | Batch & XLSX | Kolom sesuai requirement; batched tidak sama dengan paid. |
| INC-09 s.d. INC-24 | Detail 10 formulir dan review checklist | Ikuti acceptance criteria rinci pada subbab 7.11 dan manifes konfigurasi JSON pendamping. |
| CRE-01 | Create karya langsung rekam | Save valid -> status RECORDED; tidak ada approval. |
| CRE-02 | CRUD terkendali | Pemilik bisa edit; soft delete; admin restore/audit. |
| CRE-03 | Pencarian dan relasi luaran | Filter dan link ke activity tanpa klaim otomatis. |
| LEG-01 | Legacy tetap tersedia | Modul yang belum cutover dibuka di legacy via link dan perizinan. |
| LEG-02 | Mapping migrasi aman | Unique ID mapping; verifikasi jumlah dan lampiran. |
| OPS-01 | Dashboard provenance | Data legacy/new dibedakan, tidak dihitung ganda. |
| OPS-02 | Backup & restore | Uji pemulihan DB + file storage di staging berhasil. |


# 12. Model data dan data dictionary awal

RANCANGAN: MySQL menyimpan FK pada semua entitas transaksional. Primary key UUID (BINARY(16) atau CHAR(36), putuskan konsisten), created_at/updated_at pada setiap entitas, soft delete hanya pada entitas yang diperbolehkan. Index dan uniqueness berbasis query nyata; penggunaan JSON dibatasi pada field variatif tervalidasi.

| TABEL / ENTITAS | FIELD PENTING | RELASI / CONSTRAINT |
| --- | --- | --- |
| users | id; username/email; auth_provider; is_active | 1 user -> banyak role, aktivitas, notifikasi |
| roles; permissions; role_permissions; user_roles | role_code; permission_code; domain/scope | Unique role/user pairs; deny by default |
| lecturers; study_programs; disciplines | lecturer_code, nama, prodi_id, external_ref | Master identitas; tidak menyimpan NIK jika tak perlu |
| periods | name, year, window_start/end, is_active | 1 periode -> banyak scheme_versions |
| schemes; scheme_versions | domain, funding_source, external_system, valid_range | Immutable scheme_version setelah dipakai |
| field_definitions; form_profiles; form_profile_fields | key/type/validators/condition/section/order | Profile publish version; JSON conditions allowlist |
| workflow_profiles; workflow_transitions | scheme_version, from/to, role_permission, guard | Satu ruleset efektif per skema/tahun |
| activities | domain, scheme_version_id, period_id, owner_id, lifecycle_status, title, summary | Unik business code; activity milik ketua |
| activity_members | activity_id, person/lecturer_id, role, invitation_status | Unique activity+person |
| activity_details | activity_id, profile_version, validated_json | Data khusus domain berversi |
| budgets; budget_items | activity_id, year/category/item/qty/unit_price | Decimal(18,2); rekalkulasi server |
| schedules; planned_outputs | activity_id, year, month, output_type, target | Rencana bukan realisasi |
| stage_submissions; stage_revisions | stage, submission_version, submitted_at/status | Immutable versions for review |
| review_assignments; reviews | subject_type/id, reviewer_id, rubric_version, decision, notes | Unique active assignment by subject/reviewer |
| output_actuals | activity_id, planned_output_id, evidence, status | Realizations linked to activity |
| external_references | activity_id, system, external_id, url, reported_status, evidence | Provenance + status update history |
| expertise_categories | code, parent_id, active_year | Kategori denah + 10 template Excel 2026, dengan status mapping dan masa berlaku |
| incentive_rule_versions; incentive_rules | sk_number, effective dates, category, author_position, amount/formula | Versioned; no in-place update after active |
| expertise_claims; expertise_claim_versions | owner, category, year, work_fingerprint, rule_snapshot, calculated, approved | Keep submission snapshot |
| incentive_form_templates; incentive_claim_answers | category, period, immutable schema version, field answers | Formulir per sheet Excel 2026, field wajib menunggu SK/SOP |
| incentive_review_item_checks | assignment, claim_version, template_field_id, suitability Ya/Tidak, note | Checklist field-level; bukan approval otomatis |
| incentive_authors; incentive_evidence | claim_version, ordered authors, file/URL linked to template field | Satu judul per klaim; private storage |
| incentive_batches; incentive_batch_items | batch_label, created_by, items | Export batch distinct from payment |
| creative_works; creative_contributors | owner, category, title, date, status RECORDED | No reviewer/approval tables |
| entity_links | source_type/id, target_type/id, relation | Cross-module relater with permission check |
| files; file_links | storage_key, mime, size, sha256, owner, privacy, linked_record | Server signed access; never expose KTP paths |
| notifications; audit_logs | recipient; event; actor; old/new redacted; timestamp | Retention controlled; logs append only |
| migration_batches; legacy_mappings | source_system, legacy_id, new_id, checksum, reconciliation | UNIQUE(source_system, entity, legacy_id) |


## 12.1 Pemisahan data & tipe status

- activities.lifecycle_status dan stage_submissions.stage_status adalah dua dimensi berbeda. Jangan menyimpan seluruh tahap pada kolom status tunggal.
- expertise_claims menggunakan incentive status sendiri, creative_works.status hanya RECORDED/ARCHIVED/DELETED_LOGICAL tanpa approval.
- external_references.reported_status adalah laporan manual bersumber bukti; jangan gabungkan dengan activity.lifecycle_status.
- Semua uang DECIMAL (bukan float JS/Go), tanggal bertipe DATE/TIMESTAMP UTC; presentasi locale id-ID di FE.
- Gunakan transaksi database untuk perubahan status + histori + outbox event; replay dan retry harus idempotent.

# 13. Kontrak API REST (rancangan untuk Codex)

Semua endpoint versioned di /api/v1; payload JSON camelCase di FE dan mapper BE (konvensi dapat disesuaikan sekali pada inisiasi). Untuk listing gunakan ?page=&pageSize=&q=&sort=&domain=&periodId=&status=. Response konsisten: {data, meta, requestId}; error: {error:{code,message,fieldErrors},requestId}. Berkas menggunakan multipart dan download terotorisasi.

| METHOD | PATH | MAKSUD |
| --- | --- | --- |
| POST | /auth/login; /auth/logout; GET /auth/me | Auth/session sesuai provider yang disetujui |
| GET | /reference/domains; /schemes; /periods; /lecturers; /categories | Lookup scoped/filtered |
| GET | /form-profiles?domain=&schemeVersionId=&stage= | JSON schema publish version |
| GET | /workflow-profiles/:id | State + allowed actions per role |
| GET/POST | /activities | List/create own draft |
| GET/PATCH | /activities/:id | Detail/update draft/allowed metadata |
| POST | /activities/:id/submit | Validate form, freeze snapshot, status txn |
| GET/PUT | /activities/:id/team | Edit team on allowed stage |
| GET/PUT | /activities/:id/budget; /activities/:id/schedule | Structured entries, server recompute |
| GET/POST | /activities/:id/stages/:stage/submissions | List/versioned stage submit |
| POST | /activities/:id/actions/:transition | RBAC + guards; 409 invalid |
| GET | /activities/:id/history; /activities/:id/outputs | Timeline/output list |
| POST/PATCH | /activities/:id/outputs; /activities/:id/outputs/:outputId | Realization + evidence |
| GET/POST | /activities/:id/external-references | Evidence and manual reported status |
| GET/POST | /reviews/assignments | List and assign only authorized |
| GET/POST | /reviews/assignments/:id/decision | Read/write review assigned |
| GET/POST | /incentives; /incentives/quote | Claim list/create and tariff quote |
| GET | /incentives/categories; /incentives/form-templates/:categoryCode | Master kategori+form schema per periode |
| PATCH/POST | /incentives/:id/draft; /incentives/:id/evidence | Autosave jawaban field, unggah bukti |
| GET/PUT | /incentives/review-assignments/:id/checklist; /incentives/review-assignments/:id/checks | Checklist kesesuaian Ya/Tidak tiap field dari versi klaim |
| GET/PATCH | /incentives/:id | Claim own/update only draft/revision |
| POST | /incentives/:id/submit | Server quote + snapshot + duplicate check |
| GET/POST | /incentives/reviews; /incentives/reviews/:assignmentId/decision | Assigned review and decision |
| GET/POST | /incentives/batches | List/create batch |
| GET | /incentives/export.xlsx?filters... | Authorize all rows, return XLSX |
| GET/POST | /creative-works | List/create; create returns RECORDED |
| GET/PATCH/DELETE | /creative-works/:id | Owner or admin; soft delete |
| POST | /files/upload | Upload validator; create private file |
| GET | /files/:id/download | Authorized streaming/signed short URL |
| GET | /dashboard/summary; /notifications; /audit-logs | Role-filtered; audit admin only |
| GET/POST | /admin/scheme-versions; /admin/form-profiles | Admin draft/version publishing |
| GET/POST | /admin/incentive-sks; /admin/workflow-profiles | Versioned master |
| GET | /admin/migration-batches/:id/reconciliation | Historical migration report |


## 13.1 Perilaku API standar dan contoh payload

- HTTP: 200 read/update; 201 created; 202 only jika background confirmed; 400 invalid malformed; 401 unauthenticated; 403 forbidden; 404 inaccessible/not found; 409 conflict illegal transition/optimistic lock; 422 valid payload invalid business; 429 throttled.
- Gunakan Idempotency-Key pada submit, transition, approval, quote-to-claim, batch creation agar klik ganda/retry tidak membuat record duplikat.
- Optimistic locking: version_number/ETag; PATCH stale mengembalikan 409 disertai state terbaru yang aman.
- Input sanitized/validated BE; jangan menerima ownerId atau calculatedAmount langsung sebagai otoritatif saat create.
- File upload dua tahap: register/scan/store metadata; link ke record hanya jika file owner dan content category lolos pemeriksaan.
CONTOH request POST /api/v1/activities: {"domain":"RESEARCH","schemeVersionId":"<uuid>","periodId":"<uuid>","title":"Contoh judul","summary":"Ringkasan","fundingSource":"INTERNAL"}. Response 201: {"data":{"id":"<uuid>","code":"APT-2026-R-0001","status":"DRAFT","version":1},"requestId":"<id>"}. Placeholder UUID hanya ilustrasi.

CONTOH GET /api/v1/form-profiles: {"profileVersion":3,"sections":[{"id":"identity","fields":[{"key":"title","type":"text","required":true,"maxLength":500}]}]}. BE mengirim section, types, validasi, dan opsi hanya dari profile published.

CONTOH POST /api/v1/incentives/quote: {"categoryId":"<uuid>","authorPosition":"FIRST","completedYear":2026}. Response: {"data":{"ruleVersionId":"<uuid>","amount":0,"currency":"IDR","breakdown":[],"needsRules":true}} bila SK aktual belum diunggah - JANGAN mengarang nominal default.


# 14. Arsitektur aplikasi dan integrasi

| LAPIS | REKOMENDASI | CATATAN IMPLEMENTASI |
| --- | --- | --- |
| Frontend | React + Vite, TypeScript, React Router, query cache library, React Hook Form + validator | Library dipilih konsisten saat bootstrap, bukan dependency wajib produk. |
| Backend | Go + Fiber v3, modular monolith (domain modules) | Pisahkan auth, reference/config, activities, incentive, creative, files, reporting, migration. |
| Database | MySQL 8.x, migrations versioned + seeds | Foreign key, transaction and indexing; usulan versi DB. |
| Berkas | Private object storage/NAS with backend access; provider TBD | Jangan simpan file biner di MySQL; cek kebijakan data lembaga. |
| Events | DB outbox / in-process queue di awal | Notifikasi, audit dan laporan async boleh ditingkatkan kemudian. |
| Legacy | Read-only import job, mapping table, link deep URL lama | Tidak ada dual-write lintas DB; reconciliation per batch. |
| Auth | Session HttpOnly Secure SameSite + CSRF, atau SSO institusi jika ada | Provider, redirect dan masa session menunggu admin. |
| CI/CD | dev/staging/prod terpisah; migration gate dan smoke tests | Rollback app dan DB backward-compatible. |


## 14.1 Struktur proyek yang direkomendasikan untuk coding agent

Monorepo (USULAN): /frontend/src/{app,routes,modules/{activities,incentives,creative-works},components,services,schemas}; /backend/{cmd/api,internal/{auth,config,activities,incentives,creative,files,reporting,migration},pkg,db/migrations}; /contracts/openapi; /docs; /tests/e2e. BE per modul memisahkan transport/handler, service use case, domain rules, repository. Hindari business logic di handler/React component.


# 15. Keamanan, privasi dan kebutuhan nonfungsional

| ID | KEBUTUHAN | KRITERIA / UJI |
| --- | --- | --- |
| NFR-01 | Deny-by-default authz, ownership/assignment | Cross-user access test ke setiap endpoint + file. |
| NFR-02 | TLS, private file, validasi mime/ukuran/malware sesuai infra | Storage key tidak dapat diakses publik. |
| NFR-03 | Audit keputusan/uang/data personal; minimum necessary | Old/new yang sensitif diredaksi pada log. |
| NFR-04 | Backup DB dan dokumen + restore bersama | Recovery rehearsal staging dengan referential integrity. |
| NFR-05 | Performance target awal (USULAN): p95 read API < 1s untuk 20 ribu record, 100 user concurrent | Target harus disahkan dari sizing/infra; uji tanpa file transfer. |
| NFR-06 | Server validation, SQL parameterized, XSS sanitation, CSRF sesuai auth | DAST dan unit security cases. |
| NFR-07 | Accessibility: keyboard input, errors read clearly, contrast | UAT desktop/mobile 360px; hindari hanya warna untuk status. |
| NFR-08 | Reliability and observability | requestId; structured log; error alerts; health/readiness endpoints. |
| NFR-09 | Retention dan kebijakan data identitas | KTP/NPWP HAKI hanya dimigrasi jika sah dan diperlukan; retention TBD. |
| NFR-10 | Ekspor role-filtered + formula injection guard | Sel Excel teks tidak boleh dieksekusi rumus dari input user. |
| NFR-11 | Data migration reconcile 100% jumlah per batch/jenis & checksum file | Selisih dilaporkan, bukan diabaikan otomatis. |
| NFR-12 | Deployment tanpa downtime sistem lama | Go-live baru tidak mengubah host/DB legacy. |


# 16. Strategi migrasi bertahap dan rencana rilis

| FASE | AKTIVITAS | GATE |
| --- | --- | --- |
| 0. Discovery | Snapshot schema CodeIgniter legacy, dokumen, media, user/group, volume, kebutuhan akses; inventaris endpoint/DB. | Data dictionary & mapping disetujui. |
| 1. Foundation | Bootstrap React Vite + Fiber v3 + MySQL; auth/RBAC, master, file private, audit, profiles. | Security baseline, migration/staging test. |
| 2. Pilot domain | Rilis Penelitian internal pada periode baru; sistem lama mengelola cohort sebelumnya. | SOP lengkap; UAT dosen/reviewer/LPPM lulus. |
| 3. PKM & Inovasi | Pakai wizard bersama + profile kondisional; jalur eksternal dan bukti portal. | Form dibandingkan referensi + validasi sample stakeholder. |
| 4. Arsip & klaim | Rilis Karya Cipta tanpa approval; Insentif setelah SK dan bukti per jenis disetujui. | UAT klaim, nominal, Excel dan privasi lulus. |
| 5. Migrasi historis | ETL per jenis/tahun, file migration, review sample, compare sums/counts. | Business owner sign-off per batch. |
| 6. Cutover parsial | Redirect menu per modul; legacy read-only hanya bila benar-benar selesai. | Backout tested; monitoring periode awal. |


## 16.1 Pola coexistence yang harus diimplementasikan

- Config module_ownership(domain, scheme, period, write_system, read_system) menentukan sistem sumber tulis; tampilkan badge "data lama" atau "data baru".
- Untuk cohort existing legacy, klik membuka view legacy/redirect aman sampai migrasi valid; untuk pengajuan baru periode pilot, hanya aplikasi baru yang menerima create.
- Tidak ada sinkronisasi otomatis dua arah. Koreksi historis dilakukan di owner system dan diimpor ulang terkontrol dengan mapping/staging.
- Rollback rilis FE/BE tidak boleh melakukan reverse migration destruktif. Pertahankan backward-compatible SQL saat fase coexistence.
- Laporan institusi harus memiliki provenance filter dan dedupe crosswalk sebelum agregasi; indikator coverage menampilkan modul yang telah dimigrasikan.

# 17. Rencana QA, UAT dan definisi selesai

| ID | SKENARIO | KRITERIA LULUS |
| --- | --- | --- |
| UAT-01 | Create Penelitian internal draft -> submit | Missing required fails; valid record creates code, version, history. |
| UAT-02 | Create PKM dengan mitra dan lampiran kondisional | Field mitra tampil dan diperiksa; research-only fields tidak diwajibkan. |
| UAT-03 | Create Inovasi Dorongan Teknologi | TKT/mekanisme hilirisasi kondisional tampil; draft tersimpan. |
| UAT-04 | Pengajuan eksternal | External ID/status provenance tercatat tanpa API call ke portal. |
| UAT-05 | Dua reviewer dan revisi | Assigned only; komentar terikat proposal version; dokumen lama immutable. |
| UAT-06 | Laporan kemajuan/akhir/luaran | Gate sesuai workflow config; rencana dan realisasi tak tertukar. |
| UAT-07 | SK tarif baru | Quote baru pakai versi SK aktif; klaim approved lama tidak berubah. |
| UAT-08 | Klaim tanpa SK | Quote needsRules atau business 422; tidak ada nominal fiktif. |
| UAT-09 | Reviewer insentif & Excel | Kesesuaian per baris Ya/Tidak, komentar, status, nominal dan batch sesuai filter; ikuti INC-09 s.d. INC-24. |
| UAT-10 | Karya Cipta buat/edit | Save langsung RECORDED; tidak ada tombol/status approve/review. |
| UAT-11 | Akses lintas user | Unauthorized review/file/admin request ditolak BE. |
| UAT-12 | Double click/submit retry | Idempotency token membuat satu transaksi/versi saja. |
| UAT-13 | RAB jumlah besar dan karakter spesial | Decimal tepat; CSV/XLSX injection tidak berjalan. |
| UAT-14 | Migrasi sampel histori | Counts, amounts, file checksums dan legacy ID match. |
| UAT-15 | Rollback aplikasi baru | Fungsi legacy tetap hidup, draft/berkas baru tidak hilang. |


## 17.1 Definition of Done untuk semua user story

- Unit tests untuk domain state machine, validator schema dan tariff calculation; integration tests untuk MySQL transaction/RBAC.
- OpenAPI diperbarui; FE memakai typed client/generated types dari kontrak dan tidak menyisipkan aturan bisnis kritikal.
- Migrasi SQL up/down aman, seed idempotent, API errors konsisten, audit event tercatat, tidak ada secrets pada repo.
- UI state loading/empty/error, responsive dan accessible; user story mempunyai bukti uji dan screenshot UAT.
- No critical/high bugs; jalur lama tidak terdampak; catatan deployment + rollback tersedia.

# 18. Jejak sumber - kebutuhan dan keputusan TBD

| SUMBER/ARAHAN | TERJEMAHAN SPESIFIKASI |
| --- | --- |
| Denah pengembangan klien | Domain/scheme/categorical master dan lima tahap; perbedaan proses versus arsip. |
| Menu legacy & screenshot | Role, fungsi daftar/reviewer/HAKI, Excel, histori dan transisi migrasi. |
| Tambahan foto kepakaran | Dinamis per kategori; posisi penulis, tarif SK, komentar reviewer, persetujuan dan ekspor batch. |
| FORM KEPAKARAN 2026.xlsx | Inventaris 10 template aktual, SINTA 1-6, prosiding nasional, review checklist Ya/Tidak pada setiap butir, instruksi tahun 2026. |
| Permintaan terbaru klien | Form selaras BIMA/Hiliriset namun tidak dipaksakan seragam; karya tanpa approval; legacy tetap berjalan. |
| Panduan BIMA 2026 | Form terstruktur dan ketergantungan skema/tahun; jangan tiru portal yang memerlukan login. |
| Hiliriset Dorongan Teknologi 2025 | Inovasi memerlukan field kesiapan produk/hilirisasi secara kondisional. |


## 18.1 Pertanyaan produk yang wajib ditutup sebelum sprint terkait

| ID | PERTANYAAN | DAMPAK |
| --- | --- | --- |
| TBD-01 | SOP persetujuan kegiatan internal setiap skema: siapa verifikator, siapa reviewer, siapa final approver, tingkat revisi. | Blok implementasi keputusan/approval |
| TBD-02 | Apa yang harus disimpan untuk hibah eksternal: data mirror, dokumen, status dan apakah laporan wajib internal. | Blok pemetaan profile eksternal |
| TBD-03 | Sampel formulir BIMA/Hiliriset per skema yang benar-benar dipakai ULBI, berikut versi panduan aktif. | Blok finalisasi field wajib |
| TBD-04 | Dokumen SK Insentif Kepakaran 2026 final (Excel hanya memberi tautan), nominal/rumus, pembagian posisi penulis, eligibility SINTA 5-6/Prosiding Nasional, perlakuan LOA. | Blok fitur perhitungan & submit insentif |
| TBD-05 | Reviewer insentif tunggal/ganda? Apakah ada otoritas pengesahan terpisah sesudah reviewer? | Blok transisi klaim akhir |
| TBD-06 | Validasi surat pernyataan Scopus/WOS yang ditautkan Excel; formulir resmi untuk kategori yang belum dicontohkan (HAKI, Monev, reviewer, nasional nonterakreditasi). | Blok formulir klaim produksi |
| TBD-07 | Karya Cipta: apakah bukti berkas minimal 1 dan berapa jumlah kontributor eksternal? | Boleh implementasi default dengan config |
| TBD-08 | SSO/login provider, file storage, hosting, backup dan owner data sensitif. | Blok security/deployment production |
| TBD-09 | Schema + media CodeIgniter lama, cutover per modul/tahun dan siapa boleh edit histori setelah migrasi. | Blok migrasi production |
| TBD-10 | Fungsi HAKI dan publikasi lama mana yang masuk rilis baru berikutnya. | Tidak memblokir foundation / modul baru |

CATATAN: TBD bukan izin mengarang. Untuk Codex, beri stub feature flag / config nonaktif, tampilkan pesan "konfigurasi belum tersedia", dan lanjutkan modul independen seperti draft kegiatan dan Karya Cipta.


# 19. Instruksi handoff ke AI Codex

Gunakan dokumen ini sebagai sumber kebutuhan dan prioritaskan aturan yang eksplisit atas asumsi coding agent. Buat pekerjaan bertahap, jangan langsung membangun lima modul sekaligus tanpa kontrak yang ditinjau.

1. Sprint bootstrap: buat workspace frontend/backend, docker-compose MySQL dev, migration tool, CI lint/test, OpenAPI awal, auth/RBAC, health checks, file storage adapter, audit.
2. Sprint config: bangun scheme_versions, form_profiles, workflow_profiles, seed kategori lima domain dan 10 template Excel 2026 dengan flag DRAFT; buat unit tests untuk publish version dan form validators.
3. Sprint FE/BE kegiatan: implementasikan wizard shared dan Penelitian internal lebih dahulu; ujikan draft/submit/version/reviewer/stage state. Baru turunkan PKM/Inovasi sebagai profile tambahan.
4. Sprint arsip: implementasikan Karya Cipta independent tanpa approval dan tautan luaran opsional; QA langsung menyertakan test negatif memastikan approval tidak pernah muncul.
5. Sprint insentif: implementasikan 10 template aktual dari manifes konfigurasi JSON pendamping, checklist reviewer Ya/Tidak per field, SK versioned engine disabled hingga SK real, reviewer assigned dan ekspor. Jangan gunakan nominal hardcoded/sample sebagai produksi.
6. Sprint migrasi: buat ETL dry run legacy dan reconciliation report, lalu pilot per periode; tidak mengubah basis data/host legacy dalam testing fitur baru.

## 19.1 Prompt kerja yang boleh diberikan ke Codex

"Baca PRD_APTIMAS_Lengkap_v1.1.md sepenuhnya. Implementasikan hanya Sprint bootstrap dan Sprint config dahulu menggunakan Go Fiber v3, React Vite TypeScript, MySQL. Buat migrations, OpenAPI, FE minimal, tests, README, dan .env.example. Konfirmasi keputusan TBD sebelum membuat approval/tariff rules. Aplikasi lama tidak boleh disentuh. Laporkan file yang dibuat, command menjalankan stack, hasil test, dan item yang belum sesuai PRD."
