FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/offline-sync/package.json packages/offline-sync/
COPY apps/dashboard/package.json apps/dashboard/

RUN npm ci --workspace=apps/dashboard --include-workspace-root

COPY packages/ packages/
COPY apps/dashboard/ apps/dashboard/

RUN npx turbo run build --filter=dashboard

FROM nginx:alpine
COPY --from=builder /app/apps/dashboard/dist /usr/share/nginx/html
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
