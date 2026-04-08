export default {
  slug: 'view-transitions-api',
  title: 'View Transitions API: smooth UI state changes in the browser',
  date: '2026-03-22',
  readMin: 7,
  tags: ['Web Platform', 'CSS'],
  excerpt:
    'Use document.startViewTransition to animate DOM updates with minimal JS, plus CSS view-transition-name for per-element choreography.',
  sections: [
    {
      p: [
        'The View Transitions API gives you a shared-element-style crossfade between two DOM states captured in a single frame update. The browser snapshots “old” and “new” layers, then runs default or customized animations.',
        'It is especially effective for list/detail toggles, theme switches, and pagination—places where React state flips a subtree and you want continuity.',
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
}`,
      },
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
  ],
}
