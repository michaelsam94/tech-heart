import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="blog-shell">
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Tech Heart
        </Link>
        <p className="tagline">Technology trends and hands-on notes for builders</p>
        <nav className="site-nav" aria-label="Primary">
          <Link to="/">Articles</Link>
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>
          Built with React and Vite. Content is for education; verify against
          official docs before production use.
        </p>
      </footer>
    </div>
  )
}
