import { FormEvent, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import SearchPage from './pages/SearchPage'

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
          <span className="brand-meta">Lokální fitness workspace</span>
        </div>

        <div className="nav-links">
          <NavLink to="/" end className={navClassName}>
            Přehled
          </NavLink>
          <NavLink to="/search" className={navClassName}>
            Hledání
          </NavLink>
        </div>

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
      </nav>

      <main className="app fitness-app">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </>
  )
}
