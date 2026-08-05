# syntax=docker/dockerfile:1

# ── Dependencies ─────────────────────────────────────────────────────────────
# `sweph` is an N-API binding. It publishes prebuilds for the common
# architectures, but without one it falls back to node-gyp, so the build tools
# stay in this stage — shared by the build and the development image — and
# never reach the runtime.
FROM node:24-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Manifests first: the dependency layer stays cached until they change.
COPY package.json package-lock.json ./
COPY packages/i18n/package.json packages/i18n/
COPY packages/geo/package.json packages/geo/
COPY packages/core/package.json packages/core/
COPY packages/plate/package.json packages/plate/
COPY packages/mcp/package.json packages/mcp/
COPY apps/web/package.json apps/web/

# `--ignore-scripts` keeps `prepare` from running before the sources exist,
# but it also skips the one install script that matters. It is rerun on its
# own: `node-gyp-build` takes the prebuild when there is one and compiles with
# the toolchain above when there is not — without this step, an architecture
# with no prebuild would only fail at runtime.
RUN npm ci --ignore-scripts \
  && npm rebuild sweph @resvg/resvg-js


# ── Development ──────────────────────────────────────────────────────────────
# Sources are not copied: they arrive through the bind mount in compose, so an
# edit shows without rebuilding anything.
FROM deps AS dev

ENV NODE_ENV=development \
    GEONAMES_DB_PATH=/data/geonames.db

EXPOSE 5173

CMD ["npm", "run", "dev", "-w", "@qimendunjia/web", "--", "--host", "0.0.0.0"]


# ── Build ────────────────────────────────────────────────────────────────────
FROM deps AS build

COPY tsconfig.base.json ./
COPY packages/ packages/
COPY apps/ apps/

RUN npm run build

# Not versioned, fetched at build time. The ephemerides (~2 MB) fit in the
# image; the location dataset (~90 MB) does not and lives on a volume — see
# GEONAMES_DB_PATH below.
RUN npm run ephe:download -w @qimendunjia/core

RUN npm prune --omit=dev --ignore-scripts


# ── Runtime ──────────────────────────────────────────────────────────────────
# One image for three surfaces — the web application, the MCP server and the
# dataset import. They share the code and the dependencies; only the command
# differs. See compose.yaml.
FROM node:24-bookworm-slim AS runtime

WORKDIR /app

# **The glyphs are the content.** A chart is nine palaces of Chinese
# characters, and a `slim` image ships no font that can draw one. Without this
# the PNG renders a grid of empty boxes: a picture that looks like a chart and
# says nothing, which is the worst kind of failure because it is silent.
# `fontconfig` comes with it and is not optional: the rasteriser finds system
# fonts through it, and with the files present but no index it behaves exactly
# as if none were installed.
RUN apt-get update \
  && apt-get install -y --no-install-recommends fonts-noto-cjk fontconfig \
  && fc-cache -f \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    GEONAMES_DB_PATH=/data/geonames.db \
    PORT=3000

COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/package.json ./
COPY --from=build /app/packages packages/
COPY --from=build /app/apps/web/build apps/web/build/
COPY --from=build /app/apps/web/package.json apps/web/

USER node
EXPOSE 3000

CMD ["node", "apps/web/build/index.js"]
