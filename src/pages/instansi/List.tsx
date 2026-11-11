import { FilePlus2, Inbox } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnnList } from '../../components/AnnList'
import { PageHead } from '../../components/AppShell'
import { Empty } from '../../components/Empty'
import { useStore } from '../../data/store'
import type { Stage } from '../../data/types'

const FILTERS: { key: 'semua' | 'proses' | Stage; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'proses', label: 'Diproses' },
  { key: 'revisi', label: 'Perlu revisi' },
  { key: 'terbit', label: 'Terbit' },
]

export function InstansiList() {
  const { db } = useStore()
  const agencyId = db.session!.actorId
  const mine = db.announcements.filter((a) => a.agencyId === agencyId)
  const [f, setF] = useState<(typeof FILTERS)[number]['key']>('semua')
  const match = (s: Stage) => (f === 'semua' ? true : f === 'proses' ? s === 'terjemahan' || s === 'penilaian' : s === f)
  const shown = mine.filter((a) => match(a.stage))
  const count = (k: (typeof FILTERS)[number]['key']) => mine.filter((a) => (k === 'semua' ? true : k === 'proses' ? a.stage === 'terjemahan' || a.stage === 'penilaian' : a.stage === k)).length

  return (
    <>
      <PageHead
        title="Pengumuman"
        desc="Naskah yang Anda kirim, dari terjemahan sampai terbit."
        actions={
          <Link to="/instansi/baru" className="btn btn-primary">
            <FilePlus2 aria-hidden="true" />
            Unggah naskah
          </Link>
        }
      />

      <div className="tabs" role="tablist" aria-label="Saring status">
        {FILTERS.map(({ key, label }) => (
          <button key={key} role="tab" type="button" aria-selected={f === key} className="tab" onClick={() => setF(key)}>
            {label}
            <span className="tab-count t-num">{count(key)}</span>
          </button>
        ))}
      </div>

      {shown.length ? (
        <AnnList items={shown} agencies={db.agencies} hrefFor={(a) => `/instansi/${a.id}`} />
      ) : (
        <Empty
          icon={<Inbox />}
          title={mine.length ? 'Tidak ada pengumuman dengan status ini' : 'Belum ada naskah'}
          action={
            !mine.length && (
              <Link to="/instansi/baru" className="btn btn-primary">
                Unggah naskah pertama
              </Link>
            )
          }
        >
          {mine.length ? 'Pilih saringan lain di atas.' : 'Unggah naskah pengumuman. Kader Tuli akan menerjemahkannya ke BISINDO, lalu Anda menerima kode QR.'}
        </Empty>
      )}
    </>
  )
}
