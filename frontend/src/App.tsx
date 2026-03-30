import { FormEvent, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import CheckInsPage from './pages/CheckInsPage'
import DashboardPage from './pages/DashboardPage'
import GoalsPage from './pages/GoalsPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import TrainingPlansPage from './pages/TrainingPlansPage'
import WorkoutsPage from './pages/WorkoutsPage'

const mainNav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/profil', label: 'Profil' },
  { to: '/cile', label: 'Cíle' },
  { to: '/treninkove-plany', label: 'Plány' },
  { to: '/treningy', label: 'Tréninky' },
  { to: '/kontroly', label: 'Kontroly' },
]

function navClassName({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link active' : 'nav-link'
}

export default function App() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="brand-stack">
          <NavLink to="/" className="brand-mark">
            JarvisFitness
          </NavLink>
          <span className="brand-meta">Dashboard pro profil, cíle, tréninkové plány, tréninky a kontroly</span>
        </div>

        <div className="nav-links">
          {mainNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClassName}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="toolbar-cluster">
          <NavLink to="/search" className={navClassName}>
            Hledání
          </NavLink>

          <div className="search-box">
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Hledat cíle, plány, tréninky..." value={query} onChange={event => setQuery(event.target.value)} />
            </form>
          </div>
        </div>
      </nav>

      <main className="app fitness-app">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/cile" element={<GoalsPage />} />
          <Route path="/treninkove-plany" element={<TrainingPlansPage />} />
          <Route path="/treningy" element={<WorkoutsPage />} />
          <Route path="/kontroly" element={<CheckInsPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </>
  )
}
