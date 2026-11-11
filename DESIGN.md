# DESIGN.md — JEJARI

Struktur terinspirasi Wise (permukaan berlapis, radius lembut, satu aksen CTA), diwarnai identitas logo JEJARI.

## Warna (OKLCH)
| Token | Nilai | Peran |
| --- | --- | --- |
| `--navy` | `oklch(0.363 0.098 257)` (#183D70) | Tinta merek, panggung video, sidebar |
| `--navy-deep` | `oklch(0.27 0.08 257)` | Hover pada permukaan navy |
| `--sun` | `oklch(0.851 0.170 89)` (#FAC71B) | Satu-satunya aksen CTA, penanda aktif |
| `--sun-deep` | `oklch(0.78 0.165 84)` | Hover CTA |
| `--ink` | `oklch(0.22 0.03 257)` | Teks utama |
| `--body` | `oklch(0.40 0.025 257)` | Teks sekunder (≥ 7:1 di atas putih) |
| `--canvas` | `oklch(0.975 0.006 257)` | Latar halaman (netral sejuk, bukan krem) |
| `--surface` | `#fff` | Kartu dan panel |
| `--line` | `oklch(0.90 0.012 257)` | Garis 1px |
| semantik | `--ok`, `--warn`, `--bad`, `--info` | Status alur |

## Tipografi
Satu keluarga: **Atkinson Hyperlegible Next** (Braille Institute), bobot 400/600/800. Skala tetap rem dengan rasio ±1.2. Judul tampilan bobot 800, `letter-spacing: -0.02em`.

## Bentuk
Radius: 8 (chip), 12 (input), 16 (panel), 24 (tombol besar, kartu publik), pill (status).

## Komponen kunci
- **Tombol utama**: kuning, teks navy, tinggi 48px.
- **Status alur**: pill berwarna semantik + ikon; tidak pernah warna saja.
- **Pipeline 4 tahap**: naskah → terjemahan → gerbang mutu → terbit.
- **Panggung video publik**: navy penuh, takarir aktif bawaan.

## Gerak
150–220ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Semua dimatikan di `prefers-reduced-motion`.
