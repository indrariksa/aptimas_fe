# APTIMAS Frontend

Frontend portal akademik ULBI berdasarkan PRD v1.1 dan screenshot BIMA. Fase 1–3 memakai data simulasi lokal, tanpa backend, REST API, atau pengiriman data ke portal nasional.

## Menjalankan

Gunakan Node.js 22.14 atau lebih baru yang memenuhi persyaratan Vite pada lockfile.

```powershell
npm ci
npm run dev
```

Buka alamat lokal yang dicetak Vite. Pilih akun demo di halaman login. Pada development, menu profil menyediakan role Dosen, Reviewer, Operator, Ka. LPPM, dan Administrator.

Untuk menyertakan pilihan role pada build demo, salin `.env.example` ke `.env.local` sebelum build. Tanpa flag `VITE_DEMO_MODE=true`, role switcher tidak ditampilkan pada build. Semua versi ini tetap memakai login simulasi dan belum memiliki autentikasi produksi.

```powershell
Copy-Item .env.example .env.local
npm run build
npm run preview
```

## Yang tersedia pada Fase 1

- Header putih, navigasi navy horizontal, menu mobile, profil, bantuan, dan notifikasi simulasi dengan status sudah dibaca selama sesi halaman.
- Dashboard berdasarkan role, ringkasan dari record aktual mock, tindak lanjut, informasi kegiatan, dan periode contoh.
- Daftar Penelitian serta contoh daftar PKM/Inovasi. Pencarian judul/kode/ketua, filter skema/tahun/status/prodi, sorting, pagination, detail, dan ekspor CSV sesuai seluruh filter untuk role monitoring.
- Identitas awal draft Penelitian: validasi, buat/edit draft milik sendiri, simpan localStorage, peringatan perubahan belum disimpan, dan pesan kegagalan penyimpanan.
- Detail umum, dana diajukan vs disetujui, catatan pemeriksaan, lima milestone bisnis, rencana vs capaian luaran, dan riwayat lokal.
- Halaman informasi konfigurasi untuk Administrator serta pemulihan contoh awal dengan konfirmasi.
- Loading, empty, error, toast, focus ring, field labels, dialog Radix dengan Escape/focus trap, dan layout responsif.

## Yang tersedia pada Fase 2

- ActivityWizard tujuh langkah untuk Penelitian, PKM, dan Inovasi, stepper atas, indikator kelengkapan, pratinjau, serta draft yang mempertahankan isian antar langkah.
- Identitas dan referensi eksternal manual; direktori anggota demo, anggota manual, validasi duplikat ketua/anggota, serta mitra PKM/hilirisasi dengan izin berbagi kontak.
- Substansi Penelitian, PKM, dan Inovasi yang berbeda. Dorongan Teknologi memuat TKT, kelayakan, model bisnis, dan rencana hilirisasi; Inovasi internal memakai profil lebih sederhana.
- BudgetForm bersama dengan blok RAB berulang, ringkasan komponen, volume sampai tiga desimal, harga sampai dua desimal, subtotal dan total Rupiah. Perhitungan memakai integer sen/BigInt dan pembulatan subtotal; backend harus menghitung ulang saat integrasi.
- Jadwal berdasarkan tahun relatif dan rentang bulan, serta target luaran berdasarkan jenis/jumlah/status/tahun.
- Unggah lokal dan unduh berkas, checklist dokumen kondisional, batas ukuran/jenis, penanganan kuota/berkas hilang, dan pencegahan navigasi/sesi saat isian belum disimpan.
- Pengajuan/revisi simulasi dengan snapshot isian dan berkas yang mempertahankan versi sebelumnya. Konflik versi tab lain ditolak.
- Laporan kemajuan/akhir sesuai kepemilikan, status dan window; capaian beserta bukti dan versi riwayat terpisah dari rencana. Penyimpanan capaian tidak mengubah kegiatan menjadi Selesai.
- Draft Fase 1 tetap dapat dibaca; field baru diberi nilai awal tanpa menghapus penyimpanan lama.

## Yang tersedia pada Fase 3

- Daftar klaim Insentif Kepakaran untuk Dosen/Reviewer/monitoring, pencarian, filter kategori/tahun/status/prodi, sorting dan pagination. Draft tanpa tahun tetap terlihat pada filter awal Semua tahun.
- Sepuluh formulir membaca langsung JSON di `docs/`, mencakup 198 field sumber, 30 identitas otomatis, 158 butir Kesesuaian, dan 10 komentar reviewer. Label/opsi/hint sumber dipertahankan; kategori HAKI/Monev/review internal/jurnal nasional nonterakreditasi ditandai menunggu template.
- Field kondisional afiliasi, APC saat LOA, media Offline/portal Online; jawaban yang tersembunyi tetap tersimpan. Portal Lainnya mendukung nama manual. Urutan penulis dapat ditambah, dihapus, atau dipindahkan; posisi pengusul diperiksa terhadap nama profil pada simulasi submit.
- Referensi HTTPS dengan tanggal akses/catatan dan snapshot berkas opsional. Bukti buku Hardfile memuat tanda terima manual, Softfile memuat berkas lokal atau URL sumber. Korespondensi dan surat Scopus/WOS tampil hanya pada template yang memilikinya.
- Draft, pratinjau, pengajuan/revisi simulasi, snapshot identitas/jawaban/berkas, riwayat, pemeriksaan judul duplikat pengusul/tahun, konflik versi, dan peringatan isian belum tersimpan.
- Reviewer hanya dapat mengubah checklist pada klaim yang ditugaskan dan Dalam review. Checklist Ya/Tidak terpisah dari jawaban dosen, terikat versi pengajuan, dan mempertahankan pemeriksaan sebelumnya. Perubahan jawaban antar versi ditampilkan untuk pemeriksaan.
- Selesaikan Pemeriksaan memerlukan seluruh butir yang berlaku dan komentar pada alur demo, lalu mencatat `REVIEW_COMPLETED`. Rekomendasi tetap terpisah dari keputusan final; persetujuan/penolakan/revisi final/batch dinonaktifkan menunggu SK/SOP.
- Rekap per kategori dan ekspor CSV metadata seluruh hasil filter/sort untuk Operator/LPPM/Admin. Rekap tidak membentuk batch atau menyatakan dana telah dibayarkan.

Periode insentif contoh berada pada `incentivePeriods`, dengan tahun/minimum luaran 2026 dari workbook dan window demo 1 September–31 Desember 2026. Judul/identitas menjadi syarat teknis draft; tahun luaran diperiksa saat submit. Field lain tidak dipaksa wajib global karena semua `requiredOnSubmit` sumber masih TBD. Batas 125 halaman dan Impact Factor 0,10 merupakan petunjuk sumber, bukan aturan penolakan yang dikarang. LOA boleh dicatat dan memakai `PENDING_POLICY_REVIEW` pada pengajuan baru. `ruleVersionId`, `quotedAmount`, `approvedAmount`, dan `batchId` tetap `null`.

Contoh awal berisi penugasan reviewer untuk menguji alur. Klaim baru tidak otomatis mendapat reviewer; pengelolaan assignment oleh operator tersedia pada Fase 4. SINTA 1–6 tersedia sebagai opsi sumber dan tidak otomatis berarti layak dibayar.

## Batas fase dan kebijakan

Ada **lima fase**. Fase 1 (fondasi), Fase 2 (form kegiatan), dan Fase 3 (insentif) sudah diimplementasikan. Karya Cipta, review kegiatan, pengelolaan assignment, serta master lengkap masuk Fase 4. Fase 5 mencakup penyempurnaan. Menu yang belum tersedia diberi label fase.

Tarif insentif tidak diisi: tampilkan **Menunggu Konfigurasi SK** dan gunakan nilai `null`. Approval kegiatan tidak diaktifkan sebelum SOP disahkan. Angka pendanaan pada record contoh hanya simulasi, bukan tarif insentif, alokasi atau keputusan resmi. Karya Cipta nantinya langsung tercatat tanpa approval.

Periode contoh aktif 2026 dan jadwal 1 September sampai 31 Oktober adalah konfigurasi demo, bukan kebijakan resmi. Delapan skema contoh disimpan di `src/modules/activities/data.ts` dengan ID versi. Profil demo pada `profiles.ts` memakai ringkasan 300 kata, substansi 500 kata, 3–5 kata kunci, durasi maksimal 24 bulan, dan pagu contoh Rp100 juta. Angka/kategori/checklist tersebut **bukan aturan resmi**: PRD menandai profil sebagai rancangan dan belum memberikan konfigurasi final. Window proposal 1 September–31 Oktober, revisi/laporan/capaian 1 September–31 Desember 2026, serta tujuan resubmit revisi adalah konfigurasi demo per profil. Versi skema dibekukan setelah draft pertama disimpan; skema lain membutuhkan draft baru. Tanggal mock berasal dari data dan tanggal draft baru dari waktu saat penyimpanan.

## Struktur

```text
src/
  app/                  konteks sesi/data, provider, shell navigasi
  components/ui/        komponen pola shadcn/ui berbasis Radix dan CVA
  components/shared.tsx field, status, heading, loading/empty/error
  lib/                  format Indonesia dan utilitas kelas
  modules/activities/   model + schema, aturan, interface repository,
                        implementasi mock, seed, profil wizard, BudgetForm,
                        IndexedDB berkas, milestone, ekspor, TanStack Table
  modules/incentives/    manifes JSON bertipe, aturan/klaim, mock repository,
                        renderer field, checklist, tabel dan rekap
  pages/                login, dashboard, kegiatan, klaim, konfigurasi
scripts/domain-check.ts + incentive-check.ts cek kecil aturan dan repository
```

`ActivityRepository` dan `ClaimRepository` menyediakan kontrak Promise. Implementasi mock dapat diganti repository HTTP ketika integrasi Golang Fiber v3 sudah diminta. Aturan penting tetap perlu divalidasi backend kelak. Kontrol role dan kepemilikan di frontend ini hanya simulasi dan tidak menyediakan batas keamanan produksi.

Data kegiatan memakai key `aptimas.demo.activities.v1` dan klaim memakai `aptimas.demo.claims.v1` di localStorage; sesi memakai `aptimas.demo.session.v1` di sessionStorage. Berkas biner disimpan pada IndexedDB `aptimas.local.files.v1`, terpisah dari metadata. Berkas yang dilepas dari draft tetap dipertahankan agar referensi versi lama aman. Pemulihan contoh awal menghapus catatan/draft lokal setelah konfirmasi dan tetap mempertahankan Blob; hapus seluruh data situs melalui pengaturan browser bila ingin membersihkan berkas juga. Penyimpanan lokal tidak menyediakan backup lintas perangkat. Context React mencukupi; tidak ada dependensi baru pada Fase 2–3. Pemulihan kegiatan dan klaim memiliki konfirmasi terpisah agar tidak menghapus modul lain.

## Pemeriksaan

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Cek kecil memverifikasi scope pemilik/assignment, filter, CSV formula injection, kedelapan profil, tim duplikat, RAB desimal/overflow, jadwal, berkas hilang/jenis/ukuran, snapshot revisi, laporan, capaian/riwayat bukti, konflik versi, kuota, dan kompatibilitas draft. localStorage dan operasi Blob IndexedDB memakai penyimpanan memori; window diperiksa dengan waktu tetap. Insentif juga diperiksa untuk kesepuluh template, pilihan/kondisi, pemisahan aktor, Softfile/Hardfile, revisi, versi checklist/assignment, duplikat, periode, dan nominal `null`. Tidak memakai framework test tambahan.

Sesuai permintaan pengguna, tidak ada debugging atau pengujian browser/screenshot. Tampilan serta interaksi aktual perlu ditinjau melalui preview. Server static untuk hasil `dist` memerlukan fallback semua route aplikasi ke `index.html`.

Build berhasil dengan peringatan ukuran chunk JavaScript; pemisahan chunk menjadi bagian penyempurnaan Fase 5.

Aturan lint `react/incompatible-library` dinonaktifkan karena aturan tersebut menargetkan React Compiler, yang tidak diaktifkan dalam proyek ini. TanStack Table menggunakan API v8 yang dikunci oleh lockfile.

## Acuan

- `docs/PRD_APTIMAS_Lengkap_v1.1.md`
- `docs/APTIMAS_Insentif_FormSchema_2026_DRAFT_v1.1.json`
- `docs/FORM KEPAKARAN 2026.xlsx`
- `DESIGN.md`, penerjemahan arah visual dari brief dan screenshot pengguna.

Konfigurasi Tailwind mengikuti [integrasi Vite resmi](https://tailwindcss.com/docs/installation/using-vite), router mengikuti [React Router](https://reactrouter.com/start/declarative/installation), tabel memakai [TanStack Table](https://tanstack.com/table/latest/docs/guide/column-defs), dan komponen lokal mengikuti pola [shadcn/ui](https://ui.shadcn.com/docs).
