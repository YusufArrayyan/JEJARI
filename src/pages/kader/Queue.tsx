import { ArrowRight, CalendarClock, ClipboardCheck, PartyPopper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { Empty } from '../../components/Empty'
import { StageBadge } from '../../components/Stage'
import { useStore } from '../../data/store'
import { fmtDate } from '../../lib/time'

function daysUntil(date: string) {
  const ms = new Date(`${date}T00:00:00+07:00`).getTime() - Date.now()
  return Math.ceil(ms / 86400000)
}

export function KaderQueue() {
  const { db } = useStore()
  const me = db.session!.actorId
  const mine = db.announcements.filter((a) => a.draft?.kaderId === me)
  const todo = mine
    .filter((a) => a.stage === 'terjemahan' || a.stage === 'revisi')
    .sort((x, y) => (x.stage === 'revisi' ? -1 : 0) - (y.stage === 'revisi' ? -1 : 0) || x.validFrom.localeCompare(y.validFrom))
  const waiting = mine.filter((a) => a.stage === 'penilaian')
  const published = db.announcements.filter((a) => a.live?.kaderId === me).length
  const toRate = db.announcements.filter((a) => a.stage === 'penilaian' && a.draft?.kaderId !== me && !a.draft?.ratings.some((r) => r.raterId === `kader:${me}`)).length

  return (
    <>
      <PageHead title="Tugas saya" desc="Kerjakan dari atas. Revisi dan tanggal berlaku terdekat didahulukan." />

      <div className="kader-sum">
        <p>
          <strong className="t-num">{todo.length}</strong> perlu dikerjakan
        </p>
        <p>
          <strong className="t-num">{waiting.length}</strong> sedang dinilai
        </p>
        <p>
          <strong className="t-num">{published}</strong> sudah terbit
        </p>
        {toRate > 0 && (
          <Link to="/kader/nilai" className="btn btn-navy btn-sm kader-sum-cta">
            <ClipboardCheck aria-hidden="true" />
            {toRate} video menunggu penilaian Anda
          </Link>
        )}
      </div>

      {todo.length ? (
        <ol className="task-list">
          {todo.map((a, i) => {
            const d = daysUntil(a.validFrom)
            const g = db.agencies.find((x) => x.id === a.agencyId)
            return (
              <li key={a.id}>
                <Link to={`/kader/tugas/${a.id}`} className={`task ${i === 0 ? 'task-first' : ''}`}>
                  <span className="task-order t-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="stack gap-2 grow">
                    <span className="row gap-3 wrap">
                      <StageBadge stage={a.stage} />
                      <span className="t-small">
                        {g?.short} · versi {a.draft!.no}
                      </span>
                    </span>
                    <span className="task-title">{a.title}</span>
                    <span className={`row gap-2 t-small ${d <= 3 ? 'urgent' : ''}`}>
                      <CalendarClock aria-hidden="true" className="ic-16" />
                      Berlaku {fmtDate(a.validFrom)}
                      {d > 0 ? ` · ${d} hari lagi` : ' · sudah berlaku'}
                    </span>
                    {a.stage === 'revisi' && a.draft?.revisionNote && <span className="note">{a.draft.revisionNote}</span>}
                  </span>
                  <span className="task-go">
                    {i === 0 ? 'Kerjakan' : 'Buka'}
                    <ArrowRight aria-hidden="true" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      ) : (
        <Empty icon={<PartyPopper />} title="Semua tugas selesai" action={toRate > 0 && <Link to="/kader/nilai" className="btn btn-primary">Nilai video kader lain</Link>}>
          Tugas baru muncul di sini saat instansi mengunggah naskah.
        </Empty>
      )}

      {waiting.length > 0 && (
        <section className="stack gap-3" aria-labelledby="wait-h">
          <h2 id="wait-h" className="t-h2">
            Sedang dinilai
          </h2>
          <ul className="plain-list">
            {waiting.map((a) => (
              <li key={a.id} className="row between gap-3 wrap">
                <span>{a.title}</span>
                <span className="t-small t-num">
                  {a.draft!.ratings.length}/{db.settings.raters} penilaian
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
