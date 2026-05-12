import { Link, useParams } from 'react-router-dom'
import { getArticleBySlug } from '../data/articles'
import { ArticleBody } from '../components/ArticleBody'
import { useGapUnlocked } from '../hooks/useGapUnlocked'
import { isGapSlug, isGapUnlockConfigured } from '../lib/gapLock'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ArticlePage() {
  const { slug } = useParams()
  const post = getArticleBySlug(slug)
  const gapUnlocked = useGapUnlocked()
  const gap = slug ? isGapSlug(slug) : false
  const gapLockReady = isGapUnlockConfigured()
  const gapHidden = gap && (!gapLockReady || !gapUnlocked)

  if (!post) {
    return (
      <div className="article-missing">
        <h1>Article not found</h1>
        <p>No post matches “{slug}”.</p>
        <Link to="/">Back to all articles</Link>
      </div>
    )
  }

  if (gapHidden) {
    return (
      <div className="article-missing gap-article-locked">
        <h1>Private note</h1>
        <p>
          This URL is part of the gap-note library. It stays off the public index
          until the owner passphrase has been entered on this device.
        </p>
        {!gapLockReady ? (
          <p>
            Unlocking is not enabled yet (no SHA-256 hash configured at build
            time).
          </p>
        ) : (
          <p>
            <Link to="/unlock-gaps">Open the unlock page</Link> and enter your
            12-character passphrase.
          </p>
        )}
        <p>
          <Link to="/">← All articles</Link>
        </p>
      </div>
    )
  }

  return (
    <article className="article">
      <header className="article-header">
        <p className="breadcrumb">
          <Link to="/">Articles</Link>
          <span aria-hidden="true"> / </span>
          <span className="current">{post.title}</span>
        </p>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <h1>{post.title}</h1>
        <p className="lead">{post.excerpt}</p>
        <div className="meta">
          <span className="read-time">{post.readMin} min read</span>
          <ul className="tags" aria-label="Topics">
            {post.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </header>

      <div className="article-body">
        <ArticleBody markdown={post.body} />
      </div>

      <footer className="article-footer">
        <Link to="/">← All articles</Link>
      </footer>
    </article>
  )
}
