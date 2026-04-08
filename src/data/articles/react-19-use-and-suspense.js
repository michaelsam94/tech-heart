/** @typedef {{ p?: string[], h2?: string, h3?: string, ul?: string[], code?: { lang: string, code: string }, note?: string }} Section */

/** @type {{ slug: string, title: string, date: string, readMin: number, tags: string[], excerpt: string, sections: Section[] }} */
export default {
  slug: 'react-19-use-and-suspense',
  title: 'React 19: use() with promises and cleaner async UI',
  date: '2026-04-02',
  readMin: 9,
  tags: ['React', 'JavaScript'],
  excerpt:
    'How the use() hook pairs with Suspense to read promises in render, trim waterfalls, and keep loading states declarative.',
  sections: [
    {
      p: [
        'React 19 stabilizes patterns that used to require custom loaders or client-only data libraries. The use() hook can unwrap a Promise (or Context) during render; when combined with <Suspense>, the tree suspends until the promise resolves. That keeps data dependencies colocated with the components that consume them.',
        'This is especially useful when your router or data layer hands you a promise—think lazy routes, RSC payloads on the client edge, or a thin fetch wrapper that returns Promise<Response> you parse once.',
      ],
    },
    {
      h2: 'Minimal example: promise-in-render',
    },
    {
      p: [
        'Wrap the subtree in a boundary. Inside a child, call use(promise). React retries when the promise fulfills; while pending, the nearest Suspense fallback shows.',
      ],
    },
    {
      code: {
        lang: 'tsx',
        code: `import { Suspense, use } from 'react'

type User = { id: string; name: string }

function fetchUser(id: string): Promise<User> {
  return fetch(\`/api/users/\${id}\`).then((r) => {
    if (!r.ok) throw new Error('failed')
    return r.json() as Promise<User>
  })
}

function UserCard({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise)
  return (
    <article>
      <h2>{user.name}</h2>
      <p>ID: {user.id}</p>
    </article>
  )
}

export function Profile({ userId }: { userId: string }) {
  const userPromise = fetchUser(userId)
  return (
    <Suspense fallback={<p>Loading profile…</p>}>
      <UserCard userPromise={userPromise} />
    </Suspense>
  )
}`,
      },
    },
    {
      note: 'Create the promise in the parent that owns the key (e.g. userId). If you create a fresh promise on every parent render without caching, you can thrash Suspense. Memoize or lift promise creation to a stable cache keyed by userId.',
    },
    {
      h2: 'useOptimistic for instant feedback',
    },
    {
      p: [
        'For mutations, pair server actions or fetch calls with useOptimistic so the UI updates immediately while the request is in flight. You keep a reducer-like update function that knows how to roll forward and reconcile when the server responds.',
      ],
    },
    {
      code: {
        lang: 'tsx',
        code: `import { useOptimistic, useTransition } from 'react'

type Message = { id: string; text: string; pending?: boolean }

export function Thread({
  messages,
  sendMessage,
}: {
  messages: Message[]
  sendMessage: (text: string) => Promise<void>
}) {
  const [optimistic, addOptimistic] = useOptimistic(
    messages,
    (state, newText: string) => [
      ...state,
      { id: 'optimistic', text: newText, pending: true },
    ],
  )
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    const text = String(formData.get('text') ?? '')
    startTransition(async () => {
      addOptimistic(text)
      await sendMessage(text)
    })
  }

  return (
    <form action={onSubmit}>
      <ul>
        {optimistic.map((m) => (
          <li key={m.id} style={{ opacity: m.pending ? 0.6 : 1 }}>
            {m.text}
          </li>
        ))}
      </ul>
      <input name="text" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        Send
      </button>
    </form>
  )
}`,
      },
    },
    {
      h2: 'When to reach for something else',
    },
    {
      ul: [
        'Heavy client caches with normalized entities may still warrant TanStack Query or similar—especially if you need deduping, background refetch, or infinite lists.',
        'If your team standardizes on Suspense data loaders from the framework (e.g. React Router 7 loaders), keep those patterns—use() shines when promises are already first-class.',
      ],
    },
  ],
}
