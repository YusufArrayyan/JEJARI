import { ChevronDown, HelpCircle, ShieldCheck, ThumbsUp, Type } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EasyIcon, ICONS } from '../components/EasyIcon'
import { Logo } from '../components/Logo'
import { VideoPlayer } from '../components/VideoPlayer'
import { useStore } from '../data/store'
import { fmtDate } from '../lib/time'

function useLargeText() {
  const [on, setOn] = useState(() => localStorage.getItem('jejari-large') === '1')
  useEffect(() => localStorage.setItem('jejari-large', on ? '1' : '0'), [on])
  return [on, setOn] as const
}

export function PublicPage() {
  const { slug } = useParams()
  const { db, readerFeedback } = useStore()
  const a = db.announcements.find((x) => x.slug === slug)
  const agency = db.agencies.find((g) => g.id === a?.agencyId)
  const live = a?.live
  const [large, setLarge] = useLargeText()
  const fbKey = a && live ? `jejari-fb-${a.id}-v${live.no}` : ''
  const [answer, setAnswer] = useState<string | null>(() => (fbKey ? localStorage.getItem(fbKey) : null))

  useEffect(() => {
    document.title = a ? `${a.title} — JEJARI` : 'Halaman tidak ditemukan — JEJARI'
  }, [a])

  if (!a || !live)
    return (
      <div className="pub">
        <header className="pub-bar on-navy">
          <Logo tone="light" sub={false} />
        </header>
        <main className="pub-missing container">
          <h1 className="t-h1">Halaman belum tersedia</h1>
          <p className="t-lead">
            {a ? 'Video bahasa isyarat untuk pengumuman ini masih diperiksa komunitas Tuli. Coba lagi dalam beberapa hari.' : 'Kode QR ini tidak dikenali. Periksa kembali poster atau tanyakan ke petugas loket.'}
          </p>
          <Link to="/" className="btn btn-navy">
            Ke beranda JEJARI
          </Link>
        </main>
      </div>
    )

  const answerWith = (understood: boolean) => {
    readerFeedback(a.id, understood)
    const v = understood ? 'paham' : 'belum'
    localStorage.setItem(fbKey, v)
    setAnswer(v)
  }

  const gate = live.gate

  return (
    <div className={`pub ${large ? 'pub-large' : ''}`}>
      <a className="skip" href="#isi">
        Lewati ke isi pengumuman
      </a>
      <header className="pub-bar on-navy">
        <Logo tone="light" sub={false} />
        <button type="button" className="pub-tool" aria-pressed={large} onClick={() => setLarge(!large)}>
          <Type aria-hidden="true" />
          <span>{large ? 'Teks normal' : 'Teks besar'}</span>
        </button>
      </header>

      <section className="pub-stage on-navy" aria-label="Video bahasa isyarat">
        <div className="pub-stage-inner">
          <VideoPlayer video={live.video} cues={live.cues} title={a.title} />
        </div>
      </section>

      <main id="isi" className="pub-body">
        <div className="pub-head">
          <p className="pub-agency">{agency?.name}</p>
          <h1 className="pub-title">{a.title}</h1>
          <p className="pub-meta">
            {a.category} · Berlaku {fmtDate(a.validFrom)}
            {a.validUntil && ` sampai ${fmtDate(a.validUntil)}`}
          </p>
        </div>

        <section aria-labelledby="intinya" className="pub-section">
          <h2 id="intinya" className="pub-h2">
            Intinya
          </h2>
          <ul className="easy-list">
            {live.easy.map((l, i) => (
              <li key={i} className="easy-row">
                <span className={`easy-ic easy-ic-${l.icon}`}>
                  <EasyIcon k={l.icon} size={26} />
                  <span className="sr-only">{ICONS[l.icon].label}: </span>
                </span>
                <span>{l.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="pub-feedback" aria-labelledby="fb-q">
          {!answer ? (
            <>
              <h2 id="fb-q" className="pub-h2">
                Anda paham isi video ini?
              </h2>
              <div className="fb-buttons">
                <button type="button" className="fb-btn fb-yes" onClick={() => answerWith(true)}>
                  <ThumbsUp aria-hidden="true" />
                  Paham
                </button>
                <button type="button" className="fb-btn fb-no" onClick={() => answerWith(false)}>
                  <HelpCircle aria-hidden="true" />
                  Belum paham
                </button>
              </div>
              <p className="t-small">Jawaban tanpa nama. Tidak ada data pribadi yang disimpan.</p>
            </>
          ) : (
            <div className="fb-done" role="status">
              <span className="fb-done-ic" aria-hidden="true">
                {answer === 'paham' ? <ThumbsUp /> : <HelpCircle />}
              </span>
              <div className="stack gap-1">
                <h2 id="fb-q" className="pub-h2">
                  Terima kasih.
                </h2>
                <p className="t-body">
                  {answer === 'paham'
                    ? 'Jawaban Anda membantu kami menjaga mutu video.'
                    : 'Kader Tuli akan memperbaiki video ini. Jika perlu bantuan sekarang, tunjukkan halaman ini ke petugas loket.'}
                </p>
              </div>
            </div>
          )}
        </section>

        <details className="pub-source">
          <summary>
            Naskah asli dari instansi
            <ChevronDown aria-hidden="true" />
          </summary>
          <p>{live.sourceText}</p>
        </details>

        <footer className="pub-foot">
          {gate && (
            <p className="row gap-2 pub-trust">
              <ShieldCheck aria-hidden="true" />
              <span>
                Diperiksa {gate.raters} penilai Tuli sebelum terbit. {gate.pct}% menyatakan paham.
              </span>
            </p>
          )}
          <p className="t-small">
            Versi {live.no} · diperbarui {fmtDate(live.publishedAt)}. Alamat dan kode QR halaman ini tetap sama saat diperbarui.
          </p>
        </footer>
      </main>
    </div>
  )
}
