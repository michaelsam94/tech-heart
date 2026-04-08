export default {
  slug: 'node-fetch-streaming',
  title: 'Node.js: fetch, AbortController, and streaming bodies',
  date: '2026-02-14',
  readMin: 8,
  tags: ['Node.js', 'JavaScript'],
  excerpt:
    'Global fetch in modern Node pairs well with AbortSignal timeouts and ReadableStream processing—without loading entire responses into memory.',
  sections: [
    {
      p: [
        'Node 18+ exposes undici-based fetch globally. For large downloads or line-based logs, stream the body instead of buffering. Combine with AbortSignal.timeout or an AbortController for cooperative cancellation.',
      ],
    },
    {
      h2: 'Download to disk with streaming',
    },
    {
      code: {
        lang: 'ts',
        code: `import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

export async function download(url: string, path: string) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), 30_000)
  const res = await fetch(url, { signal: ac.signal })
  clearTimeout(t)
  if (!res.ok || !res.body) throw new Error(\`HTTP \${res.status}\`)

  const nodeReadable = Readable.fromWeb(res.body as any)
  await pipeline(nodeReadable, createWriteStream(path))
}`,
      },
    },
    {
      h2: 'NDJSON processing',
    },
    {
      code: {
        lang: 'ts',
        code: `import readline from 'node:readline'
import { Readable } from 'node:stream'

export async function* ndjsonLines(res: Response) {
  if (!res.body) throw new Error('no body')
  const rl = readline.createInterface({
    input: Readable.fromWeb(res.body as any),
    crlfDelay: Infinity,
  })
  for await (const line of rl) {
    if (!line) continue
    yield JSON.parse(line)
  }
}`,
      },
    },
    {
      h2: 'Operational notes',
    },
    {
      ul: [
        'Set realistic timeouts per hop; retry idempotent GETs with backoff when appropriate.',
        'For gzip content, fetch transparently decompresses; for raw bytes from non-HTTP sources, prefer fs streams.',
      ],
    },
  ],
}
