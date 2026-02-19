FROM node:20-alpine AS builder

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
COPY apps/worker-app/ apps/worker-app/

# Build with vite (skip tsc, esbuild handles TS)
RUN cd apps/worker-app && npx vite build

FROM nginx:alpine
COPY --from=builder /app/apps/worker-app/dist /usr/share/nginx/html
COPY apps/worker-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]
