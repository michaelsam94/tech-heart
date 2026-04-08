export default {
  slug: 'github-actions-reusable-workflows',
  title: 'GitHub Actions: reusable workflows and matrix hygiene',
  date: '2026-03-04',
  readMin: 16,
  tags: ['CI', 'GitHub'],
  excerpt:
    'Centralize build/test jobs with workflow_call, pass inputs and secrets explicitly, and keep matrices readable.',
  sections: [
    {
      p: [
        'Reusable workflows (trigger: workflow_call) live in .github/workflows/ and act like callable CI functions. Callers reference them with jobs.<job_id>.uses. They are ideal for org-wide Node/Java/Ruby test recipes, security scanning gates, and deployment orchestration with a single change propagating to dozens of repos.',
        'Unlike composite actions (steps bundled as an action), reusable workflows are full workflows: they own jobs, runners, and permissions boundaries. Choose reusable workflows when you need matrix strategies, job-level permissions, or environment protection rules.',
      ],
    },
    {
      h2: 'Reusable workflow definition',
    },
    {
      code: {
        lang: 'yaml',
        code: `# .github/workflows/node-ci.yml
on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
    secrets:
      NPM_TOKEN:
        required: false

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ inputs.node-version }}
          cache: npm
      - run: npm ci
      - run: npm test`,
      },
    },
    {
      h2: 'Caller repository',
    },
    {
      code: {
        lang: 'yaml',
        code: `# .github/workflows/on-push.yml
on:
  push:
    branches: [main]

jobs:
  ci:
    uses: your-org/ci/.github/workflows/node-ci.yml@main
    with:
      node-version: '22'
    secrets:
      NPM_TOKEN: \${{ secrets.NPM_TOKEN }}`,
      },
    },
    {
      p: [
        'Pin reusable workflows to a tag or SHA for supply-chain stability; @main floats and can surprise callers on every push to the central repo.',
      ],
    },
    {
      h2: 'Matrix discipline',
    },
    {
      p: [
        'Keep dimensions orthogonal: separate OS, language version, and feature flags into clear axes. Use include: only when a combination needs extra variables—avoid N×M explosions that burn concurrent minute quotas.',
      ],
    },
    {
      code: {
        lang: 'yaml',
        code: `jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        node: ['20', '22']
        os: [ubuntu-latest, windows-latest]
    uses: your-org/ci/.github/workflows/node-ci.yml@v1
    with:
      node-version: \${{ matrix.node }}`,
      },
    },
    {
      h2: 'Secrets and environments',
    },
    {
      p: [
        'Secrets passed to reusable workflows are not automatically available to workflows triggered from forks of public repos—GitHub strips them to prevent exfiltration. Design fork PR workflows accordingly (e.g. label-gated workflows, restricted tokens).',
        'Use environments with required reviewers for deploy reusable workflows even if build workflows are wide open.',
      ],
    },
  ],
}
