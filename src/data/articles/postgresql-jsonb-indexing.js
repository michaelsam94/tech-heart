export default {
  slug: 'postgresql-jsonb-indexing',
  title: 'PostgreSQL: practical JSONB indexes and queries',
  date: '2026-03-12',
  readMin: 9,
  tags: ['PostgreSQL', 'SQL'],
  excerpt:
    'Use jsonb with GIN, expression indexes, and containment operators to keep document-shaped data fast and queryable.',
  sections: [
    {
      p: [
        'JSONB stores JSON in a decomposed binary format with indexing support—prefer it over json unless you need preserved key ordering and whitespace from the original text.',
        'Typical stacks store flexible attributes (feature flags, vendor metadata) in jsonb while keeping relational columns for hot foreign keys and constraints.',
      ],
    },
    {
      h2: 'Table and basic operators',
    },
    {
      code: {
        lang: 'sql',
        code: `CREATE TABLE events (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL
);

-- Containment: does payload include this structure?
SELECT id
FROM events
WHERE payload @> '{"kind": "signup", "plan": "pro"}';

-- Path extraction ->> returns text
SELECT id, payload->>'trace_id' AS trace_id
FROM events
WHERE (payload->>'region') = 'eu-west-1';`,
      },
    },
    {
      h2: 'GIN index for flexible containment',
    },
    {
      code: {
        lang: 'sql',
        code: `CREATE INDEX events_payload_gin ON events USING gin (payload jsonb_path_ops);

-- jsonb_path_ops is compact and fast for containment; use jsonb_ops if you need many ? operators on keys.

EXPLAIN ANALYZE
SELECT id FROM events
WHERE payload @> '{"kind": "signup"}';`,
      },
    },
    {
      h2: 'Expression index for a hot field',
    },
    {
      p: [
        'If you always filter on payload->>\'user_id\', index that expression—smaller and more selective than indexing the entire jsonb.',
      ],
    },
    {
      code: {
        lang: 'sql',
        code: `CREATE INDEX events_user_id_text ON events ((payload->>'user_id'));

SELECT * FROM events WHERE payload->>'user_id' = $1;`,
      },
    },
    {
      note: 'Keep an eye on write amplification: many jsonb indexes on the same table can slow inserts. Measure with realistic batch loads.',
    },
  ],
}
