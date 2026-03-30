import { FormEvent, useEffect, useState } from 'react'
import {
  ActivityLevel,
  api,
  CheckIn,
  CheckInPayload,
  DashboardSummary,
  Goal,
  GoalCategory,
  GoalPayload,
  GoalStatus,
  ItemKind,
  PreferenceCategory,
  PreferenceItem,
  PreferencePayload,
  Profile,
  ProfilePayload,
} from '../api'
import MetricCard from '../components/MetricCard'
import {
  activityLevelLabels,
  createLocalizedExport,
  formatCheckInWeight,
  formatGoalTarget,
  formatMetricValue,
  goalCategoryLabels,
  goalStatusLabels,
  itemKindLabels,
  preferenceCategoryLabels,
} from '../i18n'

const emptyProfile: ProfilePayload = {
  fullName: '',
  age: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  activityLevel: 'ModeratelyActive',
  dietStyle: null,
  workoutDaysPerWeek: null,
  calorieTarget: null,
  proteinTargetG: null,
  equipmentAccess: null,
  injuries: null,
  allergies: null,
  notes: null,
}

const emptyGoal: GoalPayload = {
  category: 'Weight',
  title: '',
  targetValue: null,
  unit: null,
  timeframe: null,
  status: 'Active',
  notes: null,
}

const emptyPreference: PreferencePayload = {
  kind: 'Preference',
  category: 'Training',
  label: '',
  value: null,
  notes: null,
}

const todayIso = () => new Date().toISOString().slice(0, 10)

const emptyCheckIn: CheckInPayload = {
  checkInDate: todayIso(),
  weightKg: null,
  caloriesAvg: null,
  proteinGAvg: null,
  trainingSessions: null,
  energy: null,
  adherence: null,
  notes: null,
}

const activityLevels: ActivityLevel[] = ['Sedentary', 'LightlyActive', 'ModeratelyActive', 'VeryActive']
const goalCategories: GoalCategory[] = ['Weight', 'Performance', 'Nutrition', 'Habit']
const goalStatuses: GoalStatus[] = ['Active', 'Paused', 'Completed']
const itemKinds: ItemKind[] = ['Preference', 'Constraint']
const preferenceCategories: PreferenceCategory[] = ['Nutrition', 'Training', 'Schedule', 'Medical', 'Lifestyle']

function asNumber(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function asText(value: string): string | null {
  return value.trim() === '' ? null : value.trim()
}

function profileToPayload(profile: Profile | null): ProfilePayload {
  if (!profile) return emptyProfile
  return {
    fullName: profile.fullName,
    age: profile.age,
    sex: profile.sex,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activityLevel: profile.activityLevel,
    dietStyle: profile.dietStyle,
    workoutDaysPerWeek: profile.workoutDaysPerWeek,
    calorieTarget: profile.calorieTarget,
    proteinTargetG: profile.proteinTargetG,
    equipmentAccess: profile.equipmentAccess,
    injuries: profile.injuries,
    allergies: profile.allergies,
    notes: profile.notes,
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Není k dispozici'
  if (value.includes('T')) return new Date(value).toLocaleDateString('cs-CZ')
  const [year, month, day] = value.split('-')
  if (year && month && day) return `${day}.${month}.${year}`
  return value
}

function profileSnapshot(summary: DashboardSummary | null) {
  if (!summary?.profile) {
    return [
      { label: 'Profil', value: 'Zatím nevyplněný' },
      { label: 'Poslední kontrola', value: summary?.recentCheckIns[0] ? formatDate(summary.recentCheckIns[0].checkInDate) : 'Žádná' },
      { label: 'Aktivní omezení', value: String(summary?.metrics.constraintsCount ?? 0) },
      { label: 'Výživové preference', value: String(summary?.metrics.preferencesCount ?? 0) },
    ]
  }

  return [
    { label: 'Klient', value: summary.profile.fullName },
    { label: 'Aktivita', value: activityLevelLabels[summary.profile.activityLevel] },
    { label: 'Tréninky týdně', value: formatMetricValue(summary.profile.workoutDaysPerWeek) },
    { label: 'Poslední úprava', value: formatDate(summary.profile.updatedAt) },
  ]
}

function goalBadgeClass(status: GoalStatus) {
  if (status === 'Completed') return 'badge badge-active'
  if (status === 'Paused') return 'badge badge-warning'
  return 'badge badge-info'
}

function itemBadgeClass(kind: ItemKind) {
  return kind === 'Constraint' ? 'badge badge-warning' : 'badge badge-active'
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [preferences, setPreferences] = useState<PreferenceItem[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [profileForm, setProfileForm] = useState<ProfilePayload>(emptyProfile)
  const [goalForm, setGoalForm] = useState<GoalPayload>(emptyGoal)
  const [preferenceForm, setPreferenceForm] = useState<PreferencePayload>(emptyPreference)
  const [checkInForm, setCheckInForm] = useState<CheckInPayload>(emptyCheckIn)
  const [exportJson, setExportJson] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [dashboard, goalResponse, preferenceResponse, checkInResponse] = await Promise.all([
        api.dashboard.summary(),
        api.goals.list(),
        api.preferences.list(),
        api.checkIns.list(),
      ])

      setSummary(dashboard)
      setGoals(goalResponse.goals)
      setPreferences(preferenceResponse.items)
      setCheckIns(checkInResponse.checkIns)
      setProfileForm(profileToPayload(dashboard.profile))
      setExportJson(createLocalizedExport(dashboard, goalResponse.goals, preferenceResponse.items, checkInResponse.checkIns))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  async function withRefresh(task: () => Promise<void>, success: string) {
    setError(null)
    setMessage(null)
    try {
      await task()
      await loadAll()
      setMessage(success)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const submitProfile = (event: FormEvent) => {
    event.preventDefault()
    void withRefresh(async () => {
      await api.profile.upsert(profileForm)
    }, 'Profil byl uložen.')
  }

  const submitGoal = (event: FormEvent) => {
    event.preventDefault()
    void withRefresh(async () => {
      await api.goals.create(goalForm)
      setGoalForm(emptyGoal)
    }, 'Cíl byl vytvořen.')
  }

  const submitPreference = (event: FormEvent) => {
    event.preventDefault()
    void withRefresh(async () => {
      await api.preferences.create(preferenceForm)
      setPreferenceForm(emptyPreference)
    }, 'Položka byla uložena.')
  }

  const submitCheckIn = (event: FormEvent) => {
    event.preventDefault()
    void withRefresh(async () => {
      await api.checkIns.create(checkInForm)
      setCheckInForm({ ...emptyCheckIn, checkInDate: todayIso() })
    }, 'Kontrola byla zapsána.')
  }

  const setGoalStatus = (goal: Goal, status: GoalStatus) => {
    void withRefresh(async () => {
      await api.goals.update(goal.id, { ...goal, status })
    }, 'Stav cíle byl upraven.')
  }

  const removeGoal = (goalId: number) => {
    void withRefresh(async () => {
      await api.goals.delete(goalId)
    }, 'Cíl byl smazán.')
  }

  const removePreference = (itemId: number) => {
    void withRefresh(async () => {
      await api.preferences.delete(itemId)
    }, 'Položka byla smazána.')
  }

  const removeCheckIn = (checkInId: number) => {
    void withRefresh(async () => {
      await api.checkIns.delete(checkInId)
    }, 'Kontrola byla smazána.')
  }

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <div className="eyebrow">JarvisFitness</div>
          <h1>Profil, cíle a průběžné kontroly v jednom přehledu.</h1>
          <p>
            JarvisFitness teď používá stejný produktový jazyk jako JarvisCars: střízlivý app shell, kompaktní
            karty, tabulkový detail a jasné pracovní sekce pro každodenní správu dat.
          </p>
        </div>
        <div className="hero-aside">
          {profileSnapshot(summary).map(item => (
            <div key={item.label} className="hero-stat">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard label="Aktivní cíle" value={String(summary?.metrics.activeGoalsCount ?? 0)} accent="cool" />
        <MetricCard label="Splněné cíle" value={String(summary?.metrics.completedGoalsCount ?? 0)} accent="neutral" />
        <MetricCard label="Omezení" value={String(summary?.metrics.constraintsCount ?? 0)} accent="warm" />
        <MetricCard label="Poslední hmotnost" value={formatMetricValue(summary?.metrics.latestWeightKg, ' kg')} accent="cool" />
        <MetricCard
          label="Změna hmotnosti"
          value={summary?.metrics.weightChangeKg != null ? `${summary.metrics.weightChangeKg.toFixed(1)} kg` : 'Není k dispozici'}
          accent="neutral"
        />
      </section>

      {loading ? <div className="loading">Načítám přehled...</div> : null}
      {message ? <div className="notice success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <section className="dashboard-layout">
        <article className="card section-card section-card-wide">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Profil</div>
              <h2>Tréninkový a výživový kontext</h2>
            </div>
            <p>Ulož základní údaje, pracovní parametry a praktické poznámky pro plánování tréninku i stravy.</p>
          </div>

          <form className="form-grid form-grid-3" onSubmit={submitProfile}>
            <div className="form-group">
              <label htmlFor="profile-name">Celé jméno</label>
              <input id="profile-name" value={profileForm.fullName} onChange={event => setProfileForm(current => ({ ...current, fullName: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="profile-activity">Úroveň aktivity</label>
              <select
                id="profile-activity"
                value={profileForm.activityLevel}
                onChange={event => setProfileForm(current => ({ ...current, activityLevel: event.target.value as ActivityLevel }))}
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
              <input id="profile-diet" value={profileForm.dietStyle ?? ''} onChange={event => setProfileForm(current => ({ ...current, dietStyle: asText(event.target.value) }))} placeholder="např. vysokobílkovinná strava" />
            </div>
            <div className="form-group">
              <label htmlFor="profile-equipment">Dostupné vybavení</label>
              <input id="profile-equipment" value={profileForm.equipmentAccess ?? ''} onChange={event => setProfileForm(current => ({ ...current, equipmentAccess: asText(event.target.value) }))} placeholder="např. domácí gym + fitcentrum" />
            </div>
            <div className="form-group">
              <label htmlFor="profile-allergies">Alergie</label>
              <input id="profile-allergies" value={profileForm.allergies ?? ''} onChange={event => setProfileForm(current => ({ ...current, allergies: asText(event.target.value) }))} placeholder="např. žádné" />
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

      <section className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Cíle</div>
              <h2>Sledování aktuálních priorit</h2>
            </div>
            <p>Nové cíle vznikají ve stejném pracovním rytmu jako v JarvisCars: formulář vlevo, operativní seznam vpravo.</p>
          </div>

          <form className="form-grid" onSubmit={submitGoal}>
            <div className="form-group form-span-full">
              <label htmlFor="goal-title">Název cíle</label>
              <input id="goal-title" value={goalForm.title} onChange={event => setGoalForm(current => ({ ...current, title: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="goal-category">Kategorie</label>
              <select id="goal-category" value={goalForm.category} onChange={event => setGoalForm(current => ({ ...current, category: event.target.value as GoalCategory }))}>
                {goalCategories.map(category => (
                  <option key={category} value={category}>
                    {goalCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="goal-status">Stav</label>
              <select id="goal-status" value={goalForm.status} onChange={event => setGoalForm(current => ({ ...current, status: event.target.value as GoalStatus }))}>
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
              <input id="goal-unit" value={goalForm.unit ?? ''} onChange={event => setGoalForm(current => ({ ...current, unit: asText(event.target.value) }))} placeholder="kg, opakování, kroky" />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="goal-timeframe">Období</label>
              <input id="goal-timeframe" value={goalForm.timeframe ?? ''} onChange={event => setGoalForm(current => ({ ...current, timeframe: asText(event.target.value) }))} placeholder="např. 12 týdnů" />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="goal-notes">Poznámky</label>
              <textarea id="goal-notes" value={goalForm.notes ?? ''} onChange={event => setGoalForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </div>
            <div className="form-actions form-span-full">
              <button type="submit" className="btn btn-primary">
                Vytvořit cíl
              </button>
            </div>
          </form>
        </article>

        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Seznam</div>
              <h2>Aktuální cíle</h2>
            </div>
          </div>

          {goals.length === 0 ? (
            <div className="empty">Zatím žádné cíle. Přidej první prioritu.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Název</th>
                    <th>Kategorie</th>
                    <th>Target</th>
                    <th>Stav</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map(goal => (
                    <tr key={goal.id}>
                      <td>
                        <div className="table-title">{goal.title}</div>
                        <div className="table-subtitle">
                          {goal.timeframe ? `${goal.timeframe} • ` : ''}
                          {goal.notes ?? 'Bez doplňujících poznámek'}
                        </div>
                      </td>
                      <td>{goalCategoryLabels[goal.category]}</td>
                      <td>{formatGoalTarget(goal)}</td>
                      <td>
                        <span className={goalBadgeClass(goal.status)}>{goalStatusLabels[goal.status]}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {goal.status !== 'Completed' ? (
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGoalStatus(goal, 'Completed')}>
                              Splněno
                            </button>
                          ) : null}
                          {goal.status !== 'Paused' ? (
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGoalStatus(goal, 'Paused')}>
                              Pozastavit
                            </button>
                          ) : null}
                          {goal.status !== 'Active' ? (
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGoalStatus(goal, 'Active')}>
                              Aktivovat
                            </button>
                          ) : null}
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => removeGoal(goal.id)}>
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
      </section>

      <section className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Preference a omezení</div>
              <h2>Praktické mantinely</h2>
            </div>
            <p>Stejná struktura jako u vozidel: jednotný formulář a jasně čitelný operativní seznam.</p>
          </div>

          <form className="form-grid" onSubmit={submitPreference}>
            <div className="form-group">
              <label htmlFor="preference-kind">Typ položky</label>
              <select id="preference-kind" value={preferenceForm.kind} onChange={event => setPreferenceForm(current => ({ ...current, kind: event.target.value as ItemKind }))}>
                {itemKinds.map(kind => (
                  <option key={kind} value={kind}>
                    {itemKindLabels[kind]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="preference-category">Kategorie</label>
              <select
                id="preference-category"
                value={preferenceForm.category}
                onChange={event => setPreferenceForm(current => ({ ...current, category: event.target.value as PreferenceCategory }))}
              >
                {preferenceCategories.map(category => (
                  <option key={category} value={category}>
                    {preferenceCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="preference-label">Název</label>
              <input id="preference-label" value={preferenceForm.label} onChange={event => setPreferenceForm(current => ({ ...current, label: event.target.value }))} required />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="preference-value">Hodnota</label>
              <input id="preference-value" value={preferenceForm.value ?? ''} onChange={event => setPreferenceForm(current => ({ ...current, value: asText(event.target.value) }))} />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="preference-notes">Poznámky</label>
              <textarea id="preference-notes" value={preferenceForm.notes ?? ''} onChange={event => setPreferenceForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </div>
            <div className="form-actions form-span-full">
              <button type="submit" className="btn btn-primary">
                Uložit položku
              </button>
            </div>
          </form>
        </article>

        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Seznam</div>
              <h2>Preference a omezení</h2>
            </div>
          </div>

          {preferences.length === 0 ? (
            <div className="empty">Žádné uložené preference ani omezení.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Název</th>
                    <th>Kategorie</th>
                    <th>Typ</th>
                    <th>Detail</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {preferences.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-title">{item.label}</div>
                        <div className="table-subtitle">{item.notes ?? 'Bez doplňujících poznámek'}</div>
                      </td>
                      <td>{preferenceCategoryLabels[item.category]}</td>
                      <td>
                        <span className={itemBadgeClass(item.kind)}>{itemKindLabels[item.kind]}</span>
                      </td>
                      <td>{item.value ?? 'Bez hodnoty'}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => removePreference(item.id)}>
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
      </section>

      <section className="dashboard-layout">
        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Kontroly</div>
              <h2>Týdenní puls a průběžný stav</h2>
            </div>
            <p>Zápisy kontrol jsou zjednodušené na stejnou hustotu informací jako servisní a nákladové tabulky v JarvisCars.</p>
          </div>

          <form className="form-grid" onSubmit={submitCheckIn}>
            <div className="form-group">
              <label htmlFor="checkin-date">Datum</label>
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
              <label htmlFor="checkin-sessions">Počet tréninků</label>
              <input id="checkin-sessions" inputMode="numeric" value={checkInForm.trainingSessions ?? ''} onChange={event => setCheckInForm(current => ({ ...current, trainingSessions: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group">
              <label htmlFor="checkin-energy">Energie / 10</label>
              <input id="checkin-energy" inputMode="numeric" value={checkInForm.energy ?? ''} onChange={event => setCheckInForm(current => ({ ...current, energy: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group">
              <label htmlFor="checkin-adherence">Dodržení / 10</label>
              <input id="checkin-adherence" inputMode="numeric" value={checkInForm.adherence ?? ''} onChange={event => setCheckInForm(current => ({ ...current, adherence: asNumber(event.target.value) }))} />
            </div>
            <div className="form-group form-span-full">
              <label htmlFor="checkin-notes">Poznámky</label>
              <textarea id="checkin-notes" value={checkInForm.notes ?? ''} onChange={event => setCheckInForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </div>
            <div className="form-actions form-span-full">
              <button type="submit" className="btn btn-primary">
                Zapsat kontrolu
              </button>
            </div>
          </form>
        </article>

        <article className="card section-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Historie</div>
              <h2>Poslední kontroly</h2>
            </div>
          </div>

          {checkIns.length === 0 ? (
            <div className="empty">Žádné kontroly.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Hmotnost</th>
                    <th>Energie</th>
                    <th>Dodržení</th>
                    <th>Tréninky</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {checkIns.map(checkIn => (
                    <tr key={checkIn.id}>
                      <td>
                        <div className="table-title">{formatDate(checkIn.checkInDate)}</div>
                        <div className="table-subtitle">{checkIn.notes ?? 'Bez doplňujících poznámek'}</div>
                      </td>
                      <td>{formatCheckInWeight(checkIn.weightKg)}</td>
                      <td>{formatMetricValue(checkIn.energy)}</td>
                      <td>{formatMetricValue(checkIn.adherence)}</td>
                      <td>{formatMetricValue(checkIn.trainingSessions)}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => removeCheckIn(checkIn.id)}>
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
      </section>

      <section className="dashboard-layout">
        <article className="card section-card section-card-wide">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Export</div>
              <h2>Plný přehled v češtině</h2>
            </div>
            <div className="actions-right">
              <button type="button" className="btn btn-secondary" onClick={() => setExportJson(createLocalizedExport(summary, goals, preferences, checkIns))}>
                Obnovit export
              </button>
            </div>
          </div>
          <pre className="export-block">{exportJson}</pre>
        </article>
      </section>
    </div>
  )
}
