---
slug: typescript-satisfies-operator
title: "TypeScript satisfies: safer config objects without widening"
date: 2026-03-28
readMin: 16
tags:
  - TypeScript
excerpt: Use satisfies to check literals against a type while preserving precise literal types—ideal for routes, themes, and API maps.
---

The `satisfies` operator (TS 4.9+) solves a common tension: you want an object to be checked against a wide interface, but you also want each property to keep its specific literal type for inference elsewhere.

Without `satisfies`, `as` TypeAssertion widens or narrows too aggressively; without assertions, excess property checks may pass while literals widen to string and you lose autocomplete. `satisfies` checks assignability without changing the inferred type of the expression to the target—it “validates and preserves.”

## Routes map with literal keys

Below, `routes` is checked against `Record<string, RouteDef>`: every value must have `path`, `method`, `timeout`. But `keyof typeof routes` stays the literal union `"health" | "login"`, and `def.method` stays a literal where TypeScript can narrow.

```ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

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
}
```

## Catch invalid literals early

`satisfies` still performs excess property checks against the target type. Pair it with `satisfies Record<string, SomeBase>` or `satisfies SomeMappedType` to guard large tables of constants.

Template literal types (e.g. hex colors) combine well: wrong string shapes fail at definition time instead of at a distant call site.

```ts
type ThemeColor = {
  fg: `#${string}`
  bg: `#${string}`
}

const dark = {
  fg: '#e5e7eb',
  bg: '#0b0f14',
} satisfies ThemeColor

const bad = {
  fg: 'not-a-hex', // error: not assignable to `#${string}`
  bg: '#000000',
} satisfies ThemeColor
```

## Discriminated API maps

When each key maps to a variant with a discriminant, `satisfies` plus a const object preserves discriminant narrowing when you index with `keyof typeof`.

```ts
type Action =
  | { type: 'noop' }
  | { type: 'navigate'; to: string }
  | { type: 'track'; event: string; props?: Record<string, string> }

const handlers = {
  boot: { type: 'noop' },
  goHome: { type: 'navigate', to: '/' },
  trackSignup: { type: 'track', event: 'signup', props: { plan: 'pro' } },
} satisfies Record<string, Action>

type HandlerName = keyof typeof handlers

export function dispatch(name: HandlerName) {
  const a = handlers[name]
  switch (a.type) {
    case 'noop':
      return
    case 'navigate':
      return a.to // string
    case 'track':
      return a.event
  }
}
```

## Contrast with `as const`

`as const` freezes literals deeply and is perfect for tiny tuples and discriminants. `satisfies` targets a separate type shape and is better for larger objects that must conform to an interface but should not be frozen or widened incorrectly.

You rarely need `satisfies SomeType as const` on the same object; pick one primary tool. Use `as const` when you need readonly tuples and literal types with no external interface; use `satisfies` when an external shape must be satisfied.

## Migration tip

Replacing large `as` assertions with `satisfies` often surfaces latent typos (wrong keys, wrong enum strings). Do it file by file in config modules first—low runtime risk, high type leverage.
