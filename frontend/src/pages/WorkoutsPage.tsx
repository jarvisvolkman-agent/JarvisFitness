import { FormEvent, useEffect, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { api, TrainingPlan, WorkoutEntry, WorkoutEntryPayload } from '../api'
import { asNumber, asText, describeWorkout, emptyWorkout, formatDate, workoutBadgeClass, workoutStatuses, workoutToPayload } from '../fitness'
import { workoutStatusLabels } from '../i18n'

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([])
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [workoutForm, setWorkoutForm] = useState<WorkoutEntryPayload>(emptyWorkout)
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WorkoutEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
    setEditingWorkoutId(null)
    setWorkoutForm(emptyWorkout)
  }

  function closeForm() {
    if (isSaving) return
    setIsFormOpen(false)
    resetForm()
  }

  function openCreateModal() {
    setWorkoutForm(emptyWorkout)
    setEditingWorkoutId(null)
    setMessage(null)
    setError(null)
    setIsFormOpen(true)
  }

  function openEditModal(workout: WorkoutEntry) {
    setWorkoutForm(workoutToPayload(workout))
    setEditingWorkoutId(workout.id)
    setMessage(null)
    setError(null)
    setIsFormOpen(true)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSaving(true)

    const action = editingWorkoutId == null ? api.workouts.create(workoutForm) : api.workouts.update(editingWorkoutId, workoutForm)
    void action
      .then(async () => {
        await loadData()
        setIsFormOpen(false)
        resetForm()
        setMessage(editingWorkoutId == null ? 'Trénink byl vytvořen.' : 'Trénink byl upraven.')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsSaving(false))
  }

  const onDelete = () => {
    if (!deleteTarget) return

    setError(null)
    setMessage(null)
    setIsDeleting(true)
    void api.workouts
      .delete(deleteTarget.id)
      .then(async () => {
        await loadData()
        if (editingWorkoutId === deleteTarget.id) {
          setIsFormOpen(false)
          resetForm()
        }
        setDeleteTarget(null)
        setMessage('Trénink byl smazán.')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsDeleting(false))
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
          <p>Zakládání, úpravy i mazání běží v modálních oknech, aby seznamy zůstaly přehledné.</p>
        </div>
        <div className="actions-right">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            Nový trénink
          </button>
        </div>
      </div>

      {loading ? <div className="loading">Načítám tréninky...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Souhrn</div>
              <h2>Rozdělení záznamů</h2>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={openCreateModal}>
              Přidat trénink
            </button>
          </div>
          <div className="detail-grid">
            <div className="detail-card">
              <span>Plánované</span>
              <strong>{planned.length}</strong>
            </div>
            <div className="detail-card">
              <span>Odcvičené</span>
              <strong>{completed.length}</strong>
            </div>
            <div className="detail-card">
              <span>Nevyšly</span>
              <strong>{missed.length}</strong>
            </div>
          </div>
        </article>

        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Práce s modalem</div>
              <h2>Rychlé ovládání</h2>
            </div>
          </div>
          <div className="stack-list">
            <div className="stack-item">
              <strong>Vytvoření</strong>
              <p>Nový trénink otevře plný formulář v modalu bez opuštění stránky.</p>
            </div>
            <div className="stack-item">
              <strong>Úprava</strong>
              <p>Každá karta má akce pro úpravu a mazání s potvrzením.</p>
            </div>
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

          {planned.length === 0 ? (
            <div className="empty">Zatím nejsou žádné plánované tréninky.</div>
          ) : (
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
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEditModal(workout)}>
                      Upravit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(workout)}>
                      Smazat
                    </button>
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

          {completed.length === 0 ? (
            <div className="empty">Zatím nejsou žádné odcvičené tréninky.</div>
          ) : (
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
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEditModal(workout)}>
                      Upravit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(workout)}>
                      Smazat
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>

      {missed.length > 0 ? (
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Nevyšlé tréninky</div>
              <h2>Záznamy označené jako neuskutečněné</h2>
            </div>
          </div>
          <div className="stack-list">
            {missed.map(workout => (
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
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEditModal(workout)}>
                    Upravit
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(workout)}>
                    Smazat
                  </button>
                </div>
              </article>
            ))}
          </div>
        </article>
      ) : null}

      <Modal
        isOpen={isFormOpen}
        title={editingWorkoutId == null ? 'Nový trénink' : 'Upravit trénink'}
        description={editingWorkoutId == null ? 'Vyplň plánovaný nebo odcvičený trénink a ulož záznam.' : 'Uprav stav, datum nebo další detaily vybraného tréninku.'}
        onClose={closeForm}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={isSaving}>
              Zrušit
            </button>
            <button type="submit" form="workout-form" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Ukládám...' : editingWorkoutId == null ? 'Vytvořit trénink' : 'Uložit změny'}
            </button>
          </>
        }
      >
        <form id="workout-form" className="form-grid" onSubmit={onSubmit}>
          <div className="form-group form-span-full">
            <label htmlFor="workout-title">Název tréninku</label>
            <input id="workout-title" value={workoutForm.title} onChange={event => setWorkoutForm(current => ({ ...current, title: event.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="workout-plan">Tréninkový plán</label>
            <select id="workout-plan" value={workoutForm.trainingPlanId ?? ''} onChange={event => setWorkoutForm(current => ({ ...current, trainingPlanId: event.target.value === '' ? null : Number(event.target.value) }))}>
              <option value="">Bez plánu</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
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
                <option key={status} value={status}>
                  {workoutStatusLabels[status]}
                </option>
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
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget != null}
        title="Smazat trénink"
        description={deleteTarget ? `Opravdu chceš smazat trénink „${deleteTarget.title}“? Tuto akci nejde vrátit zpět.` : ''}
        confirmLabel="Smazat trénink"
        tone="danger"
        busy={isDeleting}
        onConfirm={onDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  )
}
