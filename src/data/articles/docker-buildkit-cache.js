export default {
  slug: 'docker-buildkit-cache',
  title: 'Docker BuildKit: cache mounts for faster CI images',
  date: '2026-03-08',
  readMin: 14,
  tags: ['Docker', 'CI'],
  excerpt:
    'Use RUN --mount=type=cache to persist package manager stores across builds and shrink CI time without bloating final layers.',
  sections: [
    {
      p: [
        'BuildKit enables advanced Dockerfile frontends. Cache mounts let you reuse directories between builds on the same builder—ideal for npm, pip, apt, go mod, and cargo registry caches.',
        'Unlike COPY of a cache into the image, cache mounts do not ship to the final image; they only accelerate intermediate steps. The final artifact stays minimal—important for security surface and registry bandwidth.',
      ],
    },
    {
      h2: 'How cache mounts differ from layers',
    },
    {
      p: [
        'Normal RUN layers persist everything in the filesystem into the image layer. A cache mount is an ephemeral bind to persistent storage on the builder: the RUN step sees populated caches, but those files are not committed to the layer tarball. Rebuilds hit warm caches without growing layer diffs.',
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
      h2: 'Sharing cache in CI',
    },
    {
      p: [
        'Ephemeral CI runners lose local BuildKit cache between jobs unless you export it. Use docker buildx build --cache-to type=registry,... --cache-from type=registry,... to push/pull cache manifests alongside your image, or a dedicated remote cache backend.',
      ],
    },
    {
      code: {
        lang: 'bash',
        code: `# Example: inline cache export (conceptual; adjust registry/repo)
docker buildx build \\
  --cache-to type=registry,ref=myregistry/myapp:buildcache,mode=max \\
  --cache-from type=registry,ref=myregistry/myapp:buildcache \\
  -t myregistry/myapp:latest .`,
      },
    },
    {
      h2: 'CI tips',
    },
    {
      ul: [
        'Pin the Dockerfile # syntax= line so parser features resolve predictably across machines.',
        'Scope cache IDs if multiple projects share a builder to avoid cross-project pollution.',
        'Combine cache mounts with multi-stage builds: warm deps stage, thin final stage.',
      ],
    },
  ],
}
