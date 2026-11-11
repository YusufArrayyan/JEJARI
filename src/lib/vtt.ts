import type { Cue } from '../data/types'

function ts(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`
}

export function toVtt(cues: Cue[]) {
  return ['WEBVTT', '', ...cues.flatMap((c, i) => [String(i + 1), `${ts(c.start)} --> ${ts(c.end)}`, c.text, ''])].join('\n')
}

/** Data URL (bukan blob) agar tidak perlu dicabut dan aman saat komponen dipasang ulang. */
export function vttUrl(cues: Cue[]) {
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(toVtt(cues))}`
}
