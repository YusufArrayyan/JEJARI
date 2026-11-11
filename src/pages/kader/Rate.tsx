import { CheckCheck, EyeOff, HelpCircle, ThumbsUp } from 'lucide-react'
import { PageHead } from '../../components/AppShell'
import { Empty } from '../../components/Empty'
import { useToast } from '../../components/Toast'
import { VideoPlayer } from '../../components/VideoPlayer'
import { useStore } from '../../data/store'

/** Gerbang mutu (PRD F3): penilaian buta, satu penilai satu kali per video. */
export function KaderRate() {
  const { db, rate } = useStore()
  const toast = useToast()
  const me = db.session!.actorId
  const raterId = `kader:${me}`
  const queue = db.announcements.filter((a) => a.stage === 'penilaian' && a.draft && a.draft.kaderId !== me && !a.draft.ratings.some((r) => r.raterId === raterId))
  const a = queue[0]

  return (
    <>
      <PageHead title="Nilai video" desc="Tonton seperti warga yang baru pertama kali melihat pengumuman ini. Lalu jawab satu pertanyaan." />

      {!a ? (
        <Empty icon={<CheckCheck />} title="Tidak ada video yang perlu dinilai">
          Terima kasih. Video baru dari kader lain akan muncul di sini.
        </Empty>
      ) : (
        <div className="rate">
          <div className="rate-meta row between wrap gap-3">
            <p className="t-small">
              Video 1 dari {queue.length} · {db.agencies.find((g) => g.id === a.agencyId)?.short}
            </p>
            <p className="t-small row gap-2">
              <EyeOff aria-hidden="true" className="ic-16" />
              Skor penilai lain disembunyikan
            </p>
          </div>
          <div className="rate-stage on-navy">
            <VideoPlayer key={a.id} video={a.draft!.video} cues={a.draft!.cues} title={a.title} lazy={false} />
          </div>
          <h2 className="t-h2 rate-title">{a.title}</h2>
          <fieldset className="rate-q">
            <legend className="t-h3">Apakah isi video ini jelas dan mudah dipahami?</legend>
            <div className="fb-buttons">
              <button
                type="button"
                className="fb-btn fb-yes"
                onClick={() => {
                  rate(a.id, raterId, true)
                  toast('Penilaian tersimpan')
                }}
              >
                <ThumbsUp aria-hidden="true" />
                Paham
              </button>
              <button
                type="button"
                className="fb-btn fb-no"
                onClick={() => {
                  rate(a.id, raterId, false)
                  toast('Penilaian tersimpan')
                }}
              >
                <HelpCircle aria-hidden="true" />
                Belum paham
              </button>
            </div>
          </fieldset>
          <p className="t-small">Anda hanya bisa menilai video ini satu kali. Video karya Anda sendiri tidak ditampilkan.</p>
        </div>
      )}
    </>
  )
}
