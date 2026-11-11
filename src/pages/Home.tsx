import { ArrowRight, Building2, ClipboardCheck, GraduationCap, HandHeart, QrCode, ScanLine, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Poster } from '../components/Poster'
import { useStore } from '../data/store'
import { fmtShort } from '../lib/time'

const STEPS = [
  { icon: Building2, title: 'Naskah', text: 'Instansi mengunggah naskah pengumuman beserta tanggal berlaku.' },
  { icon: Video, title: 'Terjemahan', text: 'Kader Tuli menulis bahasa mudah, merekam video BISINDO, dan memberi takarir.' },
  { icon: ClipboardCheck, title: 'Gerbang mutu', text: 'Penilai Tuli menonton tanpa melihat skor penilai lain. Video terbit bila ≥80% paham.' },
  { icon: QrCode, title: 'Publikasi', text: 'Halaman publik terbit dengan alamat tetap. Instansi mencetak poster QR.' },
]

const ROLES = [
  { role: 'instansi', icon: Building2, title: 'Admin instansi', text: 'Unggah naskah, pantau status, unduh QR siap cetak.' },
  { role: 'kader', icon: HandHeart, title: 'Kader Tuli', text: 'Kerjakan terjemahan, unggah video, nilai video kader lain.' },
  { role: 'koordinator', icon: GraduationCap, title: 'Koordinator kampus', text: 'Atur ambang gerbang mutu dan baca laporan keterpahaman.' },
] as const

export function Home() {
  const { db } = useStore()
  const live = db.announcements.filter((a) => a.live)
  const demo = live[0]

  return (
    <div className="home">
      <a className="skip" href="#utama">
        Lewati ke konten
      </a>
      <header className="home-bar container">
        <Logo />
        <nav aria-label="Navigasi beranda" className="row gap-2">
          <a href="#cara-kerja" className="btn btn-quiet btn-sm hide-sm">
            Cara kerja
          </a>
          <a href="#terbit" className="btn btn-quiet btn-sm hide-sm">
            Pengumuman
          </a>
          <Link to="/masuk" className="btn btn-navy btn-sm">
            Masuk petugas
          </Link>
        </nav>
      </header>

      <main id="utama">
        <section className="hero container">
          <div className="hero-copy stack gap-5">
            <h1 className="t-display">
              Pengumuman layanan publik, langsung dalam <mark className="hl">bahasa isyarat</mark>.
            </h1>
            <p className="t-lead">
              Pindai kode QR di loket, tonton video BISINDO bertakarir, baca intinya dalam bahasa mudah. Tanpa akun, tanpa menunggu juru bahasa.
            </p>
            <div className="row gap-3 wrap">
              {demo && (
                <Link to={`/p/${demo.slug}`} className="btn btn-primary btn-lg">
                  <ScanLine aria-hidden="true" />
                  Coba halaman publik
                </Link>
              )}
              <Link to="/masuk" className="btn btn-ghost btn-lg">
                Masuk sebagai petugas
              </Link>
            </div>
          </div>
          {demo && (
            <div className="hero-visual" aria-hidden="false">
              <div className="hero-poster-wrap">
                <Poster slug={demo.slug} title={demo.title} agency={db.agencies.find((g) => g.id === demo.agencyId)?.name} />
                <p className="hero-caption">Poster ini memuat QR asli. Pindai dengan kamera ponsel.</p>
              </div>
            </div>
          )}
        </section>

        <section className="gap-band on-navy" aria-labelledby="masalah">
          <div className="container gap-grid">
            <h2 id="masalah" className="gap-statement">
              Satu juru bahasa isyarat untuk <span className="gap-num">3.840</span> warga Tuli.
            </h2>
            <div className="stack gap-4">
              <p>
                Indonesia memiliki sekitar 500 juru bahasa isyarat untuk 1,92 juta penyandang Tuli. WHO merekomendasikan 1 untuk 100. Sebanyak 91% Tuli memakai isyarat sehari-hari yang berbeda dari isyarat sekolah formal.
              </p>
              <p className="gap-src">Sumber: Kemenko PMK (2025a; 2025b).</p>
              <p>JEJARI tidak menggantikan juru bahasa di layanan tatap muka. JEJARI memastikan pengumuman tertulis sampai ke warga Tuli dalam bahasa yang mereka pakai.</p>
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="container home-section" aria-labelledby="ck">
          <div className="section-head">
            <h2 id="ck" className="t-h1">
              Dari naskah ke poster QR dalam empat tahap
            </h2>
            <p className="t-lead">Target uji coba: paling lama 5 hari kerja per pengumuman.</p>
          </div>
          <ol className="flow">
            {STEPS.map(({ icon: I, title, text }, i) => (
              <li key={title} className="flow-step">
                <span className="flow-num">{i + 1}</span>
                <span className="flow-ic" aria-hidden="true">
                  <I />
                </span>
                <h3 className="t-h3">{title}</h3>
                <p className="t-body">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="terbit" className="container home-section" aria-labelledby="tb">
          <div className="section-head">
            <h2 id="tb" className="t-h1">
              Sudah terbit
            </h2>
            <p className="t-body">Halaman publik yang lolos gerbang mutu.</p>
          </div>
          <ul className="pub-index">
            {live.map((a) => {
              const g = db.agencies.find((x) => x.id === a.agencyId)
              return (
                <li key={a.id}>
                  <Link to={`/p/${a.slug}`} className="pub-index-row">
                    <span className="pub-index-agency">{g?.short}</span>
                    <span className="pub-index-title">{a.title}</span>
                    <span className="pub-index-meta t-small">
                      {a.live?.gate?.pct}% paham · {fmtShort(a.live?.publishedAt)}
                    </span>
                    <ArrowRight aria-hidden="true" className="pub-index-arrow" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="container home-section" aria-labelledby="peran">
          <div className="section-head">
            <h2 id="peran" className="t-h1">
              Masuk sesuai peran
            </h2>
            <p className="t-lead">Warga Tuli tidak perlu akun. Tiga peran berikut mengelola isi.</p>
          </div>
          <div className="roles">
            {ROLES.map(({ role, icon: I, title, text }) => (
              <Link key={role} to={`/masuk?peran=${role}`} className="role-row">
                <span className="role-ic" aria-hidden="true">
                  <I />
                </span>
                <span className="stack gap-1 grow">
                  <span className="t-h3">{title}</span>
                  <span className="t-body">{text}</span>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="home-foot">
        <div className="container row between wrap gap-4">
          <Logo sub />
          <p className="t-small">
            Prototipe MVP berdasarkan esai LOKASI 2026 · Muhammad Yusuf Arrayyan, Universitas Bengkulu. Data pada demo ini adalah contoh.
          </p>
        </div>
      </footer>
    </div>
  )
}
