import { ArrowLeft, Copy, Download, ExternalLink, FileDown, History, Printer, QrCode, RefreshCw, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHead } from '../components/AppShell'
import { Empty } from '../components/Empty'
import { Poster } from '../components/Poster'
import { Pipeline, StageBadge } from '../components/Stage'
import { useToast } from '../components/Toast'
import { useStore } from '../data/store'
import type { Announcement, DB } from '../data/types'
import { needed, pct } from '../lib/gate'
import { download, publicUrl, qrPng, qrSvg } from '../lib/qr'
import { fmtDate, workdays } from '../lib/time'

function StatusCard({ a, db }: { a: Announcement; db: DB }) {
  const d = a.draft
  const kader = db.kaders.find((k) => k.id === d?.kaderId)
  const { raters, thresholdPct } = db.settings
  if (a.stage === 'terjemahan')
    return (
      <div className="status-card status-terjemahan">
        <h2 className="t-h3">Sedang diterjemahkan</h2>
        <p className="t-body">
          {kader ? `${kader.name} (kader Tuli) sedang menulis bahasa mudah dan merekam video BISINDO.` : 'Menunggu kader yang tersedia.'}
        </p>
        {d && d.easy.length > 0 && <p className="t-small">{d.easy.length} baris bahasa mudah sudah ditulis.</p>}
      </div>
    )
  if (a.stage === 'penilaian' && d)
    return (
      <div className="status-card status-penilaian">
        <h2 className="t-h3">Dinilai komunitas Tuli</h2>
        <p className="t-body">
          {d.ratings.length} dari {raters} penilaian masuk. Skor disembunyikan sampai penilaian lengkap agar tiap penilai tidak terpengaruh.
        </p>
        <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={raters} aria-valuenow={d.ratings.length} aria-label="Penilaian masuk">
          <span style={{ transform: `scaleX(${d.ratings.length / raters})` }} />
        </div>
        <p className="t-small">
          Lolos bila minimal {needed(raters, thresholdPct)} dari {raters} penilai paham ({thresholdPct}%).
        </p>
      </div>
    )
  if (a.stage === 'revisi' && d)
    return (
      <div className="status-card status-revisi">
        <h2 className="t-h3">Dikembalikan ke kader untuk revisi</h2>
        <p className="t-body">
          Skor gerbang mutu {d.gate?.pct}% (ambang {d.gate?.threshold}%). {kader?.name} sedang memperbaiki video.
        </p>
        {d.revisionNote && <p className="note">{d.revisionNote}</p>}
      </div>
    )
  const live = a.live!
  return (
    <div className="status-card status-terbit">
      <h2 className="t-h3">Terbit sejak {fmtDate(live.publishedAt)}</h2>
      <p className="t-body">
        {live.gate?.pct}% penilai Tuli paham. Waktu produksi {workdays(a.createdAt, live.publishedAt!)} hari kerja.
      </p>
      <p className="t-small">
        Umpan balik pembaca: {live.readers.paham} paham, {live.readers.belum} belum paham ({pct(live.readers.paham, live.readers.paham + live.readers.belum)}% paham).
      </p>
    </div>
  )
}

export function Detail({ role }: { role: 'instansi' | 'koordinator' }) {
  const { id } = useParams()
  const { db, startNewVersion, simulateRatings } = useStore()
  const toast = useToast()
  const a = db.announcements.find((x) => x.id === id)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const back = role === 'instansi' ? '/instansi' : '/koordinator'

  if (!a || (role === 'instansi' && a.agencyId !== db.session?.actorId))
    return <Empty icon={<QrCode />} title="Pengumuman tidak ditemukan" action={<Link to={back} className="btn btn-ghost">Kembali</Link>} />

  const agency = db.agencies.find((g) => g.id === a.agencyId)
  const url = publicUrl(a.slug)
  const versions = [...(a.live ? [a.live] : []), ...a.archive]

  return (
    <>
      <Link to={back} className="back-link">
        <ArrowLeft aria-hidden="true" />
        {role === 'instansi' ? 'Semua pengumuman' : 'Dasbor'}
      </Link>
      <PageHead title={a.title} desc={`${agency?.name} · ${a.category} · berlaku ${fmtDate(a.validFrom)}${a.validUntil ? ` s.d. ${fmtDate(a.validUntil)}` : ''}`} actions={<StageBadge stage={a.stage} />} />

      <div className="panel panel-pad">
        <Pipeline stage={a.stage} />
      </div>

      <div className="detail-grid">
        <div className="stack gap-5">
          <StatusCard a={a} db={db} />

          {role === 'koordinator' && a.stage === 'penilaian' && (
            <div className="panel panel-pad row gap-4 wrap between">
              <p className="t-body grow">Demo: lengkapi sisa penilaian dengan penilai simulasi.</p>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  simulateRatings(a.id)
                  toast('Penilaian simulasi ditambahkan')
                }}
              >
                <Wand2 aria-hidden="true" />
                Simulasikan
              </button>
            </div>
          )}

          {role === 'instansi' && a.live && !a.draft && (
            <div className="panel panel-pad stack gap-4">
              <div className="row between wrap gap-3">
                <div className="stack gap-1">
                  <h2 className="t-h3">Ada perubahan informasi?</h2>
                  <p className="t-small">Versi baru melewati alur yang sama. Alamat dan QR tetap; versi lama diarsipkan.</p>
                </div>
                {!editing && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setText(a.live!.sourceText)
                      setEditing(true)
                    }}
                  >
                    <RefreshCw aria-hidden="true" />
                    Perbarui pengumuman
                  </button>
                )}
              </div>
              {editing && (
                <form
                  className="stack gap-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (text.trim().length < 40) return
                    startNewVersion(a.id, text.trim())
                    setEditing(false)
                    toast(`Versi ${a.live!.no + 1} dikirim ke kader`)
                  }}
                >
                  <label htmlFor="upd" className="label">
                    Naskah versi {a.live.no + 1}
                  </label>
                  <textarea id="upd" className="textarea" value={text} onChange={(e) => setText(e.target.value)} rows={6} />
                  <div className="row gap-3">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={text.trim().length < 40}>
                      Kirim versi baru
                    </button>
                    <button type="button" className="btn btn-quiet btn-sm" onClick={() => setEditing(false)}>
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <details className="panel source-box" open={!a.live}>
            <summary className="t-h3">Naskah {a.draft ? `versi ${a.draft.no}` : 'yang tayang'}</summary>
            <p className="t-body">{(a.draft ?? a.live)?.sourceText}</p>
          </details>

          {versions.length > 0 && (
            <div className="panel panel-pad stack gap-3">
              <h2 className="t-h3 row gap-2">
                <History aria-hidden="true" className="ic-20" />
                Riwayat versi
              </h2>
              <ul className="versions">
                {versions.map((v) => (
                  <li key={v.no} className="row between gap-3 wrap">
                    <span>
                      <strong>Versi {v.no}</strong> <span className="t-small">· terbit {fmtDate(v.publishedAt)}</span>
                    </span>
                    <span className={`pill ${v.archivedAt ? 'pill-neutral' : 'pill-terbit'}`}>{v.archivedAt ? `Diarsipkan ${fmtDate(v.archivedAt)}` : 'Tayang'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="stack gap-4 qr-side">
          {a.live ? (
            <>
              <Poster slug={a.slug} title={a.title} agency={agency?.name} id="poster-print" />
              <div className="panel panel-pad stack gap-3">
                <div className="url-box">
                  <span className="t-small url-text">{url}</span>
                  <button
                    type="button"
                    className="icon-btn icon-btn-light"
                    aria-label="Salin alamat halaman"
                    onClick={() => navigator.clipboard?.writeText(url).then(() => toast('Alamat disalin'))}
                  >
                    <Copy aria-hidden="true" />
                  </button>
                </div>
                <div className="two-col tight">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={async () => download(`qr-${a.slug}.png`, await qrPng(url))}>
                    <Download aria-hidden="true" />
                    PNG
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={async () => {
                      const svg = await qrSvg(url)
                      const href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
                      download(`qr-${a.slug}.svg`, href)
                      setTimeout(() => URL.revokeObjectURL(href), 1000)
                    }}
                  >
                    <FileDown aria-hidden="true" />
                    SVG
                  </button>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer aria-hidden="true" />
                  Cetak poster
                </button>
                <Link to={`/p/${a.slug}`} target="_blank" className="btn btn-quiet btn-sm">
                  <ExternalLink aria-hidden="true" />
                  Buka halaman publik
                </Link>
              </div>
            </>
          ) : (
            <div className="qr-wait">
              <QrCode aria-hidden="true" />
              <h2 className="t-h3">Kode QR menyusul</h2>
              <p className="t-body">QR siap cetak muncul di sini setelah video lolos gerbang mutu.</p>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
