/** @typedef {{ p?: string[], h2?: string, h3?: string, ul?: string[], code?: { lang: string, code: string }, note?: string }} Section */

/** @type {{ slug: string, title: string, date: string, readMin: number, tags: string[], excerpt: string, sections: Section[] }} */
export default {
  slug: 'react-19-use-and-suspense',
  title: 'React 19: use() with promises and cleaner async UI',
  date: '2026-04-02',
  readMin: 18,
  tags: ['React', 'JavaScript'],
  excerpt:
    'How the use() hook pairs with Suspense to read promises in render, trim waterfalls, and keep loading states declarative.',
  sections: [
    {
      p: [
        'React 19 stabilizes patterns that used to require custom loaders or client-only data libraries. The use() hook can unwrap a Promise (or Context) during render; when combined with <Suspense>, the tree suspends until the promise resolves. That keeps data dependencies colocated with the components that consume them.',
        'Mental model: Suspense is a declarative “wait here” boundary. use() is the hook that actually triggers the suspend by throwing a thenable to React when the promise is still pending. When the promise settles, React re-renders and use() returns the resolved value—or rethrows if the promise rejected.',
        'This is especially useful when your router or data layer hands you a promise—lazy routes, RSC payloads on the client edge, or a thin fetch wrapper that returns Promise<Response> you parse once. It also composes with concurrent features: transitions can keep the old UI visible while a deferred update suspends deeper in the tree.',
      ],
    },
    {
      h2: 'Minimal example: promise-in-render',
    },
    {
      p: [
        'Wrap the subtree in a boundary. Inside a child, call use(promise). React retries when the promise fulfills; while pending, the nearest Suspense fallback shows.',
        'Important: the promise identity matters. If the parent creates fetchUser(id) on every render, you get a new Promise each time and Suspense may flash fallbacks or loop. Stabilize with caching (React cache in RSC, a module-level Map, or your data library) keyed by userId.',
      ],
    },
    {
      code: {
        lang: 'tsx',
        code: `import { Suspense, use, useMemo } from 'react'

type User = { id: string; name: string }

function fetchUser(id: string): Promise<User> {
  return fetch(\`/api/users/\${id}\`).then((r) => {
    if (!r.ok) throw new Error('failed')
    return r.json() as Promise<User>
  })
}

/** Demo cache: in production use a real cache or router loader. */
const userCache = new Map<string, Promise<User>>()
function getUser(id: string) {
  let p = userCache.get(id)
  if (!p) {
    p = fetchUser(id)
    userCache.set(id, p)
  }
  return p
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
  const userPromise = useMemo(() => getUser(userId), [userId])
  return (
    <Suspense fallback={<p>Loading profile…</p>}>
      <UserCard userPromise={userPromise} />
    </Suspense>
  )
}`,
      },
    },
    {
      note: 'Rejected promises surface as render errors—wrap with an error boundary or handle errors inside the promise chain before passing to use().',
    },
    {
      h2: 'Errors and boundaries',
    },
    {
      p: [
        'If fetchUser rejects, the error propagates like a render error. Pair Suspense with <ErrorBoundary> (from react-error-boundary or your design system) around the subtree that calls use(), or attach .catch to the promise and map failures to a result type (Result<User, Error>) that you unwrap without throwing.',
      ],
    },
    {
      h2: 'useOptimistic for instant feedback',
    },
    {
      p: [
        'For mutations, pair server actions or fetch calls with useOptimistic so the UI updates immediately while the request is in flight. The hook takes the current server-backed list and a reducer that merges an optimistic row; React replays against fresh props when the parent revalidates.',
        'Wrap the async work in startTransition so the optimistic update is treated as a transition and remains responsive. Disable inputs while isPending if double-submit would corrupt server state.',
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
      h3: 'Reconciliation after mutation',
    },
    {
      p: [
        'After sendMessage resolves, the parent should refetch or receive updated messages from the server so optimistic rows are replaced by real IDs. If you leave optimistic items forever, key collisions and duplicate text become likely.',
      ],
    },
    {
      h2: 'When to reach for something else',
    },
    {
      ul: [
        'Heavy client caches with normalized entities may still warrant TanStack Query or similar—especially if you need deduping, background refetch, infinite lists, or persistence.',
        'If your team standardizes on Suspense data loaders from the framework (e.g. React Router 7 loaders), keep those patterns—use() shines when promises are already first-class.',
        'For purely synchronous context, useContext remains simpler than use(Context) unless you intentionally want suspendable context reads in future APIs.',
      ],
    },
  ],
}
