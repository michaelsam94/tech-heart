---
slug: A09-mvi-pattern
title: "A9 — MVI (Model-View-Intent) as a named pattern"
date: 2026-05-09
readMin: 5
tags:
  - Career
  - Android
  - Job search
excerpt: "Google’s architecture guide formalizes **UDF**: immutable UI state, events flowing to an owner, and a **single source of truth**. **MVI** (often from Android community practice) lines up with the same **unidirectional** shape but adds explicit **intent**…"
---

# A9 — MVI (Model-View-Intent) as a named pattern

## What it is
Unidirectional data flow with explicit “intents” driving state reduction—**conceptually close** to UDF and MVVM+reducers in many codebases.

## Why JDs care
Some JDs use “MVI” as a keyword for predictable UI state.

## Honest closes
- **OWN:** Use the word **MVI** on CV only if your team called it that or reviewers would recognize the structure as canonical MVI.
- **SIDE:** Read one canonical article + map your UDF screens to intent/state naming in comments or a blog note—**do not** rename production work falsely.
- **SKIP:** Keep “UDF / unidirectional state” if that is what you shipped.

## Interview bite
Be ready to whiteboard intent → reducer → effect vs your actual architecture.

<!-- gap-longform-appended -->

**Keywords:** MVI (Model-View-Intent) as a named pattern, official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

- [Guide to app architecture](https://developer.android.com/topic/architecture)
- [UDF in Jetpack Compose](https://developer.android.com/develop/ui/compose/architecture#udf-compose)
- [UI layer guidance](https://developer.android.com/topic/libraries/architecture)

## What official guidance emphasizes

Google’s architecture guide formalizes **UDF**: immutable UI state, events flowing to an owner, and a **single source of truth**. **MVI** (often from Android community practice) lines up with the same **unidirectional** shape but adds explicit **intent** naming; use the word **MVI** on a CV only if your codebase or team used that vocabulary.

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
