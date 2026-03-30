import { FormEvent, useEffect, useState } from 'react'
import { api, ProfilePayload } from '../api'
import { activityLevels, asNumber, asText, emptyProfile, formatDate, profileToPayload } from '../fitness'
import { activityLevelLabels } from '../i18n'

export default function ProfilePage() {
  const [profileForm, setProfileForm] = useState<ProfilePayload>(emptyProfile)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadProfile() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.profile.get()
      setProfileForm(profileToPayload(response.profile))
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

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    void api.profile
      .upsert(profileForm)
      .then(response => {
        setProfileForm(profileToPayload(response.profile))
        setUpdatedAt(response.profile.updatedAt)
        setMessage('Profil byl uložen.')
      })
      .catch((err: Error) => setError(err.message))
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Profil</div>
          <h1>Samostatný profil klienta</h1>
          <p>Profil drží základní identitu, pracovní parametry a kontext pro plánování tréninku i výživy.</p>
        </div>
        <div className="header-note">{updatedAt ? `Naposledy upraveno ${formatDate(updatedAt)}` : 'Profil ještě nebyl uložen.'}</div>
      </div>

      {loading ? <div className="loading">Načítám profil...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <article className="card section-card">
        <form className="form-grid form-grid-3" onSubmit={onSubmit}>
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
          <div className="form-actions form-span-full">
            <button type="submit" className="btn btn-primary">
              Uložit profil
            </button>
          </div>
        </form>
      </article>
    </section>
  )
}
