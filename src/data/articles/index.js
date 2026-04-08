import a1 from './react-19-use-and-suspense.js'
import a2 from './typescript-satisfies.js'
import a3 from './view-transitions-api.js'
import a4 from './oauth2-pkce-spa.js'
import a5 from './postgresql-jsonb-indexing.js'
import a6 from './docker-buildkit-cache.js'
import a7 from './github-actions-reusable-workflows.js'
import a8 from './rust-tokio-select.js'
import a9 from './python-pattern-matching.js'
import a10 from './node-fetch-streaming.js'

export const articles = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10].sort(
  (a, b) => new Date(b.date) - new Date(a.date),
)

export function getArticleBySlug(slug) {
  return articles.find((a) => a.slug === slug)
}
