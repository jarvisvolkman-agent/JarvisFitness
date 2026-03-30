import { FormEvent, useEffect, useState } from 'react'
import { api, ActivityLevel, CheckIn, CheckInPayload, DashboardSummary, Goal, GoalCategory, GoalPayload, GoalStatus, ItemKind, PreferenceCategory, PreferenceItem, PreferencePayload, Profile, ProfilePayload } from '../api'
import MetricCard from '../components/MetricCard'

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

const emptyCheckIn: CheckInPayload = {
  checkInDate: new Date().toISOString().slice(0, 10),
  weightKg: null,
  caloriesAvg: null,
  proteinGAvg: null,
  trainingSessions: null,
  energy: null,
  adherence: null,
  notes: null,
}

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
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  async function refreshExport() {
    const payload = await api.export()
    setExportJson(JSON.stringify(payload, null, 2))
  }

  async function withRefresh(task: () => Promise<void>, success: string) {
    setError(null)
    setMessage(null)
    try {
      await task()
      await loadAll()
      await refreshExport()
      setMessage(success)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const submitProfile = (event: FormEvent) => {
    event.preventDefault()
    void withRefresh(async () => {
      await api.profile.upsert(profileForm)
    }, 'Profile saved.')
  }

  const submitGoal = (event: FormEvent) => {
    event.preventDefault()
    void withRefresh(async () => {
      await api.goals.create(goalForm)
      setGoalForm(emptyGoal)
    }, 'Goal created.')
  }

  const submitPreference = (event: FormEvent) => {
    event.preventDefault()
    void withRefresh(async () => {
      await api.preferences.create(preferenceForm)
      setPreferenceForm(emptyPreference)
    }, 'Preference saved.')
  }

  const submitCheckIn = (event: FormEvent) => {
    event.preventDefault()
    void withRefresh(async () => {
      await api.checkIns.create(checkInForm)
      setCheckInForm({ ...emptyCheckIn, checkInDate: new Date().toISOString().slice(0, 10) })
    }, 'Check-in logged.')
  }

  const setGoalStatus = (goal: Goal, status: GoalStatus) => {
    void withRefresh(async () => {
      await api.goals.update(goal.id, { ...goal, status })
    }, 'Goal updated.')
  }

  const removeGoal = (goalId: number) => {
    void withRefresh(async () => {
      await api.goals.delete(goalId)
    }, 'Goal deleted.')
  }

  const removePreference = (itemId: number) => {
    void withRefresh(async () => {
      await api.preferences.delete(itemId)
    }, 'Preference deleted.')
  }

  const removeCheckIn = (checkInId: number) => {
    void withRefresh(async () => {
      await api.checkIns.delete(checkInId)
    }, 'Check-in deleted.')
  }

  useEffect(() => {
    void refreshExport()
  }, [])

  return (
    <div className="dashboard-grid">
      <section className="hero-card">
        <div>
          <span className="eyebrow">Local Fitness Workspace</span>
          <h2>Profile, goals, constraints, check-ins, and export in one local stack.</h2>
          <p>
            JarvisFitness now mirrors the JarvisCars split: React frontend, .NET API, PostgreSQL, Docker, and an agent-facing CLI.
          </p>
        </div>
      </section>

      <section className="page-section metrics-strip">
        {summary ? (
          <>
            <MetricCard label="Active goals" value={String(summary.metrics.activeGoalsCount)} accent="warm" />
            <MetricCard label="Completed goals" value={String(summary.metrics.completedGoalsCount)} accent="cool" />
            <MetricCard label="Constraints" value={String(summary.metrics.constraintsCount)} />
            <MetricCard label="Latest weight" value={summary.metrics.latestWeightKg ? `${summary.metrics.latestWeightKg} kg` : 'n/a'} accent="cool" />
            <MetricCard label="Weight change" value={summary.metrics.weightChangeKg ? `${summary.metrics.weightChangeKg.toFixed(1)} kg` : 'n/a'} accent="warm" />
          </>
        ) : null}
      </section>

      {loading ? <p className="status">Loading dashboard…</p> : null}
      {message ? <p className="status success">{message}</p> : null}
      {error ? <p className="status error">{error}</p> : null}

      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Profile</span>
            <h3>Training and nutrition context</h3>
          </div>
        </div>

        <form className="form-grid" onSubmit={submitProfile}>
          <label>
            Full name
            <input value={profileForm.fullName} onChange={event => setProfileForm(current => ({ ...current, fullName: event.target.value }))} required />
          </label>
          <label>
            Activity level
            <select value={profileForm.activityLevel} onChange={event => setProfileForm(current => ({ ...current, activityLevel: event.target.value as ActivityLevel }))}>
              {['Sedentary', 'LightlyActive', 'ModeratelyActive', 'VeryActive'].map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>
          <label>
            Age
            <input value={profileForm.age ?? ''} onChange={event => setProfileForm(current => ({ ...current, age: asNumber(event.target.value) }))} />
          </label>
          <label>
            Weight kg
            <input value={profileForm.weightKg ?? ''} onChange={event => setProfileForm(current => ({ ...current, weightKg: asNumber(event.target.value) }))} />
          </label>
          <label>
            Height cm
            <input value={profileForm.heightCm ?? ''} onChange={event => setProfileForm(current => ({ ...current, heightCm: asNumber(event.target.value) }))} />
          </label>
          <label>
            Workout days/week
            <input value={profileForm.workoutDaysPerWeek ?? ''} onChange={event => setProfileForm(current => ({ ...current, workoutDaysPerWeek: asNumber(event.target.value) }))} />
          </label>
          <label>
            Calorie target
            <input value={profileForm.calorieTarget ?? ''} onChange={event => setProfileForm(current => ({ ...current, calorieTarget: asNumber(event.target.value) }))} />
          </label>
          <label>
            Protein target g
            <input value={profileForm.proteinTargetG ?? ''} onChange={event => setProfileForm(current => ({ ...current, proteinTargetG: asNumber(event.target.value) }))} />
          </label>
          <label>
            Diet style
            <input value={profileForm.dietStyle ?? ''} onChange={event => setProfileForm(current => ({ ...current, dietStyle: asText(event.target.value) }))} />
          </label>
          <label>
            Equipment access
            <input value={profileForm.equipmentAccess ?? ''} onChange={event => setProfileForm(current => ({ ...current, equipmentAccess: asText(event.target.value) }))} />
          </label>
          <label className="full-span">
            Injuries / constraints
            <textarea value={profileForm.injuries ?? ''} onChange={event => setProfileForm(current => ({ ...current, injuries: asText(event.target.value) }))} />
          </label>
          <label className="full-span">
            Notes
            <textarea value={profileForm.notes ?? ''} onChange={event => setProfileForm(current => ({ ...current, notes: asText(event.target.value) }))} />
          </label>
          <button type="submit">Save profile</button>
        </form>
      </section>

      <section className="page-section two-column">
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Goals</span>
              <h3>Track the current objective stack</h3>
            </div>
          </div>
          <form className="form-grid compact" onSubmit={submitGoal}>
            <label>
              Title
              <input value={goalForm.title} onChange={event => setGoalForm(current => ({ ...current, title: event.target.value }))} required />
            </label>
            <label>
              Category
              <select value={goalForm.category} onChange={event => setGoalForm(current => ({ ...current, category: event.target.value as GoalCategory }))}>
                {['Weight', 'Performance', 'Nutrition', 'Habit'].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Target value
              <input value={goalForm.targetValue ?? ''} onChange={event => setGoalForm(current => ({ ...current, targetValue: asNumber(event.target.value) }))} />
            </label>
            <label>
              Unit
              <input value={goalForm.unit ?? ''} onChange={event => setGoalForm(current => ({ ...current, unit: asText(event.target.value) }))} />
            </label>
            <label>
              Timeframe
              <input value={goalForm.timeframe ?? ''} onChange={event => setGoalForm(current => ({ ...current, timeframe: asText(event.target.value) }))} />
            </label>
            <label>
              Status
              <select value={goalForm.status} onChange={event => setGoalForm(current => ({ ...current, status: event.target.value as GoalStatus }))}>
                {['Active', 'Paused', 'Completed'].map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="full-span">
              Notes
              <textarea value={goalForm.notes ?? ''} onChange={event => setGoalForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </label>
            <button type="submit">Create goal</button>
          </form>
        </div>

        <div className="list-stack">
          {goals.map(goal => (
            <article className="list-card" key={goal.id}>
              <div className="card-header">
                <div>
                  <span className="tag">{goal.category}</span>
                  <h4>{goal.title}</h4>
                </div>
                <span className={`status-pill status-pill--${goal.status.toLowerCase()}`}>{goal.status}</span>
              </div>
              <p>{goal.notes ?? 'No notes recorded.'}</p>
              <div className="card-actions">
                {goal.status !== 'Completed' ? <button onClick={() => setGoalStatus(goal, 'Completed')}>Mark complete</button> : null}
                {goal.status !== 'Paused' ? <button className="secondary" onClick={() => setGoalStatus(goal, 'Paused')}>Pause</button> : null}
                {goal.status !== 'Active' ? <button className="secondary" onClick={() => setGoalStatus(goal, 'Active')}>Activate</button> : null}
                <button className="danger" onClick={() => removeGoal(goal.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section two-column">
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Preferences</span>
              <h3>Capture preferences and hard constraints</h3>
            </div>
          </div>
          <form className="form-grid compact" onSubmit={submitPreference}>
            <label>
              Kind
              <select value={preferenceForm.kind} onChange={event => setPreferenceForm(current => ({ ...current, kind: event.target.value as ItemKind }))}>
                {['Preference', 'Constraint'].map(kind => (
                  <option key={kind} value={kind}>{kind}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select value={preferenceForm.category} onChange={event => setPreferenceForm(current => ({ ...current, category: event.target.value as PreferenceCategory }))}>
                {['Nutrition', 'Training', 'Schedule', 'Medical', 'Lifestyle'].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="full-span">
              Label
              <input value={preferenceForm.label} onChange={event => setPreferenceForm(current => ({ ...current, label: event.target.value }))} required />
            </label>
            <label>
              Value
              <input value={preferenceForm.value ?? ''} onChange={event => setPreferenceForm(current => ({ ...current, value: asText(event.target.value) }))} />
            </label>
            <label className="full-span">
              Notes
              <textarea value={preferenceForm.notes ?? ''} onChange={event => setPreferenceForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </label>
            <button type="submit">Save item</button>
          </form>
        </div>

        <div className="list-stack">
          {preferences.map(item => (
            <article className="list-card" key={item.id}>
              <div className="card-header">
                <div>
                  <span className="tag">{item.kind}</span>
                  <h4>{item.label}</h4>
                </div>
                <span className="muted">{item.category}</span>
              </div>
              <p>{item.value ?? item.notes ?? 'No detail recorded.'}</p>
              <div className="card-actions">
                <button className="danger" onClick={() => removePreference(item.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section two-column">
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Check-ins</span>
              <h3>Weekly pulse and adherence log</h3>
            </div>
          </div>
          <form className="form-grid compact" onSubmit={submitCheckIn}>
            <label>
              Date
              <input type="date" value={checkInForm.checkInDate} onChange={event => setCheckInForm(current => ({ ...current, checkInDate: event.target.value }))} required />
            </label>
            <label>
              Weight kg
              <input value={checkInForm.weightKg ?? ''} onChange={event => setCheckInForm(current => ({ ...current, weightKg: asNumber(event.target.value) }))} />
            </label>
            <label>
              Calories avg
              <input value={checkInForm.caloriesAvg ?? ''} onChange={event => setCheckInForm(current => ({ ...current, caloriesAvg: asNumber(event.target.value) }))} />
            </label>
            <label>
              Protein avg g
              <input value={checkInForm.proteinGAvg ?? ''} onChange={event => setCheckInForm(current => ({ ...current, proteinGAvg: asNumber(event.target.value) }))} />
            </label>
            <label>
              Training sessions
              <input value={checkInForm.trainingSessions ?? ''} onChange={event => setCheckInForm(current => ({ ...current, trainingSessions: asNumber(event.target.value) }))} />
            </label>
            <label>
              Energy /10
              <input value={checkInForm.energy ?? ''} onChange={event => setCheckInForm(current => ({ ...current, energy: asNumber(event.target.value) }))} />
            </label>
            <label>
              Adherence /10
              <input value={checkInForm.adherence ?? ''} onChange={event => setCheckInForm(current => ({ ...current, adherence: asNumber(event.target.value) }))} />
            </label>
            <label className="full-span">
              Notes
              <textarea value={checkInForm.notes ?? ''} onChange={event => setCheckInForm(current => ({ ...current, notes: asText(event.target.value) }))} />
            </label>
            <button type="submit">Log check-in</button>
          </form>
        </div>

        <div className="list-stack">
          {checkIns.map(checkIn => (
            <article className="list-card" key={checkIn.id}>
              <div className="card-header">
                <div>
                  <span className="tag">Check-in</span>
                  <h4>{checkIn.checkInDate}</h4>
                </div>
                <span className="muted">{checkIn.weightKg ? `${checkIn.weightKg} kg` : 'n/a'}</span>
              </div>
              <p>{checkIn.notes ?? 'No notes recorded.'}</p>
              <div className="card-actions">
                <button className="danger" onClick={() => removeCheckIn(checkIn.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Export</span>
            <h3>Agent-ready full snapshot</h3>
          </div>
          <button className="secondary" onClick={() => void refreshExport()}>Refresh export</button>
        </div>
        <pre className="export-panel">{exportJson}</pre>
      </section>
    </div>
  )
}
