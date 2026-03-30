import { FormEvent, useEffect, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { api, CheckIn, CheckInPayload } from '../api'
import { asNumber, asText, checkInToPayload, createEmptyCheckIn, describeCheckIn, formatDate } from '../fitness'

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [checkInForm, setCheckInForm] = useState<CheckInPayload>(createEmptyCheckIn())
  const [editingCheckInId, setEditingCheckInId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CheckIn | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
    setEditingCheckInId(null)
    setCheckInForm(createEmptyCheckIn())
  }

  function closeForm() {
    if (isSaving) return
    setIsFormOpen(false)
    resetForm()
  }

  function openCreateModal() {
    setCheckInForm(createEmptyCheckIn())
    setEditingCheckInId(null)
    setMessage(null)
    setError(null)
    setIsFormOpen(true)
  }

  function openEditModal(checkIn: CheckIn) {
    setCheckInForm(checkInToPayload(checkIn))
    setEditingCheckInId(checkIn.id)
    setMessage(null)
    setError(null)
    setIsFormOpen(true)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSaving(true)

    const action = editingCheckInId == null ? api.checkIns.create(checkInForm) : api.checkIns.update(editingCheckInId, checkInForm)
    void action
      .then(async () => {
        await loadCheckIns()
        setIsFormOpen(false)
        resetForm()
        setMessage(editingCheckInId == null ? 'Kontrola byla vytvořena.' : 'Kontrola byla upravena.')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsSaving(false))
  }

  const onDelete = () => {
    if (!deleteTarget) return

    setError(null)
    setMessage(null)
    setIsDeleting(true)
    void api.checkIns
      .delete(deleteTarget.id)
      .then(async () => {
        await loadCheckIns()
        if (editingCheckInId === deleteTarget.id) {
          setIsFormOpen(false)
          resetForm()
        }
        setDeleteTarget(null)
        setMessage('Kontrola byla smazána.')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsDeleting(false))
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Kontroly</div>
          <h1>Seznam, tvorba a editace check-inů</h1>
          <p>Kontroly drží průběžnou realitu a všechny změny se řeší přes modální formuláře.</p>
        </div>
        <div className="actions-right">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            Nová kontrola
          </button>
        </div>
      </div>

      {loading ? <div className="loading">Načítám kontroly...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <article className="card section-card">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Historie</div>
            <h2>Všechny kontroly</h2>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={openCreateModal}>
            Přidat kontrolu
          </button>
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
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEditModal(checkIn)}>
                    Upravit
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(checkIn)}>
                    Smazat
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>

      <Modal
        isOpen={isFormOpen}
        title={editingCheckInId == null ? 'Nová kontrola' : 'Upravit kontrolu'}
        description={editingCheckInId == null ? 'Zapiš aktuální stav a ulož nový check-in.' : 'Aktualizuj zvolenou kontrolu a potvrď změny.'}
        onClose={closeForm}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={isSaving}>
              Zrušit
            </button>
            <button type="submit" form="check-in-form" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Ukládám...' : editingCheckInId == null ? 'Vytvořit kontrolu' : 'Uložit změny'}
            </button>
          </>
        }
      >
        <form id="check-in-form" className="form-grid" onSubmit={onSubmit}>
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
            <input id="checkin-energy" inputMode="numeric" min="1" max="10" value={checkInForm.energy ?? ''} onChange={event => setCheckInForm(current => ({ ...current, energy: asNumber(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="checkin-adherence">Dodržení (1-10)</label>
            <input id="checkin-adherence" inputMode="numeric" min="1" max="10" value={checkInForm.adherence ?? ''} onChange={event => setCheckInForm(current => ({ ...current, adherence: asNumber(event.target.value) }))} />
          </div>
          <div className="form-group form-span-full">
            <label htmlFor="checkin-notes">Poznámky</label>
            <textarea id="checkin-notes" value={checkInForm.notes ?? ''} onChange={event => setCheckInForm(current => ({ ...current, notes: asText(event.target.value) }))} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget != null}
        title="Smazat kontrolu"
        description={deleteTarget ? `Opravdu chceš smazat kontrolu z ${formatDate(deleteTarget.checkInDate)}? Tuto akci nejde vrátit zpět.` : ''}
        confirmLabel="Smazat kontrolu"
        tone="danger"
        busy={isDeleting}
        onConfirm={onDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  )
}
