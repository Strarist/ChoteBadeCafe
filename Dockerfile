# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /repo

FROM base AS build
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

ENV VITE_API_URL=/api
RUN pnpm --filter @cafe/shared-types build \
  && pnpm exec prisma generate --schema=prisma/schema.prisma \
  && pnpm --filter @cafe/backend build \
  && pnpm --filter @cafe/customer-app build \
  && VITE_BASE=/counter/ pnpm --filter @cafe/counter-pos build \
  && VITE_BASE=/admin/ pnpm --filter @cafe/admin build

FROM base AS api
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
COPY --from=build /repo /repo
COPY deploy/api-entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]

FROM caddy:2.9-alpine AS web
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /repo/apps/customer-app/dist /srv/www
COPY --from=build /repo/apps/counter-pos/dist /srv/counter
COPY --from=build /repo/apps/admin/dist /srv/admin
EXPOSE 80 443
