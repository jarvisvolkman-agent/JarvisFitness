import { FormEvent, useEffect, useState } from 'react'
import Modal from '../components/Modal'
import { api, ProfilePayload } from '../api'
import { activityLevels, asNumber, asText, emptyProfile, formatDate, profileToPayload } from '../fitness'
import { activityLevelLabels, formatMetricValue } from '../i18n'

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfilePayload>(emptyProfile)
  const [profileForm, setProfileForm] = useState<ProfilePayload>(emptyProfile)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadProfile() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.profile.get()
      const nextProfile = profileToPayload(response.profile)
      setProfile(nextProfile)
      setProfileForm(nextProfile)
      setUpdatedAt(response.profile?.updatedAt ?? null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  function closeForm() {
    if (isSaving) return
    setIsFormOpen(false)
  }

  function openEditModal() {
    setProfileForm(profile)
    setMessage(null)
    setError(null)
    setIsFormOpen(true)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSaving(true)
    void api.profile
      .upsert(profileForm)
      .then(response => {
        const nextProfile = profileToPayload(response.profile)
        setProfile(nextProfile)
        setProfileForm(nextProfile)
        setUpdatedAt(response.profile.updatedAt)
        setIsFormOpen(false)
        setMessage('Profil byl uložen.')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsSaving(false))
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Profil</div>
          <h1>Samostatný profil klienta</h1>
          <p>Profil drží základní identitu, pracovní parametry a kontext pro plánování tréninku i výživy.</p>
        </div>
        <div className="actions-right">
          <div className="header-note">{updatedAt ? `Naposledy upraveno ${formatDate(updatedAt)}` : 'Profil ještě nebyl uložen.'}</div>
          <button type="button" className="btn btn-primary" onClick={openEditModal}>
            {updatedAt ? 'Upravit profil' : 'Vyplnit profil'}
          </button>
        </div>
      </div>

      {loading ? <div className="loading">Načítám profil...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Identita</div>
              <h2>Základní údaje</h2>
            </div>
          </div>
          <div className="detail-grid">
            <div className="detail-card">
              <span>Celé jméno</span>
              <strong>{profile.fullName || 'Nevyplněno'}</strong>
            </div>
            <div className="detail-card">
              <span>Úroveň aktivity</span>
              <strong>{activityLevelLabels[profile.activityLevel]}</strong>
            </div>
            <div className="detail-card">
              <span>Věk</span>
              <strong>{formatMetricValue(profile.age)}</strong>
            </div>
            <div className="detail-card">
              <span>Pohlaví</span>
              <strong>{profile.sex ?? 'Nevyplněno'}</strong>
            </div>
          </div>
        </article>

        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Parametry</div>
              <h2>Trénink a výživa</h2>
            </div>
          </div>
          <div className="stack-list">
            <div className="stack-item">
              <div className="stack-item-topline">
                <strong>Fyzické parametry</strong>
              </div>
              <p>
                Hmotnost {formatMetricValue(profile.weightKg, ' kg')} • Výška {formatMetricValue(profile.heightCm, ' cm')}
              </p>
            </div>
            <div className="stack-item">
              <div className="stack-item-topline">
                <strong>Plánování</strong>
              </div>
              <p>
                {formatMetricValue(profile.workoutDaysPerWeek)} tréninkových dnů týdně • {formatMetricValue(profile.calorieTarget)} kcal • {formatMetricValue(profile.proteinTargetG, ' g')} bílkovin
              </p>
            </div>
            <div className="stack-item">
              <div className="stack-item-topline">
                <strong>Kontext</strong>
              </div>
              <p>{profile.notes ?? profile.injuries ?? profile.equipmentAccess ?? 'Bez doplňujících poznámek.'}</p>
            </div>
          </div>
        </article>
      </div>

      <article className="card section-card">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Omezení a preference</div>
            <h2>Doplňující informace</h2>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={openEditModal}>
            Upravit profil
          </button>
        </div>

        <div className="stack-list">
          <div className="stack-item">
            <strong>Stravovací styl</strong>
            <p>{profile.dietStyle ?? 'Nevyplněno'}</p>
          </div>
          <div className="stack-item">
            <strong>Dostupné vybavení</strong>
            <p>{profile.equipmentAccess ?? 'Nevyplněno'}</p>
          </div>
          <div className="stack-item">
            <strong>Zranění a omezení</strong>
            <p>{profile.injuries ?? 'Nevyplněno'}</p>
          </div>
          <div className="stack-item">
            <strong>Alergie</strong>
            <p>{profile.allergies ?? 'Nevyplněno'}</p>
          </div>
          <div className="stack-item">
            <strong>Poznámky</strong>
            <p>{profile.notes ?? 'Nevyplněno'}</p>
          </div>
        </div>
      </article>

      <Modal
        isOpen={isFormOpen}
        title={updatedAt ? 'Upravit profil' : 'Vyplnit profil'}
        description="Uprav základní identitu, fyzické parametry i kontext pro plánování. Změny se uloží po potvrzení."
        onClose={closeForm}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={isSaving}>
              Zrušit
            </button>
            <button type="submit" form="profile-form" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Ukládám...' : 'Uložit profil'}
            </button>
          </>
        }
      >
        <form id="profile-form" className="form-grid form-grid-3" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="profile-name">Celé jméno</label>
            <input id="profile-name" value={profileForm.fullName} onChange={event => setProfileForm(current => ({ ...current, fullName: event.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="profile-activity">Úroveň aktivity</label>
            <select
              id="profile-activity"
              value={profileForm.activityLevel}
              onChange={event => setProfileForm(current => ({ ...current, activityLevel: event.target.value as ProfilePayload['activityLevel'] }))}
            >
              {activityLevels.map(level => (
                <option key={level} value={level}>
                  {activityLevelLabels[level]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="profile-sex">Pohlaví</label>
            <input id="profile-sex" value={profileForm.sex ?? ''} onChange={event => setProfileForm(current => ({ ...current, sex: asText(event.target.value) }))} placeholder="např. žena" />
          </div>
          <div className="form-group">
            <label htmlFor="profile-age">Věk</label>
            <input id="profile-age" inputMode="numeric" value={profileForm.age ?? ''} onChange={event => setProfileForm(current => ({ ...current, age: asNumber(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-weight">Hmotnost (kg)</label>
            <input id="profile-weight" inputMode="decimal" value={profileForm.weightKg ?? ''} onChange={event => setProfileForm(current => ({ ...current, weightKg: asNumber(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-height">Výška (cm)</label>
            <input id="profile-height" inputMode="decimal" value={profileForm.heightCm ?? ''} onChange={event => setProfileForm(current => ({ ...current, heightCm: asNumber(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-days">Tréninkové dny týdně</label>
            <input id="profile-days" inputMode="numeric" value={profileForm.workoutDaysPerWeek ?? ''} onChange={event => setProfileForm(current => ({ ...current, workoutDaysPerWeek: asNumber(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-calories">Kalorický cíl</label>
            <input id="profile-calories" inputMode="numeric" value={profileForm.calorieTarget ?? ''} onChange={event => setProfileForm(current => ({ ...current, calorieTarget: asNumber(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-protein">Bílkovinový cíl (g)</label>
            <input id="profile-protein" inputMode="numeric" value={profileForm.proteinTargetG ?? ''} onChange={event => setProfileForm(current => ({ ...current, proteinTargetG: asNumber(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-diet">Stravovací styl</label>
            <input id="profile-diet" value={profileForm.dietStyle ?? ''} onChange={event => setProfileForm(current => ({ ...current, dietStyle: asText(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-equipment">Dostupné vybavení</label>
            <input id="profile-equipment" value={profileForm.equipmentAccess ?? ''} onChange={event => setProfileForm(current => ({ ...current, equipmentAccess: asText(event.target.value) }))} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-allergies">Alergie</label>
            <input id="profile-allergies" value={profileForm.allergies ?? ''} onChange={event => setProfileForm(current => ({ ...current, allergies: asText(event.target.value) }))} />
          </div>
          <div className="form-group form-span-full">
            <label htmlFor="profile-injuries">Zranění a omezení</label>
            <textarea id="profile-injuries" value={profileForm.injuries ?? ''} onChange={event => setProfileForm(current => ({ ...current, injuries: asText(event.target.value) }))} />
          </div>
          <div className="form-group form-span-full">
            <label htmlFor="profile-notes">Poznámky</label>
            <textarea id="profile-notes" value={profileForm.notes ?? ''} onChange={event => setProfileForm(current => ({ ...current, notes: asText(event.target.value) }))} />
          </div>
        </form>
      </Modal>
    </section>
  )
}
