import { FormEvent, useEffect, useState } from 'react'
import { api, TrainingPlan, TrainingPlanPayload } from '../api'
import { asText, emptyTrainingPlan, formatDate, trainingPlanToPayload } from '../fitness'

export default function TrainingPlansPage() {
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [planForm, setPlanForm] = useState<TrainingPlanPayload>(emptyTrainingPlan)
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadPlans() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.trainingPlans.list()
      setPlans(response.plans)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPlans()
  }, [])

  function resetForm() {
    setPlanForm(emptyTrainingPlan)
    setEditingPlanId(null)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const action = editingPlanId == null ? api.trainingPlans.create(planForm) : api.trainingPlans.update(editingPlanId, planForm)
    void action
      .then(async () => {
        await loadPlans()
        resetForm()
        setMessage(editingPlanId == null ? 'Tréninkový plán byl vytvořen.' : 'Tréninkový plán byl upraven.')
      })
      .catch((err: Error) => setError(err.message))
  }

  const onEdit = (plan: TrainingPlan) => {
    setPlanForm(trainingPlanToPayload(plan))
    setEditingPlanId(plan.id)
    setMessage(null)
    setError(null)
  }

  const onDelete = (planId: number) => {
    setError(null)
    setMessage(null)
    void api.trainingPlans
      .delete(planId)
      .then(async () => {
        await loadPlans()
        if (editingPlanId === planId) resetForm()
        setMessage('Tréninkový plán byl smazán.')
      })
      .catch((err: Error) => setError(err.message))
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Tréninkové plány</div>
          <h1>Přehled plánů, bloků a navazujících tréninků</h1>
          <p>Na této stránce spravuješ samotné plány. Jednotlivé tréninky pak eviduješ v samostatné sekci Tréninky.</p>
        </div>
      </div>

      {loading ? <div className="loading">Načítám tréninkové plány...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{editingPlanId == null ? 'Nový plán' : 'Editace plánu'}</div>
              <h2>{editingPlanId == null ? 'Vytvořit nový tréninkový plán' : 'Upravit vybraný tréninkový plán'}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={onSubmit}>
            <div className="form-group form-span-full">
              <label htmlFor="plan-title">Název plánu</label>
              <input id="plan-title" value={planForm.title} onChange={event => setPlanForm(current => ({ ...current, title: event.target.value }))} required />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="plan-focus">Zaměření</label>
              <input id="plan-focus" value={planForm.focus ?? ''} onChange={event => setPlanForm(current => ({ ...current, focus: asText(event.target.value) }))} />
            </div>
            <div className="form-group">
              <label htmlFor="plan-start">Začátek</label>
              <input id="plan-start" type="date" value={planForm.startDate} onChange={event => setPlanForm(current => ({ ...current, startDate: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="plan-end">Konec</label>
              <input id="plan-end" type="date" value={planForm.endDate ?? ''} onChange={event => setPlanForm(current => ({ ...current, endDate: asText(event.target.value) }))} />
            </div>
            <div className="form-group form-span-full">
              <label className="checkbox-row">
                <input type="checkbox" checked={planForm.isActive} onChange={event => setPlanForm(current => ({ ...current, isActive: event.target.checked }))} />
                <span>Plán je aktivní</span>
              </label>
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="plan-notes">Poznámky</label>
              <textarea id="plan-notes" value={planForm.notes ?? ''} onChange={event => setPlanForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </div>
            <div className="form-actions form-span-full">
              <button type="submit" className="btn btn-primary">{editingPlanId == null ? 'Vytvořit plán' : 'Uložit změny'}</button>
              {editingPlanId != null ? (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Zrušit editaci</button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Seznam</div>
              <h2>Všechny tréninkové plány</h2>
            </div>
          </div>

          {plans.length === 0 ? (
            <div className="empty">Zatím nejsou žádné tréninkové plány.</div>
          ) : (
            <div className="stack-list">
              {plans.map(plan => (
                <article key={plan.id} className="stack-item">
                  <div className="stack-item-topline">
                    <strong>{plan.title}</strong>
                    <span className={plan.isActive ? 'badge badge-active' : 'badge badge-warning'}>{plan.isActive ? 'Aktivní' : 'Neaktivní'}</span>
                  </div>
                  <p>{plan.focus ?? plan.notes ?? 'Bez doplňujících poznámek.'}</p>
                  <div className="stack-item-meta">
                    <span>{formatDate(plan.startDate)} – {plan.endDate ? formatDate(plan.endDate) : 'bez konce'}</span>
                    <span>{plan.plannedWorkoutCount} plánovaných / {plan.completedWorkoutCount} odcvičených</span>
                  </div>
                  <div className="table-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(plan)}>Upravit</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(plan.id)}>Smazat</button>
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
