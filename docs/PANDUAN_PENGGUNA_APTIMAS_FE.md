# Panduan Pengguna APTIMAS Frontend

Versi panduan: FE Fase 1 sampai 4. Tanggal pemeriksaan: 2 Oktober 2026.

Panduan ini menjelaskan aplikasi yang tersedia saat ini. Semua pengajuan, pemeriksaan, keputusan, dan penerbitan konfigurasi berjalan sebagai simulasi lokal. Aplikasi belum terhubung ke backend, database institusi, BIMA, atau Hiliriset. Fase 5 ditunda sesuai permintaan pengguna.

Gunakan panduan ini untuk demonstrasi dan persiapan UAT. Penilaian terhadap kebutuhan produk lengkap ada di [Laporan Kesesuaian PRD](KESESUAIAN_PRD_APTIMAS_FE.md). PRD v1.1 sendiri masih berstatus draft validasi stakeholder.

## Daftar isi

1. [Membuka aplikasi dan memilih akun](#1-membuka-aplikasi-dan-memilih-akun)
2. [Menu dan hak tiap peran](#2-menu-dan-hak-tiap-peran)
3. [Persiapan Administrator](#3-persiapan-administrator)
4. [Pengajuan kegiatan oleh Dosen](#4-pengajuan-kegiatan-oleh-dosen)
5. [Pemeriksaan dan keputusan kegiatan](#5-pemeriksaan-dan-keputusan-kegiatan)
6. [Laporan dan capaian luaran](#6-laporan-dan-capaian-luaran)
7. [Pencatatan hibah eksternal](#7-pencatatan-hibah-eksternal)
8. [Pengajuan Insentif Kepakaran](#8-pengajuan-insentif-kepakaran)
9. [Review, keputusan, dan batch insentif](#9-review-keputusan-dan-batch-insentif)
10. [Karya Cipta](#10-karya-cipta)
11. [Pencarian, ekspor, dan riwayat](#11-pencarian-ekspor-dan-riwayat)
12. [Penyimpanan, berkas, dan pemulihan](#12-penyimpanan-berkas-dan-pemulihan)
13. [Mengatasi kendala](#13-mengatasi-kendala)
14. [Urutan demonstrasi](#14-urutan-demonstrasi)

## 1. Membuka aplikasi dan memilih akun

### Menjalankan di komputer pengembang

Jika pengembang sudah menjalankan aplikasi, cukup buka alamat yang diberikan. Jika belum, buka terminal pada folder proyek dan jalankan:

```powershell
npm ci
npm run dev
```

Buka alamat yang dicetak Vite, biasanya `http://localhost:5173`. Gunakan alamat dan port yang sama pada demonstrasi berikutnya agar penyimpanan lokal tetap terbaca.

Untuk preview hasil build dengan pemilih peran demo, pengembang dapat menjalankan:

```powershell
Copy-Item .env.example .env.local
npm run build
npm run preview
```

Perintah salin hanya diperlukan jika `.env.local` belum ada. Flag `VITE_DEMO_MODE=true` menampilkan pemilih peran pada build demo. Tanpa flag tersebut, build tetap memakai login simulasi, tetapi pemilih peran tidak ditampilkan. Alamat preview dapat berbeda dari alamat development sehingga datanya juga terpisah.

### Masuk dan mengganti akun

1. Pada halaman login, pilih Peran akun demo.
2. Jika ada beberapa akun pada peran tersebut, pilih Akun demo.
3. Klik Masuk sebagai peran yang dipilih. Login demo tidak memerlukan kata sandi.
4. Untuk berpindah peran saat demonstrasi, buka menu profil di kanan atas lalu Ganti role demo.
5. Untuk memakai reviewer kedua, pilih peran Reviewer lalu pilih akunnya pada bagian Pilih akun demo pada peran ini.
6. Klik Keluar dari demo untuk menutup sesi. Data yang telah disimpan tetap ada pada browser tersebut.

Akun awal berikut merupakan identitas fiktif untuk demonstrasi:

| Peran | Akun awal | Identitas demo |
| --- | --- | --- |
| Dosen | Dr. Ratna Puspitasari, M.T. | DEMO-001 |
| Dosen | Dr. Andi Setiawan, M.T. | DEMO-006 |
| Reviewer | Dr. Budi Santoso, M.Kom. | DEMO-002 |
| Reviewer | Dr. Sari Wijaya, M.T. | DEMO-007 |
| Operator | Dina Rahmawati, S.Ak. | DEMO-003 |
| Ka. LPPM | Dr. Ahmad Pratama, M.T. | DEMO-004 |
| Administrator | Administrator Demo | DEMO-005 |

Admin dapat menambah akun atau menonaktifkannya melalui Konfigurasi. Akun nonaktif tidak tersedia untuk login dan penugasan baru.

Seluruh peran pada satu browser menggunakan data lokal yang sama, dengan tampilan sesuai peran. Ini memungkinkan demonstrasi bergantian tanpa server. Pemilih peran tersebut bukan sistem keamanan untuk penggunaan institusi.

## 2. Menu dan hak tiap peran

| Peran | Menu utama | Tindakan yang tersedia |
| --- | --- | --- |
| Dosen | Penelitian, Pengabdian, Inovasi, Insentif Kepakaran, Karya Cipta, Riwayat Pengajuan | Membuat dan memperbaiki pengajuan sendiri, mengunggah laporan/bukti, mengajukan klaim, mencatat karya. |
| Reviewer | Penugasan Review, Riwayat Review, Review Insentif | Mengisi penilaian kegiatan atau checklist klaim yang ditugaskan. Keputusan insentif hanya jika SK memberi otoritas. |
| Operator | Monitoring Kegiatan, Rekapitulasi, Insentif & Rekap, Arsip Karya | Memulai administrasi, menugaskan reviewer, mencatat hasil eksternal, memulai pelaksanaan, ekspor dan batch klaim. |
| Ka. LPPM | Monitoring Kegiatan, Rekapitulasi, Persetujuan, Insentif & Rekap, Arsip Karya | Memberi keputusan kegiatan dan menerima milestone. Memberi keputusan insentif jika SK menunjuk Ka. LPPM. |
| Administrator | Monitoring Kegiatan, Rekapitulasi, Insentif & Rekap, Arsip Karya, Konfigurasi | Mengelola akun/periode/SK/SOP, membaca audit, memulihkan data demo, memulihkan karya yang dihapus logis. |

Dosen melihat record miliknya. Operator dan Ka. LPPM memantau kegiatan/klaim yang sudah diajukan; Administrator juga dapat melihat draft. Reviewer kegiatan dapat melihat versi tahap yang pernah ditugaskan, sedangkan daftar klaim reviewer mengikuti penugasan pada klaim. Reviewer tidak memiliki menu Karya Cipta.

Dashboard menampilkan ringkasan dan tindak lanjut menurut akun. Notifikasi saat ini merupakan pengingat kegiatan simulasi; status dibaca berlaku selama sesi halaman dan belum mencakup seluruh kejadian klaim atau karya.

## 3. Persiapan Administrator

Konfigurasi awal tidak berisi SK/SOP terbit atau tarif insentif. Untuk mencoba alur sampai keputusan, siapkan kebijakan terlebih dahulu. Untuk demonstrasi gunakan dokumen uji yang diberi keterangan simulasi; nominal dan rubrik mengikuti dokumen uji tersebut. Jangan menganggap konfigurasi demo sebagai pengesahan dokumen institusi.

### 3.1 Menentukan akun dan periode

1. Masuk sebagai Administrator.
2. Buka Konfigurasi (`/configuration`; `/admin/config` mengarah ke halaman yang sama).
3. Buka Pengguna & Peran untuk menambah atau mengedit akun: nama bergelar, identitas, prodi/unit, peran, dan status aktif.
4. Pastikan jumlah akun Reviewer aktif cukup untuk jumlah reviewer yang akan ditentukan. Pengusul tidak boleh menjadi reviewer pengajuannya sendiri.
5. Buka Periode bila perlu menambahkan periode insentif: nama, tahun, tahun luaran paling awal, tanggal buka, dan tanggal tutup.
6. Klik Simpan Periode. Periode yang telah disimpan tidak dapat diubah; buat periode baru untuk jadwal berbeda.

Tab Periode mengatur klaim insentif. Tahun pengajuan kegiatan pada FE ini masih 2026. Menambahkan periode insentif tidak menambah skema atau tahun kegiatan baru.

### 3.2 Mengonfigurasi SK Insentif

Lokasinya: Administrator → Konfigurasi → SK Insentif → Tambah Draft SK.

1. Pilih kategori insentif dan periode klaim. Satu konfigurasi SK mengatur satu kategori/periode.
2. Isi Nama versi konfigurasi, Nomor SK, Referensi SOP pemeriksaan dan keputusan, serta tanggal berlaku.
3. Tentukan Jumlah reviewer dan Otoritas keputusan: Reviewer yang ditugaskan atau Ka. LPPM.
4. Klik Tambah Tarif dan isi nominal dari dokumen sumber. Posisi penulis boleh dikosongkan jika tarif berlaku untuk semua posisi.
5. Bila tarif bergantung pada pilihan formulir, pilih Kondisi pilihan sumber dan Nilai pilihan, misalnya pilihan peringkat jurnal yang memang diatur dokumen.
6. Tandai Butir Wajib Menurut SK/SOP. Butir kondisional hanya wajib saat kondisinya berlaku.
7. Aktifkan izin LOA atau hak koreksi nominal Operator hanya jika dokumen sumber mengaturnya.
8. Unggah dokumen SK/SOP. Centang pernyataan bahwa konfigurasi mengikuti dokumen dan kewenangan simulasi.
9. Klik Simpan Draft Konfigurasi jika belum selesai. Draft belum mengaktifkan kebijakan.
10. Klik Pratinjau & Terbitkan, periksa isinya, lalu Terbitkan Simulasi.

Masukkan uang tanpa pemisah ribuan dan gunakan titik untuk pecahan desimal. Format teknis `1000.25`, misalnya, berarti Rp1.000,25; angka ini hanya contoh format input, bukan tarif resmi. Tarif harus positif dan maksimal dua desimal.

Mesin tarif saat ini mendukung nominal tetap, posisi penulis, dan satu kondisi pilihan per baris. Tepat satu baris harus cocok dengan klaim. Baris umum yang tumpang tindih dengan baris khusus dapat membuat quote ambigu. Aplikasi akan menahan quote/penugasan/keputusan terkait; aplikasi tidak memilih tarif secara acak. Rumus pembagian khusus, kuota, atau syarat kelayakan yang lebih kompleks belum tersedia.

### 3.3 Mengonfigurasi SOP dan profil kegiatan

Lokasinya: Administrator → Konfigurasi → SOP & Profil Skema → Tambah Draft SOP.

1. Pilih skema kegiatan yang akan digunakan.
2. Isi nama versi, nomor SOP/keputusan, referensi SOP, dan masa berlaku.
3. Tentukan jumlah reviewer. Keputusan kegiatan pada FE saat ini memakai otoritas Ka. LPPM.
4. Tambahkan butir rubrik, bobot, dan skor maksimal dari dokumen sumber. Total bobot harus 100%.
5. Pilih Alur setelah revisi proposal diajukan: kembali ke administrasi atau kembali ke reviewer proposal sebelumnya.
6. Atur batas kata ringkasan/substansi, pagu, komponen RAB, dan jenis luaran. Isi daftar pilihan satu pilihan per baris.
7. Atur tanggal buka/tutup pengajuan, revisi, laporan, dan luaran.
8. Aktifkan pemeriksaan dan penerimaan laporan kemajuan, akhir, dan luaran bila SOP memang memerlukannya.
9. Unggah dokumen dan centang pernyataan konfigurasi.
10. Simpan draft atau terbitkan melalui pratinjau.

Default yang tampil adalah baseline demo, bukan ketentuan resmi ULBI. Beberapa aturan seperti jumlah kata kunci, durasi maksimal, struktur substansi, dan jenis dokumen masih mengikuti profil demo dalam kode dan belum dapat diedit melalui konfigurasi.

### 3.4 Mengubah aturan setelah terbit

1. Pada daftar SK/SOP, buka Lihat Versi untuk membaca versi terbit.
2. Klik Buat Versi Baru jika aturan perlu berubah.
3. Perbarui aturan, dokumen, dan pernyataan sumber lalu terbitkan versi baru.

Versi terbit dikunci. Profil kegiatan dibekukan saat draft pertama disimpan; SK klaim diikat pada pengajuan atau penugasan yang mendapat kebijakan. Record yang sudah terikat mempertahankan versi tersebut. Konfigurasikan SOP sebelum membuat draft baru bila ingin draft langsung memakai profil terbit terbaru.

Data Master saat ini menampilkan skema dan template sumber serta akses ke konfigurasi profilnya. Halaman tersebut belum menyediakan editor bebas untuk menambah skema, kategori, atau struktur field baru. Audit menampilkan riwayat perubahan konfigurasi; riwayat pengajuan berada pada detail masing-masing record.

## 4. Pengajuan kegiatan oleh Dosen

### 4.1 Memilih domain dan skema

1. Masuk sebagai Dosen.
2. Buka Penelitian → Buat draft Penelitian, atau buka Pengabdian/Inovasi lalu Tambah Pengajuan.
3. Pilih skema pada langkah Identitas.

| Domain | Skema yang tersedia saat ini |
| --- | --- |
| Penelitian | Hibah Internal, Hibah Pemerintah, Kerja Sama Industri |
| Pengabdian kepada Masyarakat | Hibah Internal, Hibah Pemerintah, Hibah Industri |
| Inovasi | Hibah Internal, Dorongan Teknologi |

Skema Inovasi lain yang disebut dalam PRD belum tersedia. PKM di aplikasi ini berarti Pengabdian kepada Masyarakat.

### 4.2 Mengisi tujuh langkah

| Langkah | Yang diisi |
| --- | --- |
| Identitas | Skema, judul, ringkasan, kata kunci, rumpun ilmu, durasi. Identitas ketua/prodi mengikuti akun. Hibah eksternal juga memiliki referensi portal. |
| Tim Pengusul | Anggota melalui direktori demo atau isian manual. PKM memerlukan mitra pada profil demo; Inovasi dapat mencatat mitra hilirisasi. |
| Substansi | Penelitian: latar belakang, masalah, tujuan, kebaruan, metode dan bagian terkait. PKM: masalah mitra, solusi, pelaksanaan, evaluasi dan keberlanjutan. Dorongan Teknologi: produk, TKT, kelayakan dan hilirisasi. |
| Pendanaan & Jadwal | Komponen/uraian/satuan/volume/harga/tahun RAB dan jadwal bulan per tahun relatif. Subtotal serta dana diajukan mengikuti RAB. |
| Dokumen | Proposal dan dokumen pendukung sesuai checklist profil. Pilih jenis dokumen sebelum unggah. |
| Rencana Luaran | Jenis, judul target, jumlah, target status, dan tahun luaran. Bagian ini mencatat rencana. |
| Pratinjau | Periksa seluruh isian, dokumen, dan pernyataan sebelum pengajuan. |

Anggota tidak boleh menduplikasi ketua atau anggota lain. Kontak mitra yang dibagikan memerlukan izin berbagi. Pada RAB, volume mendukung sampai tiga desimal dan harga sampai dua desimal; gunakan titik desimal tanpa pemisah ribuan.

Gunakan Selanjutnya/Sebelumnya atau stepper untuk berpindah bagian. Isian tetap ada selama formulir terbuka. Klik Simpan Draft secara berkala: aplikasi belum memiliki autosave.

### 4.3 Menyimpan dan mengajukan

1. Klik Simpan Draft untuk menyimpan pekerjaan yang belum lengkap secara lokal.
2. Setelah tersimpan, skema tidak dapat diganti pada record itu. Buat draft baru jika perlu skema lain.
3. Lengkapi semua bagian yang diminta dan unggah berkas.
4. Pada Pratinjau, centang pernyataan bahwa isian telah diperiksa.
5. Klik Ajukan Proposal, lalu Ya, ajukan simulasi pada konfirmasi.
6. Aplikasi membuka detail pengajuan. Salinan versi isian dan berkas tersedia pada Proposal & Revisi; aktivitas tercatat pada Riwayat Aktivitas.

Pengajuan hanya tersedia pada window profil. Di luar window, draft tetap dapat disimpan. Data tidak dikirim ke portal nasional.

### 4.4 Melakukan perbaikan

1. Buka pengajuan berstatus Perbaikan administrasi atau Perlu revisi.
2. Baca catatan, kemudian klik Perbaiki Proposal.
3. Perbarui isian atau lampiran, simpan draft, periksa pratinjau, lalu Ajukan Revisi.
4. Salinan pengajuan bertambah versi; lampiran versi lama tetap dipertahankan.

Perbaikan administrasi kembali ke tahap administrasi. Revisi hasil review mengikuti pilihan alur pada SOP terikat. Jika kembali ke administrasi, Operator perlu menugaskan reviewer lagi.

## 5. Pemeriksaan dan keputusan kegiatan

### Operator

1. Buka Monitoring Kegiatan dan detail pengajuan internal berstatus Diajukan.
2. Buka Pemeriksaan lalu Mulai Verifikasi Administrasi. Konfirmasikan Simpan Simulasi.
3. Jika ada kekurangan, isi Catatan perbaikan administrasi lalu Minta Perbaikan Administrasi.
4. Jika layak diperiksa, pilih reviewer aktif sesuai jumlah pada SOP lalu Tugaskan Reviewer.
5. Penugasan memerlukan SOP/rubrik terbit dan salinan pengajuan yang tersedia.

### Reviewer

1. Buka Penugasan Review lalu detail kegiatan yang ditugaskan.
2. Buka Pemeriksaan dan baca Dokumen Versi yang Diperiksa.
3. Isi skor setiap butir rubrik, komentar, dan rekomendasi.
4. Klik Simpan Draft Penilaian jika pemeriksaan belum selesai.
5. Klik Selesaikan Penilaian dan konfirmasikan bila sudah lengkap. Hasil final dikunci pada versi tersebut.
6. Bila SOP menggunakan beberapa reviewer, semua reviewer harus menyelesaikan penilaian. Gunakan akun reviewer yang berbeda untuk mencoba alur ini.

Skor berbobot dan rekomendasi tidak menghasilkan keputusan pendanaan otomatis.

### Ka. LPPM dan Operator setelah review

1. Ka. LPPM membuka Persetujuan lalu detail → Pemeriksaan setelah seluruh reviewer selesai.
2. Pilih Setujui, Tolak, atau Minta revisi dan isi Alasan keputusan.
3. Bila menyetujui proposal, isi Dana disetujui sesuai pagu SOP. Dana tersebut terpisah dari dana diajukan.
4. Simpan dan konfirmasikan keputusan.
5. Setelah Disetujui, Operator membuka Pemeriksaan, mengisi catatan, lalu Mulai Pelaksanaan.

Persetujuan dan mulai pelaksanaan tidak mencatat pencairan uang.

### Arti status kegiatan

| Status tampilan | Arti |
| --- | --- |
| Draft | Isian belum diajukan. |
| Diajukan | Versi proposal telah dicatat. |
| Verifikasi administrasi / Perbaikan administrasi | Operator memeriksa atau meminta kelengkapan. |
| Dalam review / Review selesai | Reviewer sedang memeriksa / seluruh pemeriksaan proposal selesai. |
| Perlu revisi | Otoritas meminta perbaikan proposal. |
| Disetujui / Ditolak | Keputusan proposal, bukan status pencairan. |
| Sedang berjalan | Pelaksanaan dibuka. |
| Laporan kemajuan diajukan / Laporan akhir diajukan | Laporan menunggu pemeriksaan dan penerimaan. |
| Menunggu luaran / Selesai | Laporan akhir diterima / capaian luaran telah diterima. |
| Pencatatan eksternal | Status hibah luar dilaporkan manual melalui bukti. |
| Ditarik | Tersedia pada data contoh; tindakan menarik pengajuan belum tersedia di UI. |

## 6. Laporan dan capaian luaran

### Mengajukan laporan

1. Sebagai pemilik kegiatan yang Sedang berjalan, buka detail → Laporan.
2. Pilih pengajuan laporan kemajuan atau laporan akhir yang tersedia.
3. Isi ringkasan pelaksanaan dan persentase kemajuan. Laporan akhir memerlukan 100%.
4. Unggah laporan PDF lalu Ajukan Laporan.
5. Operator menugaskan reviewer tahap laporan melalui Pemeriksaan. Penugasan proposal tidak otomatis menjadi penugasan laporan.
6. Reviewer menyelesaikan penilaian versi laporan; Ka. LPPM mengisi alasan dan memilih Terima Milestone setelah seluruh pemeriksaan selesai.

Penerimaan kemajuan mengembalikan kegiatan ke Sedang berjalan. Penerimaan akhir mengubahnya menjadi Menunggu luaran. SOP harus mengaktifkan milestone dan window laporan harus terbuka.

### Mencatat hasil

1. Buka detail → Luaran. Periksa Luaran Wajib / Rencana Luaran.
2. Klik Tambah Capaian ketika status/window mengizinkan.
3. Pilih target rencana yang dicapai, isi judul hasil, status capaian, tanggal, keterangan, dan bukti.
4. Klik Simpan Capaian. Penyimpanan bukti belum menyelesaikan kegiatan.
5. Pada Menunggu luaran, Operator menugaskan reviewer untuk versi capaian terkini; reviewer memeriksa bukti.
6. Ka. LPPM menerima milestone setelah semua pemeriksaan lengkap dan setiap target memiliki hasil yang memenuhi status capaian serta bukti.

Riwayat laporan dan versi capaian mempertahankan berkas sebelumnya. Mengubah capaian saat menunggu penerimaan mengharuskan pemeriksaan versi baru.

## 7. Pencatatan hibah eksternal

1. Dosen memilih skema pemerintah/industri dan mengisi referensi eksternal: portal, kode, tautan HTTPS, status yang dilaporkan, serta tanggal bukti jika tersedia.
2. Dosen melengkapi formulir demo dan mengajukan proposal.
3. Operator membuka Pemeriksaan pada pengajuan berstatus Diajukan/Pencatatan eksternal.
4. Isi Status resmi yang dilaporkan, tanggal dokumen, tautan sumber bila tersedia, dan unggah bukti keputusan.
5. Pilih Catat Status Eksternal lalu konfirmasikan.
6. Jika bukti menyatakan hibah diterima, centang pembukaan pelaksanaan menurut SOP milestone. SOP terbit harus mengaktifkan milestone sebelum tindakan ini dapat dilakukan.

Aplikasi mencatat sumber `EXTERNAL_MANUAL`, aktor, waktu, dan bukti. Status ini merupakan laporan Operator. Aplikasi tidak mengambil status real-time atau menulis kembali ke BIMA/Hiliriset. Pencatatan eksternal saat ini belum memiliki input tersendiri untuk nominal pendanaan yang disetujui di portal luar.

## 8. Pengajuan Insentif Kepakaran

### Kategori yang tersedia

| Formulir | Isian pembeda |
| --- | --- |
| Buku | Jenis buku, urutan penulis, halaman, ISBN, bukti lengkap Hardfile/Softfile. |
| Jurnal terakreditasi SINTA | Peringkat SINTA 1 sampai 6, terbitan, posisi penulis, Publish/LOA dan bukti terkait. |
| Jurnal internasional terindeks Scopus | Kuartil Q1 sampai Q4, bahasa, impact factor, bukti peringkat/korespondensi dan surat pernyataan. |
| Jurnal internasional terindeks Copernicus | Bukti indeks Copernicus dan terbitan, tanpa mewajibkan field kuartil Scopus. |
| Prosiding internasional Scopus/WOS | Komite, peserta lintas negara, indeks, terbitan dan surat pernyataan. |
| Prosiding internasional nonterindeks | Terbitan dan keterangan konferensi tanpa field indeks Scopus/WOS. |
| Jurnal internasional nonterindeks | Terbitan, penulis, bahasa dan bukti publikasi. |
| Prosiding nasional ber-ISSN/ISBN | ISSN/ISBN, penulis, bahasa dan keterangan peserta/komite nasional. |
| Karya pemikiran di media/penerbit populer | Akses Online/Offline, media/portal, status karya dan kurasi. |
| Karya pemikiran di portal/jurnal internal | Tautan karya/LOA, status, afiliasi dan kurasi. |

HAKI, Monev internal, review proposal internal, dan jurnal nasional nonterakreditasi ditandai menunggu template. Kategori tersebut belum dapat dipakai untuk membuat klaim. SINTA 5/6 atau suatu kategori yang tersedia di form tidak otomatis berhak mendapat insentif.

### Langkah Dosen

1. Buka Insentif Kepakaran → Ajukan Klaim Baru.
2. Pilih formulir sesuai karya. Satu judul merupakan satu klaim; buat klaim terpisah untuk judul lain.
3. Periksa identitas yang otomatis mengikuti akun dan pilih periode klaim.
4. Isi data karya, urutan penulis, posisi pengusul, serta tahun luaran dari field terbitan atau metadata tahun tambahan.
5. Posisi pengusul harus menunjuk nama akun pada daftar penulis. Pada Buku, posisi pengusul ditandai sebagai metadata tarif tambahan karena sheet sumber tidak memiliki kolom tersebut.
6. Isi bukti yang relevan: URL HTTPS, tanggal akses, catatan pemeriksaan sumber, file snapshot, atau unggahan lokal sesuai kontrol.
7. Untuk Buku Hardfile, catat informasi serah-terima fisik. Ini belum merupakan verifikasi penerimaan oleh Operator. Untuk Softfile, isi bukti digital sesuai aturan yang dipilih.
8. Klik Simpan Draft secara berkala, lalu Pratinjau.
9. Periksa quote dan kebijakan. Centang pernyataan, pilih Ajukan Simulasi, lalu konfirmasikan.
10. Pantau status pada detail. Jika diminta revisi, pilih Perbaiki Klaim, simpan perubahan, dan ajukan kembali sebagai versi baru.

Kategori, periode, dan versi template dibekukan setelah draft disimpan. Buat klaim baru untuk menggantinya. Tahun luaran harus berada dalam rentang periode; pada periode contoh 2026, tahun minimum dan maksimum sama-sama 2026.

Field tambahan tampil mengikuti jawaban: afiliasi jika Ya, bukti APC saat LOA pada template yang memilikinya, serta media cetak/portal sesuai Offline/Online. Jawaban yang tersembunyi tetap disimpan. Pilihan portal Lainnya memerlukan nama manual.

Tanpa SK sesuai kategori/periode, quote bernilai belum tersedia dan tidak ditampilkan sebagai tarif nol. FE dapat mencatat pengajuan simulasi sebelum kebijakan lengkap; pengajuan LOA tanpa izin kebijakan masuk Menunggu kebijakan. Penugasan, keputusan final, dan batch memerlukan kebijakan serta nominal yang valid. Kondisi ini bukan persetujuan kelayakan produksi.

Petunjuk 125 halaman buku dan impact factor 0,10 mengikuti dokumen sumber. FE belum menjadikannya dasar penolakan otomatis atau nominal insentif. Biaya APC juga bukan nilai insentif.

## 9. Review, keputusan, dan batch insentif

### Operator dan Reviewer

1. Operator membuka Insentif & Rekap → detail klaim → Administrasi & Keputusan.
2. Klik Mulai Verifikasi Administrasi.
3. Pilih reviewer sesuai jumlah pada SK/SOP. Klik Tugaskan Reviewer & Bekukan Quote. Tindakan memerlukan SK terbit dengan tepat satu tarif sesuai klaim.
4. Reviewer membuka Review Insentif, memilih klaim, lalu Pemeriksaan.
5. Baca jawaban/bukti dan isi Kesesuaian Ya/Tidak untuk semua butir yang berlaku. Checklist ini terpisah dari jawaban Ya/Tidak milik Dosen.
6. Isi Komentar Reviewer dan rekomendasi bila diperlukan. Klik Simpan Draft Checklist selama pemeriksaan belum selesai.
7. Klik Selesaikan Pemeriksaan lalu Simpan Pemeriksaan. Checklist dikunci untuk versi pengajuan itu.
8. Jika ada beberapa reviewer, masing-masing menyelesaikan pemeriksaan menggunakan akun sendiri.

### Keputusan dan revisi

1. Akun yang berwenang menurut SK, yaitu reviewer ditugaskan atau Ka. LPPM, membuka Administrasi & Keputusan.
2. Setelah semua pemeriksaan versi aktif selesai, pilih Setujui, Tolak, atau Minta revisi.
3. Isi alasan lalu Simpan Keputusan dan konfirmasikan.
4. Jika disetujui, nominal mengikuti quote SK terikat. Reviewer tidak mengubah master tarif.
5. Jika diminta revisi, Dosen memperbaiki dan mengajukan versi baru. Klaim kembali ke administrasi; Operator menugaskan reviewer kembali untuk pemeriksaan versi baru.

Pemeriksaan selesai belum berarti klaim disetujui. LOA hanya dapat dilanjutkan sesuai izin kebijakan. Versi SK baru tidak mengganti tarif klaim yang sudah terikat.

### Koreksi nominal dan batch

1. Jika SOP memberi izin, Operator dapat membuka klaim Disetujui yang belum dibatch, memasukkan nominal baru dan alasan, lalu Koreksi Nominal.
2. Audit menyimpan nilai sebelum/sesudah, alasan, aktor, dan waktu.
3. Buka daftar Insentif & Rekap atau Buka Rekap. Terapkan filter yang diperlukan.
4. Centang klaim Disetujui yang memiliki nominal dan belum masuk batch.
5. Klik Bentuk Batch, periksa jumlah/total, lalu Simpan Batch.
6. Baca ID batch dan snapshot nominal pada detail klaim. Klaim yang sudah dibatch tidak dapat dibatch ulang atau dikoreksi melalui tindakan tersebut.
7. Klik Ekspor CSV untuk mengunduh hasil sesuai filter.

Batch merupakan pencatatan administratif. Aplikasi tidak memiliki pencairan, transfer uang, atau tindakan menandai klaim sebagai sudah dibayar.

## 10. Karya Cipta

1. Sebagai Dosen, buka Karya Cipta lalu Tambah Karya.
2. Pilih kategori: Produk Barang, Produk Jasa, Produk Teknologi, Buku Chapter, Buku Populer, atau Karya Seni.
3. Isi judul, deskripsi, dan tanggal karya sudah tersedia. Tanggal tidak boleh di masa depan.
4. Isi penerbit/produsen, ISBN/registrasi, tautan HTTPS, serta kontributor bila berlaku.
5. Bila perlu, pilih kegiatan milik sendiri yang terkait. Relasi saat ini menuju kegiatan; belum memilih satu item target luaran tertentu.
6. Unggah minimal satu bukti lalu Simpan Karya.
7. Record langsung Tercatat (`RECORDED`). Klik Buka Detail Karya untuk melihat bukti dan riwayat.

Tidak ada pengajuan proposal, reviewer, atau tombol approval pada Karya Cipta. Menyimpan karya tidak membuat klaim insentif otomatis.

Pemilik dapat memilih Edit Karya atau Hapus Catatan dengan konfirmasi. Penghapusan bersifat logis sehingga bukti dan versi tetap ada. Administrator memulihkannya melalui Arsip Karya → Tampilkan catatan dihapus → detail → Pulihkan Karya. Operator/Ka. LPPM dapat membaca dan mengekspor arsip, tetapi belum memiliki tindakan koreksi metadata karya.

## 11. Pencarian, ekspor, dan riwayat

Pada daftar kegiatan, masukkan judul/kode/ketua, buka Filter bila perlu, pilih skema/tahun/status/prodi yang tersedia, lalu klik Cari. Klik judul atau Detail untuk membuka record. Header kolom yang dapat diurutkan menyediakan sorting; pagination hanya membatasi baris yang sedang ditampilkan.

Daftar insentif memakai filter pencarian, kategori, tahun luaran, status, dan prodi sesuai peran. Arsip karya menyediakan pencarian judul/kode/pemilik, kategori, tahun, prodi, serta pilihan urutan. Gunakan tombol reset untuk menghapus filter.

Ekspor tersedia untuk Operator, Ka. LPPM, dan Administrator sesuai cakupan modul. Ekspor mencakup seluruh hasil filter, bukan hanya halaman tabel yang sedang dibuka. Formatnya CSV yang dapat diimpor ke spreadsheet; belum berupa workbook XLSX, dan file bukti tidak ikut dimasukkan ke CSV.

Untuk insentif, CSV memuat metadata pengusul/kategori/karya, status, quote, nominal disetujui, referensi versi SK, batch, ringkasan pemeriksaan, komentar, serta jawaban kategori. Rekap menampilkan total nominal yang diketahui dan jumlah klaim yang belum memiliki nominal secara terpisah.

| Record | Lokasi bukti dan riwayat |
| --- | --- |
| Kegiatan | Proposal & Revisi, Pemeriksaan, Laporan, Luaran, Riwayat Aktivitas |
| Klaim | Isian & Bukti, Versi Pengajuan, Pemeriksaan, Administrasi & Keputusan, Riwayat Aktivitas |
| Karya | Bukti Karya dan Riwayat & Versi pada detail |
| Konfigurasi | Lihat Versi dan tab Audit |

## 12. Penyimpanan, berkas, dan pemulihan

Metadata tersimpan di localStorage browser, sesi di sessionStorage, dan file di IndexedDB. Data tidak tersedia lintas perangkat/browser/alamat aplikasi. Gunakan browser dan alamat yang sama untuk melanjutkan draft. CSV merupakan ekspor laporan, bukan backup lengkap yang dapat diimpor kembali.

| Berkas | Batas demo |
| --- | --- |
| Proposal dan laporan | PDF |
| Bukti/lampiran lain | PDF, DOCX, XLSX, JPG/JPEG, PNG sesuai kontrol |
| Ukuran | Lebih dari 0, maksimal 10 MB per berkas |
| Karya, kebijakan, keputusan eksternal, laporan/capaian | Maksimal 10 berkas per kelompok; formulir dapat membatasi jumlahnya |

Tunggu unggahan lokal selesai, lalu simpan draft/record untuk mencatat hubungan berkas ke formulir. Menghapus lampiran dari isian tidak membersihkan blob lama yang masih mungkin diperlukan riwayat.

Untuk mereset data demo, Administrator membuka Konfigurasi → Pemulihan, memilih Kegiatan, Klaim Insentif, atau Konfigurasi SK/SOP & Akun, lalu membaca dan mengonfirmasi dialog Hapus & Pulihkan. Perubahan lokal pada modul yang dipilih akan hilang; modul lain dan berkas tetap ada.

Pemulihan konfigurasi menghapus SK/SOP terbit. Record historis yang terikat pada ID kebijakan yang dihapus akan tertahan untuk keputusan/batch. Menerbitkan SK baru dengan nomor dokumen sama tidak mengembalikan ID versi lama. Gunakan pemulihan ini untuk demonstrasi yang memang ingin dimulai ulang; tidak ada pemulihan backup historis otomatis pada FE.

Karya dipulihkan per record setelah penghapusan logis. Untuk menghapus seluruh data dan blob lokal, pengguna dapat membersihkan data situs melalui pengaturan browser, tetapi aplikasi tidak dapat mengembalikannya setelah itu.

## 13. Mengatasi kendala

| Gejala | Yang diperiksa/dilakukan |
| --- | --- |
| Tombol pengajuan/laporan tidak aktif | Periksa kepemilikan, status, tanggal window dan unggahan yang belum selesai. Draft dapat disimpan walau window pengajuan ditutup. |
| Menunggu Konfigurasi SK/SOP | Administrator perlu menerbitkan kebijakan untuk kategori/periode atau skema yang sesuai. Menyimpan draft konfigurasi saja belum cukup. |
| Quote belum tersedia atau ambigu | Periksa izin LOA, isian wajib, posisi penulis, pilihan sumber, dan baris tarif; tepat satu baris harus cocok. |
| Reviewer tidak melihat pengajuan | Operator perlu menugaskan akun aktif pada versi tahap yang benar. Pastikan akun reviewer yang dipilih sesuai. |
| Keputusan belum dapat disimpan | Periksa seluruh review versi aktif, kebijakan terikat, otoritas akun, serta alasan/nominal yang diminta. |
| Nominal kosong | Belum ada quote/keputusan yang valid. Nilai kosong tidak berarti Rp0. |
| Judul duplikat ditolak | Periksa klaim sebelumnya milik pengusul pada tahun sama, atau karya dengan judul/tanggal sama. UI belum menyediakan override duplikat. |
| Berkas tidak ditemukan | Kembali ke browser/alamat asal; unggah ulang pada record yang masih boleh diubah. Data contoh lama belum tentu memiliki berkas nyata. |
| Perubahan di tab lain | Salin isian yang belum disimpan sebelum memuat ulang; buka versi terbaru dan ulangi tindakan. Hindari mengedit record sama di beberapa tab. |
| Penyimpanan penuh/tidak tersedia | Pertahankan formulir dan salin isian penting. Jangan langsung membersihkan data situs karena draft/berkas dapat hilang. |
| Diminta menyimpan sebelum pindah bagian | Simpan draft/checklist/konfigurasi, atau batalkan perubahan melalui dialog yang tersedia. |
| Data tidak ada pada browser/port lain | Kembali ke alamat dan browser asal. Belum ada sinkronisasi lintas perangkat. |
| Record contoh berstatus selesai tetapi tak bisa diproses | Contoh awal menunjukkan status; buat pengajuan baru lengkap beserta bukti untuk mencoba seluruh alur. |

## 14. Urutan demonstrasi

Berikut skenario manual yang dapat dijalankan pengguna. Langkah ini belum merupakan bukti UAT browser lulus.

### A. Kegiatan internal

1. Administrator menerbitkan SOP skema internal dengan rubrik/jadwal dan jumlah reviewer sesuai dokumen uji.
2. Dosen membuat pengajuan baru, menyimpan, lalu mengajukan tujuh langkah lengkap.
3. Operator memulai administrasi dan menugaskan reviewer.
4. Tiap reviewer menyelesaikan penilaian versi proposal.
5. Ka. LPPM memberi keputusan dan nominal, kemudian Operator memulai pelaksanaan.
6. Dosen mengajukan laporan kemajuan/akhir serta mencatat capaian; Operator menugaskan reviewer tiap tahap, dan Ka. LPPM menerima milestone sesuai SOP.
7. Periksa versi lama, bukti, dan riwayat.

### B. Insentif

1. Administrator menerbitkan SK untuk satu kategori/periode dengan tarif dari dokumen uji.
2. Dosen membuat satu klaim lengkap dengan urutan penulis dan bukti.
3. Operator memulai administrasi dan menugaskan reviewer.
4. Tiap reviewer menyelesaikan checklist; otoritas SK memberi keputusan beralasan.
5. Operator mencoba koreksi nominal jika diizinkan, membentuk batch, dan mengekspor CSV hasil filter.
6. Periksa bahwa batch tidak menyatakan pembayaran dan versi SK lama tetap terikat.

### C. Karya Cipta

1. Dosen mencatat karya yang sudah tersedia beserta satu bukti.
2. Periksa bahwa karya langsung Tercatat dan tidak mempunyai approval.
3. Edit metadata, periksa snapshot sebelumnya, lalu hapus logis dengan konfirmasi.
4. Administrator menampilkan catatan dihapus dan memulihkannya.

Panduan disusun dari source code dan kebutuhan lokal, tanpa debugging BIMA atau pengujian browser. Untuk daftar kebutuhan yang masih parsial/belum ada, baca [Laporan Kesesuaian PRD](KESESUAIAN_PRD_APTIMAS_FE.md).
