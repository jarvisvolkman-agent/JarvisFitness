import { FormEvent, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, SearchResult } from '../api'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = searchParams.get('q')
    if (!q || q.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)
    api.search(q)
      .then(setResults)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [searchParams])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSearchParams(query.trim().length >= 2 ? { q: query.trim() } : {})
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Search</span>
          <h2>Cross-domain lookup</h2>
        </div>
        <Link className="ghost-link" to="/">Back to dashboard</Link>
      </div>

      <form className="search-form standalone" onSubmit={onSubmit}>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search goals, notes, constraints..." />
        <button type="submit">Search</button>
      </form>

      {loading ? <p className="status">Searching…</p> : null}
      {error ? <p className="status error">{error}</p> : null}

      <div className="search-results">
        {results.map(result => (
          <article className="search-result" key={`${result.entityType}-${result.entityId}`}>
            <div>
              <span className="tag">{result.entityType}</span>
              <h3>{result.title}</h3>
            </div>
            <p><strong>{result.matchField}:</strong> {result.matchSnippet}</p>
          </article>
        ))}
        {!loading && !error && results.length === 0 ? (
          <p className="status">Enter at least two characters to search the fitness workspace.</p>
        ) : null}
      </div>
    </section>
  )
}
