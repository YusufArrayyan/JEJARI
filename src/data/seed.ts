import type { Announcement, Cue, DB, EasyLine, Rating, Version } from './types'

/**
 * Data contoh untuk demo. Nama instansi mengacu pada Kota Bengkulu (lokasi uji coba
 * yang diusulkan esai); isi pengumuman dan angka bersifat ilustratif, bukan data nyata.
 */

const SAMPLE_VIDEO = 'media/contoh-bisindo.mp4'

function ratings(total: number, paham: number, seed: string, day: string): Rating[] {
  return Array.from({ length: total }, (_, i) => ({
    raterId: `${seed}-r${i + 1}`,
    understood: i < paham,
    at: `${day}T${String(9 + (i % 8)).padStart(2, '0')}:1${i % 6}:00+07:00`,
  }))
}

function cuesFrom(lines: EasyLine[], span = 3.2): Cue[] {
  return lines.map((l, i) => ({ start: +(i * span).toFixed(1), end: +((i + 1) * span - 0.2).toFixed(1), text: l.text }))
}

function v(p: Partial<Version> & Pick<Version, 'no' | 'sourceText'>): Version {
  return { easy: [], cues: [], ratings: [], readers: { paham: 0, belum: 0 }, ...p }
}

const ktpEasy: EasyLine[] = [
  { icon: 'calendar', text: 'Perekaman KTP-el keliling: 18–22 November 2026.' },
  { icon: 'clock', text: 'Jam 08.00 sampai 14.00 WIB.' },
  { icon: 'pin', text: 'Tempat: kantor kelurahan dekat rumah Anda.' },
  { icon: 'doc', text: 'Bawa Kartu Keluarga (KK) asli.' },
  { icon: 'people', text: 'Untuk warga umur 17 tahun ke atas yang belum punya KTP-el.' },
  { icon: 'wallet', text: 'Gratis. Tidak ada biaya.' },
]

const ktpEasyV1: EasyLine[] = [
  { icon: 'calendar', text: 'Perekaman KTP-el keliling: 11–15 November 2026.' },
  { icon: 'clock', text: 'Jam 08.00 sampai 12.00 WIB.' },
  { icon: 'doc', text: 'Bawa Kartu Keluarga (KK) asli.' },
  { icon: 'wallet', text: 'Gratis.' },
]

const vaksinEasy: EasyLine[] = [
  { icon: 'people', text: 'Untuk anak umur 9 bulan sampai 15 tahun.' },
  { icon: 'calendar', text: 'Setiap Selasa dan Kamis, sampai 30 November 2026.' },
  { icon: 'pin', text: 'Di puskesmas terdekat dari rumah.' },
  { icon: 'doc', text: 'Bawa buku KIA atau kartu imunisasi anak.' },
  { icon: 'wallet', text: 'Gratis.' },
]

const bpjsEasy: EasyLine[] = [
  { icon: 'doc', text: 'Bawa kartu BPJS atau KTP-el dan surat rujukan dari puskesmas.' },
  { icon: 'pin', text: 'Daftar di loket BPJS lantai 1, dekat pintu masuk.' },
  { icon: 'clock', text: 'Loket buka Senin–Jumat, jam 07.30 sampai 12.00 WIB.' },
  { icon: 'info', text: 'Ambil nomor antrean, tunggu nomor muncul di layar.' },
]

const dtksEasy: EasyLine[] = [
  { icon: 'info', text: 'Data penerima bantuan sosial sedang diperbarui.' },
  { icon: 'pin', text: 'Cek nama Anda di kantor kelurahan.' },
  { icon: 'calendar', text: 'Batas waktu: 5 Desember 2026.' },
  { icon: 'doc', text: 'Bawa KK dan KTP-el.' },
]

const simEasy: EasyLine[] = [
  { icon: 'doc', text: 'Bawa SIM lama dan KTP-el.' },
  { icon: 'pin', text: 'Gerai SIM di Mal Bengkulu, lantai dasar.' },
  { icon: 'clock', text: 'Buka setiap hari, jam 10.00 sampai 16.00 WIB.' },
  { icon: 'alert', text: 'SIM yang sudah lewat masa berlaku harus membuat SIM baru.' },
]

const banjirEasy: EasyLine[] = [
  { icon: 'alert', text: 'Hujan deras bisa menyebabkan banjir.' },
  { icon: 'pin', text: 'Titik kumpul: halaman kantor camat terdekat.' },
  { icon: 'phone', text: 'Darurat: kirim pesan WhatsApp ke 112.' },
]

export function createSeed(): DB {
  const announcements: Announcement[] = [
    {
      id: 'a1',
      slug: 'ktp-el-keliling',
      agencyId: 'dukcapil',
      title: 'Jadwal perekaman KTP-el keliling',
      category: 'Administrasi kependudukan',
      validFrom: '2026-11-18',
      validUntil: '2026-11-22',
      createdAt: '2026-11-02T09:00:00+07:00',
      stage: 'terbit',
      live: v({
        no: 2,
        sourceText:
          'Dinas Kependudukan dan Pencatatan Sipil Kota Bengkulu melaksanakan perekaman KTP elektronik keliling pada 18 s.d. 22 November 2026 pukul 08.00–14.00 WIB di kantor kelurahan sesuai jadwal. Wajib KTP yang telah berusia 17 tahun dan belum melakukan perekaman diharap membawa Kartu Keluarga asli. Layanan tidak dipungut biaya.',
        easy: ktpEasy,
        cues: cuesFrom(ktpEasy),
        video: SAMPLE_VIDEO,
        kaderId: 'k1',
        submittedAt: '2026-11-05T14:00:00+07:00',
        ratings: ratings(10, 9, 'a1v2', '2026-11-06'),
        readers: { paham: 46, belum: 5 },
        gate: { passed: true, pct: 90, at: '2026-11-06T16:00:00+07:00', raters: 10, threshold: 80 },
        publishedAt: '2026-11-06T16:00:00+07:00',
      }),
      archive: [
        v({
          no: 1,
          sourceText: 'Perekaman KTP elektronik keliling 11 s.d. 15 November 2026 pukul 08.00–12.00 WIB.',
          easy: ktpEasyV1,
          cues: cuesFrom(ktpEasyV1),
          video: SAMPLE_VIDEO,
          kaderId: 'k1',
          submittedAt: '2026-10-28T11:00:00+07:00',
          ratings: ratings(10, 8, 'a1v1', '2026-10-29'),
          readers: { paham: 38, belum: 9 },
          gate: { passed: true, pct: 80, at: '2026-10-29T15:00:00+07:00', raters: 10, threshold: 80 },
          publishedAt: '2026-10-29T15:00:00+07:00',
          archivedAt: '2026-11-06T16:00:00+07:00',
        }),
      ],
    },
    {
      id: 'a2',
      slug: 'vaksin-campak-rubela',
      agencyId: 'dinkes',
      title: 'Imunisasi campak-rubela anak di puskesmas',
      category: 'Kesehatan',
      validFrom: '2026-11-03',
      validUntil: '2026-11-30',
      createdAt: '2026-10-27T08:30:00+07:00',
      stage: 'terbit',
      live: v({
        no: 1,
        sourceText:
          'Dinas Kesehatan Kota Bengkulu menyelenggarakan imunisasi campak-rubela bagi anak usia 9 bulan sampai dengan 15 tahun setiap hari Selasa dan Kamis hingga 30 November 2026 di seluruh puskesmas. Orang tua diminta membawa buku KIA atau kartu imunisasi. Layanan tidak dipungut biaya.',
        easy: vaksinEasy,
        cues: cuesFrom(vaksinEasy),
        video: SAMPLE_VIDEO,
        kaderId: 'k2',
        submittedAt: '2026-10-30T10:00:00+07:00',
        ratings: ratings(10, 9, 'a2', '2026-10-31'),
        readers: { paham: 31, belum: 3 },
        gate: { passed: true, pct: 90, at: '2026-11-02T10:00:00+07:00', raters: 10, threshold: 80 },
        publishedAt: '2026-11-02T10:00:00+07:00',
      }),
      archive: [],
    },
    {
      id: 'a3',
      slug: 'klaim-bpjs-rawat-jalan',
      agencyId: 'rsud',
      title: 'Cara mendaftar rawat jalan dengan BPJS',
      category: 'Kesehatan',
      validFrom: '2026-10-20',
      createdAt: '2026-10-13T08:00:00+07:00',
      stage: 'terbit',
      live: v({
        no: 1,
        sourceText:
          'Pasien peserta BPJS Kesehatan yang akan berobat rawat jalan wajib membawa kartu peserta atau KTP-el beserta surat rujukan dari FKTP. Pendaftaran dilakukan di loket BPJS lantai 1 pada hari Senin–Jumat pukul 07.30–12.00 WIB.',
        easy: bpjsEasy,
        cues: cuesFrom(bpjsEasy),
        video: SAMPLE_VIDEO,
        kaderId: 'k3',
        submittedAt: '2026-10-16T13:00:00+07:00',
        ratings: ratings(10, 8, 'a3', '2026-10-19'),
        readers: { paham: 12, belum: 7 },
        gate: { passed: true, pct: 80, at: '2026-10-20T09:00:00+07:00', raters: 10, threshold: 80 },
        publishedAt: '2026-10-20T09:00:00+07:00',
      }),
      archive: [],
    },
    {
      id: 'a4',
      slug: 'pembaruan-dtks',
      agencyId: 'dinsos',
      title: 'Pembaruan data penerima bantuan sosial (DTKS)',
      category: 'Bantuan sosial',
      validFrom: '2026-11-10',
      validUntil: '2026-12-05',
      createdAt: '2026-11-04T10:00:00+07:00',
      stage: 'penilaian',
      draft: v({
        no: 1,
        sourceText:
          'Dinas Sosial Kota Bengkulu melakukan pemutakhiran Data Terpadu Kesejahteraan Sosial (DTKS). Masyarakat dapat memeriksa status kepesertaan di kantor kelurahan masing-masing paling lambat 5 Desember 2026 dengan membawa KK dan KTP-el.',
        easy: dtksEasy,
        cues: cuesFrom(dtksEasy),
        video: SAMPLE_VIDEO,
        kaderId: 'k4',
        submittedAt: '2026-11-09T15:00:00+07:00',
        ratings: ratings(9, 7, 'a4', '2026-11-10'),
      }),
      archive: [],
    },
    {
      id: 'a5',
      slug: 'perpanjangan-sim',
      agencyId: 'samsat',
      title: 'Perpanjangan SIM di gerai mal',
      category: 'Transportasi',
      validFrom: '2026-11-15',
      createdAt: '2026-11-06T09:00:00+07:00',
      stage: 'penilaian',
      draft: v({
        no: 1,
        sourceText:
          'Satlantas Polresta Bengkulu membuka gerai perpanjangan SIM A dan C di Mal Bengkulu lantai dasar setiap hari pukul 10.00–16.00 WIB. Pemohon membawa SIM lama dan KTP-el. SIM yang telah habis masa berlakunya wajib mengikuti prosedur penerbitan SIM baru.',
        easy: simEasy,
        cues: cuesFrom(simEasy),
        video: SAMPLE_VIDEO,
        kaderId: 'k2',
        submittedAt: '2026-11-10T16:00:00+07:00',
        ratings: ratings(4, 4, 'a5', '2026-11-11'),
      }),
      archive: [],
    },
    {
      id: 'a6',
      slug: 'akta-kelahiran-daring',
      agencyId: 'dukcapil',
      title: 'Daftar akta kelahiran secara daring',
      category: 'Administrasi kependudukan',
      validFrom: '2026-11-20',
      createdAt: '2026-11-10T13:00:00+07:00',
      stage: 'terjemahan',
      draft: v({
        no: 1,
        sourceText:
          'Pengurusan akta kelahiran kini dapat dilakukan secara daring melalui laman resmi Disdukcapil Kota Bengkulu. Siapkan surat keterangan lahir, KK, dan KTP-el kedua orang tua dalam format foto atau PDF. Akta akan dikirim dalam bentuk dokumen elektronik ke alamat surel pemohon.',
        kaderId: 'k1',
      }),
      archive: [],
    },
    {
      id: 'a7',
      slug: 'peringatan-banjir',
      agencyId: 'bpbd',
      title: 'Peringatan dini banjir dan titik evakuasi',
      category: 'Kebencanaan',
      validFrom: '2026-11-01',
      createdAt: '2026-11-02T07:00:00+07:00',
      stage: 'revisi',
      draft: v({
        no: 1,
        sourceText:
          'BPBD Kota Bengkulu mengimbau masyarakat waspada potensi banjir akibat curah hujan tinggi. Titik kumpul evakuasi berada di halaman kantor camat terdekat. Laporan darurat dapat disampaikan melalui layanan 112 yang juga menerima pesan teks.',
        easy: banjirEasy,
        cues: cuesFrom(banjirEasy),
        video: SAMPLE_VIDEO,
        kaderId: 'k5',
        submittedAt: '2026-11-05T09:00:00+07:00',
        ratings: ratings(10, 6, 'a7', '2026-11-06'),
        gate: { passed: false, pct: 60, at: '2026-11-07T11:00:00+07:00', raters: 10, threshold: 80 },
        revisionNote:
          'Isyarat "titik kumpul" belum jelas bagi 4 penilai. Tambahkan contoh peta atau tunjuk arah, dan perlambat bagian nomor 112.',
      }),
      archive: [],
    },
    {
      id: 'a8',
      slug: 'imunisasi-lansia',
      agencyId: 'dinkes',
      title: 'Imunisasi influenza untuk lansia',
      category: 'Kesehatan',
      validFrom: '2026-11-25',
      createdAt: '2026-11-11T08:00:00+07:00',
      stage: 'terjemahan',
      draft: v({
        no: 1,
        sourceText:
          'Puskesmas se-Kota Bengkulu menyediakan imunisasi influenza bagi warga berusia 60 tahun ke atas mulai 25 November 2026. Peserta diminta membawa KTP-el dan kartu BPJS. Kuota terbatas 50 orang per hari per puskesmas.',
        easy: [{ icon: 'people', text: 'Untuk warga umur 60 tahun ke atas.' }],
        kaderId: 'k3',
      }),
      archive: [],
    },
  ]

  return {
    agencies: [
      { id: 'dukcapil', name: 'Disdukcapil Kota Bengkulu', short: 'Dukcapil' },
      { id: 'dinkes', name: 'Dinas Kesehatan Kota Bengkulu', short: 'Dinkes' },
      { id: 'rsud', name: 'RSUD Dr. M. Yunus Bengkulu', short: 'RSUD' },
      { id: 'dinsos', name: 'Dinas Sosial Kota Bengkulu', short: 'Dinsos' },
      { id: 'samsat', name: 'Satlantas Polresta Bengkulu', short: 'Satlantas' },
      { id: 'bpbd', name: 'BPBD Kota Bengkulu', short: 'BPBD' },
    ],
    kaders: [
      { id: 'k1', name: 'Rani Putri', region: 'Kota Bengkulu', trained: true },
      { id: 'k2', name: 'Fajar Hidayat', region: 'Kota Bengkulu', trained: true },
      { id: 'k3', name: 'Dewi Lestari', region: 'Bengkulu Tengah', trained: true },
      { id: 'k4', name: 'Bima Saputra', region: 'Kota Bengkulu', trained: true },
      { id: 'k5', name: 'Sari Wulandari', region: 'Seluma', trained: true },
      { id: 'k6', name: 'Ilham Pratama', region: 'Kota Bengkulu', trained: true },
      { id: 'k7', name: 'Nur Aisyah', region: 'Bengkulu Utara', trained: false },
      { id: 'k8', name: 'Yoga Ramadhan', region: 'Kota Bengkulu', trained: false },
    ],
    announcements,
    settings: { raters: 10, thresholdPct: 80 },
  }
}
