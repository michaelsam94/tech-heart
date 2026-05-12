---
slug: A12-fcm-routing-topics
title: "A12 — FCM push routing / topic subscriptions (bullet-level)"
date: 2026-05-12
readMin: 5
tags:
  - Career
  - Android
  - Job search
excerpt: "FCM’s official documentation distinguishes **notification messages** vs **data messages**, explains **topic** and **token** targeting, and links to **Admin SDK / HTTP v1** send paths. Android **notification permission** (13+) and **background delivery**…"
---

# A12 — FCM push routing / topic subscriptions (bullet-level)

## What it is
Beyond “we have FCM”: payload shape, deep-link routing, data vs notification messages, topic vs token models, deduping.

## Why JDs care
Marketplace and growth teams care about reliable delivery semantics and user targeting.

## Honest closes
- **OWN:** One bullet: payload fields, routing table, idempotency, or topic strategy you shipped.
- **SIDE:** Document a toy server + client handling data messages with explicit routing—honestly labeled.
- **SKIP:** If FCM was only a keyword in a list.

## Interview bite
Android 13+ notification permission, background delivery limits, and duplicate notification bugs.

<!-- gap-longform-appended -->

**Keywords:** FCM push routing / topic subscriptions (bullet-level), official documentation, Android career gaps, interview prep

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
