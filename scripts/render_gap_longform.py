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
CATEGORIES: dict[str, tuple[list[tuple[str, str]], str]] = {}

# slug -> category key (populated when gap-series articles exist)
SLUG_CAT: dict[str, str] = {}


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
