# APTIMAS, arah visual Fase 1–4

Sumber arah: brief pengguna dan lima screenshot BIMA. PRD menjadi acuan proses bisnis. Screenshot menjadi acuan komposisi, bukan aturan resmi atau aset identitas.

- Identitas: portal akademik ULBI untuk dosen, reviewer, operator, LPPM, dan administrator. Nama aplikasi ditampilkan sebagai teks; tidak memakai logo BIMA atau logo institusi yang belum diberikan.
- Karakter: profesional, tenang, operasional. Fokus layar pada pengajuan yang perlu diperiksa dan tindakan berikutnya.
- Layout: header putih, navigasi navy horizontal, container maksimum 1360px, konten putih pada latar abu-abu terang. Menu berlabel pada layar yang tidak cukup lebar. Tidak ada sidebar navigasi desktop.
- Palet: navy `#203A70` mengikat navigasi dan identitas; biru `#3156A3` untuk tombol dan tautan; latar `#F7F9FC`, teks `#243247`, teks sekunder `#596A80`. Warna semantik hanya pada status dan catatan pemeriksaan.
- Tipografi: Plus Jakarta Sans, dibundel lokal, sesuai pilihan font dalam brief. Judul tegas dan tabel tetap nyaman dibaca; angka menggunakan tabular numerals.
- ENERGY 2 / RHYTHM 2 / MOTION 1: portal tenang dengan hierarki judul, ringkasan kecil, tabel utama, daftar tindak lanjut, dan informasi periode. Hanya perubahan hover/focus, tanpa animasi dekoratif.
- Motif: penamaan akademik, kode pengajuan, pembatas baris, dan informasi periode konsisten di daftar serta detail. Titik pada wordmark hanya perlakuan tipografi, bukan simbol resmi.
- Ikon Lucide: dipilih karena diminta pengguna; Bell untuk notifikasi, Search untuk pencarian, FileText untuk pengajuan, Eye untuk detail. Ikon tidak menggantikan label yang perlu dibaca.
- Badge menyatakan status kegiatan. Ringkasan dihitung dari mock repository dan selalu diberi konteks data simulasi.
- Shadow hanya pada menu, dialog, dan toast agar permukaan sementara terpisah dari konten. Permukaan halaman tetap datar dengan border tipis.
- Tabel digeser di dalam container pada layar kecil; halaman utama tetap reflow. Input dan tombol memiliki area sentuh minimal 44px serta focus ring yang terlihat.

Pemeriksaan visual melalui browser tidak dijalankan sesuai permintaan pengguna. Ketepatan render, mobile, dan interaksi keyboard aktual masih perlu ditinjau pengguna melalui preview.

Fase 2 mempertahankan baseline yang disetujui pengguna: stepper di atas formulir, isi berkelompok dengan divider, blok RAB berulang dan ringkasan komponen, serta bagian rencana/capaian yang terpisah. Jadwal memakai matrix bulan sederhana; berkas dan keputusan tetap diberi konteks simulasi lokal.

Fase 3 memakai daftar kategori berbaris, formulir sesuai label workbook, daftar bukti, dan tabel Kesesuaian yang memisahkan jawaban pengusul dari penilaian reviewer. Status kebijakan dan nominal ditampilkan sebagai teks; tidak ada grafik atau tarif buatan.

Fase 4 mempertahankan komposisi portal yang disetujui: konfigurasi memakai tab horizontal dan formulir berkelompok, daftar karya memakai divider/tabel, rubrik memakai input bernama, keputusan ditempatkan terpisah dari bukti pengusul. Checklist dan radio/select tetap berlabel; penerbitan/keputusan/pemulihan memakai dialog konfirmasi. Tidak ada aset, grafik, atau warna identitas baru.

Pemeriksaan sumber Fase 4 (batas QA mengikuti permintaan pengguna tanpa debugging browser):
- Hard Gate, cakupan sumber: PASS. Route Karya/konfigurasi/review terpasang, aksi terhubung handler repository, state kosong/loading/error tersedia, tidak ada tarif/rubrik awal buatan. Pemeriksaan otomatis mencakup transisi dan persistensi. Verifikasi render/click-through/mobile aktual dikecualikan atas instruksi pengguna dan tidak diklaim lulus.
- Purpose-Gate: PASS. Tab mengelompokkan jenis konfigurasi, divider memisahkan bukti/penilaian/keputusan, warna/status memakai token baseline; tidak ada efek dekoratif baru.
- Liveliness, cakupan sumber: PASS. ENERGY 2 / RHYTHM 2 / MOTION 1 dipertahankan; heading/tindakan utama, kode akademik, dan informasi periode menjadi motif serta hierarki layar.
- Craftsmanship, cakupan sumber: PASS. TypeScript, lint, cek aturan runnable dan build memvalidasi implementasi; native label/input, area label checkbox 44px, grid reflow 720/1100px, dan dialog Radix dipakai. Klaim kepatuhan produksi, verifikasi SK, atau pembayaran tidak ditampilkan. Keyboard, zoom, dan visual aktual masih perlu ditinjau pada preview.
