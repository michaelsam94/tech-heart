---
slug: A29-subscription-iap-paywalls
title: "A29 — Subscription apps, paywalls, IAP (StoreKit, Play Billing)"
date: 2026-05-29
readMin: 5
tags:
  - Career
  - Android
  - Job search
excerpt: "Google’s **Play Billing Library** docs cover **one-time products**, **subscriptions**, **offer tokens**, and **server-side validation** with **Real-time developer notifications**. Subscription employers expect fluency in **entitlement**, **grace periods**,…"
---

# A29 — Subscription apps, paywalls, IAP (StoreKit, Play Billing)

## What it is
Free trial ladders, entitlement servers, renewal webhooks, refund/chargeback handling, StoreKit 2 / Play Billing Library v5+ patterns.

## Why JDs care
MAU subscription division roles want monetization mechanics, not only one-off marketplace payments.

## Honest closes
- **OWN:** Any subscription you shipped (even single app) with renewal pain you handled.
- **SIDE:** Toy subscription with test cards—honestly minor vs production.
- **SKIP:** If your payments story is wallets/auctions only—say that clearly in tailoring.

## Interview bite
Receipt validation, server notifications, and grace periods—expect specifics.

<!-- gap-longform-appended -->

**Keywords:** A29 — Subscription apps, paywalls, IAP (StoreKit, Play Billing), official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

- [Google Play Billing Library](https://developer.android.com/google/play/billing)
- [Subscriptions](https://developer.android.com/google/play/billing/subscriptions)
- [Real-time developer notifications](https://developer.android.com/google/play/billing/rtdn-reference)

## What official guidance emphasizes

Google’s **Play Billing Library** docs cover **one-time products**, **subscriptions**, **offer tokens**, and **server-side validation** with **Real-time developer notifications**. Subscription employers expect fluency in **entitlement**, **grace periods**, and **account hold** flows.

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
