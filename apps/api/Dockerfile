FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/offline-sync/package.json packages/offline-sync/
COPY apps/api/package.json apps/api/

RUN npm ci --workspace=apps/api --include-workspace-root

COPY packages/ packages/
COPY apps/api/ apps/api/

RUN npx turbo run build --filter=api

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api
RUN npx prisma generate

EXPOSE 4000
CMD ["node", "dist/index.js"]
