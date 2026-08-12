#!/bin/sh
set -eu

echo "Running Prisma migrations..."
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma

# Always safe: seed.ts is idempotent in production (fills empty menu/staff only).
echo "Ensuring seed data (idempotent)..."
pnpm db:seed

echo "Starting API..."
exec node apps/backend/dist/main.js
