import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DashboardPayload, TeamMemberPreview } from '../types'
import * as api from '../api/peermatchApi'
import { MetricBar } from '../components/MetricBar'

function ScorePill({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  return <span className="score-pill">{pct}% match</span>
}

function MemberCard({ m }: { m: TeamMemberPreview }) {
  return (
    <article className="member-card">
      <div className="member-card__head">
        <h3>{m.displayName}</h3>
        <ScorePill score={m.compatibilityScore} />
      </div>
      <p className="muted">{m.major}</p>
      <ul className="tag-list">
        {m.skills.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </article>
  )
}

function TeamCard({ team }: { team: NonNullable<DashboardPayload['allAssignments']>[number] }) {
  return (
    <article className="team-card panel panel--subtle">
      <div className="team-card__head">
        <h3>{team.projectTitle}</h3>
        <p className="muted">
          Team <code className="inline-code">{team.teamId}</code> · Project{' '}
          <code className="inline-code">{team.projectId}</code>
        </p>
      </div>
      <div className="member-grid">
        {team.members.map((member) => (
          <MemberCard key={member.userId} m={member} />
        ))}
      </div>
    </article>
  )
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchMsg, setMatchMsg] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const d = await api.getDashboard()
        if (!cancelled) setData(d)
      } catch {
        if (!cancelled)
          setData({
            userProfile: null,
            assignment: null,
            suggestedPeers: [],
          })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const d = await api.getDashboard()
      setData(d)
    } catch {
      setData({
        userProfile: null,
        assignment: null,
        suggestedPeers: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const runMatch = async () => {
    setRunning(true)
    setMatchMsg(null)
    try {
      const { jobId } = await api.triggerMatching()
      setMatchMsg(`Matching completed (${jobId}). Refreshing assignment...`)
      
      // Refresh dashboard after a short delay to fetch the new assignments
      setTimeout(async () => {
        try {
          const d = await api.getDashboard()
          setData(d)
          setMatchMsg(`Team assignments updated successfully!`)
        } catch {
          setMatchMsg(`Matching completed but failed to fetch new assignments. Click Refresh to retry.`)
        }
      }, 1000)
    } catch (e) {
      setMatchMsg(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setRunning(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="page">
        <p className="muted">Loading dashboard…</p>
      </div>
    )
  }

  const assignment = data?.assignment
  const user = data?.userProfile
  const otherTeams = data?.allAssignments?.filter(
    (team) => team.teamId !== assignment?.teamId
  )

  return (
    <div className="page dashboard">
      <div className="dashboard__head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="lede">
            View your team assignment, composition, and evaluation-style metrics
            once the matcher runs.
          </p>
        </div>
        <div className="dashboard__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={runMatch}
            disabled={running}
          >
            {running ? 'Triggering…' : 'Trigger matching (API)'}
          </button>
        </div>
      </div>

      {matchMsg && (
        <div className="alert alert--ok" role="status">
          {matchMsg}
        </div>
      )}

      {!user && (
        <div className="alert alert--error" role="status">
          No profile yet.{' '}
          <Link to="/profile">Complete your profile</Link> to see richer results.
        </div>
      )}

      <section className="panel">
        <h2 className="panel__title">Your assignment</h2>
        {assignment ? (
          <>
            <p className="assignment-title">{assignment.projectTitle}</p>
            <p className="muted">
              Team <code className="inline-code">{assignment.teamId}</code> ·
              Project{' '}
              <code className="inline-code">{assignment.projectId}</code>
            </p>
            <div className="metrics-grid">
              <MetricBar
                label="Average team similarity"
                value={assignment.metrics.averageTeamSimilarity}
                hint="How alike teammates are on skills, style, and interests."
              />
              <MetricBar
                label="Skill coverage"
                value={assignment.metrics.skillCoverage}
                hint="Share of required skills represented on the team."
              />
              <MetricBar
                label="Preference satisfaction"
                value={assignment.metrics.preferenceSatisfaction}
                hint="How well peer and project preferences were honored."
              />
              <MetricBar
                label="Availability overlap"
                value={assignment.metrics.availabilityOverlap}
                hint="Estimated common meeting windows."
              />
            </div>
            <h3 className="subsection-title">Team composition</h3>
            <div className="member-grid">
              {assignment.members.map((m) => (
                <MemberCard key={m.userId} m={m} />
              ))}
            </div>
          </>
        ) : (
          <p className="muted">
            No assignment yet. After the backend runs clustering and assignment,
            this panel will show your project and teammates.
          </p>
        )}
      </section>

      {otherTeams && otherTeams.length > 0 && (
        <section className="panel">
          <h2 className="panel__title">Other teams and projects</h2>
          <p className="field-help">
            See how the matcher grouped your classmates and which project each team was assigned.
          </p>
          <div className="team-grid">
            {otherTeams.map((team) => (
              <TeamCard key={team.teamId} team={team} />
            ))}
          </div>
        </section>
      )}

      {data?.suggestedPeers && data.suggestedPeers.length > 0 && (
        <section className="panel">
          <h2 className="panel__title">Suggested peers (preview)</h2>
          <p className="field-help">
            Mock similarity scores; replace with matrix output from Spark.
          </p>
          <div className="member-grid">
            {data.suggestedPeers.map((m) => (
              <MemberCard key={m.userId} m={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
