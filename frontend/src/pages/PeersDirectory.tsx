import { useEffect, useMemo, useState } from 'react'
import type { PublicUserProfile } from '../types'
import * as api from '../api/peermatchApi'

export function PeersDirectoryPage() {
  const [peers, setPeers] = useState<PublicUserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await api.listPublicUserProfiles()
        if (!cancelled) setPeers(list)
      } catch {
        if (!cancelled) setPeers([])
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
    if (!q) return peers
    return peers.filter((p) => {
      const blob = [
        `${p.firstName} ${p.lastName}`,
        p.major,
        p.bio ?? '',
        ...(p.skills ?? []),
        p.email ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [peers, query])

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading classmates…</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">Classmates</h1>
      <p className="lede">
        Browse profiles others have chosen to share in this course. With a live
        API, this list comes from your backend; for now it uses sample data plus
        your own saved profile is separate under &quot;Your profile&quot;.
      </p>

      <label className="field directory-search">
        <span>Search by name, major, skill, or keyword</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. React, HCI, standups"
          autoComplete="off"
        />
      </label>

      <ul className="peer-grid">
        {filtered.map((p) => (
          <li key={p.userId} className="peer-card">
            <h2 className="peer-card__name">{`${p.firstName} ${p.lastName}`}</h2>
            <p className="peer-card__meta">{p.major}</p>
            {p.email ? (
              <p className="peer-card__email">
                <a href={`mailto:${p.email}`}>{p.email}</a>
              </p>
            ) : null}
            {p.availabilitySummary ? (
              <p className="peer-card__avail">
                <strong>Availability:</strong> {p.availabilitySummary}
              </p>
            ) : null}
            {p.bio ? <p className="peer-card__bio">{p.bio}</p> : null}
            <ul className="tag-list peer-card__skills">
              {p.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="muted">No matches. Try a different search.</p>
      ) : null}
    </div>
  )
}
