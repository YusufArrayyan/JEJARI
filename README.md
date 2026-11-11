<p align="center">
  <img src="public/brand/logo-192.png" width="120" alt="Logo JEJARI" />
</p>

<h1 align="center">JEJARI</h1>
<p align="center"><strong>Kanal informasi layanan publik dalam bahasa isyarat, dibuka lewat kode QR.</strong></p>

JEJARI mengubah setiap pengumuman layanan publik menjadi satu halaman berbahasa isyarat (BISINDO). Warga Tuli memindai QR di poster, menonton video bertakarir, dan membaca intinya dalam bahasa mudah, tanpa akun dan tanpa menunggu juru bahasa isyarat.

Prototipe MVP ini dibangun dari PRD JEJARI dan esai LOKASI 2026 (Muhammad Yusuf Arrayyan, Universitas Bengkulu).

## Alur kerja

| Tahap | Siapa | Yang terjadi di sistem |
| --- | --- | --- |
| 1. Naskah | Admin instansi | Unggah naskah, tanggal berlaku, kategori layanan |
| 2. Terjemahan | Kader Tuli | Sistem menugaskan kader dengan antrean paling sedikit; kader menulis bahasa mudah, mengunggah video BISINDO, membuat takarir WebVTT |
| 3. Gerbang mutu | Penilai Tuli | Penilaian buta "paham / belum paham"; satu penilai satu kali; terbit bila ≥ ambang (awal 80%), jika tidak kembali ke kader |
| 4. Publikasi | Sistem | Halaman publik dengan URL tetap, QR PNG/SVG, poster siap cetak; versi baru memakai QR yang sama |

## Fitur MVP (sesuai PRD)

- **F1** Unggah naskah dengan validasi
- **F2** Penugasan otomatis ke kader, editor bahasa mudah + ikon, unggah video, editor takarir WebVTT
- **F3** Gerbang mutu buta dengan jumlah penilai dan ambang yang bisa diatur koordinator, plus simulasi peluang lolos (binomial)
- **F4** QR PNG dan SVG, poster A5 siap cetak
- **F5** Halaman publik tanpa login: video dimuat saat diputar, takarir aktif, teks bahasa mudah beserta ikon, tombol "Paham / Belum paham", mode teks besar
- **F6** Dasbor capaian terhadap target uji coba (pengumuman, keterpahaman, waktu produksi, kader)
- **F7** Versi baru dengan URL dan QR yang sama; versi lama diarsipkan

## Desain

- Warna dari logo: navy `#183D70` dan kuning `#FAC71B` (OKLCH di `src/styles.css`)
- Huruf: Atkinson Hyperlegible Next, dirancang untuk keterbacaan tinggi
- Target WCAG 2.2 AA: kontras ≥ 4,5:1, fokus terlihat, tombol ≥ 48 px, bisa dipakai dengan keyboard, menghormati `prefers-reduced-motion`
- Rincian: [`DESIGN.md`](DESIGN.md) dan [`PRODUCT.md`](PRODUCT.md)

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Pilih **Masuk petugas** untuk mencoba peran admin instansi, kader Tuli, atau koordinator.

```bash
npm run build   # hasil di dist/, bisa di-host statis (mis. GitHub Pages)
```

## Catatan prototipe

- Data tersimpan di `localStorage` dan video unggahan di IndexedDB peramban. Tombol **Pulihkan data contoh** mengembalikan data awal.
- Nama instansi mengacu pada Kota Bengkulu; isi pengumuman, nama kader, dan angka adalah **data contoh**, bukan data nyata.
- Video `public/media/contoh-bisindo.mp4` adalah penanda tempat, bukan rekaman BISINDO. Rekaman kader Tuli menggantikannya saat uji coba.
- Usulan produksi (PRD): PostgreSQL, penyimpanan berkas untuk video, autentikasi berbasis peran, pembuat QR di sisi server.

## Struktur

```
src/
  data/        tipe, data contoh, store (alur kerja & aturan gerbang mutu)
  lib/         gate (binomial), qr, vtt, idb, waktu
  components/  AppShell, Pipeline, VideoPlayer, Poster, ...
  pages/       Home, PublicPage, Login, instansi/, kader/, koordinator/
docs/          panduan PDF, mockup, video alur kerja
```
