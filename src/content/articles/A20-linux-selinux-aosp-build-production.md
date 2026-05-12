---
slug: A20-linux-selinux-aosp-build-production
title: "A20 — Linux internals / SELinux / AOSP build (production)"
date: 2026-05-20
readMin: 5
tags:
  - Career
  - Android
  - Job search
excerpt: "**AOSP** and **SELinux** documentation targets **system integrators** building images—not every app developer. Cite these when you can speak to **sepolicy**, **image signing**, or **board bring-up**; otherwise keep claims at honest self-study depth."
---

# A20 — Linux internals / SELinux / AOSP build (production)

## What it is
Kernel-adjacent debugging, SELinux policy, building AOSP images—embedded Android platform work.

## Why JDs care
Automotive / STB / rugged device JDs overlap here.

## Honest closes
- **OWN:** Only with device program context (board bring-up, policy changes shipped).
- **SIDE:** Already cached as self-study—keep boundary clear vs production.
- **SKIP:** If app-layer is your lane.

## Interview bite
sepolicy denials and `audit2allow` stories—or admit gap.

<!-- gap-longform-appended -->

**Keywords:** A20 — Linux internals / SELinux / AOSP build (production), official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

- [Android Open Source Project](https://source.android.com/)
- [SELinux for Android](https://source.android.com/docs/security/features/selinux)

## What official guidance emphasizes

**AOSP** and **SELinux** documentation targets **system integrators** building images—not every app developer. Cite these when you can speak to **sepolicy**, **image signing**, or **board bring-up**; otherwise keep claims at honest self-study depth.

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
