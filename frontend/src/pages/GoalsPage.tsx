import { FormEvent, useEffect, useState } from 'react'
import { api, Goal, GoalPayload } from '../api'
import { asNumber, asText, emptyGoal, formatDate, goalBadgeClass, goalCategories, goalStatuses, goalToPayload } from '../fitness'
import { formatGoalTarget, goalCategoryLabels, goalStatusLabels } from '../i18n'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalForm, setGoalForm] = useState<GoalPayload>(emptyGoal)
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
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
    setGoalForm(emptyGoal)
    setEditingGoalId(null)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const action = editingGoalId == null ? api.goals.create(goalForm) : api.goals.update(editingGoalId, goalForm)
    void action
      .then(async () => {
        await loadGoals()
        resetForm()
        setMessage(editingGoalId == null ? 'Cíl byl vytvořen.' : 'Cíl byl upraven.')
      })
      .catch((err: Error) => setError(err.message))
  }

  const onEdit = (goal: Goal) => {
    setGoalForm(goalToPayload(goal))
    setEditingGoalId(goal.id)
    setMessage(null)
    setError(null)
  }

  const onDelete = (goalId: number) => {
    setError(null)
    setMessage(null)
    void api.goals
      .delete(goalId)
      .then(async () => {
        await loadGoals()
        if (editingGoalId === goalId) resetForm()
        setMessage('Cíl byl smazán.')
      })
      .catch((err: Error) => setError(err.message))
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Cíle</div>
          <h1>Seznam, tvorba a editace cílů</h1>
          <p>Každý cíl má vlastní detail v pracovním formuláři a přehledný operativní seznam vpravo.</p>
        </div>
      </div>

      {loading ? <div className="loading">Načítám cíle...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{editingGoalId == null ? 'Nový cíl' : 'Editace cíle'}</div>
              <h2>{editingGoalId == null ? 'Vytvořit nový cíl' : 'Upravit vybraný cíl'}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={onSubmit}>
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
            <div className="form-actions form-span-full">
              <button type="submit" className="btn btn-primary">
                {editingGoalId == null ? 'Vytvořit cíl' : 'Uložit změny'}
              </button>
              {editingGoalId != null ? (
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
              <div className="eyebrow">Seznam</div>
              <h2>Všechny cíle</h2>
            </div>
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
                    <th>Target</th>
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
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(goal)}>
                            Upravit
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(goal.id)}>
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
      </div>
    </section>
  )
}
