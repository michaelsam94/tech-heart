export default {
  slug: 'python-pattern-matching',
  title: 'Python 3.10+: structural pattern matching for clean parsers',
  date: '2026-02-20',
  readMin: 16,
  tags: ['Python'],
  excerpt:
    'Replace deep if/elif chains with match/case, capture sub-patterns, and guard with when for readable command and event dispatch.',
  sections: [
    {
      p: [
        'Structural pattern matching (PEP 634) lets you match shapes—not just values. It shines for CLI dispatch, JSON event types, and AST-like trees without deep isinstance ladders.',
        'Cases are tried top to bottom; the first match wins. Guards (if clauses) run after the pattern matches. Wildcard _ matches anything and is often used as a final exhaustiveness sink.',
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
      h2: 'Sequences and OR patterns',
    },
    {
      p: [
        'You can match sequences with fixed length, capture rest with *rest, and combine alternatives with |. Useful for parsing argv-style tokens or protocol frames.',
      ],
    },
    {
      code: {
        lang: 'python',
        code: `def parse_tokens(tokens: list[str]) -> str:
    match tokens:
        case ["deploy", env, version]:
            return f"deploy {version} to {env}"
        case ["rollback", env]:
            return f"rollback {env}"
        case ["help" | "-h" | "--help"]:
            return "help"
        case _:
            raise ValueError("unknown command")`,
      },
    },
    {
      h2: 'Exhaustiveness and typing',
    },
    {
      p: [
        'Static checkers (mypy, pyright) do not prove exhaustiveness of match on arbitrary dicts; for domain types prefer TypedDict, dataclasses, or enums so analyzers can warn on missing cases.',
      ],
    },
    {
      h2: 'Style guidance',
    },
    {
      ul: [
        'Prefer match when branches are shape-driven; stick to if/elif for simple scalar comparisons.',
        'Use capture patterns (x as binding) sparingly—readability drops if cases multiply.',
        'Keep guards cheap; heavy validation belongs in dedicated functions.',
      ],
    },
  ],
}
