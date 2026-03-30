import { FormEvent, useEffect, useState } from 'react'
import { api, TrainingPlan, WorkoutEntry, WorkoutEntryPayload } from '../api'
import { asNumber, asText, describeWorkout, emptyWorkout, formatDate, workoutBadgeClass, workoutStatuses, workoutToPayload } from '../fitness'
import { workoutStatusLabels } from '../i18n'

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([])
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [workoutForm, setWorkoutForm] = useState<WorkoutEntryPayload>(emptyWorkout)
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [workoutsResponse, plansResponse] = await Promise.all([api.workouts.list(), api.trainingPlans.list()])
      setWorkouts(workoutsResponse.workouts)
      setPlans(plansResponse.plans)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  function resetForm() {
    setWorkoutForm(emptyWorkout)
    setEditingWorkoutId(null)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const action = editingWorkoutId == null ? api.workouts.create(workoutForm) : api.workouts.update(editingWorkoutId, workoutForm)
    void action
      .then(async () => {
        await loadData()
        resetForm()
        setMessage(editingWorkoutId == null ? 'Trénink byl vytvořen.' : 'Trénink byl upraven.')
      })
      .catch((err: Error) => setError(err.message))
  }

  const onEdit = (workout: WorkoutEntry) => {
    setWorkoutForm(workoutToPayload(workout))
    setEditingWorkoutId(workout.id)
    setMessage(null)
    setError(null)
  }

  const onDelete = (workoutId: number) => {
    setError(null)
    setMessage(null)
    void api.workouts
      .delete(workoutId)
      .then(async () => {
        await loadData()
        if (editingWorkoutId === workoutId) resetForm()
        setMessage('Trénink byl smazán.')
      })
      .catch((err: Error) => setError(err.message))
  }

  const planned = workouts.filter(workout => workout.status === 'Planned')
  const completed = workouts.filter(workout => workout.status === 'Completed')
  const missed = workouts.filter(workout => workout.status === 'Missed')

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Tréninky</div>
          <h1>Plánování i evidence tréninků na jednom místě</h1>
          <p>Každý záznam může být plánovaný, odcvičený nebo označený jako neuskutečněný. K plánu ho můžeš přiřadit, ale nemusíš.</p>
        </div>
      </div>

      {loading ? <div className="loading">Načítám tréninky...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{editingWorkoutId == null ? 'Nový trénink' : 'Editace tréninku'}</div>
              <h2>{editingWorkoutId == null ? 'Vytvořit nový trénink' : 'Upravit vybraný trénink'}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={onSubmit}>
            <div className="form-group form-span-full">
              <label htmlFor="workout-title">Název tréninku</label>
              <input id="workout-title" value={workoutForm.title} onChange={event => setWorkoutForm(current => ({ ...current, title: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="workout-plan">Tréninkový plán</label>
              <select id="workout-plan" value={workoutForm.trainingPlanId ?? ''} onChange={event => setWorkoutForm(current => ({ ...current, trainingPlanId: event.target.value === '' ? null : Number(event.target.value) }))}>
                <option value="">Bez plánu</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="workout-type">Typ tréninku</label>
              <input id="workout-type" value={workoutForm.workoutType ?? ''} onChange={event => setWorkoutForm(current => ({ ...current, workoutType: asText(event.target.value) }))} placeholder="např. Síla, běh, mobilita" />
            </div>
            <div className="form-group">
              <label htmlFor="workout-status">Stav</label>
              <select id="workout-status" value={workoutForm.status} onChange={event => setWorkoutForm(current => ({ ...current, status: event.target.value as WorkoutEntryPayload['status'] }))}>
                {workoutStatuses.map(status => (
                  <option key={status} value={status}>{workoutStatusLabels[status]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="workout-duration">Délka (min)</label>
              <input id="workout-duration" inputMode="numeric" value={workoutForm.durationMinutes ?? ''} onChange={event => setWorkoutForm(current => ({ ...current, durationMinutes: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group">
              <label htmlFor="workout-scheduled">Plánované datum</label>
              <input id="workout-scheduled" type="date" value={workoutForm.scheduledDate} onChange={event => setWorkoutForm(current => ({ ...current, scheduledDate: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="workout-completed">Datum odcvičení</label>
              <input id="workout-completed" type="date" value={workoutForm.completedDate ?? ''} onChange={event => setWorkoutForm(current => ({ ...current, completedDate: asText(event.target.value) }))} />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="workout-notes">Poznámky</label>
              <textarea id="workout-notes" value={workoutForm.notes ?? ''} onChange={event => setWorkoutForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </div>
            <div className="form-actions form-span-full">
              <button type="submit" className="btn btn-primary">{editingWorkoutId == null ? 'Vytvořit trénink' : 'Uložit změny'}</button>
              {editingWorkoutId != null ? <button type="button" className="btn btn-secondary" onClick={resetForm}>Zrušit editaci</button> : null}
            </div>
          </form>
        </article>

        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Souhrn</div>
              <h2>Rozdělení záznamů</h2>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-card"><span>Plánované</span><strong>{planned.length}</strong></div>
            <div className="detail-card"><span>Odcvičené</span><strong>{completed.length}</strong></div>
            <div className="detail-card"><span>Nevyšly</span><strong>{missed.length}</strong></div>
          </div>
        </article>
      </div>

      <div className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Plánované tréninky</div>
              <h2>Přehled budoucích nebo neuzavřených jednotek</h2>
            </div>
          </div>

          {planned.length === 0 ? <div className="empty">Zatím nejsou žádné plánované tréninky.</div> : (
            <div className="stack-list">
              {planned.map(workout => (
                <article key={workout.id} className="stack-item">
                  <div className="stack-item-topline">
                    <strong>{workout.title}</strong>
                    <span className={workoutBadgeClass(workout.status)}>{formatDate(workout.scheduledDate)}</span>
                  </div>
                  <p>{workout.notes ?? 'Bez poznámek.'}</p>
                  <div className="stack-item-meta">
                    <span>{describeWorkout(workout)}</span>
                    <span>{workout.trainingPlanTitle ?? 'Bez plánu'}</span>
                  </div>
                  <div className="table-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(workout)}>Upravit</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(workout.id)}>Smazat</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Evidence odcvičených tréninků</div>
              <h2>Historie skutečně dokončených jednotek</h2>
            </div>
          </div>

          {completed.length === 0 ? <div className="empty">Zatím nejsou žádné odcvičené tréninky.</div> : (
            <div className="stack-list">
              {completed.map(workout => (
                <article key={workout.id} className="stack-item">
                  <div className="stack-item-topline">
                    <strong>{workout.title}</strong>
                    <span className={workoutBadgeClass(workout.status)}>{formatDate(workout.completedDate ?? workout.scheduledDate)}</span>
                  </div>
                  <p>{workout.notes ?? 'Bez poznámek.'}</p>
                  <div className="stack-item-meta">
                    <span>{describeWorkout(workout)}</span>
                    <span>{workout.trainingPlanTitle ?? 'Bez plánu'}</span>
                  </div>
                  <div className="table-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(workout)}>Upravit</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(workout.id)}>Smazat</button>
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
