FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/offline-sync/package.json packages/offline-sync/
COPY apps/worker-app/package.json apps/worker-app/

RUN npm ci --workspace=apps/worker-app --include-workspace-root

COPY packages/ packages/
COPY apps/worker-app/ apps/worker-app/

RUN npx turbo run build --filter=worker-app

FROM nginx:alpine
COPY --from=builder /app/apps/worker-app/dist /usr/share/nginx/html
COPY apps/worker-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]
