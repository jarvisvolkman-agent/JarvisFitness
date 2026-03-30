import { FormEvent, useEffect, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import { api, TrainingPlan, TrainingPlanPayload } from '../api'
import { asText, emptyTrainingPlan, formatDate, trainingPlanToPayload } from '../fitness'

export default function TrainingPlansPage() {
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [planForm, setPlanForm] = useState<TrainingPlanPayload>(emptyTrainingPlan)
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
    setEditingPlanId(null)
    setPlanForm(emptyTrainingPlan)
  }

  function closeForm() {
    if (isSaving) return
    setIsFormOpen(false)
    resetForm()
  }

  function openCreateModal() {
    setPlanForm(emptyTrainingPlan)
    setEditingPlanId(null)
    setMessage(null)
    setError(null)
    setIsFormOpen(true)
  }

  function openEditModal(plan: TrainingPlan) {
    setPlanForm(trainingPlanToPayload(plan))
    setEditingPlanId(plan.id)
    setMessage(null)
    setError(null)
    setIsFormOpen(true)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSaving(true)

    const action = editingPlanId == null ? api.trainingPlans.create(planForm) : api.trainingPlans.update(editingPlanId, planForm)
    void action
      .then(async () => {
        await loadPlans()
        setIsFormOpen(false)
        resetForm()
        setMessage(editingPlanId == null ? 'Tréninkový plán byl vytvořen.' : 'Tréninkový plán byl upraven.')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsSaving(false))
  }

  const onDelete = () => {
    if (!deleteTarget) return

    setError(null)
    setMessage(null)
    setIsDeleting(true)
    void api.trainingPlans
      .delete(deleteTarget.id)
      .then(async () => {
        await loadPlans()
        if (editingPlanId === deleteTarget.id) {
          setIsFormOpen(false)
          resetForm()
        }
        setDeleteTarget(null)
        setMessage('Tréninkový plán byl smazán.')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsDeleting(false))
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Tréninkové plány</div>
          <h1>Přehled plánů, bloků a navazujících tréninků</h1>
          <p>Správa plánů probíhá přes modální formuláře, seznam zůstává zaměřený na orientaci a rychlé akce.</p>
        </div>
        <div className="actions-right">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            Nový plán
          </button>
        </div>
      </div>

      {loading ? <div className="loading">Načítám tréninkové plány...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <article className="card section-card">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Seznam</div>
            <h2>Všechny tréninkové plány</h2>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={openCreateModal}>
            Přidat plán
          </button>
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
                  <span>
                    {formatDate(plan.startDate)} – {plan.endDate ? formatDate(plan.endDate) : 'bez konce'}
                  </span>
                  <span>
                    {plan.plannedWorkoutCount} plánovaných / {plan.completedWorkoutCount} odcvičených
                  </span>
                </div>
                <div className="table-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEditModal(plan)}>
                    Upravit
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(plan)}>
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
        title={editingPlanId == null ? 'Nový tréninkový plán' : 'Upravit tréninkový plán'}
        description={editingPlanId == null ? 'Vyplň plán, nastav jeho období a případně ho rovnou označ jako aktivní.' : 'Aktualizuj parametry vybraného plánu a potvrď změny.'}
        onClose={closeForm}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={isSaving}>
              Zrušit
            </button>
            <button type="submit" form="training-plan-form" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Ukládám...' : editingPlanId == null ? 'Vytvořit plán' : 'Uložit změny'}
            </button>
          </>
        }
      >
        <form id="training-plan-form" className="form-grid" onSubmit={onSubmit}>
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
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget != null}
        title="Smazat tréninkový plán"
        description={deleteTarget ? `Opravdu chceš smazat plán „${deleteTarget.title}“? Pokud na něj odkazují tréninky, server mazání odmítne a data zůstanou beze změny.` : ''}
        confirmLabel="Smazat plán"
        tone="danger"
        busy={isDeleting}
        onConfirm={onDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  )
}
