import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export type SuccessActionLink = {
  to: string
  label: string
  variant?: 'primary' | 'ghost'
}

type SaveSuccessPanelProps = {
  title?: string
  lead: string
  hint?: string
  links: SuccessActionLink[]
  editLabel: string
  onEdit: () => void
}

export function SaveSuccessPanel({
  title = 'Thank you',
  lead,
  hint,
  links,
  editLabel,
  onEdit,
}: SaveSuccessPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="page">
      <div
        ref={rootRef}
        className="profile-success"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="profile-success__icon" aria-hidden>
          <svg viewBox="0 0 48 48" width="56" height="56" fill="none">
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="currentColor"
              fillOpacity="0.12"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M14 24.5l7 7 13-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="profile-success__title">{title}</h1>
        <p className="profile-success__lead">{lead}</p>
        {hint ? (
          <p className="muted profile-success__hint">{hint}</p>
        ) : null}
        <div className="profile-success__actions">
          {links.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              className={`btn btn--${l.variant ?? 'ghost'}`}
            >
              {l.label}
            </Link>
          ))}
          <button type="button" className="btn btn--ghost" onClick={onEdit}>
            {editLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
