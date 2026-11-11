import QRCode from 'qrcode'

const NAVY = '#183D70'

export function publicUrl(slug: string) {
  const base = `${location.origin}${location.pathname}`
  return `${base}#/p/${slug}`
}

export const qrPng = (text: string, width = 1024) =>
  QRCode.toDataURL(text, { width, margin: 2, errorCorrectionLevel: 'Q', color: { dark: NAVY, light: '#FFFFFF' } })

export const qrSvg = (text: string) =>
  QRCode.toString(text, { type: 'svg', margin: 2, errorCorrectionLevel: 'Q', color: { dark: NAVY, light: '#FFFFFF' } })

export function download(name: string, href: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
}
