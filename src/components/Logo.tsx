import { Link } from 'react-router-dom'

const src = `${import.meta.env.BASE_URL}brand/logo-96.png`

export function LogoMark({ size = 40 }: { size?: number }) {
  return <img src={src} width={size} height={size} alt="" aria-hidden="true" style={{ width: size, height: size }} />
}

export function Logo({ to = '/', tone = 'dark', sub = true }: { to?: string; tone?: 'dark' | 'light'; sub?: boolean }) {
  return (
    <Link to={to} className={`logo logo-${tone}`} aria-label="JEJARI, ke beranda">
      <span className="logo-badge">
        <LogoMark size={34} />
      </span>
      <span className="logo-text">
        <span className="logo-word">JEJARI</span>
        {sub && <span className="logo-sub">Informasi publik dalam isyarat</span>}
      </span>
    </Link>
  )
}
