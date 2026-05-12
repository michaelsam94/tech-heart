---
slug: A01-ble-bluetooth-low-energy
title: "A1 — BLE / Bluetooth Low Energy"
date: 2026-05-01
readMin: 5
tags:
  - Career
  - Android
  - Job search
excerpt: "Google’s BLE guide centers on **GATT**, **services/characteristics**, and the **central vs peripheral** split: your app typically scans as a central, connects to a GATT server on the device, then reads or subscribes to characteristics. Permissions and…"
---

# A1 — BLE / Bluetooth Low Energy

## What it is
Short-range wireless for sensors, wearables, POS peripherals, and “robot” style devices. Different stack from classic Bluetooth: connection intervals, GATT services/characteristics, scanning, bonding.

## Why JDs care
Hardware-adjacent Android roles (IoT, field devices, BLE robots) expect you to have shipped **or** credibly experimented with a real peripheral flow—not just “Bluetooth exists.”

## Honest closes
- **OWN:** Employer + year + what you did (scan only vs read/write vs notifications vs OTA-style chunks).
- **SIDE:** A tiny public sample: scan → connect → read one characteristic (e.g. `RxAndroidBle` or Android BLE APIs). One paragraph in `claimed_skills.json` as side project—**not** inside a job bullet unless it was paid work.
- **SKIP:** You will never target BLE-heavy JDs; keep cover letters honest.

## Interview bite
If you claim production BLE, expect questions on connection drops, MTU, threading, and background scan limits on modern Android.

<!-- gap-longform-appended -->

**Keywords:** A1 — BLE / Bluetooth Low Energy, official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

- [Bluetooth Low Energy overview](https://developer.android.com/develop/connectivity/bluetooth/ble/ble-overview)
- [Bluetooth permissions](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions)
- [Find BLE devices](https://developer.android.com/develop/connectivity/bluetooth/ble/find-ble-devices)
- [Transfer BLE data](https://developer.android.com/develop/connectivity/bluetooth/ble/transfer-ble-data)
- [BluetoothLeGatt sample (platform-samples)](https://github.com/android/platform-samples/tree/main/samples/connectivity/bluetooth/ble)

## What official guidance emphasizes

Google’s BLE guide centers on **GATT**, **services/characteristics**, and the **central vs peripheral** split: your app typically scans as a central, connects to a GATT server on the device, then reads or subscribes to characteristics. Permissions and background behavior changed across Android versions, so treat **manifest permissions**, **scan throttling**, and **app-layer encryption** (paired BLE data is visible to other apps on the device) as first-class design constraints—not an afterthought.

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
