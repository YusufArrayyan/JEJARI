import {
  BarChart3,
  ClipboardCheck,
  FilePlus2,
  Inbox,
  ListChecks,
  LogOut,
  Menu,
  RotateCcw,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import type { Role } from '../data/types'
import { Logo } from './Logo'
import { useToast } from './Toast'

const NAV: Record<Role, { to: string; label: string; icon: typeof Inbox; end?: boolean }[]> = {
  instansi: [
    { to: '/instansi', label: 'Pengumuman', icon: ListChecks, end: true },
    { to: '/instansi/baru', label: 'Unggah naskah', icon: FilePlus2 },
  ],
  kader: [
    { to: '/kader', label: 'Tugas saya', icon: Inbox, end: true },
    { to: '/kader/nilai', label: 'Nilai video', icon: ClipboardCheck },
  ],
  koordinator: [
    { to: '/koordinator', label: 'Dasbor', icon: BarChart3, end: true },
    { to: '/koordinator/gerbang', label: 'Gerbang mutu', icon: SlidersHorizontal },
    { to: '/koordinator/kader', label: 'Kader', icon: Users },
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  instansi: 'Admin instansi',
  kader: 'Kader Tuli',
  koordinator: 'Koordinator',
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const { db, logout, reset } = useStore()
  const toast = useToast()
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  if (!db.session || db.session.role !== role) return <Navigate to={`/masuk?peran=${role}`} replace />

  const s = db.session
  const who =
    s.role === 'instansi'
      ? db.agencies.find((a) => a.id === s.actorId)?.name
      : s.role === 'kader'
        ? db.kaders.find((k) => k.id === s.actorId)?.name
        : 'Tim Universitas Bengkulu'
  const initials = (who ?? '?')
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

  const sidebar = (
    <>
      <div className="side-top">
        <Logo tone="light" to={NAV[role][0].to} />
      </div>
      <nav aria-label="Navigasi utama" className="side-nav">
        {NAV[role].map(({ to, label, icon: I, end }) => (
          <NavLink key={to} to={to} end={end} className="side-link">
            <I aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="side-foot">
        <div className="side-user">
          <span className="avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="stack">
            <span className="side-user-name">{who}</span>
            <span className="side-user-role">{ROLE_LABEL[role]}</span>
          </span>
        </div>
        <button
          type="button"
          className="side-link side-btn"
          onClick={() => {
            logout()
            nav('/masuk')
          }}
        >
          <LogOut aria-hidden="true" />
          Ganti peran
        </button>
      </div>
    </>
  )

  return (
    <div className="shell">
      <a className="skip" href="#konten">
        Lewati ke konten
      </a>
      <aside className="side on-navy" aria-label="Menu samping">
        {sidebar}
      </aside>

      <header className="mobilebar on-navy no-print">
        <Logo tone="light" sub={false} to={NAV[role][0].to} />
        <button type="button" className="icon-btn" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu aria-hidden="true" />
        </button>
      </header>
      {open && (
        <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="drawer-scrim" aria-label="Tutup menu" onClick={() => setOpen(false)} />
          <div className="drawer on-navy">
            <button type="button" className="icon-btn drawer-close" aria-label="Tutup menu" onClick={() => setOpen(false)}>
              <X aria-hidden="true" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <main id="konten" className="main" tabIndex={-1}>
        <div className="demo-bar no-print">
          <span>
            <strong>Mode demo.</strong> Data contoh tersimpan di peramban ini.
          </span>
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              reset()
              toast('Data contoh dipulihkan')
            }}
          >
            <RotateCcw aria-hidden="true" />
            Pulihkan data contoh
          </button>
        </div>
        <div className="page enter" key={loc.pathname}>
          {children}
        </div>
      </main>
    </div>
  )
}

export function PageHead({ title, desc, actions }: { title: string; desc?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="stack gap-2 grow">
        <h1 className="t-h1">{title}</h1>
        {desc && <p className="t-body page-desc">{desc}</p>}
      </div>
      {actions && <div className="row gap-3 wrap">{actions}</div>}
    </header>
  )
}
