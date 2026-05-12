---
slug: A04-card-reader-pos-sdk
title: "A4 — Modern card-reader / POS terminal SDKs"
date: 2026-05-04
readMin: 5
tags:
  - Career
  - Android
  - Job search
excerpt: "**Card-present** integrations pair your Android app with **vendor SDKs** (readers, firmware updates, transaction lifecycle). Official vendor docs—not generic REST tutorials—define **pairing**, **offline behavior**, **error codes**, and **PCI scope**…"
---

# A4 — Modern card-reader / POS terminal SDKs

## What it is
Integrating dedicated readers (Stripe Terminal, Adyen, SumUp-style paths, OEM SDKs): pairing, firmware, transaction intents, error surfaces.

## Why JDs care
Modern POS JDs mean **card-present** hardware, not “we hit a REST API for online pay.”

## Honest closes
- **OWN:** Name vendor, device model, and failure modes you handled.
- **SIDE:** Dev-kit sandbox + one documented spike repo.
- **SKIP:** If you never touched reader SDKs.

## Interview bite
Chargebacks, offline queues, and reader reconnect logic separate real experience from tutorials.

<!-- gap-longform-appended -->

**Keywords:** Modern card-reader / POS terminal SDKs, official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

- [Stripe — Terminal SDK overview](https://docs.stripe.com/terminal)
- [Adyen — in-person payments](https://docs.adyen.com/point-of-sale/)
- [Google Pay for Business (ecosystem entry)](https://developers.google.com/pay/api)
- [PCI SSC](https://www.pcisecuritystandards.org/)

## What official guidance emphasizes

**Card-present** integrations pair your Android app with **vendor SDKs** (readers, firmware updates, transaction lifecycle). Official vendor docs—not generic REST tutorials—define **pairing**, **offline behavior**, **error codes**, and **PCI scope** boundaries. Expect interview depth on **idempotency**, **reversals**, and **receipt rendering** vs **authorization**.

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
