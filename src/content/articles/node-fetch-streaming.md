---
slug: node-fetch-streaming
title: "Node.js: fetch, AbortController, and streaming bodies"
date: 2026-02-14
readMin: 17
tags:
  - Node.js
  - JavaScript
excerpt: Global fetch in modern Node pairs well with AbortSignal timeouts and ReadableStream processing—without loading entire responses into memory.
---

Node 18+ exposes undici-based `fetch` globally. For large downloads or line-based logs, stream the body instead of buffering entire responses into the heap. Combine with `AbortSignal.timeout` (Node 17.3+) or an `AbortController` for cooperative cancellation.

Streaming matters for CI artifacts, log tailers, and CSV/NDJSON ingestion where responses exceed comfortable memory limits or arrive slowly.

## Download to disk with streaming

```ts
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

export async function download(url: string, path: string) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), 30_000)
  const res = await fetch(url, { signal: ac.signal })
  clearTimeout(t)
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

  const nodeReadable = Readable.fromWeb(res.body as any)
  await pipeline(nodeReadable, createWriteStream(path))
}
```

`AbortSignal.timeout(30_000)` can replace manual `setTimeout` in Node 18+; it composes with other signals via `AbortSignal.any([...])` when you need multiple cancel reasons.

## NDJSON processing

```ts
import readline from 'node:readline'
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
}
```

## Backpressure and errors

`pipeline` propagates errors and destroys streams on failure—prefer it over manual `.pipe` chains. If `JSON.parse` throws on a bad line, decide whether to abort the whole file or collect parse errors per line for observability.

## Uploading with streams

```ts
import { createReadStream } from 'node:fs'

export async function uploadFile(url: string, filePath: string) {
  const body = createReadStream(filePath)
  const res = await fetch(url, {
    method: 'PUT',
    body,
    duplex: 'half',
    headers: { 'content-type': 'application/octet-stream' },
  } as RequestInit)
  if (!res.ok) throw new Error(`upload failed ${res.status}`)
}
```

> For fetch upload streams, Node may require `duplex: "half"` when streaming a request body—check current undici docs for your version.

## Operational notes

- Set realistic timeouts per hop; retry idempotent GETs with backoff when appropriate.
- For gzip, fetch decompresses transparently when `Content-Encoding` is set; you stream decompressed bytes.
- Tune `highWaterMark` only if profiling shows buffer pressure; defaults are usually fine.
