export default {
  slug: 'github-actions-reusable-workflows',
  title: 'GitHub Actions: reusable workflows and matrix hygiene',
  date: '2026-03-04',
  readMin: 8,
  tags: ['CI', 'GitHub'],
  excerpt:
    'Centralize build/test jobs with workflow_call, pass inputs and secrets explicitly, and keep matrices readable.',
  sections: [
    {
      p: [
        'Reusable workflows (.github/workflows/ci.yml with workflow_call) let organizations standardize lint, test, and deploy steps. Callers stay thin; maintainers update one workflow to roll out policy changes.',
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
      h2: 'Matrix discipline',
    },
    {
      p: [
        'Keep dimensions orthogonal: separate OS, language version, and feature flags into clear axes. Use include: only when a combination needs special variables—avoid exploding job counts accidentally.',
      ],
    },
  ],
}
