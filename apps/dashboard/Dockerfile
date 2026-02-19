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
COPY apps/dashboard/ apps/dashboard/

# Build with vite (skip tsc, esbuild handles TS)
RUN cd apps/dashboard && npx vite build

FROM nginx:alpine
COPY --from=builder /app/apps/dashboard/dist /usr/share/nginx/html
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
