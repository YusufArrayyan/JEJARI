const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
const shortFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' })

export const fmtDate = (iso?: string) => (iso ? dateFmt.format(new Date(iso)) : '—')
export const fmtShort = (iso?: string) => (iso ? shortFmt.format(new Date(iso)) : '—')

/** Hari kerja (Senin–Jumat) antara dua waktu, dibulatkan ke atas, minimal 1. */
export function workdays(fromIso: string, toIso: string) {
  const a = new Date(fromIso)
  const b = new Date(toIso)
  if (b <= a) return 1
  let days = 0
  const d = new Date(a)
  d.setHours(0, 0, 0, 0)
  const end = new Date(b)
  end.setHours(0, 0, 0, 0)
  while (d < end) {
    d.setDate(d.getDate() + 1)
    const w = d.getDay()
    if (w !== 0 && w !== 6) days++
  }
  return Math.max(1, days)
}

export const nowIso = () => new Date().toISOString()

export function fmtSeconds(s: number) {
  const m = Math.floor(s / 60)
  const r = s - m * 60
  return `${String(m).padStart(2, '0')}:${r.toFixed(1).padStart(4, '0')}`
}
