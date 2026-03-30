import { FormEvent, useEffect, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { api, Goal, GoalPayload } from '../api'
import { asNumber, asText, emptyGoal, formatDate, goalBadgeClass, goalCategories, goalStatuses, goalToPayload } from '../fitness'
import { formatGoalTarget, goalCategoryLabels, goalStatusLabels } from '../i18n'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalForm, setGoalForm] = useState<GoalPayload>(emptyGoal)
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadGoals() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.goals.list()
      setGoals(response.goals)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadGoals()
  }, [])

  function resetForm() {
    setEditingGoalId(null)
    setGoalForm(emptyGoal)
  }

  function closeForm() {
    if (isSaving) return
    setIsFormOpen(false)
    resetForm()
  }

  function openCreateModal() {
    setGoalForm(emptyGoal)
    setEditingGoalId(null)
    setMessage(null)
    setError(null)
    setIsFormOpen(true)
  }

  function openEditModal(goal: Goal) {
    setGoalForm(goalToPayload(goal))
    setEditingGoalId(goal.id)
    setMessage(null)
    setError(null)
    setIsFormOpen(true)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSaving(true)

    const action = editingGoalId == null ? api.goals.create(goalForm) : api.goals.update(editingGoalId, goalForm)
    void action
      .then(async () => {
        await loadGoals()
        setIsFormOpen(false)
        resetForm()
        setMessage(editingGoalId == null ? 'Cíl byl vytvořen.' : 'Cíl byl upraven.')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsSaving(false))
  }

  const onDelete = () => {
    if (!deleteTarget) return

    setError(null)
    setMessage(null)
    setIsDeleting(true)
    void api.goals
      .delete(deleteTarget.id)
      .then(async () => {
        await loadGoals()
        if (editingGoalId === deleteTarget.id) {
          setIsFormOpen(false)
          resetForm()
        }
        setDeleteTarget(null)
        setMessage('Cíl byl smazán.')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsDeleting(false))
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Cíle</div>
          <h1>Seznam, tvorba a editace cílů</h1>
          <p>Všechny úpravy probíhají v modálním okně, seznam zůstává čistý a dobře čitelný.</p>
        </div>
        <div className="actions-right">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            Nový cíl
          </button>
        </div>
      </div>

      {loading ? <div className="loading">Načítám cíle...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <article className="card section-card">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Seznam</div>
            <h2>Všechny cíle</h2>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={openCreateModal}>
            Přidat cíl
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="empty">Zatím nejsou žádné cíle.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Název</th>
                  <th>Kategorie</th>
                  <th>Cíl</th>
                  <th>Stav</th>
                  <th>Aktualizace</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {goals.map(goal => (
                  <tr key={goal.id}>
                    <td>
                      <div className="table-title">{goal.title}</div>
                      <div className="table-subtitle">{goal.notes ?? 'Bez doplňujících poznámek'}</div>
                    </td>
                    <td>{goalCategoryLabels[goal.category]}</td>
                    <td>{formatGoalTarget(goal)}</td>
                    <td>
                      <span className={goalBadgeClass(goal.status)}>{goalStatusLabels[goal.status]}</span>
                    </td>
                    <td>{formatDate(goal.updatedAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEditModal(goal)}>
                          Upravit
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(goal)}>
                          Smazat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <Modal
        isOpen={isFormOpen}
        title={editingGoalId == null ? 'Nový cíl' : 'Upravit cíl'}
        description={editingGoalId == null ? 'Vyplň základní parametry cíle a potvrď vytvoření.' : 'Uprav zvolený cíl a změny potvrď uložením.'}
        onClose={closeForm}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={isSaving}>
              Zrušit
            </button>
            <button type="submit" form="goal-form" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Ukládám...' : editingGoalId == null ? 'Vytvořit cíl' : 'Uložit změny'}
            </button>
          </>
        }
      >
        <form id="goal-form" className="form-grid" onSubmit={onSubmit}>
          <div className="form-group form-span-full">
            <label htmlFor="goal-title">Název cíle</label>
            <input id="goal-title" value={goalForm.title} onChange={event => setGoalForm(current => ({ ...current, title: event.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="goal-category">Kategorie</label>
            <select id="goal-category" value={goalForm.category} onChange={event => setGoalForm(current => ({ ...current, category: event.target.value as GoalPayload['category'] }))}>
              {goalCategories.map(category => (
                <option key={category} value={category}>
                  {goalCategoryLabels[category]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="goal-status">Stav</label>
            <select id="goal-status" value={goalForm.status} onChange={event => setGoalForm(current => ({ ...current, status: event.target.value as GoalPayload['status'] }))}>
              {goalStatuses.map(status => (
                <option key={status} value={status}>
                  {goalStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="goal-target">Cílová hodnota</label>
            <input id="goal-target" inputMode="decimal" value={goalForm.targetValue ?? ''} onChange={event => setGoalForm(current => ({ ...current, targetValue: asNumber(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="goal-unit">Jednotka</label>
            <input id="goal-unit" value={goalForm.unit ?? ''} onChange={event => setGoalForm(current => ({ ...current, unit: asText(event.target.value) }))} />
          </div>
          <div className="form-group form-span-full">
            <label htmlFor="goal-timeframe">Období</label>
            <input id="goal-timeframe" value={goalForm.timeframe ?? ''} onChange={event => setGoalForm(current => ({ ...current, timeframe: asText(event.target.value) }))} />
          </div>
          <div className="form-group form-span-full">
            <label htmlFor="goal-notes">Poznámky</label>
            <textarea id="goal-notes" value={goalForm.notes ?? ''} onChange={event => setGoalForm(current => ({ ...current, notes: asText(event.target.value) }))} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget != null}
        title="Smazat cíl"
        description={deleteTarget ? `Opravdu chceš smazat cíl „${deleteTarget.title}“? Tuto akci nejde vrátit zpět.` : ''}
        confirmLabel="Smazat cíl"
        tone="danger"
        busy={isDeleting}
        onConfirm={onDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  )
}
