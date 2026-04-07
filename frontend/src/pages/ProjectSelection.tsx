import { useEffect, useMemo, useState } from 'react'
import type { ProjectPreference, ProjectProfile } from '../types'
import * as api from '../api/peermatchApi'
import { SaveSuccessPanel } from '../components/SaveSuccessPanel'

const RATING_MAX = 5

function normalizePrefs(raw: ProjectPreference[]): ProjectPreference[] {
  return raw
    .filter((p) => p.projectId)
    .map((p) => ({
      projectId: p.projectId,
      rank: p.rank,
      rating:
        typeof p.rating === 'number' &&
        p.rating >= 1 &&
        p.rating <= RATING_MAX
          ? p.rating
          : 4,
    }))
    .sort((a, b) => a.rank - b.rank)
    .map((p, i) => ({ ...p, rank: i + 1 }))
}

export function ProjectSelectionPage() {
  const [catalog, setCatalog] = useState<ProjectProfile[]>([])
  const [favorites, setFavorites] = useState<ProjectPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [projects, existing] = await Promise.all([
        api.listCatalogProjects(),
        api.getProjectPreferences(),
      ])
      if (cancelled) return
      setCatalog(projects)
      setFavorites(normalizePrefs(existing))
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.projectId)),
    [favorites]
  )

  const projectById = useMemo(() => {
    const m = new Map<string, ProjectProfile>()
    catalog.forEach((p) => {
      const id = p.id ?? ''
      if (id) m.set(id, p)
    })
    return m
  }, [catalog])

  const notSelected = useMemo(
    () => catalog.filter((p) => !favoriteIds.has(p.id ?? '')),
    [catalog, favoriteIds]
  )

  const orderedFavorites = useMemo(
    () => [...favorites].sort((a, b) => a.rank - b.rank),
    [favorites]
  )

  const addFavorite = (projectId: string) => {
    if (!projectId || favoriteIds.has(projectId)) return
    setFavorites((prev) => {
      const nextRank = prev.length + 1
      return [
        ...prev,
        { projectId, rank: nextRank, rating: RATING_MAX },
      ]
    })
  }

  const removeFavorite = (projectId: string) => {
    setFavorites((prev) =>
      normalizePrefs(prev.filter((p) => p.projectId !== projectId))
    )
  }

  const setRating = (projectId: string, rating: number) => {
    const r = Math.min(RATING_MAX, Math.max(1, Math.round(rating)))
    setFavorites((prev) =>
      prev.map((p) => (p.projectId === projectId ? { ...p, rating: r } : p))
    )
  }

  const moveFavorite = (projectId: string, dir: -1 | 1) => {
    const list = orderedFavorites.map((x) => x.projectId)
    const idx = list.indexOf(projectId)
    const j = idx + dir
    if (idx < 0 || j < 0 || j >= list.length) return
    const nextIds = [...list]
    ;[nextIds[idx], nextIds[j]] = [nextIds[j], nextIds[idx]]
    setFavorites((prev) => {
      const byId = new Map(prev.map((p) => [p.projectId, p]))
      return nextIds.map((id, i) => {
        const base = byId.get(id)!
        return { ...base, rank: i + 1 }
      })
    })
  }

  const onSave = async () => {
    setSaving(true)
    setSaveError(null)
    const prefs = normalizePrefs(favorites)
    try {
      await api.saveProjectPreferences(prefs)
      setFavorites(prefs)
      setShowThankYou(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading projects…</p>
      </div>
    )
  }

  if (showThankYou) {
    return (
      <SaveSuccessPanel
        lead="Your project preferences have been recorded. The matching system will use your picks and ratings when forming teams."
        hint="You can update your choices anytime—just open this page again and save."
        links={[
          { to: '/dashboard', label: 'View dashboard', variant: 'primary' },
          { to: '/profile', label: 'Your profile', variant: 'ghost' },
          { to: '/project-profile', label: 'Project profile', variant: 'ghost' },
        ]}
        editLabel="Edit project preferences"
        onEdit={() => setShowThankYou(false)}
      />
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">Project preferences</h1>
      <p className="lede">
        Add only the projects you care about, then rate each one and put your
        top choices first. You do not need to rank the whole catalog.
      </p>

      {saveError && (
        <div className="alert alert--error" role="alert">
          {saveError}
        </div>
      )}

      <section className="panel project-picks-panel">
        <h2 className="panel__title">Your picks</h2>
        <p className="field-help">
          Order = priority if the matcher breaks ties. Stars = how much you want
          that project (1–{RATING_MAX}).
        </p>
        {orderedFavorites.length === 0 ? (
          <p className="muted">
            No projects yet. Add some from the catalog below.
          </p>
        ) : (
          <ul className="project-list project-list--favorites">
            {orderedFavorites.map((f) => {
              const p = projectById.get(f.projectId)
              if (!p) return null
              return (
                <li key={f.projectId} className="project-card project-card--favorite">
                  <div className="project-card__main">
                    <span className="rank-badge" aria-label="Priority order">
                      {f.rank}
                    </span>
                    <div>
                      <h2 className="project-card__title">{p.title}</h2>
                      <p className="project-card__meta">{p.courseCode}</p>
                      <p className="project-card__desc">{p.description}</p>
                      <div
                        className="star-row"
                        role="group"
                        aria-label={`Interest rating for ${p.title}`}
                      >
                        <span className="star-row__label">Rating</span>
                        {Array.from({ length: RATING_MAX }, (_, i) => {
                          const n = i + 1
                          const on = n <= f.rating
                          return (
                            <button
                              key={n}
                              type="button"
                              className={`star-btn${on ? ' star-btn--on' : ''}`}
                              aria-label={`${n} out of ${RATING_MAX} stars`}
                              aria-pressed={on}
                              onClick={() => setRating(f.projectId, n)}
                            >
                              ★
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="project-card__actions project-card__actions--stack">
                    <button
                      type="button"
                      className="btn btn--small btn--ghost"
                      onClick={() => moveFavorite(f.projectId, -1)}
                      aria-label="Move higher priority"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="btn btn--small btn--ghost"
                      onClick={() => moveFavorite(f.projectId, 1)}
                      aria-label="Move lower priority"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="btn btn--small btn--ghost"
                      onClick={() => removeFavorite(f.projectId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2 className="panel__title">All projects</h2>
        <p className="field-help">
          Browse everything offered this term. Use &quot;Add to picks&quot; for
          projects you might want—ignore the rest.
        </p>
        {notSelected.length === 0 ? (
          <p className="muted">You have added every project to your picks.</p>
        ) : (
          <ul className="project-list project-list--browse">
            {notSelected.map((p) => {
              const id = p.id ?? ''
              return (
                <li key={id} className="project-card project-card--compact">
                  <div className="project-card__main">
                    <div>
                      <h2 className="project-card__title">{p.title}</h2>
                      <p className="project-card__meta">{p.courseCode}</p>
                      <p className="project-card__desc">{p.description}</p>
                      <p className="project-card__skills">
                        <strong>Skills:</strong>{' '}
                        {p.requiredSkills.join(', ') || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="project-card__actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--small"
                      onClick={() => addFavorite(id)}
                    >
                      Add to picks
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </div>
  )
}
