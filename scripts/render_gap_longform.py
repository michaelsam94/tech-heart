#!/usr/bin/env python3
"""
Append long-form, source-linked sections to CV gap articles under src/content/articles/.
Uses official / primary vendor documentation only (no random blogs).

Idempotent: skips files that already contain MARKER.
Also refreshes YAML excerpt + readMin from full body word count.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ART_DIR = ROOT / "src" / "content" / "articles"
MARKER = "<!-- gap-longform-appended -->"

FRONT = re.compile(r"^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)\Z")


def yaml_double_quoted(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def parse_simple_front_matter(block: str) -> dict:
    """Enough for tech-heart article YAML (flat keys + tags list). No PyYAML."""
    meta: dict = {}
    lines = block.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith("tags:"):
            tags: list[str] = []
            i += 1
            while i < len(lines) and lines[i].startswith("  - "):
                tags.append(lines[i][4:].strip().strip('"'))
                i += 1
            meta["tags"] = tags
            continue
        m = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
        if not m:
            i += 1
            continue
        key, rest = m.group(1), m.group(2).strip()
        if rest.startswith('"') and rest.endswith('"') and len(rest) >= 2:
            # Single-line double-quoted value (matches all current articles)
            inner = rest[1:-1].replace('\\"', '"').replace("\\\\", "\\")
            meta[key] = inner
        else:
            meta[key] = rest.strip('"')
        i += 1
    return meta


def dump_simple_front_matter(meta: dict) -> str:
    order = ["slug", "title", "date", "readMin", "tags", "excerpt"]
    lines: list[str] = []
    for k in order:
        if k not in meta:
            continue
        v = meta[k]
        if k == "tags":
            lines.append("tags:")
            for t in v:
                lines.append(f"  - {t}")
            continue
        if k in ("title", "excerpt"):
            lines.append(f"{k}: {yaml_double_quoted(str(v))}")
        else:
            lines.append(f"{k}: {v}")
    return "\n".join(lines) + "\n"


def md_links(items: list[tuple[str, str]]) -> str:
    return "\n".join(f"- [{title}]({url})" for title, url in items)


# Category -> (trusted links, teaching paragraph)
CATEGORIES: dict[str, tuple[list[tuple[str, str]], str]] = {
    "android_ble": (
        [
            ("Bluetooth Low Energy overview", "https://developer.android.com/develop/connectivity/bluetooth/ble/ble-overview"),
            ("Bluetooth permissions", "https://developer.android.com/develop/connectivity/bluetooth/bt-permissions"),
            ("Find BLE devices", "https://developer.android.com/develop/connectivity/bluetooth/ble/find-ble-devices"),
            ("Transfer BLE data", "https://developer.android.com/develop/connectivity/bluetooth/ble/transfer-ble-data"),
            ("BluetoothLeGatt sample (platform-samples)", "https://github.com/android/platform-samples/tree/main/samples/connectivity/bluetooth/ble"),
        ],
        "Google’s BLE guide centers on **GATT**, **services/characteristics**, and the **central vs peripheral** split: your app typically scans as a central, connects to a GATT server on the device, then reads or subscribes to characteristics. Permissions and background behavior changed across Android versions, so treat **manifest permissions**, **scan throttling**, and **app-layer encryption** (paired BLE data is visible to other apps on the device) as first-class design constraints—not an afterthought.",
    ),
    "payments_regional_blik": (
        [
            ("BLIK — corporate site (product context)", "https://blik.com/en"),
            ("National Bank of Poland (regulatory context)", "https://www.nbp.pl/"),
            ("PCI SSC — security standards library", "https://www.pcisecuritystandards.org/document_library"),
            ("Google Play — Payments policy center", "https://support.google.com/googleplay/android-developer/topic/9858052"),
        ],
        "**BLIK** is a Poland-specific mobile payment scheme; international engineers usually meet it when integrating **local checkout** or **payout** rails for Polish users. Official engineering detail lives with **scheme operators**, **acquirers**, and **PSP SDKs** you integrate—not a single Android API. Pair any integration work with **PCI DSS** expectations for cardholder data and Google Play’s **payments policy** for digital goods vs physical goods.",
    ),
    "nfc_android": (
        [
            ("NFC overview", "https://developer.android.com/develop/connectivity/nfc"),
            ("Host-based card emulation", "https://developer.android.com/develop/connectivity/nfc/hce"),
            ("Google Pay API for Passes (context: Google wallet ecosystem)", "https://developers.google.com/wallet"),
        ],
        "Android’s **NFC** docs describe discovery, **NDEF** records, **reader/writer** mode, and **HCE**. **Tap to Pay on Android** (soft POS) is a **program + device certification** path layered on NFC and payment acceptance stacks—not the same as printing receipts or doing online-only tokenization. Read NFC fundamentals first, then follow your **PSP / acquirer** integration guide for the certified acceptance SDK.",
    ),
    "pos_hardware": (
        [
            ("Stripe — Terminal SDK overview", "https://docs.stripe.com/terminal"),
            ("Adyen — in-person payments", "https://docs.adyen.com/point-of-sale/"),
            ("Google Pay for Business (ecosystem entry)", "https://developers.google.com/pay/api"),
            ("PCI SSC", "https://www.pcisecuritystandards.org/"),
        ],
        "**Card-present** integrations pair your Android app with **vendor SDKs** (readers, firmware updates, transaction lifecycle). Official vendor docs—not generic REST tutorials—define **pairing**, **offline behavior**, **error codes**, and **PCI scope** boundaries. Expect interview depth on **idempotency**, **reversals**, and **receipt rendering** vs **authorization**.",
    ),
    "bitrise": (
        [
            ("Bitrise — documentation home", "https://devcenter.bitrise.io/"),
            ("Bitrise — Android build", "https://devcenter.bitrise.io/en/builds/android-build.html"),
        ],
        "Bitrise is a **hosted CI/CD** product aimed at mobile pipelines: signing, Gradle/AGP versions, test sharding, and store delivery. Official **DevCenter** articles are the source of truth for **Workflows**, **Stacks**, and **caching**—map them to concepts you already know from **GitHub Actions** or **GitLab CI** so you describe migrations honestly.",
    ),
    "firebase_test_lab": (
        [
            ("Firebase Test Lab", "https://firebase.google.com/docs/test-lab"),
            ("Instrumented tests (Android testing guide)", "https://developer.android.com/training/testing/instrumented-tests"),
        ],
        "**Firebase Test Lab** runs Espresso/UI tests on **virtual and physical devices** from CI. Google’s docs cover **Robo** vs **instrumentation**, quotas, and how results map to **Flaky tests**. This is the authoritative place to learn how to wire **Gradle-connected checks** into a cloud matrix.",
    ),
    "feature_flags": (
        [
            ("Firebase Remote Config", "https://firebase.google.com/docs/remote-config"),
            ("LaunchDarkly — docs home", "https://docs.launchdarkly.com/home"),
            ("Android architecture: UDF", "https://developer.android.com/topic/libraries/architecture"),
        ],
        "**Remote Config** is Google’s hosted key/value rollout system; **LaunchDarkly** is a leading SaaS feature-flag product with targeting and experimentation primitives. Both sit beside **UDF** architecture on Android: flags should feed **state holders** and **single sources of truth**, not scatter `if` statements through UI code.",
    ),
    "payments_reconciliation": (
        [
            ("Stripe — reconciliation", "https://docs.stripe.com/reports/reporting-and-balance"),
            ("Stripe — payouts", "https://docs.stripe.com/payouts"),
            ("PCI SSC", "https://www.pcisecuritystandards.org/"),
        ],
        "**Reconciliation** matches **processor settlements**, **ledger entries**, and **bank payouts**—downstream of auth/capture. PSP docs (Stripe shown here as a widely-cited reference) model **balance transactions**, **payout batches**, and **reporting CSVs**. Interviews probe **idempotency**, **timezone cutoffs**, and **chargeback** lifecycle—not the happy-path REST call.",
    ),
    "udf_architecture": (
        [
            ("Guide to app architecture", "https://developer.android.com/topic/architecture"),
            ("UDF in Jetpack Compose", "https://developer.android.com/develop/ui/compose/architecture#udf-compose"),
            ("UI layer guidance", "https://developer.android.com/topic/libraries/architecture"),
        ],
        "Google’s architecture guide formalizes **UDF**: immutable UI state, events flowing to an owner, and a **single source of truth**. **MVI** (often from Android community practice) lines up with the same **unidirectional** shape but adds explicit **intent** naming; use the word **MVI** on a CV only if your codebase or team used that vocabulary.",
    ),
    "android_security_storage": (
        [
            ("Data security on Android", "https://developer.android.com/topic/security/data"),
            ("Jetpack Security — EncryptedFile / EncryptedSharedPreferences (library)", "https://developer.android.com/topic/security/encryption"),
            ("Android Keystore system", "https://developer.android.com/privacy-and-security/keystore"),
        ],
        "Android’s **data security** guidance explains **encryption at rest**, **Keystore-backed keys**, and Jetpack **Security** APIs for **EncryptedSharedPreferences** and **EncryptedFile**. Treat **key rotation**, **backup rules**, and **rooted-device** assumptions as explicit threat-model topics.",
    ),
    "ui_automator": (
        [
            ("UI Automator", "https://developer.android.com/training/testing/ui-automator"),
            ("Espresso (compare scope)", "https://developer.android.com/training/testing/espresso"),
        ],
        "**UI Automator** targets **cross-app** and **system UI** interactions; **Espresso** optimizes in-app, single-process tests. Official docs are the right place to learn **`UiDevice`**, **wait conditions**, and why flakiness differs from Espresso’s synchronization model.",
    ),
    "fcm": (
        [
            ("Firebase Cloud Messaging", "https://firebase.google.com/docs/cloud-messaging"),
            ("Message types", "https://firebase.google.com/docs/cloud-messaging/customize-messages/set-message-type"),
            ("Topic messaging", "https://firebase.google.com/docs/cloud-messaging/topic-messaging"),
            ("Receive messages (Android)", "https://firebase.google.com/docs/cloud-messaging/receive-messages"),
        ],
        "FCM’s official documentation distinguishes **notification messages** vs **data messages**, explains **topic** and **token** targeting, and links to **Admin SDK / HTTP v1** send paths. Android **notification permission** (13+) and **background delivery** constraints belong in any serious architecture discussion.",
    ),
    "compose_accessibility": (
        [
            ("Compose accessibility", "https://developer.android.com/develop/ui/compose/accessibility"),
            ("Accessibility overview", "https://developer.android.com/guide/topics/ui/accessibility"),
            ("TalkBack", "https://support.google.com/accessibility/android/answer/6283677"),
        ],
        "Google’s Compose accessibility guide covers **semantics**, **custom actions**, **traversal order**, and **contentDescription** discipline. Pair it with the platform **Accessibility** overview for services like **TalkBack** and system-wide behaviors beyond Compose.",
    ),
    "recyclerview": (
        [
            ("RecyclerView guide", "https://developer.android.com/develop/ui/views/layout/recyclerview"),
            ("ListAdapter + DiffUtil", "https://developer.android.com/reference/androidx/recyclerview/widget/ListAdapter"),
        ],
        "**RecyclerView** remains the performance backbone of many legacy feeds. Official docs emphasize **view holder** patterns, **LayoutManager** choice, **DiffUtil/ListAdapter** for incremental updates, and **prefetch**—the vocabulary interviewers use for “heavy list” jank.",
    ),
    "macrobenchmark": (
        [
            ("Macrobenchmark library", "https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview"),
            ("Microbenchmark", "https://developer.android.com/topic/performance/benchmarking/microbenchmark-overview"),
        ],
        "Jetpack **Macrobenchmark** measures **startup**, **frame phases**, and **tailored scenarios** on device; **Microbenchmark** isolates tiny JVM/Kotlin hotspots. Google’s pages document Gradle setup, **baseline profiles**, and how to avoid **misleading numbers** from debuggable builds.",
    ),
    "profiling_systrace": (
        [
            ("Inspect GPU rendering speed", "https://developer.android.com/topic/performance/rendering/profile-gpu"),
            ("Capture a system trace (Perfetto)", "https://developer.android.com/topic/performance/tracing/system-tracing"),
            ("Android Studio Profiler", "https://developer.android.com/studio/profile"),
        ],
        "Performance work on Android should be grounded in **system traces** and **Android Studio profilers**. Official tracing docs describe **Perfetto**, **systrace successors**, and interpreting **binder**, **layout**, and **GPU** slices—this is what backs credible production performance stories.",
    ),
    "android_automotive": (
        [
            ("Android for Cars overview", "https://developer.android.com/training/cars"),
            ("Android Automotive OS", "https://source.android.com/docs/automotive"),
            ("Car App Library", "https://developer.android.com/training/cars/navigation"),
        ],
        "Google splits **Android Auto** (projection) from **Android Automotive OS** (full in-vehicle stack). Platform bring-up, **vehicle properties**, and **distraction** constraints are documented on **source.android.com** and **developer.android.com/training/cars**—expect OEM-specific variation beyond the public docs.",
    ),
    "android_ipc": (
        [
            ("Bound services (AIDL)", "https://developer.android.com/develop/background-work/services/bound-services"),
            ("AIDL overview", "https://developer.android.com/develop/background-work/services/aidl"),
            ("Content providers", "https://developer.android.com/guide/topics/providers/content-providers"),
        ],
        "Android’s **bound services** and **AIDL** pages explain **Binder IPC**, synchronous vs asynchronous calls, and **errors like `TransactionTooLargeException`**. **ContentProvider** is an IPC/data surface with its own contract—depth here is platform-team territory, not typical app-only CVs.",
    ),
    "aosp_embedded": (
        [
            ("Android Open Source Project", "https://source.android.com/"),
            ("SELinux for Android", "https://source.android.com/docs/security/features/selinux"),
        ],
        "**AOSP** and **SELinux** documentation targets **system integrators** building images—not every app developer. Cite these when you can speak to **sepolicy**, **image signing**, or **board bring-up**; otherwise keep claims at honest self-study depth.",
    ),
    "react_native": (
        [
            ("React Native — docs", "https://reactnative.dev/docs/getting-started"),
            ("React — docs", "https://react.dev/"),
            ("Using TypeScript", "https://reactnative.dev/docs/typescript"),
        ],
        "Meta’s **React Native** documentation covers **Metro**, **native modules**, **New Architecture**, and **Hermes**. Cross-reference **react.dev** for modern component and hooks patterns—interviewers often blur RN and React web fluency for lead roles.",
    ),
    "apple_ios": (
        [
            ("Apple Developer Documentation", "https://developer.apple.com/documentation/"),
            ("Swift language guide", "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/"),
            ("Human Interface Guidelines", "https://developer.apple.com/design/human-interface-guidelines"),
        ],
        "Apple’s **Developer Documentation** and **Swift.org** book are the canonical references for **native iOS** depth. HIG is the official UX contract for **accessibility**, **Dynamic Type**, and platform conventions—useful when discussing **SwiftUI vs UIKit** tradeoffs.",
    ),
    "web3_eth": (
        [
            ("Ethereum developers", "https://ethereum.org/en/developers/"),
            ("Hardhat docs", "https://hardhat.org/docs"),
            ("OWASP — Smart Contract Security", "https://owasp.org/www-project-smart-contract-security/"),
        ],
        "**ethereum.org** and **Hardhat** document the modern smart-contract toolchain. Treat **wallet custody**, **key material**, and **WebView signing** as **high-risk** surface areas—OWASP’s smart-contract security project is a trusted starting point for threat modeling, not hype threads.",
    ),
    "kotlin_multiplatform": (
        [
            ("Kotlin Multiplatform", "https://kotlinlang.org/docs/multiplatform.html"),
            ("KMP mobile samples", "https://kotlinlang.org/docs/multiplatform-get-started.html"),
        ],
        "JetBrains’ **Kotlin Multiplatform** documentation explains **expect/actual**, **hierarchical structure**, and **code sharing** between Android and iOS. Official guidance evolves quickly—prefer **kotlinlang.org** over stale blog posts when studying.",
    ),
    "scrum": (
        [
            ("Scrum Guide (2020)", "https://scrumguides.org/scrum-guide.html"),
            ("Professional Scrum certifications (PSM)", "https://www.scrum.org/professional-scrum-certifications"),
        ],
        "The **Scrum Guide** is the authoritative definition of Scrum roles, events, and artifacts. **Scrum.org** publishes **PSM** certifications separate from employment history—claim **years of Scrum** only if ceremonies and increments matched that model in practice.",
    ),
    "automotive_process": (
        [
            ("ISO 26262 road vehicles — functional safety (ISO catalog entry)", "https://www.iso.org/standard/68383.html"),
            ("AOSP automotive docs (engineering context)", "https://source.android.com/docs/automotive"),
        ],
        "**ASPICE** and **ISO 26262** are process and safety standards used in automotive software supply chains. Public overviews exist, but detailed work products are **company confidential**—safe interview language focuses on **traceability**, **release gates**, and **OTA governance** you actually experienced.",
    ),
    "product_scheduling": (
        [
            ("WorkManager (deferrable background work)", "https://developer.android.com/topic/libraries/architecture/workmanager"),
            ("Android background execution limits", "https://developer.android.com/about/versions/oreo/background"),
        ],
        "Product “scheduling” in JDs may mean **appointments**, **SLA timers**, or **background sync**. On Android, **WorkManager** is Google’s canonical API for **deferrable**, **constraint-aware** execution under **background limits** introduced since Android 8+.",
    ),
    "play_billing": (
        [
            ("Google Play Billing Library", "https://developer.android.com/google/play/billing"),
            ("Subscriptions", "https://developer.android.com/google/play/billing/subscriptions"),
            ("Real-time developer notifications", "https://developer.android.com/google/play/billing/rtdn-reference"),
        ],
        "Google’s **Play Billing Library** docs cover **one-time products**, **subscriptions**, **offer tokens**, and **server-side validation** with **Real-time developer notifications**. Subscription employers expect fluency in **entitlement**, **grace periods**, and **account hold** flows.",
    ),
    "android_studio_ats": (
        [
            ("Android Studio download & release notes", "https://developer.android.com/studio"),
            ("Gradle tips (Android)", "https://developer.android.com/build/gradle-tips"),
        ],
        "**Android Studio** and **AGP/Gradle** release notes are first-party evidence you ship on a modern toolchain. Mentioning Android Studio explicitly can help literal ATS parsers without changing your engineering story.",
    ),
    "compose_design_system": (
        [
            ("Compose theming (Material 3)", "https://developer.android.com/jetpack/compose/designsystems/material3"),
            ("Compose performance", "https://developer.android.com/develop/ui/compose/performance"),
        ],
        "Compose **Material 3** and **theming** docs show how to centralize **color**, **type**, and **shape** systems—this is how you defend **design system** bullets with Google’s vocabulary: **CompositionLocals**, **Theme** objects, and reusable primitives.",
    ),
    "maps_offline": (
        [
            ("Maps SDK for Android", "https://developers.google.com/maps/documentation/android-sdk/overview"),
            ("Offline maps (Google Maps consumer help — product behavior context)", "https://support.google.com/maps/answer/6291838"),
        ],
        "Google’s **Maps SDK for Android** documentation is the authoritative integration reference; **offline tile** behavior also depends on **Terms of Service** and caching rules for your SKU. Outdoor products usually combine SDK guidance with **on-device storage budgets** and **eviction** policies.",
    ),
    "soft_outdoor": (
        [
            ("Leave No Trace (outdoor ethics — culture signal only)", "https://lnt.org/"),
            ("OpenStreetMap", "https://www.openstreetmap.org/"),
        ],
        "Trusted **outdoor** references are not a substitute for engineering evidence—but **OpenStreetMap** is the canonical open mapping community if you contribute data honestly. Use personal context **only** if true.",
    ),
    "soft_consulting": (
        [
            ("Agile practice guide (PMI)", "https://www.pmi.org/disciplined-agile/process/introduction-to-disciplined-agile"),
            ("Scrum Guide", "https://scrumguides.org/scrum-guide.html"),
        ],
        "Client-facing delivery language is grounded in **transparent increments**, **risk disclosure**, and **written tradeoffs**—concepts aligned with **Scrum** and broader **agile** guidance from bodies like **PMI** (Disciplined Agile) when you need a neutral citation.",
    ),
    "java_kotlin_interop": (
        [
            ("Kotlin — Calling Java from Kotlin", "https://kotlinlang.org/docs/java-interop.html"),
            ("Android Java & Kotlin interop", "https://developer.android.com/kotlin/interop"),
        ],
        "JetBrains and Android document **nullability annotations**, **`@JvmStatic`**, default parameters, and **static helpers**—the real pain of mixed Java/Kotlin modules. That is what “legacy Java maintenance” screens usually test.",
    ),
    "language_policy": (
        [
            ("Common European Framework of Reference (CEFR)", "https://www.coe.int/en/web/common-european-framework-reference-languages"),
            ("European language policy portal (Council of Europe)", "https://www.coe.int/en/web/portal/home"),
        ],
        "Language levels on CVs map cleanly to **CEFR** bands (A1–C2) used across Europe. Official hiring language still varies—confirm **English-only** vs **local language** expectations with recruiters early.",
    ),
    "us_work_auth": (
        [
            ("US Department of State — visas", "https://travel.state.gov/content/travel/en/us-visas.html"),
            ("USCIS — employment authorization", "https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-employment-based-preference-immigrants"),
        ],
        "Work authorization is **legal status**, not a skill. Use **travel.state.gov** and **USCIS** pages to understand visa classes at a high level, then answer recruiters with **exact, consistent facts** from your own situation—never guess.",
    ),
    "claimed_skills_meta": (
        [
            ("Android architecture recommendations", "https://developer.android.com/topic/architecture/recommendations"),
            ("Jetpack libraries", "https://developer.android.com/jetpack/androidx/explorer"),
        ],
        "Section **E** items belong in an honest **skills inventory** (`claimed_skills.json` style), not duplicated as long essays. Anchor self-study claims to **first-party Android/Jetpack** reading you can defend in an interview.",
    ),
}

# slug -> category key
SLUG_CAT: dict[str, str] = {
    "A01-ble-bluetooth-low-energy": "android_ble",
    "A02-blik-polish-payments": "payments_regional_blik",
    "A03-tap-to-pay-android": "nfc_android",
    "A04-card-reader-pos-sdk": "pos_hardware",
    "A05-bitrise": "bitrise",
    "A06-firebase-test-lab": "firebase_test_lab",
    "A07-feature-flags-launchdarkly": "feature_flags",
    "A08-reconciliation-payouts-back-office": "payments_reconciliation",
    "A09-mvi-pattern": "udf_architecture",
    "A10-android-keystore-encrypted-prefs": "android_security_storage",
    "A11-ui-automator": "ui_automator",
    "A12-fcm-routing-topics": "fcm",
    "A13-compose-accessibility": "compose_accessibility",
    "A14-recyclerview-heavy-screens": "recyclerview",
    "A15-macro-micro-benchmark": "macrobenchmark",
    "A16-perfetto-systrace-dumpsys-battery-historian": "profiling_systrace",
    "A17-android-automotive-aaos-production": "android_automotive",
    "A18-ivi-car-apis-driver-distraction": "android_automotive",
    "A19-binder-aidl-ipc-contentprovider": "android_ipc",
    "A20-linux-selinux-aosp-build-production": "aosp_embedded",
    "A21-react-native-production": "react_native",
    "A22-react-redux-js-es6": "react_native",
    "A23-ios-swift-production": "apple_ios",
    "A24-crypto-wallets-defi-production": "web3_eth",
    "A25-kotlin-multiplatform-production": "kotlin_multiplatform",
    "A26-multi-year-scrum-cert": "scrum",
    "A27-ota-aspice-safety-process": "automotive_process",
    "A28-scheduling-task-management-features": "product_scheduling",
    "A29-subscription-iap-paywalls": "play_billing",
    "B01-android-studio-ats": "android_studio_ats",
    "B02-push-notifications-depth": "fcm",
    "B03-compose-design-system": "compose_design_system",
    "B04-offline-maps-tile-caching": "maps_offline",
    "B05-outdoor-tech-personal-signal": "soft_outdoor",
    "B06-client-facing-consulting-framing": "soft_consulting",
    "B07-java-legacy-maintenance-years": "java_kotlin_interop",
    "D01-catalan-level": "language_policy",
    "D02-portuguese": "language_policy",
    "D03-spanish-cv-variant": "language_policy",
    "D05-us-work-authorization": "us_work_auth",
    "E00-claimed-skills-reference": "claimed_skills_meta",
}


def appendix_md(slug: str, title: str) -> str:
    cat = SLUG_CAT[slug]
    links, para = CATEGORIES[cat]
    kw = title.replace("—", "-").split("-", 1)[-1].strip() if "-" in title else title
    return f"""{MARKER}

**Keywords:** {kw}, official documentation, Android career gaps, interview prep

*Who this is for:* Mobile and platform engineers who saw this topic on a JD and want **credible, first-party reading**—not resume inflation.

---

## Trusted sources (official and primary)

{md_links(links)}

## What official guidance emphasizes

{para}

## Study checklist (before you claim depth)

- Read the **top-level doc pages** above end-to-end once; bookmark the **API/class** pages you would touch in a spike.
- Reproduce **one minimal vertical slice** in a throwaway repo (build, run, capture logs)—evidence beats keywords.
- Write down **three failure modes** (permissions, background, data integrity, or device variance) you could explain without notes.
- Align language with your tracker: **OWN vs SIDE vs SKIP** from `gaps_to_review.md`—interviewers reward precision.

## CV alignment

Keep the short **OWN / SIDE / SKIP** section at the top of this article as your source of truth. The long-form section exists so you can study like an **ungapped** article: definitions, links, and interview vocabulary grounded in vendor and standards documentation.
"""


def read_article(path: Path) -> tuple[dict, str]:
    raw = path.read_text(encoding="utf-8")
    m = FRONT.match(raw)
    if not m:
        raise ValueError(f"No front matter: {path}")
    meta = parse_simple_front_matter(m.group(1))
    body = m.group(2).lstrip("\n")
    return meta, body


def write_article(path: Path, meta: dict, body: str) -> None:
    words = len(re.findall(r"\w+", body))
    try:
        rm = int(meta.get("readMin") or 5)
    except (TypeError, ValueError):
        rm = 5
    meta["readMin"] = max(rm, max(5, (words + 199) // 200))
    # Richer excerpt: first ~220 chars of longform paragraph after marker
    excerpt_src = body
    if MARKER in excerpt_src:
        tail = excerpt_src.split(MARKER, 1)[1]
        # first paragraph after "## What official guidance emphasizes"
        mp = re.search(
            r"## What official guidance emphasizes\s*\n+([\s\S]*?)(?=\n## |\Z)",
            tail,
        )
        if mp:
            excerpt_src = re.sub(r"\s+", " ", mp.group(1).strip())
    else:
        excerpt_src = re.sub(r"\s+", " ", body.split("\n", 5)[-1][:400])
    if len(excerpt_src) > 260:
        excerpt_src = excerpt_src[:257].rsplit(" ", 1)[0] + "…"
    meta["excerpt"] = excerpt_src
    fm = dump_simple_front_matter(meta).strip()
    path.write_text(f"---\n{fm}\n---\n\n{body.rstrip()}\n", encoding="utf-8")


def main() -> None:
    updated = 0
    skipped = 0
    for slug in sorted(SLUG_CAT):
        path = ART_DIR / f"{slug}.md"
        if not path.exists():
            print("missing", path)
            continue
        meta, body = read_article(path)
        if MARKER in body:
            skipped += 1
            continue
        title = str(meta.get("title") or slug)
        body = body.rstrip() + "\n\n" + appendix_md(slug, title)
        write_article(path, meta, body)
        updated += 1
        print("updated", slug)
    print("--- done: updated", updated, "skipped", skipped)


if __name__ == "__main__":
    main()
