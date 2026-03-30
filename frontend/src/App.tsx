import { FormEvent, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import SearchPage from './pages/SearchPage'

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
        <Link to="/"><h1>JarvisFitness</h1></Link>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/search">Search</Link>
        </div>
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search goals, notes, constraints..."
          />
        </form>
      </nav>

      <main className="app-shell">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </>
  )
}
