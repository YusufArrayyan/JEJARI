import { ArrowLeft, Check, Captions, FileText, Plus, Send, Trash2, Upload, Video, Wand2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { EasyIcon, ICONS } from '../../components/EasyIcon'
import { Empty } from '../../components/Empty'
import { StageBadge } from '../../components/Stage'
import { useToast } from '../../components/Toast'
import { VideoPlayer } from '../../components/VideoPlayer'
import { useStore } from '../../data/store'
import type { Cue, EasyLine, IconKey } from '../../data/types'
import { putVideo } from '../../lib/idb'

const MAX_MB = 80

function Step({ n, done, icon, title, desc, children }: { n: number; done: boolean; icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="ws-step panel" aria-labelledby={`step-${n}`}>
      <header className="ws-step-head">
        <span className={`ws-num ${done ? 'ws-num-done' : ''}`} aria-hidden="true">
          {done ? <Check strokeWidth={3} /> : n}
        </span>
        <div className="stack gap-1 grow">
          <h2 id={`step-${n}`} className="t-h3 row gap-2">
            {icon}
            {title}
            {done && <span className="sr-only">(selesai)</span>}
          </h2>
          <p className="t-small">{desc}</p>
        </div>
      </header>
      <div className="ws-step-body">{children}</div>
    </section>
  )
}

export function KaderWorkspace() {
  const { id } = useParams()
  const { db, saveDraft, submitDraft } = useStore()
  const toast = useToast()
  const nav = useNavigate()
  const a = db.announcements.find((x) => x.id === id)
  const d = a?.draft
  const me = db.session!.actorId

  const [easy, setEasy] = useState<EasyLine[]>(() => d?.easy ?? [])
  const [cues, setCues] = useState<Cue[]>(() => d?.cues ?? [])
  const [uploading, setUploading] = useState(false)
  const [fileErr, setFileErr] = useState('')
  const first = useRef(true)

  // Simpan otomatis 500 ms setelah berhenti mengetik.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!a) return
    const t = setTimeout(() => saveDraft(a.id, { easy, cues }), 500)
    return () => clearTimeout(t)
  }, [easy, cues]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!a || !d || d.kaderId !== me)
    return <Empty icon={<FileText />} title="Tugas tidak ditemukan" action={<Link to="/kader" className="btn btn-ghost">Kembali ke tugas</Link>} />

  const editable = a.stage === 'terjemahan' || a.stage === 'revisi'
  const easyDone = easy.filter((l) => l.text.trim()).length > 0
  const videoDone = !!d.video
  const cuesDone = cues.filter((c) => c.text.trim() && c.end > c.start).length > 0
  const ready = easyDone && videoDone && cuesDone

  async function onFile(f?: File) {
    setFileErr('')
    if (!f || !a || !d) return
    if (!f.type.startsWith('video/')) return setFileErr('Berkas harus berupa video (MP4 atau WebM).')
    if (f.size > MAX_MB * 1024 * 1024) return setFileErr(`Ukuran maksimal ${MAX_MB} MB. Kompres video lalu coba lagi.`)
    setUploading(true)
    const key = `${a.id}-v${d.no}-${Date.now()}`
    await putVideo(key, f)
    saveDraft(a.id, { video: `idb:${key}` })
    setUploading(false)
    toast('Video tersimpan')
  }

  const setLine = (i: number, patch: Partial<EasyLine>) => setEasy((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const setCue = (i: number, patch: Partial<Cue>) => setCues((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const lastEnd = cues.at(-1)?.end ?? 0

  return (
    <>
      <Link to="/kader" className="back-link">
        <ArrowLeft aria-hidden="true" />
        Tugas saya
      </Link>
      <PageHead title={a.title} desc={`${db.agencies.find((g) => g.id === a.agencyId)?.name} · versi ${d.no}`} actions={<StageBadge stage={a.stage} />} />

      {a.stage === 'revisi' && d.revisionNote && (
        <div className="callout callout-bad" role="note">
          <strong>Catatan gerbang mutu:</strong> {d.revisionNote}
        </div>
      )}

      <div className="ws-grid">
        <aside className="ws-source panel panel-pad stack gap-3">
          <h2 className="t-h3 row gap-2">
            <FileText aria-hidden="true" className="ic-20" />
            Naskah dari instansi
          </h2>
          <p className="ws-source-text">{d.sourceText}</p>
        </aside>

        <div className="stack gap-4">
          <Step n={1} done={easyDone} icon={<FileText aria-hidden="true" className="ic-20" />} title="Bahasa mudah" desc="Satu gagasan per baris. Kalimat pendek. Pilih ikon yang paling mewakili.">
            <ul className="easy-edit">
              {easy.map((l, i) => (
                <li key={i} className="easy-edit-row">
                  <label className="sr-only" htmlFor={`ic-${i}`}>
                    Ikon baris {i + 1}
                  </label>
                  <div className="icon-select">
                    <span aria-hidden="true">
                      <EasyIcon k={l.icon} size={20} />
                    </span>
                    <select id={`ic-${i}`} value={l.icon} onChange={(e) => setLine(i, { icon: e.target.value as IconKey })} disabled={!editable}>
                      {(Object.keys(ICONS) as IconKey[]).map((k) => (
                        <option key={k} value={k}>
                          {ICONS[k].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="sr-only" htmlFor={`tx-${i}`}>
                    Teks baris {i + 1}
                  </label>
                  <input id={`tx-${i}`} className="input" value={l.text} maxLength={120} onChange={(e) => setLine(i, { text: e.target.value })} disabled={!editable} placeholder="Contoh: Bawa Kartu Keluarga asli." />
                  <button type="button" className="icon-btn icon-btn-light" aria-label={`Hapus baris ${i + 1}`} onClick={() => setEasy((xs) => xs.filter((_, j) => j !== i))} disabled={!editable}>
                    <Trash2 aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            {editable && (
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setEasy((xs) => [...xs, { icon: 'info', text: '' }])}>
                <Plus aria-hidden="true" />
                Tambah baris
              </button>
            )}
          </Step>

          <Step n={2} done={videoDone} icon={<Video aria-hidden="true" className="ic-20" />} title="Video BISINDO" desc="Rekam tegak atau mendatar, latar polos, cahaya dari depan. Maksimal 80 MB.">
            {d.video && <VideoPlayer video={d.video} cues={cues} title={a.title} lazy={false} />}
            {editable && (
              <div className="row gap-3 wrap">
                <label className={`btn btn-ghost btn-sm ${uploading ? 'is-busy' : ''}`}>
                  <Upload aria-hidden="true" />
                  {uploading ? 'Menyimpan…' : d.video ? 'Ganti video' : 'Unggah video'}
                  <input type="file" accept="video/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} disabled={uploading} />
                </label>
                {!d.video && (
                  <button type="button" className="btn btn-quiet btn-sm" onClick={() => saveDraft(a.id, { video: 'media/contoh-bisindo.mp4' })}>
                    Pakai video contoh (demo)
                  </button>
                )}
              </div>
            )}
            {fileErr && <p className="error">{fileErr}</p>}
          </Step>

          <Step n={3} done={cuesDone} icon={<Captions aria-hidden="true" className="ic-20" />} title="Takarir (WebVTT)" desc="Teks yang tampil di video. Waktu dalam detik.">
            {cues.length > 0 && (
              <div className="cue-table" role="table" aria-label="Daftar takarir">
                <div className="cue-row cue-head" role="row">
                  <span role="columnheader">Mulai</span>
                  <span role="columnheader">Selesai</span>
                  <span role="columnheader">Teks</span>
                  <span role="columnheader">
                    <span className="sr-only">Aksi</span>
                  </span>
                </div>
                {cues.map((c, i) => (
                  <div className="cue-row" role="row" key={i}>
                    <input aria-label={`Mulai takarir ${i + 1}`} className="input t-num" type="number" step="0.1" min={0} value={c.start} onChange={(e) => setCue(i, { start: +e.target.value })} disabled={!editable} />
                    <input aria-label={`Selesai takarir ${i + 1}`} className="input t-num" type="number" step="0.1" min={0} value={c.end} aria-invalid={c.end <= c.start} onChange={(e) => setCue(i, { end: +e.target.value })} disabled={!editable} />
                    <input aria-label={`Teks takarir ${i + 1}`} className="input" value={c.text} onChange={(e) => setCue(i, { text: e.target.value })} disabled={!editable} />
                    <button type="button" className="icon-btn icon-btn-light" aria-label={`Hapus takarir ${i + 1}`} onClick={() => setCues((xs) => xs.filter((_, j) => j !== i))} disabled={!editable}>
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {editable && (
              <div className="row gap-3 wrap">
                <button type="button" className="btn btn-quiet btn-sm" onClick={() => setCues((xs) => [...xs, { start: lastEnd, end: +(lastEnd + 3).toFixed(1), text: '' }])}>
                  <Plus aria-hidden="true" />
                  Tambah takarir
                </button>
                {easyDone && (
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={() => {
                      setCues(easy.filter((l) => l.text.trim()).map((l, i) => ({ start: +(i * 3.2).toFixed(1), end: +((i + 1) * 3.2 - 0.2).toFixed(1), text: l.text })))
                      toast('Takarir dibuat dari bahasa mudah. Sesuaikan waktunya dengan video.')
                    }}
                  >
                    <Wand2 aria-hidden="true" />
                    Buat dari bahasa mudah
                  </button>
                )}
              </div>
            )}
          </Step>
        </div>
      </div>

      {editable && (
        <div className="submit-bar">
          <ul className="submit-checks" aria-label="Kelengkapan">
            <li className={easyDone ? 'ok' : ''}>Bahasa mudah</li>
            <li className={videoDone ? 'ok' : ''}>Video</li>
            <li className={cuesDone ? 'ok' : ''}>Takarir</li>
          </ul>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!ready}
            onClick={() => {
              saveDraft(a.id, { easy: easy.filter((l) => l.text.trim()), cues })
              submitDraft(a.id)
              toast('Terkirim ke gerbang mutu')
              nav('/kader')
            }}
          >
            <Send aria-hidden="true" />
            Kirim ke gerbang mutu
          </button>
        </div>
      )}
    </>
  )
}
