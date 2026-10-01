# Kesesuaian APTIMAS Frontend terhadap PRD v1.1

Tanggal pemeriksaan: 2 Oktober 2026. Cakupan: implementasi FE Fase 1 sampai 4 pada workspace ini. Fase 5 belum dikerjakan.

## 1. Kesimpulan

FE mengikuti alur utama PRD: Penelitian/PKM/Inovasi memakai wizard bersama dan pemeriksaan bertahap, Insentif Kepakaran memakai sepuluh template sumber dengan checklist reviewer, dan Karya Cipta langsung tercatat tanpa approval. SK/SOP dapat dikonfigurasi sebagai versi lokal; tanpa kebijakan yang diperlukan, aplikasi menahan keputusan terkait.

Namun aplikasi belum memenuhi PRD secara penuh dan belum siap menjadi sistem produksi institusi. PRD mencakup FE, backend, autentikasi, database, penyimpanan privat, konfigurasi dinamis, XLSX, migrasi legacy, serta UAT. Implementasi sekarang merupakan frontend simulasi yang menyimpan metadata/berkas di browser. Tersedianya suatu alur FE tidak membuktikan keamanan, transaksi server, atau keberhasilan interaksi browser.

Perbedaan yang perlu diketahui sebelum mencoba aplikasi:

- Draft disimpan melalui tombol, belum autosave.
- Ekspor berbentuk CSV, belum XLSX.
- Skema kegiatan tersedia delapan dan tahun kegiatan masih 2026; taksonomi Inovasi PRD belum seluruhnya tersedia.
- Admin mengatur beberapa bagian profil dan kebijakan, tetapi belum menambah skema/struktur field/template baru secara bebas.
- Tarif lokal mendukung nominal tetap, posisi penulis, dan satu kondisi pilihan per baris; belum mesin rumus/kelayakan lengkap.
- Login, role, audit, berkas, dan nominal masih lokal; belum menjadi kontrol keamanan produksi.
- Legacy, migrasi, backup terpadu, dan notifikasi persisten belum terintegrasi.
- Pemeriksaan browser, mobile, keyboard, dan UAT belum dilakukan.

Fase 5 FE yang dibahas dalam pekerjaan ini adalah penyempurnaan UI, aksesibilitas, performa, dan pemeriksaan akhir. Itu berbeda dari fase rilis PRD bab 16, yang memuat Discovery sampai Cutover dan menyebut fase 5 sebagai migrasi historis. Menyelesaikan Fase 5 FE kelak tidak otomatis memenuhi seluruh PRD atau menambahkan backend/migrasi.

## 2. Dasar penilaian

Sumber utama:

- [PRD APTIMAS Lengkap v1.1](PRD_APTIMAS_Lengkap_v1.1.md), khususnya bab 3 sampai 11, 13 sampai 18.
- [Manifes formulir Kepakaran 2026](APTIMAS_Insentif_FormSchema_2026_DRAFT_v1.1.json). Renderer membaca berkas ini langsung; dokumen sumber tidak diubah pada pekerjaan dokumentasi.
- [Workbook sumber](FORM%20KEPAKARAN%202026.xlsx), yang menjadi dasar sepuluh template dalam manifes.
- Source code yang tercantum pada bagian bukti implementasi dan pemeriksaan otomatis yang sudah tersedia.

Dokumen PRD/manifes adalah acuan kebutuhan, termasuk bagian rancangan dan keputusan TBD. Contoh prompt/handoff di dalam PRD tidak diperlakukan sebagai perintah baru untuk membangun backend atau menjalankan migrasi pada permintaan dokumentasi ini.

Istilah status pada matriks:

| Status | Makna |
| --- | --- |
| Tersedia di FE | Alur/aturan tersedia dalam simulasi lokal dan dapat ditelusuri pada kode. Belum berarti kriteria produksi/QA browser lulus. |
| Parsial | Ada bagian implementasi, tetapi kebutuhan memiliki kekurangan nyata, misalnya server, konfigurasi, atau format ekspor. |
| Belum tersedia | Fitur atau integrasi tersebut belum ada. |

Tidak diberikan persentase kepatuhan karena kebutuhan memiliki bobot berbeda, sejumlah keputusan masih TBD, dan UAT belum dilaksanakan.

## 3. Matriks kebutuhan fungsional

### Foundation

| ID PRD | Status | Bukti dan batas |
| --- | --- | --- |
| FND-01 Login, session, multi-role | Parsial | Login simulasi dan lima peran tersedia. Satu akun mempunyai satu role dalam konfigurasi lokal; belum autentikasi/SSO, HTTP 401, atau multi-role produksi. |
| FND-02 Ownership/assignment | Parsial | Filter pemilik, reviewer assigned, akun aktif, dan guard tindakan lokal tersedia. Belum penolakan 403/404 pada endpoint atau download server. |
| FND-03 Master/skema berversi | Parsial | Profil draft, versi SK/SOP, periode insentif, snapshot pengajuan dibekukan. Skema/template dasar dan sejumlah aturan masih statis; editor struktur profil lengkap belum ada. |
| FND-04 File privat dan versi | Parsial | File lokal IndexedDB dengan pemeriksaan jenis/ukuran/keberadaan serta referensi versi lama. Belum checksum, scanning, storage privat server, atau otorisasi download. |
| FND-05 Audit append-only | Parsial | Riwayat lokal menyimpan aktor/waktu/tindakan; koreksi nominal menyimpan sebelum/sesudah. Belum audit server yang tahan perubahan, requestId, atau redaksi/retensi terpusat. |
| FND-06 Notifikasi/read state | Parsial | Pengingat dari tindak lanjut kegiatan dan status dibaca sementara. Belum event assignment/revisi/status untuk semua modul atau persistensi notifikasi per penerima. |

Bukti: [login](../src/pages/login.tsx), [navigasi/sesi](../src/app/shell.tsx), [provider](../src/app/provider.tsx), [aturan akses kegiatan](../src/modules/activities/rules.ts), [berkas](../src/modules/activities/files.ts), [konfigurasi](../src/modules/configuration/store.ts).

### Penelitian, PKM, dan Inovasi

| ID PRD | Status | Bukti dan batas |
| --- | --- | --- |
| ACT-01 Wizard bersama | Tersedia di FE | Tujuh langkah, tiga domain, substansi/mitra/TKT/dokumen kondisional. Profil yang dipakai masih baseline demo dengan sebagian konfigurasi Admin. |
| ACT-02 Draft/submit | Tersedia di FE | Simpan manual, validasi sebelum submit, window, konfirmasi dan snapshot. Keabsahan aturan wajib institusi masih menunggu validasi sumber. |
| ACT-03 Tim/anggota | Tersedia di FE | Ketua dari akun, direktori/manual anggota, pencegahan duplikat. Undangan/konfirmasi anggota dan akses kegiatan sebagai anggota belum ada. |
| ACT-04 Workflow server-state | Parsial | Guard transisi dan konflik versi pada repository lokal. Belum HTTP 409, transaksi database, whitelist server atau idempotency key. |
| ACT-05 Penugasan reviewer | Tersedia di FE | Operator memilih reviewer aktif sesuai jumlah SOP; akses versi kegiatan mengikuti penugasan tahap. Batas keamanan server masuk kekurangan FND-02. |
| ACT-06 Penilaian/keputusan | Tersedia di FE | Rubrik, skor, komentar, rekomendasi, versi tahap/policy, semua reviewer selesai, dan keputusan Ka. LPPM terpisah. Otoritas kegiatan belum bisa selain Ka. LPPM. |
| ACT-07 Perbaikan proposal | Tersedia di FE | Revisi menambah versi, menjaga file lama, dan mengikuti pilihan kembali ke administrasi/reviewer. |
| ACT-08 Laporan kemajuan | Tersedia di FE | Pemilik/status/window, PDF, versi laporan, penugasan tahap dan penerimaan milestone. |
| ACT-09 Laporan akhir | Tersedia di FE | PDF dan kemajuan 100%, review tahap, penerimaan menuju OUTPUT_PENDING. |
| ACT-10 Realisasi luaran | Tersedia di FE | Target terpisah dari capaian/bukti dan riwayat; penyimpanan bukti tidak otomatis COMPLETED. |
| ACT-11 RAB terstruktur | Parsial | Komponen, volume/harga desimal, pembulatan integer sen/BigInt dan total lokal. Rekalkulasi server dan DECIMAL database belum ada. |
| ACT-12 Jalur eksternal | Tersedia di FE | ID/URL/status, bukti Operator dan EXTERNAL_MANUAL tanpa API portal. Nominal pendanaan hasil eksternal belum memiliki input tersendiri. |
| ACT-13 Laporan/filter | Parsial | Daftar/rekap/dashboard lokal sesuai scope, filter/sort/pagination dan CSV semua hasil filter. Belum reporting institusi dan query/agregat server. |

Kekurangan lain pada bab 3, 5, 6 dan 10:

- Daftar skema terdiri dari tiga Penelitian, tiga PKM, serta Inovasi Internal dan Dorongan Teknologi. Sinergi, Kemitraan Internasional, Ajakan Industri, Kosa Bangsa, Kekayaan Intelektual, dan Penguatan belum mempunyai profil kegiatan.
- Sumber pendanaan OTHER belum tersedia pada pilihan skema. Form kegiatan masih memakai tahun 2026.
- SOP lokal mengatur rubrik/jumlah reviewer/jadwal/pagu/batas kata/komponen RAB/jenis luaran dan tujuan resubmit. Struktur field, syarat visibilitas, kata kunci, durasi, checklist/limit dokumen belum seluruhnya dapat dikonfigurasi.
- Profile/window masih memuat nilai demo; belum kesetaraan field resmi BIMA/Hiliriset per skema yang divalidasi stakeholder. PRD tidak meminta kesetaraan UI 1:1.
- WITHDRAWN tersedia sebagai status/data contoh, tetapi tindakan withdraw/cancel beralasan belum tersedia.
- Grace period dan override tenggat beralasan belum tersedia. Pemeriksaan milestone memiliki penerimaan; jalur koreksi/revisi laporan tersendiri belum lengkap.
- Penyimpanan manual memenuhi draft dasar, tetapi belum autosave/status autosave yang diminta pada rancangan layar dan UX bab 10.
- Tabel menerapkan pencarian melalui tombol Cari; server-side pagination/filter/sort serta debounced search PRD belum tersedia.

Bukti: [wizard](../src/pages/draft.tsx), [master skema](../src/modules/activities/data.ts), [profil/validator/RAB](../src/modules/activities/profiles.ts), [repository kegiatan](../src/modules/activities/repository.ts), [workflow](../src/modules/activities/workflow.ts), [panel pemeriksaan](../src/modules/activities/review.tsx), [laporan/luaran](../src/modules/activities/milestones.tsx), [tabel](../src/modules/activities/table.tsx).

### Insentif: alur dan finansial

| ID PRD | Status | Bukti dan batas |
| --- | --- | --- |
| INC-01 Sepuluh template/kategori tambahan | Tersedia di FE | Sepuluh template membaca manifes langsung: 198 field sumber, termasuk 30 identitas otomatis dan 10 komentar reviewer; 158 butir Kesesuaian. Empat kategori tanpa sumber ditandai belum ada template. |
| INC-02 Tarif SK berversi | Parsial | ID SK/quote/snapshot terikat, versi terbit dikunci, nominal awal null. Perhitungan masih lokal dan hanya tarif tetap dengan selector terbatas, belum approvedFormula/server. |
| INC-03 Quote/anti-tamper | Parsial | Aplikasi menghitung quote dari SK lokal dan memeriksa input; pengguna yang mengubah data browser masih bisa mengubah sumbernya. Belum kalkulasi otoritatif server. |
| INC-04 Reviewer klaim | Tersedia di FE | Reviewer assigned, checklist/komentar, rekomendasi, otoritas final sesuai SK dan riwayat. |
| INC-05 Revisi | Tersedia di FE | Jawaban/bukti baru menjadi versi baru; hasil pemeriksaan sebelumnya dipertahankan. |
| INC-06 Koreksi nominal | Tersedia di FE | Operator hanya jika diizinkan SK, alasan wajib, audit sebelum/sesudah, belum dibatch. |
| INC-07 Duplikat | Parsial | Cek judul ternormalisasi/pengusul/tahun saat submit. Belum pencocokan lebih luas, antrean kandidat, atau override berizin. |
| INC-08 Batch/XLSX | Parsial | Batch lokal anti duplikat dengan snapshot nominal dan tanpa PAID. Ekspor masih CSV, belum XLSX. |

Template sumber tetap draft validasi. Admin mengonfigurasi wajib/LOA/tarif pada SK, tetapi belum memublikasikan versi struktur template baru seperti kontrak bab 7.7 sampai 7.9. Renderer/histori masih memakai manifes tunggal yang dibundel pada FE; arsip renderer schema per versi historis belum tersedia.

Tanpa SK, FE dapat mencatat pengajuan simulasi non-LOA dengan quote null; LOA dapat masuk PENDING_POLICY_REVIEW. Penugasan/approval/batch yang memerlukan kebijakan diblokir. Ini bukan gerbang kelayakan submit produksi lengkap: izin kategori/peringkat, ambang kelayakan, kuota, dan rumus aktual masih menunggu SK/SOP dan implementasi server.

Bukti: [model/manifes](../src/modules/incentives/model.ts), [form](../src/pages/claim-form.tsx), [renderer](../src/modules/incentives/fields.tsx), [aturan](../src/modules/incentives/rules.ts), [repository](../src/modules/incentives/repository.ts), [workflow](../src/modules/incentives/workflow.ts), [SK/quote](../src/modules/configuration/store.ts), [operasi klaim](../src/modules/incentives/operations.tsx), [tabel/rekap](../src/modules/incentives/table.tsx).

### Insentif: detail acceptance criteria bab 7.11

| ID PRD | Status | Bukti dan batas |
| --- | --- | --- |
| INC-09 Buku | Tersedia di FE | Penulis urut, metadata posisi pengusul, Hardfile/Softfile dan petunjuk 125 halaman. Tanda terima fisik masih input pengusul, belum konfirmasi penerimaan Operator. |
| INC-10 SINTA 1 sampai 6 | Parsial | Semua pilihan sumber tampil dan dapat menjadi kondisi tarif; kelayakan final tiap peringkat belum merupakan aturan produksi. |
| INC-11 Scopus/LOA | Tersedia di FE | APC kondisional, kuartil/impact factor/surat; tidak otomatis membayar LOA. |
| INC-12 Copernicus | Tersedia di FE | Field indeks Copernicus mengikuti template sendiri. |
| INC-13 Prosiding Scopus/WOS | Tersedia di FE | Field komite/peserta/indeks/surat mengikuti sumber. |
| INC-14 Prosiding internasional nonindeks | Tersedia di FE | Tidak mewarisi field indeks Scopus/WOS yang tidak ada di template. |
| INC-15 Jurnal internasional nonindeks | Tersedia di FE | Bahasa dan Publish/LOA sesuai sumber, tanpa field impact factor yang tidak ada di template. |
| INC-16 Prosiding nasional | Parsial | Template ISSN/ISBN dan bahasa tersedia; gerbang eligibility submit produksi menunggu SK/SOP. |
| INC-17 Karya populer | Tersedia di FE | Media/portal kondisional, akses, kurasi dan pilihan manual. |
| INC-18 Karya internal | Tersedia di FE | Bukti/LOA/kurasi mengikuti kategori sendiri. |
| INC-19 Checklist per field | Tersedia di FE | Stable fieldId, Ya/Tidak reviewer terpisah dari jawaban Dosen. Butir yang berlaku dan komentar diperlukan untuk finalisasi; pilihan N/A belum tersedia. |
| INC-20 Banyak judul | Tersedia di FE | Satu judul satu record, beberapa klaim per dosen. |
| INC-21 Tanpa SK | Tersedia di FE | Quote null dengan alasan; keputusan/batch kebijakan terkait ditahan. Tidak ada nominal tebakan pada data awal klaim. |
| INC-22 Revisi setelah komentar | Tersedia di FE | Snapshot versi pengajuan/checklist dan perbedaan jawaban antar versi. |
| INC-23 Akses reviewer/file | Parsial | Tampilan/guard assigned lokal; belum 403/404 server atau keamanan file privat produksi. |
| INC-24 Importer historis | Belum tersedia | Tidak ada dry-run impor workbook/Drive atau rekonsiliasi klaim historis. |

Pemeriksaan angka/jurnal/URL bersifat sintaks dan data yang diinput, bukan validasi otomatis sumber eksternal. Korespondensi dan surat hanya muncul pada template sumber yang memilikinya. Tambahan posisi Buku/tahun pada kategori tanpa kolom tahun ditandai sebagai metadata klaim; tidak diklaim sebagai field asli workbook.

### Karya Cipta, legacy, dan operasi

| ID PRD | Status | Bukti dan batas |
| --- | --- | --- |
| CRE-01 Langsung tercatat | Tersedia di FE | Enam kategori, bukti minimum satu, save langsung RECORDED; tanpa proposal/review/approval. |
| CRE-02 CRUD terkendali | Tersedia di FE | Edit pemilik, snapshot, soft-delete dengan konfirmasi, restore Admin, bukti lama dipertahankan. |
| CRE-03 Pencarian/relasi | Parsial | Filter/CSV dan tautan ke kegiatan milik sendiri. Belum relasi ke item luaran tertentu atau pengelolaan konflik relasi lintas modul. |
| LEG-01 Legacy tersedia | Belum tersedia | Aplikasi lokal ini tidak menyentuh legacy. Route/link /legacy, scope akses, serta navigasi aman modul lama belum dibuat. Tidak memodifikasi legacy bukan bukti integrasi coexistence selesai. |
| LEG-02 Mapping migrasi | Belum tersedia | Belum ETL, crosswalk legacy ID, checksum atau rekonsiliasi. |
| OPS-01 Dashboard provenance | Parsial | Data diberi label simulasi dan status eksternal manual dibedakan. Belum agregasi legacy/new, dedupe lintas sistem atau indikator cakupan migrasi. |
| OPS-02 Backup/restore | Belum tersedia | Reset/restore contoh browser tersedia, tetapi bukan backup dan restore database/file institusi. |

Koreksi karya oleh Operator dengan mandat khusus belum tersedia; Operator membaca/mengekspor. Peran anggota tim sebagai pengguna kegiatan, Wadir 2, Sentra HAKI, dan manajemen read-only belum menjadi peran mandiri. Lima peran saat ini mengikuti matriks minimum PRD bab 4.1.

Bukti: [karya](../src/pages/creative-works.tsx), [repository karya](../src/modules/creative-works/repository.ts), [dashboard](../src/pages/dashboard.tsx), [routes](../src/App.tsx), [konfigurasi/pemulihan](../src/pages/configuration.tsx).

## 4. Kebutuhan nonfungsional dan arsitektur

| ID PRD | Status | Batas saat ini |
| --- | --- | --- |
| NFR-01 Authz deny-by-default | Parsial | Guard FE tersedia; enforcement setiap endpoint/file server belum ada. |
| NFR-02 TLS/private storage/malware | Parsial | Pemeriksaan jenis/ukuran lokal ada. TLS produksi, file server privat dan malware scanning belum ada. |
| NFR-03 Audit/privasi | Parsial | Riwayat lokal ada; jaminan minimum necessary, redaksi/retensi/log server belum lengkap. |
| NFR-04 Backup DB/dokumen | Belum tersedia | Belum database, backup terpadu atau recovery rehearsal staging. |
| NFR-05 Performa API/concurrency | Belum tersedia | Tidak ada API/load test. Build terakhir Fase 4 mempunyai peringatan chunk; pemecahan bundle ditunda ke Fase 5 FE. |
| NFR-06 Validasi/security server | Belum tersedia | Validasi form lokal ada; SQL/CSRF/DAST dan validasi backend belum ada. |
| NFR-07 Aksesibilitas/responsif | Parsial | Label, fokus, dialog, beberapa layout responsif dan state tersedia pada kode. Keyboard/kontras/mobile 360px/UAT aktual belum diuji. |
| NFR-08 Observability | Belum tersedia | Belum requestId, logging/alert/health/readiness layanan. |
| NFR-09 Retensi identitas | Belum tersedia | Kebutuhan HAKI/retensi sensitif masih TBD, belum migrasi atau penerapan kebijakan retensi institusi. |
| NFR-10 Ekspor scope/injection | Parsial | CSV mengikuti scope/filter dan melindungi sel formula. Otorisasi server dan XLSX belum tersedia. |
| NFR-11 Rekonsiliasi migrasi | Belum tersedia | Belum batch migrasi, checksum atau laporan mismatch. |
| NFR-12 Deploy/coexistence | Belum tersedia | Aplikasi lokal terpisah; belum deployment pilot, route legacy/cohort atau verifikasi zero downtime. |

React/Vite/TypeScript, Router, React Hook Form dan Zod tersedia. Penyimpanan memakai localStorage/IndexedDB; belum Go Fiber v3, MySQL, REST `/api/v1`, OpenAPI/typed HTTP client, auth cookie/SSO, object storage atau outbox. Business rules lokal membantu simulasi dan harus ditegakkan ulang oleh backend saat integrasi.

Batch lokal memvalidasi seluruh pilihan sebelum satu penulisan metadata; konflik versi dan anti pengulangan diperiksa. Mekanisme tersebut belum transaksi database, serialisasi lintas proses, atau idempotency key server seperti PRD bab 13.1.

## 5. Bukti pemeriksaan dan batas QA

Pada 2 Oktober 2026, `npm test` dijalankan ulang untuk pemeriksaan dokumentasi ini dan selesai dengan exit code 0. Output menyatakan cek kegiatan, sepuluh template insentif, dan Fase 4 lulus. Node memberi peringatan experimental type stripping; peringatan tersebut tidak menggagalkan check.

Pemeriksaan tersedia dalam:

- [domain-check.ts](../scripts/domain-check.ts): scope/wizard/profil, RAB, validasi berkas, revisi, laporan/luaran, konflik versi/kuota, kompatibilitas draft.
- [incentive-check.ts](../scripts/incentive-check.ts): sumber template/kondisi/aktor, bukti, tahun/duplikat, versi, checklist, nominal null dan CSV.
- [phase-four-check.ts](../scripts/phase-four-check.ts): SK/SOP terbit immutable, dua reviewer/otoritas, nominal/koreksi/batch, profil historis, penerimaan kemajuan, provenance eksternal, serta CRUD/soft-delete/restore karya.

Check tersebut memakai penyimpanan memori, simulasi transaksi Blob, dan waktu tetap untuk aturan tanggal. Tidak menguji UI di browser, IndexedDB browser sebenarnya, MySQL, server, keamanan jaringan, atau integrasi antar perangkat.

Lint, typecheck, dan build telah lulus pada akhir Fase 4; build masih memberi peringatan ukuran chunk. Ketiganya tidak dijalankan ulang pada perubahan dokumentasi ini karena kode aplikasi tidak diubah. Status ini bukan bukti bebas bug atau produksi siap.

| Skenario PRD bab 17 | Bukti saat ini | Yang belum dibuktikan |
| --- | --- | --- |
| UAT-01 sampai UAT-05 | Check logika draft/domain/eksternal/dua reviewer/revisi | Click-through browser dan sign-off stakeholder. |
| UAT-06 | Check laporan/capaian dan penerimaan kemajuan | UAT browser menyeluruh sampai final/COMPLETED, termasuk skenario gagal. |
| UAT-07 dan UAT-08 | Check versi SK/quote/null dan guard kebijakan | Kalkulasi server serta kesesuaian SK resmi. |
| UAT-09 | Check template/checklist, CSV, nominal/batch | XLSX dan UAT reviewer/rekap aktual. |
| UAT-10 | Check save RECORDED, edit, soft-delete/restore | UAT form/unduh di browser. |
| UAT-11 | Check sebagian guard lokal | Cross-user endpoint/file server. |
| UAT-12 | Konflik versi/anti batch ulang lokal | Retry/idempotency token server. |
| UAT-13 | Check RAB desimal/overflow dan CSV injection | Integrasi uang server/XLSX. |
| UAT-14 dan UAT-15 | Belum ada | Migrasi historis dan rollback/coexistence dengan legacy. |

Tidak ada status UAT dinyatakan lulus hanya berdasarkan check logika. Definition of Done PRD bab 17.1 masih belum terpenuhi: antara lain integration test MySQL/RBAC, OpenAPI, migrasi SQL, screenshot/UAT, deployment dan rollback belum tersedia. Preferensi pengguna untuk tidak debugging browser/BIMA tetap dihormati.

## 6. Keputusan yang masih dibutuhkan

| Acuan PRD | Yang perlu dipastikan | Dampak |
| --- | --- | --- |
| TBD-01, TBD-05 | SOP per skema/kategori, jumlah reviewer, final approver dan tujuan revisi | Konfigurasi demo sudah ada; otoritas produksi belum dapat disahkan dari kode. |
| TBD-02 | Data/status/nominal eksternal dan kewajiban laporan internal | Finalisasi jalur hibah pemerintah/industri. |
| TBD-03 | Contoh form resmi skema/tahun yang benar-benar digunakan ULBI | Finalisasi field wajib, dokumen, skema Inovasi tambahan dan batas aturan. |
| TBD-04 | SK final: nominal/rumus, posisi, LOA, eligibility SINTA/Prosiding Nasional, kuota | Mesin tarif dan gerbang submit produksi; config terbatas mungkin perlu diperluas. |
| TBD-06 | Form kategori yang belum tersedia dan surat Scopus/WOS institusi | Aktivasi kategori tambahan dan kebijakan bukti. |
| TBD-07 | Minimum bukti, kontributor dan izin koreksi Karya Cipta | Validasi batas demo terhadap SOP resmi. |
| TBD-08 | Auth/SSO, hosting, storage privat, backup dan owner data | Implementasi keamanan dan deployment. |
| TBD-09, TBD-10 | Schema/media/role legacy, cohort cutover, HAKI/publikasi dan akses histori | Migrasi serta coexistence terukur. |

Penerbitan SK/SOP lokal meminta dokumen dan pernyataan Admin, tetapi tidak memverifikasi keaslian atau pengesahan dokumen. Dokumen sumber saat ini masih memuat keputusan TBD; penambahan editor lokal belum menutup keputusan tersebut.

## 7. Penggunaan saat ini dan pekerjaan lanjutan

FE dapat digunakan untuk demonstrasi alur, latihan pengisian lokal, pemeriksaan desain form terhadap sumber, dan persiapan skenario UAT dalam [Panduan Pengguna](PANDUAN_PENGGUNA_APTIMAS_FE.md). Buat record baru lengkap untuk mencoba alur; data status contoh lama tidak selalu mempunyai bukti atau submission yang dibutuhkan.

Pekerjaan lanjutan perlu dibedakan:

1. Fase 5 FE, saat diminta: penyempurnaan responsif/aksesibilitas/performa dan pemeriksaan UI, mengikuti preferensi pengujian pengguna.
2. Penyelesaian gap fungsional FE: autosave, XLSX, profil/skema/template dinamis, serta transisi/peran tambahan yang benar-benar disahkan. Ini perlu direncanakan tersendiri; jangan diasumsikan semuanya masuk polish.
3. Integrasi produk: backend/auth/database/file privat/API, server rules/transactions/idempotency, backup dan observability.
4. Validasi lembaga dan rilis: SK/SOP/form resmi, UAT stakeholder, legacy/migrasi/coexistence, deployment dan rollback.

Permintaan dokumentasi ini hanya membuat panduan dan laporan kesesuaian. Kode aplikasi, aturan bisnis, PRD sumber, dan jadwal Fase 5 tidak diubah.
