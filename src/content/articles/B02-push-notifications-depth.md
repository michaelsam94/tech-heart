---
slug: B02-push-notifications-depth
title: "B2 — Push notifications beyond the “FCM” keyword"
date: 2026-05-31
readMin: 5
tags:
  - Career
  - Resume
  - Job search
excerpt: "FCM’s official documentation distinguishes **notification messages** vs **data messages**, explains **topic** and **token** targeting, and links to **Admin SDK / HTTP v1** send paths. Android **notification permission** (13+) and **background delivery**…"
---

# B2 — Push notifications beyond the “FCM” keyword

## What it is
Operational detail: topics, segmentation, payload contracts, deep links, retries, analytics hooks.

## Why JDs care
Booksy/Kake/marketplace JDs want proof notifications were **engineered**, not merely enabled.

## Honest closes
- **OWN:** One bullet with a concrete routing or subscription story (ties to A12).
- **SIDE:** Documented toy with server-driven topics.
- **SKIP:** If pushes were third-party-only black box.

## Interview bite
Duplicate delivery, collapse keys, and notification channels on Android 8+.

<!-- gap-longform-appended -->

**Keywords:** B2 — Push notifications beyond the “FCM” keyword, official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Message types](https://firebase.google.com/docs/cloud-messaging/customize-messages/set-message-type)
- [Topic messaging](https://firebase.google.com/docs/cloud-messaging/topic-messaging)
- [Receive messages (Android)](https://firebase.google.com/docs/cloud-messaging/receive-messages)

## What official guidance emphasizes

FCM’s official documentation distinguishes **notification messages** vs **data messages**, explains **topic** and **token** targeting, and links to **Admin SDK / HTTP v1** send paths. Android **notification permission** (13+) and **background delivery** constraints belong in any serious architecture discussion.

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
