---
slug: A07-feature-flags-launchdarkly
title: "A7 — Feature flags (LaunchDarkly / in-house)"
date: 2026-05-07
readMin: 5
tags:
  - Career
  - Android
  - Job search
excerpt: "**Remote Config** is Google’s hosted key/value rollout system; **LaunchDarkly** is a leading SaaS feature-flag product with targeting and experimentation primitives. Both sit beside **UDF** architecture on Android: flags should feed **state holders** and…"
---

# A7 — Feature flags (LaunchDarkly / in-house)

## What it is
Runtime or config-driven toggles for gradual rollout, experiments, and kill switches—implemented with SaaS (LaunchDarkly) or internal services / Remote Config.

## Why JDs care
Release engineering maturity: shipping behind flags reduces blast radius.

## Honest closes
- **OWN:** If you used **Firebase Remote Config as flags** (even without LaunchDarkly), one explicit bullet can partially close this gap—be precise about use case.
- **SIDE:** Spike LaunchDarkly SDK in a toy app; label honestly as side study unless production.
- **SKIP:** If you never controlled release behavior beyond static builds.

## Interview bite
Targeting rules, stickiness, and incident rollback stories matter more than vendor name-dropping.

<!-- gap-longform-appended -->

**Keywords:** Feature flags (LaunchDarkly / in-house), official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

- [Firebase Remote Config](https://firebase.google.com/docs/remote-config)
- [LaunchDarkly — docs home](https://docs.launchdarkly.com/home)
- [Android architecture: UDF](https://developer.android.com/topic/libraries/architecture)

## What official guidance emphasizes

**Remote Config** is Google’s hosted key/value rollout system; **LaunchDarkly** is a leading SaaS feature-flag product with targeting and experimentation primitives. Both sit beside **UDF** architecture on Android: flags should feed **state holders** and **single sources of truth**, not scatter `if` statements through UI code.

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
