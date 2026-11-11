import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { StageBadge } from '../../components/Stage'
import { useStore } from '../../data/store'
import type { Stage } from '../../data/types'
import { pct } from '../../lib/gate'
import { workdays } from '../../lib/time'

function Target({ label, value, target, unit, invert = false, note }: { label: string; value: number; target: number; unit?: string; invert?: boolean; note: string }) {
  const ratio = invert ? (value === 0 ? 0 : Math.min(1, target / value)) : Math.min(1, value / target)
  const met = invert ? value > 0 && value <= target : value >= target
  return (
    <div className="target">
      <p className="target-label">{label}</p>
      <p className="target-value t-num">
        {value}
        {unit && <span className="target-unit">{unit}</span>}
        <span className="target-of">
          {' '}
          / {invert ? '≤' : ''}
          {target}
          {unit}
        </span>
      </p>
      <div className={`meter ${met ? 'meter-ok' : ''}`} aria-hidden="true">
        <span style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <p className="t-small">{note}</p>
    </div>
  )
}

const ORDER: Stage[] = ['terjemahan', 'penilaian', 'revisi', 'terbit']

export function Dashboard() {
  const { db } = useStore()
  const live = db.announcements.filter((a) => a.live)
  const agenciesServed = new Set(live.map((a) => a.agencyId)).size
  const gateAvg = live.length ? Math.round(live.reduce((s, a) => s + (a.live!.gate?.pct ?? 0), 0) / live.length) : 0
  const prodDays = live.map((a) => workdays(a.createdAt, a.live!.publishedAt!))
  const prodAvg = prodDays.length ? +(prodDays.reduce((s, x) => s + x, 0) / prodDays.length).toFixed(1) : 0
  const trained = db.kaders.filter((k) => k.trained).length
  const activeKaders = new Set(db.announcements.flatMap((a) => [a.draft?.kaderId, a.live?.kaderId]).filter(Boolean)).size
  const byStage = ORDER.map((s) => ({ s, n: db.announcements.filter((a) => a.stage === s).length }))
  const total = db.announcements.length

  const rows = db.announcements.map((a) => {
    const v = a.live
    const n = v ? v.readers.paham + v.readers.belum : 0
    const readerPct = v ? pct(v.readers.paham, n) : null
    return {
      a,
      gate: (a.live ?? a.draft)?.gate?.pct,
      readerPct,
      n,
      days: v ? workdays(a.createdAt, v.publishedAt!) : null,
      flag: readerPct !== null && n >= 10 && readerPct < db.settings.thresholdPct,
    }
  })

  return (
    <>
      <PageHead title="Dasbor" desc="Capaian uji coba enam bulan terhadap target pada Tabel 1 esai." />

      <section className="targets panel" aria-label="Capaian terhadap target">
        <Target label="Pengumuman terbit" value={live.length} target={20} note={`${agenciesServed} dari 5 instansi terlayani`} />
        <Target label="Keterpahaman di gerbang mutu" value={gateAvg} target={db.settings.thresholdPct} unit="%" note="Rata-rata video yang terbit" />
        <Target label="Waktu produksi" value={prodAvg} target={5} unit=" hari" invert note="Rata-rata hari kerja, naskah sampai terbit" />
        <Target label="Kader Tuli terlatih" value={trained} target={10} note={`${activeKaders} kader aktif mengerjakan tugas`} />
      </section>

      <section className="panel panel-pad stack gap-4" aria-labelledby="alur-h">
        <div className="row between wrap gap-3">
          <h2 id="alur-h" className="t-h2">
            Alur kerja saat ini
          </h2>
          <p className="t-small t-num">{total} pengumuman</p>
        </div>
        <div className="stagebar" role="img" aria-label={byStage.map(({ s, n }) => `${s} ${n}`).join(', ')}>
          {byStage.map(({ s, n }) => n > 0 && <span key={s} className={`stagebar-seg seg-${s}`} style={{ flexGrow: n }} />)}
        </div>
        <ul className="stage-legend">
          {byStage.map(({ s, n }) => (
            <li key={s}>
              <StageBadge stage={s} />
              <span className="t-num">{n}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="stack gap-3" aria-labelledby="video-h">
        <div className="row between wrap gap-3">
          <h2 id="video-h" className="t-h2">
            Keterpahaman per video
          </h2>
          <p className="t-small">Ditandai bila umpan balik pembaca di bawah {db.settings.thresholdPct}% (min. 10 jawaban).</p>
        </div>
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Pengumuman</th>
                <th scope="col">Status</th>
                <th scope="col" className="num">
                  Gerbang mutu
                </th>
                <th scope="col" className="num">
                  Pembaca paham
                </th>
                <th scope="col" className="num">
                  Produksi
                </th>
                <th scope="col">
                  <span className="sr-only">Buka</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, gate, readerPct, n, days, flag }) => (
                <tr key={a.id} className={flag ? 'row-flag' : ''}>
                  <td>
                    <Link to={`/koordinator/p/${a.id}`} className="cell-title">
                      {a.title}
                    </Link>
                    <span className="t-small block">{db.agencies.find((g) => g.id === a.agencyId)?.short}</span>
                  </td>
                  <td>
                    <StageBadge stage={a.stage} />
                  </td>
                  <td className="num t-num">{gate !== undefined ? `${gate}%` : '—'}</td>
                  <td className="num t-num">
                    {readerPct !== null ? (
                      <span className={`row gap-1 end ${flag ? 'flag-text' : ''}`}>
                        {flag && <AlertTriangle aria-label="Perlu ditinjau" className="ic-16" />}
                        {readerPct}% <span className="t-small">({n})</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={`num t-num ${days !== null && days > 5 ? 'flag-text' : ''}`}>{days !== null ? `${days} hari` : '—'}</td>
                  <td className="num">
                    <ChevronRight aria-hidden="true" className="ic-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
