import { useEffect, useMemo, useState } from 'react'
import type { ProjectProfile } from '../types'
import * as api from '../api/peermatchApi'

export function ProjectSelectionPage() {
  const [projects, setProjects] = useState<ProjectProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await api.listCatalogProjects()
        if (!cancelled) setProjects(list)
      } catch {
        if (!cancelled) setProjects([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => {
      const blob = [
        p.title,
        p.courseCode,
        p.description,
        ...(p.requiredSkills ?? []),
        ...(p.teamRoles ?? []),
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [projects, query])

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading projects…</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">Projects</h1>
      <p className="lede">
        Browse all available projects for this course. View details about each project including required skills, team size, and roles.
      </p>

      <label className="field directory-search">
        <span>Search by title, code, skill, or keyword</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. React, Machine Learning, backend"
          autoComplete="off"
        />
      </label>

      <ul className="peer-grid">
        {filtered.map((p) => (
          <li key={p.id} className="peer-card">
            <h2 className="peer-card__name">{p.title}</h2>
            <p className="peer-card__meta">{p.courseCode}</p>
            <p className="peer-card__bio">{p.description}</p>
            <div>
              <p className="peer-card__meta" style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                <strong>Team size:</strong> {p.teamSizeMin}–{p.teamSizeMax} people
              </p>
            </div>
            {p.requiredSkills && p.requiredSkills.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <p className="peer-card__meta" style={{ marginBottom: '0.25rem' }}>
                  <strong>Required skills:</strong>
                </p>
                <ul className="tag-list peer-card__skills">
                  {p.requiredSkills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {p.teamRoles && p.teamRoles.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <p className="peer-card__meta" style={{ marginBottom: '0.25rem' }}>
                  <strong>Roles:</strong>
                </p>
                <ul className="tag-list peer-card__skills">
                  {p.teamRoles.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="muted">No projects match your search. Try a different term.</p>
      ) : null}
    </div>
  )
}
