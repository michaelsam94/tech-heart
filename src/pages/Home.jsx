import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { articles } from '../data/articles'
import { useGapUnlocked } from '../hooks/useGapUnlocked'
import { filterArticlesForHome } from '../lib/gapLock'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function Home() {
  const gapUnlocked = useGapUnlocked()
  const visibleArticles = useMemo(
    () => filterArticlesForHome(articles, gapUnlocked),
    [gapUnlocked],
  )

  return (
    <div className="home">
      <header className="page-intro">
        <h1>Latest on engineering and platform shifts</h1>
        <p>
          Deep dives with runnable patterns—frontend, backend, infra, and
          languages—focused on what changes how we ship software in 2026.
        </p>
      </header>

      <ol className="article-index">
        {visibleArticles.map((post) => (
          <li key={post.slug}>
            <article className="card">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <h2>
                <Link to={`/article/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="excerpt">{post.excerpt}</p>
              <div className="meta">
                <span className="read-time">{post.readMin} min read</span>
                <ul className="tags" aria-label="Topics">
                  {post.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <Link className="read-more" to={`/article/${post.slug}`}>
                Read article
              </Link>
            </article>
          </li>
        ))}
      </ol>
    </div>
  )
}
