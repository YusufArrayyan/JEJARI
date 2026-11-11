import { ArrowRight, Building2, GraduationCap, HandHeart } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useStore } from '../data/store'
import type { Role } from '../data/types'

const ROLES: { role: Role; icon: typeof Building2; title: string; text: string }[] = [
  { role: 'instansi', icon: Building2, title: 'Admin instansi', text: 'Unggah naskah dan unduh QR' },
  { role: 'kader', icon: HandHeart, title: 'Kader Tuli', text: 'Terjemahkan dan nilai video' },
  { role: 'koordinator', icon: GraduationCap, title: 'Koordinator', text: 'Atur mutu dan baca laporan' },
]

const HOME: Record<Role, string> = { instansi: '/instansi', kader: '/kader', koordinator: '/koordinator' }

export function Login() {
  const { db, login } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const initial = (params.get('peran') as Role) || 'instansi'
  const [role, setRole] = useState<Role>(ROLES.some((r) => r.role === initial) ? initial : 'instansi')
  const actors =
    role === 'instansi'
      ? db.agencies.map((a) => ({ id: a.id, label: a.name }))
      : role === 'kader'
        ? db.kaders.filter((k) => k.trained).map((k) => ({ id: k.id, label: `${k.name} · ${k.region}` }))
        : [{ id: 'unib', label: 'Tim Universitas Bengkulu' }]
  const [actor, setActor] = useState(actors[0].id)
  const actorValid = actors.some((a) => a.id === actor) ? actor : actors[0].id

  return (
    <div className="login">
      <div className="login-aside on-navy">
        <Logo tone="light" />
        <div className="stack gap-4 login-aside-copy">
          <p className="login-quote">Setiap pengumuman layanan publik dikurasi oleh komunitas Tuli sebelum sampai ke warga.</p>
          <p className="login-src">Prototipe MVP JEJARI · LOKASI 2026</p>
        </div>
      </div>

      <main className="login-main">
        <form
          className="login-form stack gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            login({ role, actorId: actorValid })
            nav(HOME[role])
          }}
        >
          <div className="stack gap-2">
            <h1 className="t-h1">Masuk petugas</h1>
            <p className="t-body">Pilih peran Anda. Pada demo ini tidak ada kata sandi.</p>
          </div>

          <fieldset className="role-pick">
            <legend className="label">Peran</legend>
            {ROLES.map(({ role: r, icon: I, title, text }) => (
              <label key={r} className="role-opt">
                <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
                <span className="role-opt-ic" aria-hidden="true">
                  <I />
                </span>
                <span className="stack">
                  <span className="role-opt-title">{title}</span>
                  <span className="t-small">{text}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {actors.length > 1 && (
            <div className="field">
              <label htmlFor="actor">{role === 'instansi' ? 'Instansi' : 'Nama kader'}</label>
              <select id="actor" className="select" value={actorValid} onChange={(e) => setActor(e.target.value)}>
                {actors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block">
            Masuk
            <ArrowRight aria-hidden="true" />
          </button>
        </form>
      </main>
    </div>
  )
}
