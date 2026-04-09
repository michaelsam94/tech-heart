import { parse as parseYaml } from 'yaml'

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/

function parseMarkdownFile(raw) {
  const m = raw.match(FRONT_MATTER)
  if (!m) {
    return { data: {}, content: raw.trim() }
  }
  const data = parseYaml(m[1]) ?? {}
  return { data, content: m[2].trim() }
}

const rawModules = import.meta.glob('../../content/articles/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function parseArticles() {
  const posts = []
  for (const path of Object.keys(rawModules)) {
    const raw = rawModules[path]
    const { data, content } = parseMarkdownFile(raw)
    if (!data.slug || !data.title) continue
    posts.push({
      slug: data.slug,
      title: data.title,
      date: data.date,
      readMin: data.readMin ?? 5,
      tags: Array.isArray(data.tags) ? data.tags : [],
      excerpt: data.excerpt ?? '',
      body: content,
    })
  }
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export const articles = parseArticles()

export function getArticleBySlug(slug) {
  return articles.find((a) => a.slug === slug)
}
