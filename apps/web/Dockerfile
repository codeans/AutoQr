FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_WEBRTC_ICE_SERVERS
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_WEBRTC_ICE_SERVERS=$VITE_WEBRTC_ICE_SERVERS
ENV NODE_OPTIONS=--max-old-space-size=4096

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

COPY apps/web apps/web
COPY packages/shared packages/shared
RUN npx --workspace @autoqr/web vite build

FROM nginx:1.27-alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
