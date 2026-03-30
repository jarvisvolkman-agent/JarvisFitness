import { FormEvent, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, SearchResult } from '../api'
import { getEntityTypeLabel, getMatchFieldLabel } from '../i18n'

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
    <section className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">Hledání</div>
          <h1>Průřezové vyhledávání napříč fitness daty</h1>
          <p>Najdi cíle, tréninkové plány, jednotlivé tréninky, profilové poznámky i záznamy z kontrol z jednoho místa.</p>
        </div>
        <div className="actions-right">
          <Link className="btn btn-secondary" to="/">
            Zpět na přehled
          </Link>
        </div>
      </div>

      <div className="card">
        <form className="toolbar-form" onSubmit={onSubmit}>
          <div className="form-group search-field">
            <label htmlFor="search-page-query">Dotaz</label>
            <input id="search-page-query" value={query} onChange={event => setQuery(event.target.value)} placeholder="Zadej alespoň dva znaky" />
          </div>
          <div className="toolbar-actions">
            <button type="submit" className="btn btn-primary">
              Vyhledat
            </button>
          </div>
        </form>

        {loading ? <div className="loading">Probíhá vyhledávání...</div> : null}
        {error ? <div className="error">{error}</div> : null}

        {!loading && !error && results.length === 0 ? <div className="empty">Zadej alespoň dva znaky a prohledej celý fitness workspace.</div> : null}

        {results.length > 0 ? (
          <div className="search-results-card">
            {results.map(result => (
              <article className="search-result-row" key={`${result.entityType}-${result.entityId}`}>
                <div className="search-result-main">
                  <div className="search-result-topline">
                    <span className="badge badge-info">{getEntityTypeLabel(result.entityType)}</span>
                    <span className="search-match-field">Pole: {getMatchFieldLabel(result.matchField)}</span>
                  </div>
                  <h2>{result.title}</h2>
                  <p>{result.matchSnippet}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
