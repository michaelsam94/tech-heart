export default {
  slug: 'typescript-satisfies-operator',
  title: 'TypeScript satisfies: safer config objects without widening',
  date: '2026-03-28',
  readMin: 8,
  tags: ['TypeScript'],
  excerpt:
    'Use satisfies to check literals against a type while preserving precise literal types—ideal for routes, themes, and API maps.',
  sections: [
    {
      p: [
        'The satisfies operator (TS 4.9+) solves a common tension: you want an object to be checked against a wide interface, but you also want each property to keep its specific literal type for inference elsewhere.',
        'Without satisfies, as TypeAssertion widens or narrows too aggressively; without assertions, excess property checks may pass while literals widen to string and you lose autocomplete.',
      ],
    },
    {
      h2: 'Routes map with literal keys',
    },
    {
      code: {
        lang: 'ts',
        code: `type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type RouteDef = {
  path: string
  method: HttpMethod
  /** ms */
  timeout: number
}

const routes = {
  health: { path: '/health', method: 'GET', timeout: 2000 },
  login: { path: '/auth/login', method: 'POST', timeout: 8000 },
} satisfies Record<string, RouteDef>

// Keys stay precise: 'health' | 'login'
export type RouteKey = keyof typeof routes

// Values keep literal method unions where applicable
export function callRoute(key: RouteKey) {
  const def = routes[key]
  return fetch(def.path, { method: def.method })
}`,
      },
    },
    {
      h2: 'Catch invalid literals early',
    },
    {
      p: [
        'satisfies still performs excess property checks against the target type. Pair it with satisfies Record<string, SomeBase> or satisfies SomeMappedType to guard large tables of constants.',
      ],
    },
    {
      code: {
        lang: 'ts',
        code: `type ThemeColor = {
  fg: \`#\${string}\`
  bg: \`#\${string}\`
}

const dark = {
  fg: '#e5e7eb',
  bg: '#0b0f14',
} satisfies ThemeColor

const bad = {
  fg: 'not-a-hex', // error: not assignable to \`#\${string}\`
  bg: '#000000',
} satisfies ThemeColor`,
      },
    },
    {
      h2: 'Contrast with as const',
    },
    {
      p: [
        'as const freezes literals deeply and is perfect for tiny tuples and discriminants. satisfies targets a separate type shape and is better for larger objects that must conform to an interface but should not be frozen or widened incorrectly.',
        'You can combine them: satisfies SomeType as const is rarely needed; pick one primary tool per object.',
      ],
    },
  ],
}
