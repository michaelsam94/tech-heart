---
slug: A25-kotlin-multiplatform-production
title: "A25 — Kotlin Multiplatform (KMP) in production"
date: 2026-05-25
readMin: 5
tags:
  - Career
  - Android
  - Job search
excerpt: "JetBrains’ **Kotlin Multiplatform** documentation explains **expect/actual**, **hierarchical structure**, and **code sharing** between Android and iOS. Official guidance evolves quickly—prefer **kotlinlang.org** over stale blog posts when studying."
---

# A25 — Kotlin Multiplatform (KMP) in production

## What it is
Shared Kotlin across Android/iOS/server with expect/actual boundaries and shared domain modules.

## Why JDs care
Wikiloc / Intellias sometimes list KMP as nice-to-have or future direction.

## Honest closes
- **OWN:** Repos where KMP shipped to prod with CI matrix for targets.
- **SIDE:** Cached side project—good for “experimented”; not “led KMP migration” unless true.
- **SKIP:** If you standardize on Flutter for cross-platform story instead.

## Interview bite
Memory model in native targets, serialization, and how you tested shared code.

<!-- gap-longform-appended -->

**Keywords:** A25 — Kotlin Multiplatform (KMP) in production, official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

- [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform.html)
- [KMP mobile samples](https://kotlinlang.org/docs/multiplatform-get-started.html)

## What official guidance emphasizes

JetBrains’ **Kotlin Multiplatform** documentation explains **expect/actual**, **hierarchical structure**, and **code sharing** between Android and iOS. Official guidance evolves quickly—prefer **kotlinlang.org** over stale blog posts when studying.

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
