export default {
  slug: 'docker-buildkit-cache',
  title: 'Docker BuildKit: cache mounts for faster CI images',
  date: '2026-03-08',
  readMin: 7,
  tags: ['Docker', 'CI'],
  excerpt:
    'Use RUN --mount=type=cache to persist package manager stores across builds and shrink CI time without bloating final layers.',
  sections: [
    {
      p: [
        'BuildKit enables advanced Dockerfile frontends. Cache mounts let you reuse directories between builds on the same builder—ideal for npm, pip, apt, and go mod caches.',
        'Unlike COPY of a cache into the image, cache mounts do not ship to the final image; they only accelerate intermediate steps.',
      ],
    },
    {
      h2: 'Node example',
    },
    {
      code: {
        lang: 'dockerfile',
        code: `# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \\
    npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12 AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
ENV NODE_ENV=production
USER nonroot:nonroot
CMD ["dist/server.js"]`,
      },
    },
    {
      h2: 'Python example',
    },
    {
      code: {
        lang: 'dockerfile',
        code: `FROM python:3.13-slim AS app
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \\
    pip install -r requirements.txt
COPY . .
CMD ["python", "-m", "app"]`,
      },
    },
    {
      h2: 'CI tips',
    },
    {
      ul: [
        'Use a remote cache (BuildKit registry cache or dedicated cache service) so ephemeral runners still benefit.',
        'Pin the Dockerfile syntax comment so new features resolve predictably.',
      ],
    },
  ],
}
