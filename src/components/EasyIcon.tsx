import { AlertTriangle, CalendarDays, CheckCircle2, Clock, FileText, Info, MapPin, Phone, Users, Wallet } from 'lucide-react'
import type { IconKey } from '../data/types'

export const ICONS: Record<IconKey, { C: typeof Info; label: string }> = {
  calendar: { C: CalendarDays, label: 'Tanggal' },
  clock: { C: Clock, label: 'Jam' },
  pin: { C: MapPin, label: 'Tempat' },
  doc: { C: FileText, label: 'Dokumen' },
  people: { C: Users, label: 'Untuk siapa' },
  wallet: { C: Wallet, label: 'Biaya' },
  phone: { C: Phone, label: 'Kontak' },
  alert: { C: AlertTriangle, label: 'Penting' },
  info: { C: Info, label: 'Info' },
  check: { C: CheckCircle2, label: 'Langkah' },
}

export function EasyIcon({ k, size = 24 }: { k: IconKey; size?: number }) {
  const { C } = ICONS[k] ?? ICONS.info
  return <C width={size} height={size} aria-hidden="true" strokeWidth={2.2} />
}
