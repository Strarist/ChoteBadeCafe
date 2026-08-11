#!/bin/sh
set -eu

echo "Running Prisma migrations..."
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma

if [ "${SEED_ON_BOOT:-0}" = "1" ]; then
  echo "Seeding database (idempotent in production)..."
  pnpm db:seed
fi

echo "Starting API..."
exec node apps/backend/dist/main.js
