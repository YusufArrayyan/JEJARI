import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createSeed } from './seed'
import type { Announcement, Category, DB, GateSettings, Session, Version } from './types'
import { pct } from '../lib/gate'
import { nowIso } from '../lib/time'

const KEY = 'jejari-db-v1'

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* data rusak: mulai dari data contoh */
  }
  return createSeed()
}

export interface NewAnnouncement {
  title: string
  category: Category
  validFrom: string
  validUntil?: string
  sourceText: string
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 48)
}

function emptyVersion(no: number, sourceText: string, from?: Version): Version {
  return {
    no,
    sourceText,
    easy: from ? structuredClone(from.easy) : [],
    cues: from ? structuredClone(from.cues) : [],
    video: undefined,
    ratings: [],
    readers: { paham: 0, belum: 0 },
  }
}

function useStoreValue() {
  const [db, setDb] = useState<DB>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(db))
  }, [db])

  const mutate = useCallback((fn: (d: DB) => void) => {
    setDb((prev) => {
      const next = structuredClone(prev)
      fn(next)
      return next
    })
  }, [])

  const mutateA = useCallback(
    (id: string, fn: (a: Announcement, d: DB) => void) =>
      mutate((d) => {
        const a = d.announcements.find((x) => x.id === id)
        if (a) fn(a, d)
      }),
    [mutate],
  )

  /** Pilih kader terlatih dengan tugas terbuka paling sedikit (PRD F2). */
  const pickKader = (d: DB) => {
    const load = new Map(d.kaders.filter((k) => k.trained).map((k) => [k.id, 0]))
    for (const a of d.announcements)
      if (a.draft?.kaderId && (a.stage === 'terjemahan' || a.stage === 'revisi'))
        load.set(a.draft.kaderId, (load.get(a.draft.kaderId) ?? 0) + 1)
    return [...load.entries()].sort((x, y) => x[1] - y[1])[0]?.[0]
  }

  const evaluate = (a: Announcement, settings: GateSettings) => {
    const dr = a.draft
    if (!dr || dr.ratings.length < settings.raters) return
    const yes = dr.ratings.filter((r) => r.understood).length
    const score = pct(yes, dr.ratings.length)
    const passed = score >= settings.thresholdPct
    dr.gate = { passed, pct: score, at: nowIso(), raters: dr.ratings.length, threshold: settings.thresholdPct }
    if (passed) {
      if (a.live) a.archive.unshift({ ...a.live, archivedAt: nowIso() })
      a.live = { ...dr, publishedAt: nowIso(), revisionNote: undefined }
      a.draft = undefined
      a.stage = 'terbit'
    } else {
      dr.revisionNote = `${dr.ratings.length - yes} dari ${dr.ratings.length} penilai belum paham. Tinjau bagian yang paling sulit, lalu kirim ulang.`
      a.stage = 'revisi'
    }
  }

  const actions = useMemo(
    () => ({
      login: (session: Session) => mutate((d) => void (d.session = session)),
      logout: () => mutate((d) => void (d.session = undefined)),
      reset: () => {
        const fresh = createSeed()
        fresh.session = db.session
        setDb(fresh)
      },

      createAnnouncement(agencyId: string, input: NewAnnouncement) {
        const id = `a${Date.now().toString(36)}`
        let slug = slugify(input.title) || id
        mutate((d) => {
          if (d.announcements.some((a) => a.slug === slug)) slug = `${slug}-${id.slice(-4)}`
          const draft = emptyVersion(1, input.sourceText)
          draft.kaderId = pickKader(d)
          d.announcements.unshift({
            id,
            slug,
            agencyId,
            title: input.title,
            category: input.category,
            validFrom: input.validFrom,
            validUntil: input.validUntil || undefined,
            createdAt: nowIso(),
            stage: 'terjemahan',
            draft,
            archive: [],
          })
        })
        return id
      },

      /** F7: versi baru dengan URL dan QR yang sama. */
      startNewVersion(id: string, sourceText: string) {
        mutateA(id, (a, d) => {
          const base = a.live
          a.draft = emptyVersion((base?.no ?? 0) + 1, sourceText, base)
          a.draft.kaderId = base?.kaderId ?? pickKader(d)
          a.stage = 'terjemahan'
          a.createdAt = nowIso()
        })
      },

      saveDraft(id: string, patch: Partial<Version>) {
        mutateA(id, (a) => {
          if (a.draft) Object.assign(a.draft, patch)
        })
      },

      submitDraft(id: string) {
        mutateA(id, (a) => {
          if (!a.draft) return
          a.draft.submittedAt = nowIso()
          a.draft.ratings = []
          a.draft.gate = undefined
          a.stage = 'penilaian'
        })
      },

      rate(id: string, raterId: string, understood: boolean) {
        mutateA(id, (a, d) => {
          const dr = a.draft
          if (!dr || a.stage !== 'penilaian') return
          if (dr.ratings.some((r) => r.raterId === raterId)) return
          dr.ratings.push({ raterId, understood, at: nowIso() })
          evaluate(a, d.settings)
        })
      },

      /** Bantuan demo: lengkapi sisa penilaian dengan peluang paham p. */
      simulateRatings(id: string, p = 0.9) {
        mutateA(id, (a, d) => {
          const dr = a.draft
          if (!dr || a.stage !== 'penilaian') return
          while (dr.ratings.length < d.settings.raters)
            dr.ratings.push({ raterId: `sim-${dr.ratings.length}-${Math.random()}`, understood: Math.random() < p, at: nowIso() })
          evaluate(a, d.settings)
        })
      },

      readerFeedback(id: string, understood: boolean) {
        mutateA(id, (a) => {
          if (a.live) a.live.readers[understood ? 'paham' : 'belum']++
        })
      },

      setSettings(s: GateSettings) {
        mutate((d) => {
          d.settings = s
          for (const a of d.announcements) if (a.stage === 'penilaian') evaluate(a, s)
        })
      },
    }),
    [mutate, mutateA, db.session],
  )

  return { db, ...actions }
}

type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore di luar StoreProvider')
  return s
}

/** Versi yang sedang dikerjakan atau yang tayang. */
export const current = (a: Announcement) => a.draft ?? a.live
