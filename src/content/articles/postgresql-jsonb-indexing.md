---
slug: postgresql-jsonb-indexing
title: "PostgreSQL: practical JSONB indexes and queries"
date: 2026-03-12
readMin: 18
tags:
  - PostgreSQL
  - SQL
excerpt: Use jsonb with GIN, expression indexes, and containment operators to keep document-shaped data fast and queryable.
---

JSONB stores JSON in a decomposed binary format with indexing support—prefer it over `json` unless you need preserved key ordering and whitespace from the original text.

Typical stacks store flexible attributes (feature flags, vendor metadata, event envelopes) in `jsonb` while keeping relational columns for hot foreign keys and constraints. That split keeps joins and integrity on columns while still allowing schema-light evolution in payload.

Operators you will use daily: `->` returns `jsonb`; `->>` returns text; `@>` containment; `?` / `?|` / `?&` key existence; `#>` and `#>>` for path arrays.

## Table and basic operators

```sql
CREATE TABLE events (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL
);

-- Containment: does payload include this structure?
SELECT id
FROM events
WHERE payload @> '{"kind": "signup", "plan": "pro"}';

-- Path extraction ->> returns text (good for equality filters)
SELECT id, payload->>'trace_id' AS trace_id
FROM events
WHERE (payload->>'region') = 'eu-west-1';

-- Nested path with #>>
SELECT payload #>> '{user,email}' AS email FROM events LIMIT 5;
```

## jsonb_path_ops vs jsonb_ops

GIN indexes support two operator classes. `jsonb_path_ops` is smaller and faster for containment (`@>`, `<@`) but supports fewer operators (`?` etc.). `jsonb_ops` is larger but supports key existence queries. Pick based on your query mix; wrong class means the planner cannot use the index for that operator.

## GIN index for flexible containment

```sql
CREATE INDEX events_payload_gin ON events USING gin (payload jsonb_path_ops);

EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM events
WHERE payload @> '{"kind": "signup"}';
```

## Expression index for a hot field

If you always filter on `payload->>'user_id'`, index that expression—smaller and more selective than indexing the entire `jsonb`. Partial indexes (`WHERE ...`) further shrink size when the condition is common.

```sql
CREATE INDEX events_user_id_text ON events ((payload->>'user_id'));

CREATE INDEX events_signup_recent ON events (created_at)
WHERE payload @> '{"kind": "signup"}';

SELECT * FROM events WHERE payload->>'user_id' = $1;
```

## jsonpath and analytics

For complex extraction, `jsonb_path_query` and SQL/JSON path (`jsonpath`) can express filters inside documents. Use them when containment is not enough; remember functional indexes can target `jsonpath` expressions if one path is hot.

```sql
-- Example: items where any line has qty > 10
SELECT id
FROM orders
WHERE jsonb_path_exists(
  payload,
  '$.lines[*] ? (@.qty > 10)'
);
```

> Keep an eye on write amplification: many jsonb indexes on the same table slow inserts. Measure with realistic batch loads and autovacuum settings.

## Migration tip

When promoting a jsonb key to a column, add a generated column (stored) and index the column—queries become simpler and statistics more accurate than raw jsonb for heavy filters.
