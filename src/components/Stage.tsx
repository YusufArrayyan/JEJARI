import { Check, CheckCircle2, ClipboardCheck, Languages, RotateCcw } from 'lucide-react'
import type { Stage } from '../data/types'

export const STAGE_LABEL: Record<Stage, string> = {
  terjemahan: 'Diterjemahkan kader',
  penilaian: 'Gerbang mutu',
  revisi: 'Perlu revisi',
  terbit: 'Terbit',
}

const STAGE_ICON = { terjemahan: Languages, penilaian: ClipboardCheck, revisi: RotateCcw, terbit: CheckCircle2 }

export function StageBadge({ stage }: { stage: Stage }) {
  const I = STAGE_ICON[stage]
  return (
    <span className={`pill pill-${stage}`}>
      <I aria-hidden="true" strokeWidth={2.4} />
      {STAGE_LABEL[stage]}
    </span>
  )
}

const STEPS = [
  { key: 'naskah', label: 'Naskah' },
  { key: 'terjemahan', label: 'Terjemahan' },
  { key: 'penilaian', label: 'Gerbang mutu' },
  { key: 'terbit', label: 'Publikasi' },
] as const

/** Pelacak empat tahap alur kerja (Gambar 1 esai). */
export function Pipeline({ stage, compact = false }: { stage: Stage; compact?: boolean }) {
  const idx = stage === 'terbit' ? 3 : stage === 'penilaian' ? 2 : 1
  return (
    <ol className={`pipeline ${compact ? 'pipeline-compact' : ''}`} aria-label="Tahap alur kerja">
      {STEPS.map((s, i) => {
        const state = i < idx || stage === 'terbit' ? 'done' : i === idx ? (stage === 'revisi' ? 'back' : 'now') : 'todo'
        return (
          <li key={s.key} className={`pipe-step pipe-${state}`} aria-current={state === 'now' || state === 'back' ? 'step' : undefined}>
            <span className="pipe-dot" aria-hidden="true">
              {state === 'done' ? <Check strokeWidth={3} /> : i + 1}
            </span>
            <span className="pipe-label">
              {s.label}
              {state === 'back' && <span className="pipe-note"> (revisi)</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
