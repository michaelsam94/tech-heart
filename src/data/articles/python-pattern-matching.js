export default {
  slug: 'python-pattern-matching',
  title: 'Python 3.10+: structural pattern matching for clean parsers',
  date: '2026-02-20',
  readMin: 8,
  tags: ['Python'],
  excerpt:
    'Replace deep if/elif chains with match/case, capture sub-patterns, and guard with when for readable command and event dispatch.',
  sections: [
    {
      p: [
        'Structural pattern matching (PEP 634) lets you match shapes—not just values. It shines for CLI dispatch, JSON event types, and AST-like trees without classes of isinstance checks.',
      ],
    },
    {
      h2: 'CLI argument routing',
    },
    {
      code: {
        lang: 'python',
        code: `from dataclasses import dataclass
from typing import Literal

@dataclass
class Deploy:
    env: Literal["staging", "prod"]
    version: str

@dataclass
class Rollback:
    env: Literal["staging", "prod"]

Command = Deploy | Rollback

def run(cmd: Command) -> None:
    match cmd:
        case Deploy(env="staging", version=v):
            print(f"deploy {v} to staging")
        case Deploy(env="prod", version=v):
            print(f"deploy {v} to prod with approvals")
        case Rollback(env=e):
            print(f"rollback in {e}")`,
      },
    },
    {
      h2: 'JSON event handling',
    },
    {
      code: {
        lang: 'python',
        code: `def handle_event(event: dict) -> None:
    match event:
        case {"type": "user.created", "id": uid, "email": email}:
            print("onboard", uid, email)
        case {"type": "billing.paid", "amount": amt} if amt > 0:
            print("revenue", amt)
        case {"type": t}:
            print("unhandled", t)
        case _:
            raise ValueError("unknown payload")`,
      },
    },
    {
      h2: 'Style guidance',
    },
    {
      ul: [
        'Prefer match when branches are shape-driven; stick to if/elif for simple scalar comparisons.',
        'Use capture patterns (x as binding) sparingly—readability drops if cases multiply.',
      ],
    },
  ],
}
