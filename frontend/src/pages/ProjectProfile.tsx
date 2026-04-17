import { useEffect, useState } from 'react'
import type { ProjectProfile } from '../types'
import * as api from '../api/peermatchApi'
import { ChipToggle } from '../components/ChipToggle'
import { SaveSuccessPanel } from '../components/SaveSuccessPanel'
import { SKILL_OPTIONS } from '../mocks/seedData'

const empty: ProjectProfile = {
  title: '',
  courseCode: '',
  description: '',
  requiredSkills: [],
  teamSizeMin: 3,
  teamSizeMax: 4,
  teamRoles: [],
}

const DEFAULT_ROLES = ['Frontend', 'Backend', 'Data/ML', 'PM/Documentation']

function validate(p: ProjectProfile): string[] {
  const errs: string[] = []
  if (!p.title.trim()) errs.push('Project title is required.')
  if (!p.courseCode.trim()) errs.push('Course code is required.')
  if (!p.description.trim()) errs.push('Description is required.')
  if (p.requiredSkills.length === 0)
    errs.push('Add at least one required skill.')
  if (p.teamSizeMin < 2 || p.teamSizeMax < p.teamSizeMin)
    errs.push('Team size: min ≥ 2 and max ≥ min.')
  return errs
}

export function ProjectProfilePage() {
  const [project, setProject] = useState<ProjectProfile>(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const existing = await api.getProjectProfile()
        if (!cancelled && existing) setProject({ ...empty, ...existing })
      } catch {
        // Backend unreachable — show empty form.
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleSkill = (s: string) => {
    setProject((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(s)
        ? prev.requiredSkills.filter((x) => x !== s)
        : [...prev.requiredSkills, s],
    }))
  }

  const toggleRole = (r: string) => {
    const roles = project.teamRoles ?? []
    setProject((prev) => ({
      ...prev,
      teamRoles: roles.includes(r)
        ? roles.filter((x) => x !== r)
        : [...roles, r],
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate(project)
    setErrors(v)
    if (v.length) return
    setSaving(true)
    setSaveError(null)
    try {
      await api.saveProjectProfile(project)
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
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (showThankYou) {
    return (
      <SaveSuccessPanel
        lead="Your project proposal has been recorded. Classmates can consider it when they set preferences, and the course can include it in matching."
        hint="You can refine the description or skills later if plans change."
        links={[
          { to: '/projects', label: 'Project preferences', variant: 'primary' },
          { to: '/dashboard', label: 'View dashboard', variant: 'ghost' },
          { to: '/profile', label: 'Your profile', variant: 'ghost' },
        ]}
        editLabel="Edit project profile"
        onEdit={() => setShowThankYou(false)}
      />
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">Project profile</h1>
      <p className="lede">
        If you are proposing a project, describe it here so others can rank it
        and the matcher can align required skills and roles.
      </p>

      <form className="form-card" onSubmit={onSubmit} noValidate>
        {errors.length > 0 && (
          <div className="alert alert--error" role="alert">
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
          <span>Project title</span>
          <input
            required
            value={project.title}
            onChange={(e) =>
              setProject((p) => ({ ...p, title: e.target.value }))
            }
          />
        </label>

        <label className="field">
          <span>Course code</span>
          <input
            required
            placeholder="CS 4675"
            value={project.courseCode}
            onChange={(e) =>
              setProject((p) => ({ ...p, courseCode: e.target.value }))
            }
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            required
            rows={4}
            value={project.description}
            onChange={(e) =>
              setProject((p) => ({ ...p, description: e.target.value }))
            }
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Min team size</span>
            <input
              type="number"
              min={2}
              max={12}
              value={project.teamSizeMin}
              onChange={(e) =>
                setProject((p) => ({
                  ...p,
                  teamSizeMin: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="field">
            <span>Max team size</span>
            <input
              type="number"
              min={2}
              max={12}
              value={project.teamSizeMax}
              onChange={(e) =>
                setProject((p) => ({
                  ...p,
                  teamSizeMax: Number(e.target.value),
                }))
              }
            />
          </label>
        </div>

        <fieldset className="field">
          <legend>Required skills</legend>
          <div className="chip-grid">
            {SKILL_OPTIONS.map((s) => (
              <ChipToggle
                key={s}
                label={s}
                selected={project.requiredSkills.includes(s)}
                onToggle={() => toggleSkill(s)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Team roles to cover (optional)</legend>
          <p className="field-help">
            Helps the backend build feature vectors and balance roles across the
            team.
          </p>
          <div className="chip-grid">
            {DEFAULT_ROLES.map((r) => (
              <ChipToggle
                key={r}
                label={r}
                selected={(project.teamRoles ?? []).includes(r)}
                onToggle={() => toggleRole(r)}
              />
            ))}
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save project profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
