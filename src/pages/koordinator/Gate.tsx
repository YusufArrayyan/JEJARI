import { Minus, Plus, Save } from 'lucide-react'
import { useState } from 'react'
import { PageHead } from '../../components/AppShell'
import { useToast } from '../../components/Toast'
import { useStore } from '../../data/store'
import { needed, passProbability } from '../../lib/gate'

const TRUE_P = [0.6, 0.7, 0.8, 0.9]

function Stepper({ id, label, value, min, max, step, onChange, suffix }: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; suffix?: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="stepper">
        <button type="button" className="icon-btn icon-btn-light" aria-label={`Kurangi ${label}`} onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min}>
          <Minus aria-hidden="true" />
        </button>
        <input id={id} className="input t-num" type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Math.min(max, Math.max(min, +e.target.value || min)))} />
        {suffix && <span className="stepper-suffix">{suffix}</span>}
        <button type="button" className="icon-btn icon-btn-light" aria-label={`Tambah ${label}`} onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max}>
          <Plus aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function Gate() {
  const { db, setSettings } = useStore()
  const toast = useToast()
  const [raters, setRaters] = useState(db.settings.raters)
  const [th, setTh] = useState(db.settings.thresholdPct)
  const k = needed(raters, th)
  const dirty = raters !== db.settings.raters || th !== db.settings.thresholdPct

  return (
    <>
      <PageHead title="Gerbang mutu" desc="Atur jumlah penilai Tuli per video dan ambang kelulusan. Perubahan berlaku untuk video yang sedang dinilai." />

      <div className="gate-grid">
        <form
          className="panel panel-pad stack gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            setSettings({ raters, thresholdPct: th })
            toast('Pengaturan gerbang mutu disimpan')
          }}
        >
          <Stepper id="raters" label="Penilai per video" value={raters} min={3} max={30} step={1} onChange={setRaters} />
          <Stepper id="th" label="Ambang paham" value={th} min={50} max={100} step={5} onChange={setTh} suffix="%" />
          <p className="gate-rule">
            Video lolos bila minimal <strong className="t-num">{k}</strong> dari <strong className="t-num">{raters}</strong> penilai memilih “paham”.
          </p>
          <button type="submit" className="btn btn-primary" disabled={!dirty}>
            <Save aria-hidden="true" />
            Simpan pengaturan
          </button>
        </form>

        <section className="panel panel-pad stack gap-4" aria-labelledby="sim-h">
          <div className="stack gap-1">
            <h2 id="sim-h" className="t-h2">
              Seberapa ketat aturan ini?
            </h2>
            <p className="t-body">Peluang sebuah video lolos, bergantung pada keterpahaman sebenarnya di kalangan pengguna Tuli.</p>
          </div>
          <ul className="prob-list">
            {TRUE_P.map((p) => {
              const prob = passProbability(raters, th, p)
              const good = p * 100 >= th
              return (
                <li key={p} className="prob-row">
                  <span className="prob-label">
                    Dipahami <strong className="t-num">{Math.round(p * 100)}%</strong> pengguna
                  </span>
                  <span className="prob-bar" aria-hidden="true">
                    <span className={good ? 'prob-fill-ok' : 'prob-fill-bad'} style={{ transform: `scaleX(${prob})` }} />
                  </span>
                  <span className="prob-val t-num">{(prob * 100).toFixed(1).replace('.', ',')}%</span>
                </li>
              )
            })}
          </ul>
          <p className="t-small">
            Hijau: video yang memang layak. Merah: video di bawah ambang yang masih bisa lolos secara kebetulan. Esai mencatat, dengan 10 penilai dan ambang 8, video yang dipahami 70% pengguna tetap lolos dengan peluang 38,3%. Menambah penilai menurunkan peluang ini.
          </p>
        </section>
      </div>
    </>
  )
}
