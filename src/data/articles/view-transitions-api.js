export default {
  slug: 'view-transitions-api',
  title: 'View Transitions API: smooth UI state changes in the browser',
  date: '2026-03-22',
  readMin: 15,
  tags: ['Web Platform', 'CSS'],
  excerpt:
    'Use document.startViewTransition to animate DOM updates with minimal JS, plus CSS view-transition-name for per-element choreography.',
  sections: [
    {
      p: [
        'The View Transitions API gives you a shared-element-style crossfade between two DOM states captured in a single frame update. The browser snapshots “old” and “new” layers, then runs default or customized animations. You opt in per navigation or per state change—no full SPA framework required.',
        'It is especially effective for list/detail toggles, theme switches, and pagination—places where React state flips a subtree and you want continuity. For same-document updates, startViewTransition accepts a callback that mutates the DOM (or React state); the transition runs around that atomic update.',
      ],
    },
    {
      h2: 'Why pair with startTransition in React',
    },
    {
      p: [
        'React 18+ concurrent rendering can batch updates. Wrapping your state flip in useTransition marks it as low priority so input stays responsive; wrapping the same update in startViewTransition tells the browser to snapshot before and after the transition updates. Together you avoid jank on large trees.',
      ],
    },
    {
      h2: 'Baseline pattern in React',
    },
    {
      code: {
        lang: 'tsx',
        code: `import { useState, useTransition, type ReactNode } from 'react'

declare global {
  interface Document {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> }
  }
}

export function ViewTransitionSwitch({
  a,
  b,
}: {
  a: ReactNode
  b: ReactNode
}) {
  const [showB, setShowB] = useState(false)
  const [, startTransition] = useTransition()

  function flip() {
    const run = () => startTransition(() => setShowB((v) => !v))
    if (document.startViewTransition) document.startViewTransition(run)
    else run()
  }

  return (
    <section>
      <button type="button" onClick={flip}>
        Toggle
      </button>
      <div className="stage">{showB ? b : a}</div>
    </section>
  )
}`,
      },
    },
    {
      h2: 'Name elements for paired motion',
    },
    {
      p: [
        'view-transition-name creates a named participating layer. Matching names between old and new trees get a morph animation; unnamed content participates in the root transition. Unique names must be unique in the document at snapshot time—duplicate names can produce surprising merges.',
      ],
    },
    {
      code: {
        lang: 'css',
        code: `/* Assign stable names to elements that should morph between states */
.card-title {
  view-transition-name: card-title;
}

/* Optional: tweak animations */
::view-transition-old(card-title),
::view-transition-new(card-title) {
  animation-duration: 240ms;
  animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* Root transition (default crossfade) */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 300ms;
}`,
      },
    },
    {
      h2: 'SPA and MPA considerations',
    },
    {
      p: [
        'Cross-document view transitions (navigating between static HTML pages) are evolving; same-document transitions in SPAs are the most portable today. For router-based apps, call startViewTransition in the same tick as your route state change so the snapshot matches user expectation.',
      ],
    },
    {
      note: 'Support is strong in Chromium; Safari and Firefox are catching up—keep the fallback branch (no startViewTransition) for older engines.',
    },
    {
      h2: 'Accessibility',
    },
    {
      p: [
        'Respect prefers-reduced-motion: disable or shorten animations when the user opts out. View transitions are decorative; core functionality must work with JS/CSS disabled where applicable.',
      ],
    },
    {
      code: {
        lang: 'css',
        code: `@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}`,
      },
    },
  ],
}
