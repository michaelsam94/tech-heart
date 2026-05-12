---
slug: A18-ivi-car-apis-driver-distraction
title: "A18 — IVI, Car APIs, driver-distraction UX"
date: 2026-05-18
readMin: 5
tags:
  - Career
  - Android
  - Job search
excerpt: "Google splits **Android Auto** (projection) from **Android Automotive OS** (full in-vehicle stack). Platform bring-up, **vehicle properties**, and **distraction** constraints are documented on **source.android.com** and…"
---

# A18 — IVI, Car APIs, driver-distraction UX

## What it is
In-vehicle infotainment UX plus Android Car APIs for passenger vs driver contexts, focus rules, and OEM-specific UX gates.

## Why JDs care
Distinct from “Android Automotive exists”—this is product + regulatory shape in the cabin.

## Honest closes
- **OWN:** Shipping IVI features with references to distraction testing or UX sign-off.
- **SIDE:** AAOS emulator + sample apps for Car App Library / constraints—document honestly as study.
- **SKIP:** If A17 is SKIP, this usually follows.

## Interview bite
How you would redesign a notification surface that fails driver-distraction review.

<!-- gap-longform-appended -->

**Keywords:** IVI, Car APIs, driver-distraction UX, official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

- [Android for Cars overview](https://developer.android.com/training/cars)
- [Android Automotive OS](https://source.android.com/docs/automotive)
- [Car App Library](https://developer.android.com/training/cars/navigation)

## What official guidance emphasizes

Google splits **Android Auto** (projection) from **Android Automotive OS** (full in-vehicle stack). Platform bring-up, **vehicle properties**, and **distraction** constraints are documented on **source.android.com** and **developer.android.com/training/cars**—expect OEM-specific variation beyond the public docs.

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
