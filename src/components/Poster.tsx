import { useEffect, useState } from 'react'
import { publicUrl, qrSvg } from '../lib/qr'
import { LogoMark } from './Logo'

/** Poster A5 siap cetak: judul, QR, ajakan pindai. */
export function Poster({ slug, title, agency, id }: { slug: string; title: string; agency?: string; id?: string }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    let alive = true
    qrSvg(publicUrl(slug)).then((s) => alive && setSvg(s))
    return () => {
      alive = false
    }
  }, [slug])

  return (
    <figure className="poster" id={id} aria-label={`Poster QR untuk ${title}`}>
      <div className="poster-top">
        <LogoMark size={44} />
        <div className="stack">
          <span className="poster-brand">JEJARI</span>
          <span className="poster-agency">{agency}</span>
        </div>
      </div>
      <p className="poster-title">{title}</p>
      <div className="poster-qr" dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label="Kode QR" />
      <p className="poster-cta">Pindai untuk info dalam bahasa isyarat</p>
      <p className="poster-sub">BISINDO · takarir · bahasa mudah</p>
    </figure>
  )
}
