import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, DashboardSummary } from '../api'
import MetricCard from '../components/MetricCard'
import { describeCheckIn, formatDate, goalBadgeClass, itemBadgeClass, profileSnapshot } from '../fitness'
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
    title: 'Kontroly',
    description: 'Průběžné check-iny s hmotností, energií, dodržením a poznámkami.',
    href: '/kontroly',
    cta: 'Otevřít kontroly',
  },
  {
    title: 'Mantinely',
    description: 'Preference a omezení, která ovlivňují trénink, stravu i rozvrh.',
    href: '/mantinely',
    cta: 'Upravit mantinely',
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
          <h1>Jedno místo pro progres, aktuální priority a další krok.</h1>
          <p>
            Hlavní stránka teď funguje jako pracovní přehled. Detailní správa profilu, cílů, kontrol i praktických
            mantinelů je rozdělená do samostatných obrazovek.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/kontroly">
              Nová kontrola
            </Link>
            <Link className="btn btn-secondary" to="/cile">
              Upravit cíle
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
        <MetricCard label="Splněné cíle" value={String(summary?.metrics.completedGoalsCount ?? 0)} accent="neutral" />
        <MetricCard label="Kontroly" value={String(summary?.metrics.checkInCount ?? 0)} accent="cool" />
        <MetricCard label="Omezení" value={String(summary?.metrics.constraintsCount ?? 0)} accent="warm" />
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
                  <div className="eyebrow">Poslední kontroly</div>
                  <h2>Jak se věci vyvíjejí</h2>
                </div>
                <Link className="btn btn-secondary btn-sm" to="/kontroly">
                  Historie kontrol
                </Link>
              </div>

              {summary?.recentCheckIns.length ? (
                <div className="stack-list">
                  {summary.recentCheckIns.map(checkIn => (
                    <article key={checkIn.id} className="stack-item">
                      <div className="stack-item-topline">
                        <strong>{formatDate(checkIn.checkInDate)}</strong>
                        <span className="badge badge-info">{describeCheckIn(checkIn)}</span>
                      </div>
                      <p>{checkIn.notes ?? 'Bez poznámek.'}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty compact">Zatím nejsou žádné kontroly.</div>
              )}
            </article>
          </section>

          <section className="dashboard-layout">
            <article className="card section-card">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">Mantinely</div>
                  <h2>Aktuální omezení</h2>
                </div>
                <Link className="btn btn-secondary btn-sm" to="/mantinely">
                  Správa mantinelů
                </Link>
              </div>

              {summary?.constraints.length ? (
                <div className="stack-list">
                  {summary.constraints.map(item => (
                    <article key={item.id} className="stack-item">
                      <div className="stack-item-topline">
                        <strong>{item.label}</strong>
                        <span className={itemBadgeClass(item.kind)}>{item.kind === 'Constraint' ? 'Omezení' : 'Preference'}</span>
                      </div>
                      <p>{item.value ?? item.notes ?? 'Bez doplňujícího popisu.'}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty compact">Zatím nejsou evidovaná omezení.</div>
              )}
            </article>

            <article className="card section-card">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">Profil</div>
                  <h2>Rychlý kontext</h2>
                </div>
                <Link className="btn btn-secondary btn-sm" to="/profil">
                  Otevřít profil
                </Link>
              </div>

              <div className="detail-grid">
                {profileSnapshot(summary).map(item => (
                  <div key={item.label} className="detail-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </div>
  )
}
