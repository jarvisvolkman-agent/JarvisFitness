import { FormEvent, useEffect, useState } from 'react'
import { api, CheckIn, CheckInPayload } from '../api'
import { asNumber, asText, checkInToPayload, createEmptyCheckIn, describeCheckIn, formatDate } from '../fitness'

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [checkInForm, setCheckInForm] = useState<CheckInPayload>(createEmptyCheckIn())
  const [editingCheckInId, setEditingCheckInId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadCheckIns() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.checkIns.list()
      setCheckIns(response.checkIns)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCheckIns()
  }, [])

  function resetForm() {
    setCheckInForm(createEmptyCheckIn())
    setEditingCheckInId(null)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const action = editingCheckInId == null ? api.checkIns.create(checkInForm) : api.checkIns.update(editingCheckInId, checkInForm)
    void action
      .then(async () => {
        await loadCheckIns()
        resetForm()
        setMessage(editingCheckInId == null ? 'Kontrola byla vytvořena.' : 'Kontrola byla upravena.')
      })
      .catch((err: Error) => setError(err.message))
  }

  const onEdit = (checkIn: CheckIn) => {
    setCheckInForm(checkInToPayload(checkIn))
    setEditingCheckInId(checkIn.id)
    setMessage(null)
    setError(null)
  }

  const onDelete = (checkInId: number) => {
    setError(null)
    setMessage(null)
    void api.checkIns
      .delete(checkInId)
      .then(async () => {
        await loadCheckIns()
        if (editingCheckInId === checkInId) resetForm()
        setMessage('Kontrola byla smazána.')
      })
      .catch((err: Error) => setError(err.message))
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Kontroly</div>
          <h1>Seznam, tvorba a editace check-inů</h1>
          <p>Kontroly drží průběžnou realitu: hmotnost, příjem, trénink, energii, dodržení a rychlé poznámky.</p>
        </div>
      </div>

      {loading ? <div className="loading">Načítám kontroly...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{editingCheckInId == null ? 'Nová kontrola' : 'Editace kontroly'}</div>
              <h2>{editingCheckInId == null ? 'Zapsat novou kontrolu' : 'Upravit vybranou kontrolu'}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="checkin-date">Datum kontroly</label>
              <input id="checkin-date" type="date" value={checkInForm.checkInDate} onChange={event => setCheckInForm(current => ({ ...current, checkInDate: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="checkin-weight">Hmotnost (kg)</label>
              <input id="checkin-weight" inputMode="decimal" value={checkInForm.weightKg ?? ''} onChange={event => setCheckInForm(current => ({ ...current, weightKg: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group">
              <label htmlFor="checkin-calories">Průměr kalorií</label>
              <input id="checkin-calories" inputMode="numeric" value={checkInForm.caloriesAvg ?? ''} onChange={event => setCheckInForm(current => ({ ...current, caloriesAvg: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group">
              <label htmlFor="checkin-protein">Průměr bílkovin (g)</label>
              <input id="checkin-protein" inputMode="numeric" value={checkInForm.proteinGAvg ?? ''} onChange={event => setCheckInForm(current => ({ ...current, proteinGAvg: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group">
              <label htmlFor="checkin-training">Počet tréninků</label>
              <input id="checkin-training" inputMode="numeric" value={checkInForm.trainingSessions ?? ''} onChange={event => setCheckInForm(current => ({ ...current, trainingSessions: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group">
              <label htmlFor="checkin-energy">Energie (1-10)</label>
              <input id="checkin-energy" inputMode="numeric" value={checkInForm.energy ?? ''} onChange={event => setCheckInForm(current => ({ ...current, energy: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group">
              <label htmlFor="checkin-adherence">Dodržení (1-10)</label>
              <input id="checkin-adherence" inputMode="numeric" value={checkInForm.adherence ?? ''} onChange={event => setCheckInForm(current => ({ ...current, adherence: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="checkin-notes">Poznámky</label>
              <textarea id="checkin-notes" value={checkInForm.notes ?? ''} onChange={event => setCheckInForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </div>
            <div className="form-actions form-span-full">
              <button type="submit" className="btn btn-primary">
                {editingCheckInId == null ? 'Vytvořit kontrolu' : 'Uložit změny'}
              </button>
              {editingCheckInId != null ? (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Zrušit editaci
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Historie</div>
              <h2>Všechny kontroly</h2>
            </div>
          </div>

          {checkIns.length === 0 ? (
            <div className="empty">Zatím nejsou žádné kontroly.</div>
          ) : (
            <div className="stack-list">
              {checkIns.map(checkIn => (
                <article key={checkIn.id} className="stack-item">
                  <div className="stack-item-topline">
                    <strong>{formatDate(checkIn.checkInDate)}</strong>
                    <span className="badge badge-info">{describeCheckIn(checkIn)}</span>
                  </div>
                  <p>{checkIn.notes ?? 'Bez poznámek.'}</p>
                  <div className="stack-item-meta">
                    <span>Vytvořeno {formatDate(checkIn.createdAt)}</span>
                  </div>
                  <div className="table-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(checkIn)}>
                      Upravit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(checkIn.id)}>
                      Smazat
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
