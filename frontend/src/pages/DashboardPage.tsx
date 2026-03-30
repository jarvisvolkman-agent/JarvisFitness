import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, DashboardSummary } from '../api'
import MetricCard from '../components/MetricCard'
import { describeCheckIn, describeWorkout, formatDate, goalBadgeClass, profileSnapshot, workoutBadgeClass } from '../fitness'
import { formatCheckInWeight, formatGoalTarget, goalStatusLabels } from '../i18n'

const quickActions = [
  {
    title: 'Profil',
    description: 'Správa osobních údajů, tréninkového kontextu a výživových parametrů.',
    href: '/profil',
    cta: 'Otevřít profil',
  },
  {
    title: 'Cíle',
    description: 'Seznam aktivních priorit, tvorba nových cílů a úprava stávajících.',
    href: '/cile',
    cta: 'Spravovat cíle',
  },
  {
    title: 'Tréninkové plány',
    description: 'Přehled bloků, mezocyklů a plánovaných jednotek navázaných na konkrétní plán.',
    href: '/treninkove-plany',
    cta: 'Otevřít plány',
  },
  {
    title: 'Tréninky',
    description: 'Eviduj plánované i odcvičené tréninky, doplňuj poznámky a upravuj stav.',
    href: '/treningy',
    cta: 'Spravovat tréninky',
  },
]

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.dashboard
      .summary()
      .then(setSummary)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1>Jedno místo pro progres, plán tréninku i evidenci odcvičené práce.</h1>
          <p>
            Hlavní stránka teď funguje jako pracovní přehled. Detailní správa profilu, cílů, tréninkových plánů,
            jednotlivých tréninků i kontrol je rozdělená do samostatných obrazovek.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/treningy">
              Nový trénink
            </Link>
            <Link className="btn btn-secondary" to="/treninkove-plany">
              Upravit plán
            </Link>
          </div>
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
        <MetricCard label="Aktivní plány" value={String(summary?.metrics.activeTrainingPlansCount ?? 0)} accent="neutral" />
        <MetricCard label="Plánované tréninky" value={String(summary?.metrics.plannedWorkoutsCount ?? 0)} accent="cool" />
        <MetricCard label="Odcvičené tréninky" value={String(summary?.metrics.completedWorkoutsCount ?? 0)} accent="warm" />
        <MetricCard label="Poslední hmotnost" value={formatCheckInWeight(summary?.metrics.latestWeightKg ?? null)} accent="neutral" />
      </section>

      {loading ? <div className="loading">Načítám dashboard...</div> : null}
      {error ? <div className="error">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="quick-action-grid">
            {quickActions.map(action => (
              <article key={action.href} className="card quick-action-card">
                <div className="eyebrow">Sekce</div>
                <h2>{action.title}</h2>
                <p>{action.description}</p>
                <Link className="btn btn-secondary" to={action.href}>
                  {action.cta}
                </Link>
              </article>
            ))}
          </section>

          <section className="dashboard-layout">
            <article className="card section-card">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">Aktuální cíle</div>
                  <h2>Co je teď rozběhnuté</h2>
                </div>
                <Link className="btn btn-secondary btn-sm" to="/cile">
                  Všechny cíle
                </Link>
              </div>

              {summary?.activeGoals.length ? (
                <div className="stack-list">
                  {summary.activeGoals.map(goal => (
                    <article key={goal.id} className="stack-item">
                      <div className="stack-item-topline">
                        <strong>{goal.title}</strong>
                        <span className={goalBadgeClass(goal.status)}>{goalStatusLabels[goal.status]}</span>
                      </div>
                      <p>{goal.notes ?? 'Bez doplňujících poznámek.'}</p>
                      <div className="stack-item-meta">
                        <span>{formatGoalTarget(goal)}</span>
                        <span>{goal.timeframe ?? 'Bez období'}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty compact">Zatím nejsou žádné aktivní cíle.</div>
              )}
            </article>

            <article className="card section-card">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">Tréninkový plán</div>
                  <h2>Nejbližší naplánované jednotky</h2>
                </div>
                <Link className="btn btn-secondary btn-sm" to="/treningy">
                  Všechny tréninky
                </Link>
              </div>

              {summary?.upcomingWorkouts.length ? (
                <div className="stack-list">
                  {summary.upcomingWorkouts.map(workout => (
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
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty compact">Zatím nejsou žádné naplánované tréninky.</div>
              )}
            </article>
          </section>

          <section className="dashboard-layout">
            <article className="card section-card">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">Tréninkové plány</div>
                  <h2>Aktivní bloky a mezocykly</h2>
                </div>
                <Link className="btn btn-secondary btn-sm" to="/treninkove-plany">
                  Správa plánů
                </Link>
              </div>

              {summary?.activeTrainingPlans.length ? (
                <div className="stack-list">
                  {summary.activeTrainingPlans.map(plan => (
                    <article key={plan.id} className="stack-item">
                      <div className="stack-item-topline">
                        <strong>{plan.title}</strong>
                        <span className="badge badge-info">{plan.plannedWorkoutCount} plánovaných</span>
                      </div>
                      <p>{plan.focus ?? plan.notes ?? 'Bez doplňujícího popisu.'}</p>
                      <div className="stack-item-meta">
                        <span>Začátek {formatDate(plan.startDate)}</span>
                        <span>{plan.completedWorkoutCount} odcvičených</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty compact">Zatím nejsou založené žádné aktivní plány.</div>
              )}
            </article>

            <article className="card section-card">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">Evidence</div>
                  <h2>Poslední odcvičené tréninky a kontroly</h2>
                </div>
                <Link className="btn btn-secondary btn-sm" to="/kontroly">
                  Historie kontrol
                </Link>
              </div>

              <div className="stack-list">
                {summary?.recentCompletedWorkouts.length ? (
                  summary.recentCompletedWorkouts.map(workout => (
                    <article key={`workout-${workout.id}`} className="stack-item">
                      <div className="stack-item-topline">
                        <strong>{workout.title}</strong>
                        <span className="badge badge-active">{formatDate(workout.completedDate ?? workout.scheduledDate)}</span>
                      </div>
                      <p>{workout.notes ?? 'Bez poznámek.'}</p>
                      <div className="stack-item-meta">
                        <span>{describeWorkout(workout)}</span>
                        <span>{workout.trainingPlanTitle ?? 'Bez plánu'}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty compact">Zatím nejsou žádné odcvičené tréninky.</div>
                )}

                {summary?.recentCheckIns.map(checkIn => (
                  <article key={`checkin-${checkIn.id}`} className="stack-item">
                    <div className="stack-item-topline">
                      <strong>{formatDate(checkIn.checkInDate)}</strong>
                      <span className="badge badge-info">{describeCheckIn(checkIn)}</span>
                    </div>
                    <p>{checkIn.notes ?? 'Bez poznámek.'}</p>
                  </article>
                ))}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </div>
  )
}
