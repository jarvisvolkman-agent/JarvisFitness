import { FormEvent, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import CheckInsPage from './pages/CheckInsPage'
import DashboardPage from './pages/DashboardPage'
import GoalsPage from './pages/GoalsPage'
import PreferencesPage from './pages/PreferencesPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'

const mainNav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/profil', label: 'Profil' },
  { to: '/cile', label: 'Cíle' },
  { to: '/kontroly', label: 'Kontroly' },
  { to: '/mantinely', label: 'Mantinely' },
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
          <span className="brand-meta">Dashboard pro profil, cíle, kontroly a mantinely</span>
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
              <input
                type="text"
                placeholder="Hledat cíle, poznámky..."
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </form>
          </div>
        </div>
      </nav>

      <main className="app fitness-app">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/cile" element={<GoalsPage />} />
          <Route path="/kontroly" element={<CheckInsPage />} />
          <Route path="/mantinely" element={<PreferencesPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </>
  )
}
