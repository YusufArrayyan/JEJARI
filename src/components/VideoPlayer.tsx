import { Play } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Cue } from '../data/types'
import { getVideo } from '../lib/idb'
import { vttUrl } from '../lib/vtt'

const BASE = import.meta.env.BASE_URL
const POSTER = `${BASE}media/poster.jpg`

function useVideoSrc(video?: string) {
  const [blobSrc, setBlobSrc] = useState<string>()
  const isIdb = !!video?.startsWith('idb:')

  useEffect(() => {
    if (!video || !isIdb) return
    let url: string | undefined
    let alive = true
    getVideo(video.slice(4)).then((b) => {
      if (b && alive) {
        url = URL.createObjectURL(b)
        setBlobSrc(url)
      }
    })
    return () => {
      alive = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [video, isIdb])

  if (!video) return undefined
  return isIdb ? blobSrc : BASE + video
}

/**
 * Pemutar HTML5 dengan takarir WebVTT. Video baru diunduh saat pengguna menekan putar
 * (PRD: halaman awal ringan untuk akses internet terbatas).
 */
export function VideoPlayer({ video, cues, title, lazy = true }: { video?: string; cues: { start: number; end: number; text: string }[]; title: string; lazy?: boolean }) {
  const src = useVideoSrc(video)
  const track = useMemo(() => (cues.length ? vttUrl(cues as Cue[]) : undefined), [cues])
  const [armed, setArmed] = useState(!lazy)
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!armed || !v) return
    const t = v.textTracks[0]
    if (t) t.mode = 'showing'
    if (lazy) v.play().catch(() => {})
  }, [armed, lazy, src, track])

  if (!src)
    return (
      <div className="player player-empty">
        <p>Video belum diunggah.</p>
      </div>
    )

  if (!armed)
    return (
      <button type="button" className="player player-poster" onClick={() => setArmed(true)} aria-label={`Putar video bahasa isyarat: ${title}`}>
        <img src={POSTER} alt="" />
        <span className="player-play" aria-hidden="true">
          <Play fill="currentColor" />
        </span>
        <span className="player-hint">Putar video BISINDO · takarir aktif</span>
      </button>
    )

  return (
    <div className="player">
      <video key={src} ref={ref} src={src} controls playsInline preload="metadata" aria-label={`Video bahasa isyarat: ${title}`}>
        {track && <track kind="captions" srcLang="id" label="Indonesia" src={track} default />}
      </video>
    </div>
  )
}
