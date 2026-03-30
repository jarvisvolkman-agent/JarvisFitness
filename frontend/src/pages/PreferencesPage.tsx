import { FormEvent, useEffect, useState } from 'react'
import { api, PreferenceItem, PreferencePayload } from '../api'
import { asText, describePreference, emptyPreference, formatDate, itemBadgeClass, itemKinds, preferenceCategories, preferenceToPayload } from '../fitness'
import { itemKindLabels, preferenceCategoryLabels } from '../i18n'

export default function PreferencesPage() {
  const [items, setItems] = useState<PreferenceItem[]>([])
  const [itemForm, setItemForm] = useState<PreferencePayload>(emptyPreference)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadItems() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.preferences.list()
      setItems(response.items)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
  }, [])

  function resetForm() {
    setItemForm(emptyPreference)
    setEditingItemId(null)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const action = editingItemId == null ? api.preferences.create(itemForm) : api.preferences.update(editingItemId, itemForm)
    void action
      .then(async () => {
        await loadItems()
        resetForm()
        setMessage(editingItemId == null ? 'Položka byla vytvořena.' : 'Položka byla upravena.')
      })
      .catch((err: Error) => setError(err.message))
  }

  const onEdit = (item: PreferenceItem) => {
    setItemForm(preferenceToPayload(item))
    setEditingItemId(item.id)
    setMessage(null)
    setError(null)
  }

  const onDelete = (itemId: number) => {
    setError(null)
    setMessage(null)
    void api.preferences
      .delete(itemId)
      .then(async () => {
        await loadItems()
        if (editingItemId === itemId) resetForm()
        setMessage('Položka byla smazána.')
      })
      .catch((err: Error) => setError(err.message))
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Mantinely</div>
          <h1>Preference a constraints na samostatné stránce</h1>
          <p>Praktické mantinely drží všechno, co ovlivňuje plán: výživu, vybavení, zdravotní limity i režim.</p>
        </div>
      </div>

      {loading ? <div className="loading">Načítám mantinely...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{editingItemId == null ? 'Nová položka' : 'Editace položky'}</div>
              <h2>{editingItemId == null ? 'Vytvořit mantinel' : 'Upravit vybraný mantinel'}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="item-kind">Typ</label>
              <select id="item-kind" value={itemForm.kind} onChange={event => setItemForm(current => ({ ...current, kind: event.target.value as PreferencePayload['kind'] }))}>
                {itemKinds.map(kind => (
                  <option key={kind} value={kind}>
                    {itemKindLabels[kind]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="item-category">Kategorie</label>
              <select
                id="item-category"
                value={itemForm.category}
                onChange={event => setItemForm(current => ({ ...current, category: event.target.value as PreferencePayload['category'] }))}
              >
                {preferenceCategories.map(category => (
                  <option key={category} value={category}>
                    {preferenceCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="item-label">Název</label>
              <input id="item-label" value={itemForm.label} onChange={event => setItemForm(current => ({ ...current, label: event.target.value }))} required />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="item-value">Hodnota</label>
              <input id="item-value" value={itemForm.value ?? ''} onChange={event => setItemForm(current => ({ ...current, value: asText(event.target.value) }))} />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="item-notes">Poznámky</label>
              <textarea id="item-notes" value={itemForm.notes ?? ''} onChange={event => setItemForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </div>
            <div className="form-actions form-span-full">
              <button type="submit" className="btn btn-primary">
                {editingItemId == null ? 'Vytvořit položku' : 'Uložit změny'}
              </button>
              {editingItemId != null ? (
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
              <h2>Všechny mantinely</h2>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty">Zatím nejsou žádné mantinely.</div>
          ) : (
            <div className="stack-list">
              {items.map(item => (
                <article key={item.id} className="stack-item">
                  <div className="stack-item-topline">
                    <strong>{item.label}</strong>
                    <span className={itemBadgeClass(item.kind)}>{itemKindLabels[item.kind]}</span>
                  </div>
                  <p>{item.value ?? item.notes ?? 'Bez doplňujícího popisu.'}</p>
                  <div className="stack-item-meta">
                    <span>{describePreference(item)}</span>
                    <span>Aktualizováno {formatDate(item.updatedAt)}</span>
                  </div>
                  <div className="table-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(item)}>
                      Upravit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>
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
