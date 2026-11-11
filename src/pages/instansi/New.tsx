import { Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHead } from '../../components/AppShell'
import { useToast } from '../../components/Toast'
import { useStore } from '../../data/store'
import { CATEGORIES, type Category } from '../../data/types'

const MIN = 40

export function InstansiNew() {
  const { db, createAnnouncement } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [validFrom, setFrom] = useState('')
  const [validUntil, setUntil] = useState('')
  const [text, setText] = useState('')
  const [tried, setTried] = useState(false)

  const errors = {
    title: !title.trim() ? 'Tulis judul pengumuman.' : '',
    validFrom: !validFrom ? 'Pilih tanggal mulai berlaku.' : '',
    validUntil: validUntil && validFrom && validUntil < validFrom ? 'Tanggal selesai tidak boleh sebelum tanggal mulai.' : '',
    text: text.trim().length < MIN ? `Naskah minimal ${MIN} karakter agar kader punya cukup konteks.` : '',
  }
  const ok = !Object.values(errors).some(Boolean)

  function submit(e: FormEvent) {
    e.preventDefault()
    setTried(true)
    if (!ok) {
      const first = (Object.keys(errors) as (keyof typeof errors)[]).find((k) => errors[k])
      document.getElementById(`f-${first}`)?.focus()
      return
    }
    const id = createAnnouncement(db.session!.actorId, { title: title.trim(), category, validFrom, validUntil, sourceText: text.trim() })
    toast('Naskah terkirim. Kader Tuli sudah ditugaskan.')
    nav(`/instansi/${id}`)
  }

  const err = (k: keyof typeof errors) =>
    tried && errors[k] ? (
      <p className="error" id={`e-${k}`}>
        {errors[k]}
      </p>
    ) : null
  const inv = (k: keyof typeof errors) => ({ 'aria-invalid': tried && !!errors[k], 'aria-describedby': tried && errors[k] ? `e-${k}` : undefined })

  return (
    <>
      <PageHead title="Unggah naskah" desc="Tulis seperti surat edaran biasa. Kader Tuli akan menyederhanakannya ke bahasa mudah dan BISINDO." />

      <form className="form-grid" onSubmit={submit} noValidate>
        <div className="panel panel-pad stack gap-5">
          <div className="field">
            <label htmlFor="f-title">Judul pengumuman</label>
            <input id="f-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Jadwal perekaman KTP-el keliling" maxLength={90} {...inv('title')} />
            {err('title')}
          </div>

          <div className="field">
            <label htmlFor="f-cat">Kategori layanan</label>
            <select id="f-cat" className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="two-col">
            <div className="field">
              <label htmlFor="f-validFrom">Mulai berlaku</label>
              <input id="f-validFrom" type="date" className="input" value={validFrom} onChange={(e) => setFrom(e.target.value)} {...inv('validFrom')} />
              {err('validFrom')}
            </div>
            <div className="field">
              <label htmlFor="f-validUntil">
                Berakhir <span className="hint">(opsional)</span>
              </label>
              <input id="f-validUntil" type="date" className="input" value={validUntil} min={validFrom || undefined} onChange={(e) => setUntil(e.target.value)} {...inv('validUntil')} />
              {err('validUntil')}
            </div>
          </div>

          <div className="field">
            <label htmlFor="f-text">Isi naskah</label>
            <textarea id="f-text" className="textarea" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Siapa, apa, kapan, di mana, syarat yang perlu dibawa, dan biaya." {...inv('text')} />
            <div className="row between">
              {err('text') ?? <span className="hint">Sertakan tanggal, jam, tempat, syarat, dan biaya.</span>}
              <span className="hint t-num">{text.trim().length} karakter</span>
            </div>
          </div>
        </div>

        <aside className="stack gap-4">
          <div className="panel panel-pad stack gap-3 tip">
            <h2 className="t-h3">Setelah dikirim</h2>
            <ol className="tip-list">
              <li>Sistem menugaskan kader Tuli dengan antrean paling sedikit.</li>
              <li>Kader menulis bahasa mudah, merekam video, dan memberi takarir.</li>
              <li>Penilai Tuli menilai. Video terbit bila {db.settings.thresholdPct}% paham.</li>
              <li>Anda menerima kode QR siap cetak.</li>
            </ol>
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block">
            <Send aria-hidden="true" />
            Kirim ke kader
          </button>
        </aside>
      </form>
    </>
  )
}
