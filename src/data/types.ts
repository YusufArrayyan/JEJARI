export type Role = 'instansi' | 'kader' | 'koordinator'

/** Status alur kerja naskah (Gambar 1 esai). */
export type Stage = 'terjemahan' | 'penilaian' | 'revisi' | 'terbit'

export type IconKey =
  | 'calendar'
  | 'clock'
  | 'pin'
  | 'doc'
  | 'info'
  | 'phone'
  | 'wallet'
  | 'people'
  | 'alert'
  | 'check'

export interface EasyLine {
  icon: IconKey
  text: string
}

export interface Cue {
  start: number // detik
  end: number
  text: string
}

export interface Rating {
  raterId: string
  understood: boolean
  at: string
}

export interface Version {
  no: number
  sourceText: string
  easy: EasyLine[]
  cues: Cue[]
  /** URL video contoh atau `idb:<key>` untuk berkas unggahan kader. */
  video?: string
  kaderId?: string
  submittedAt?: string
  ratings: Rating[]
  /** Umpan balik pembaca di halaman publik. */
  readers: { paham: number; belum: number }
  gate?: { passed: boolean; pct: number; at: string; raters: number; threshold: number }
  revisionNote?: string
  publishedAt?: string
  archivedAt?: string
}

export interface Announcement {
  id: string
  slug: string
  agencyId: string
  title: string
  category: Category
  validFrom: string
  validUntil?: string
  createdAt: string
  stage: Stage
  /** Versi yang sedang tayang di URL/QR publik. */
  live?: Version
  /** Versi yang sedang diproses di alur kerja. */
  draft?: Version
  archive: Version[]
}

export type Category =
  | 'Administrasi kependudukan'
  | 'Kesehatan'
  | 'Bantuan sosial'
  | 'Transportasi'
  | 'Pendidikan'
  | 'Kebencanaan'

export const CATEGORIES: Category[] = [
  'Administrasi kependudukan',
  'Kesehatan',
  'Bantuan sosial',
  'Transportasi',
  'Pendidikan',
  'Kebencanaan',
]

export interface Agency {
  id: string
  name: string
  short: string
}

export interface Kader {
  id: string
  name: string
  region: string
  trained: boolean
}

export interface GateSettings {
  raters: number
  thresholdPct: number
}

export interface Session {
  role: Role
  /** id instansi untuk admin, id kader untuk kader. */
  actorId: string
}

export interface DB {
  agencies: Agency[]
  kaders: Kader[]
  announcements: Announcement[]
  settings: GateSettings
  session?: Session
}
