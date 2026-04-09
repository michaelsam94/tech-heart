import { Link, useParams } from 'react-router-dom'
import { getArticleBySlug } from '../data/articles'
import { ArticleBody } from '../components/ArticleBody'

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

  if (!post) {
    return (
      <div className="article-missing">
        <h1>Article not found</h1>
        <p>No post matches “{slug}”.</p>
        <Link to="/">Back to all articles</Link>
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
