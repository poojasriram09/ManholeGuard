FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copy all package.json files for workspace resolution
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/offline-sync/package.json packages/offline-sync/
COPY apps/api/package.json apps/api/
COPY apps/dashboard/package.json apps/dashboard/
COPY apps/worker-app/package.json apps/worker-app/
COPY apps/citizen-portal/package.json apps/citizen-portal/

RUN npm ci

# Copy source
COPY packages/ packages/
COPY apps/api/ apps/api/

# Build API (tsc compiles to dist/)
RUN cd apps/api && npx tsc

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api
RUN npx prisma generate

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
