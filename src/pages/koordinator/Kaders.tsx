import { PageHead } from '../../components/AppShell'
import { useStore } from '../../data/store'

export function Kaders() {
  const { db } = useStore()
  const trained = db.kaders.filter((k) => k.trained).length

  return (
    <>
      <PageHead title="Kader Tuli" desc={`${trained} dari target 10 kader sudah terlatih.`} />
      <div className="table-wrap panel">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Nama</th>
              <th scope="col">Wilayah</th>
              <th scope="col">Pelatihan</th>
              <th scope="col" className="num">
                Tugas aktif
              </th>
              <th scope="col" className="num">
                Video terbit
              </th>
              <th scope="col" className="num">
                Penilaian diberikan
              </th>
            </tr>
          </thead>
          <tbody>
            {db.kaders.map((k) => {
              const active = db.announcements.filter((a) => a.draft?.kaderId === k.id && a.stage !== 'terbit').length
              const pub = db.announcements.filter((a) => a.live?.kaderId === k.id).length + db.announcements.reduce((s, a) => s + a.archive.filter((v) => v.kaderId === k.id).length, 0)
              const rated = db.announcements.reduce((s, a) => s + (a.draft?.ratings.filter((r) => r.raterId === `kader:${k.id}`).length ?? 0) + (a.live?.ratings.filter((r) => r.raterId === `kader:${k.id}`).length ?? 0), 0)
              return (
                <tr key={k.id}>
                  <td className="cell-title">{k.name}</td>
                  <td>{k.region}</td>
                  <td>
                    <span className={`pill ${k.trained ? 'pill-terbit' : 'pill-neutral'}`}>{k.trained ? 'Terlatih' : 'Dijadwalkan'}</span>
                  </td>
                  <td className="num t-num">{active}</td>
                  <td className="num t-num">{pub}</td>
                  <td className="num t-num">{rated}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
