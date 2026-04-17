import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? ' nav-link--active' : ''}`

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="brand" end>
          <span className="brand-mark" aria-hidden />
          PeerMatch
        </NavLink>
        <nav className="app-nav" aria-label="Main">
          <NavLink to="/profile" className={linkClass}>
            Your profile
          </NavLink>
          <NavLink to="/classmates" className={linkClass}>
            Classmates
          </NavLink>
          <NavLink to="/project-profile" className={linkClass}>
            Project profile
          </NavLink>
          <NavLink to="/projects" className={linkClass}>
            Project preferences
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <span>
          API base:{' '}
          <code className="inline-code">
            {import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'}
          </code>
          . Start Flask on port 5000, or set{' '}
          <code className="inline-code">VITE_API_BASE_URL</code> in{' '}
          <code className="inline-code">frontend/.env</code>.
        </span>
      </footer>
    </div>
  )
}
