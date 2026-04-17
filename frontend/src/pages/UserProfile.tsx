import { useEffect, useRef, useState } from 'react'
import type { UserProfile, TeamMemberPreview, ProjectProfile } from '../types'
import * as api from '../api/peermatchApi'
import { ChipToggle } from '../components/ChipToggle'
import { SaveSuccessPanel } from '../components/SaveSuccessPanel'
import { WeeklyAvailabilityGrid } from '../components/WeeklyAvailabilityGrid'
import {
  countSelectedSlots,
  createEmptyWeeklyAvailability,
  normalizeWeeklyAvailability,
} from '../lib/availability'
import { SKILL_OPTIONS, TEAM_ROLE_OPTIONS } from '../mocks/seedData'

const emptyProfile: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  major: '',
  skills: [],
  weeklyAvailability: createEmptyWeeklyAvailability(),
  // workingStyle: WORKING_STYLES[0] ?? '',
  preferredPeerIds: [],
  preferredProjectIds: [],
  teamRoles: [],
  bio: '',
}

function validate(p: UserProfile): string[] {
  const errs: string[] = []
  if (!p.firstName.trim() && !p.lastName.trim()) errs.push('First and last name is required.')
  if (!p.email.trim()) errs.push('Email is required.')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))
    errs.push('Enter a valid email (GT email when auth is enabled).')
  if (!p.major.trim()) errs.push('Major or program is required.')
  if (p.skills.length === 0) errs.push('Select at least one skill.')
  // if (!p.workingStyle) errs.push('Choose a working style.')
  if (countSelectedSlots(p.weeklyAvailability) === 0)
    errs.push(
      'Select at least one half-hour slot when you are free (any day—you do not need to fill every day).'
    )
  return errs
}

export function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [users, setUsers] = useState<TeamMemberPreview[]>([])
  const [projects, setProjects] = useState<ProjectProfile[]>([])
  const errorAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (errors.length > 0) {
      errorAnchorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [errors])

  useEffect(() => {
    setProfile(emptyProfile)
}, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const existing = await api.getUserProfile()
        if (!cancelled && existing) {
          const rest = {
            ...(existing as UserProfile & { availability?: unknown }),
          }
          delete rest.availability
          setProfile({
            ...emptyProfile,
            ...rest,
            weeklyAvailability: normalizeWeeklyAvailability(existing),
          })
        }
        const [allUsers, allProjects] = await Promise.all([
          api.getAllUsers(),
          api.listCatalogProjects(),
        ])
        if (!cancelled) {
          setUsers(allUsers)
          setProjects(allProjects)
        }
      } catch {
        // Backend unreachable or fetch error — still show the form.
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleSkill = (s: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.includes(s)
        ? prev.skills.filter((x) => x !== s)
        : [...prev.skills, s],
    }))
  }

  const togglePeer = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      preferredPeerIds: prev.preferredPeerIds.includes(id)
        ? prev.preferredPeerIds.filter((x) => x !== id)
        : [...prev.preferredPeerIds, id],
    }))
  }

  const toggleProject = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      preferredProjectIds: (prev.preferredProjectIds ?? []).includes(id)
        ? (prev.preferredProjectIds ?? []).filter((x) => x !== id)
        : [...(prev.preferredProjectIds ?? []), id],
    }))
  }

  const toggleTeamRole = (role: string) => {
    setProfile((prev) => ({
      ...prev,
      teamRoles: (prev.teamRoles ?? []).includes(role)
        ? (prev.teamRoles ?? []).filter((x) => x !== role)
        : [...(prev.teamRoles ?? []), role],
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate(profile)
    setErrors(v)
    setSaveError(null)
    if (v.length) return
    setSaving(true)
    try {
      await api.saveUserProfile(profile)
      setErrors([])
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
        <p className="muted">Loading profile…</p>
      </div>
    )
  }

  if (showThankYou) {
    return (
      <SaveSuccessPanel
        lead="Your profile has been recorded. We will use it for team matching and project preferences."
        hint="You can set project preferences next, or come back later from the navigation menu."
        links={[
          {
            to: '/projects',
            label: 'Continue to project preferences',
            variant: 'primary',
          },
          { to: '/dashboard', label: 'View dashboard', variant: 'ghost' },
        ]}
        editLabel="Edit my profile"
        onEdit={() => setShowThankYou(false)}
      />
    )
  }

  const slotCount = countSelectedSlots(profile.weeklyAvailability)

  return (
    <div className="page">
      <h1 className="page-title">Your profile</h1>
      <p className="lede">
        Skills, availability, and peer preferences feed the matching pipeline.
        Field names mirror what your backend team can persist.
      </p>

      <form className="form-card" onSubmit={onSubmit} noValidate>
        <div ref={errorAnchorRef} className="error-anchor" aria-hidden />
        {errors.length > 0 && (
          <div className="alert alert--error" role="alert">
            <p className="alert__title">Please fix the following:</p>
            <ul>
              {errors.map((e, i) => (
                <li key={`${i}-${e}`}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        {saveError && (
          <div className="alert alert--error" role="alert">
            {saveError}
          </div>
        )}

        <label className="field">
          <span>First Name</span>
          <input
            required
            value={profile.firstName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, firstName: e.target.value }))
            }
            autoComplete="name"
          />
        
        </label>
                <label className="field">
          <span>Last Name</span>
          <input
            required
            value={profile.lastName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, lastName: e.target.value }))
            }
            autoComplete="name"
          />
        </label>


        <label className="field">
          <span>Email</span>
          <input
            type="email"
            required
            placeholder="you@gatech.edu"
            value={profile.email}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Major / program</span>
          <input
            required
            value={profile.major}
            onChange={(e) =>
              setProfile((p) => ({ ...p, major: e.target.value }))
            }
          />
        </label>

        <fieldset className="field">
          <legend>Skills</legend>
          <div className="chip-grid">
            {SKILL_OPTIONS.map((s) => (
              <ChipToggle
                key={s}
                label={s}
                selected={profile.skills.includes(s)}
                onToggle={() => toggleSkill(s)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Team roles (optional)</legend>
          <p className="field-help">
            Select the roles you can fulfill on a team. This helps the matching algorithm form balanced teams.
          </p>
          <div className="chip-grid">
            {TEAM_ROLE_OPTIONS.map((role) => (
              <ChipToggle
                key={role}
                label={role}
                selected={(profile.teamRoles ?? []).includes(role)}
                onToggle={() => toggleTeamRole(role)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="field field--availability">
          <legend>Weekly availability</legend>
          <p
            className={
              slotCount === 0
                ? 'availability-status availability-status--warn'
                : 'availability-status'
            }
          >
            {slotCount} half-hour slot{slotCount === 1 ? '' : 's'} marked as
            free (only the times you chose; at least one anywhere in the week to
            save).
          </p>
          <WeeklyAvailabilityGrid
            value={profile.weeklyAvailability}
            onChange={(weeklyAvailability) =>
              setProfile((p) => ({ ...p, weeklyAvailability }))
            }
          />
        </fieldset>

        {/* <label className="field">
          <span>Working style</span>
          <select
            value={profile.workingStyle}
            onChange={(e) =>
              setProfile((p) => ({ ...p, workingStyle: e.target.value }))
            }
          >
            {WORKING_STYLES.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label> */}

        <fieldset className="field">
          <legend>Peer preferences (optional)</legend>
          <p className="field-help">
            Select classmates you would like to work with. The matcher uses this
            as a soft constraint alongside skills and availability.
          </p>
          <div className="chip-grid">
            {users.map((r) => (
              <ChipToggle
                key={r.userId}
                label={`${r.displayName} (${r.major})`}
                selected={profile.preferredPeerIds.includes(r.userId)}
                onToggle={() => togglePeer(r.userId)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Project preferences (optional)</legend>
          <p className="field-help">
            Select projects you are interested in working on. The matcher considers your project preferences when forming teams.
          </p>
          <div className="chip-grid">
            {projects.map((p) => (
              <ChipToggle
                key={p.id}
                label={p.title}
                selected={(profile.preferredProjectIds ?? []).includes(p.id ?? '')}
                onToggle={() => toggleProject(p.id ?? '')}
              />
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Short bio (optional)</span>
          <textarea
            rows={3}
            value={profile.bio ?? ''}
            onChange={(e) =>
              setProfile((p) => ({ ...p, bio: e.target.value }))
            }
          />
        </label>

        {errors.length > 0 && (
          <div className="alert alert--error form-actions-errors" role="alert">
            <ul>
              {errors.map((e, i) => (
                <li key={`bottom-${i}-${e}`}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
