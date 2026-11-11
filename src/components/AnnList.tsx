import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Agency, Announcement } from '../data/types'
import { fmtShort } from '../lib/time'
import { StageBadge } from './Stage'

export function AnnList({ items, agencies, hrefFor, showAgency = false }: { items: Announcement[]; agencies: Agency[]; hrefFor: (a: Announcement) => string; showAgency?: boolean }) {
  return (
    <ul className="ann-list">
      {items.map((a) => {
        const g = agencies.find((x) => x.id === a.agencyId)
        const ver = a.draft ?? a.live
        return (
          <li key={a.id}>
            <Link to={hrefFor(a)} className="ann-row">
              <span className="stack gap-1 grow">
                <span className="ann-title">{a.title}</span>
                <span className="t-small">
                  {showAgency && `${g?.short} · `}
                  {a.category} · versi {ver?.no ?? 1}
                  {a.live && a.draft && ' (versi baru diproses)'}
                </span>
              </span>
              <span className="ann-date t-small t-num">Berlaku {fmtShort(a.validFrom)}</span>
              <StageBadge stage={a.stage} />
              <ChevronRight aria-hidden="true" className="ann-chev" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
