import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="page landing">
      <p className="eyebrow">Course team formation</p>
      <h1 className="page-title">Find teammates who fit your project and schedule</h1>
      <p className="lede">
        PeerMatch helps you share skills, availability, and preferences so
        matching can balance teams objectively—not just by who you already know.
      </p>
      <div className="cta-row">
        <Link to="/profile" className="btn btn--primary">
          Create your profile
        </Link>
        <Link to="/dashboard" className="btn btn--ghost">
          View dashboard
        </Link>
        <Link to="/classmates" className="btn btn--ghost">
          Browse classmates
        </Link>
      </div>
      <ul className="steps">
        <li>
          <strong>1.</strong> Complete your student profile and peer preferences (pick
          availability on the weekly grid).
        </li>
        <li>
          <strong>2.</strong> Optionally describe a project you are proposing.
        </li>
        <li>
          <strong>3.</strong> Rank available projects, then review matches and team
          composition on the dashboard.
        </li>
      </ul>
    </div>
  )
}
