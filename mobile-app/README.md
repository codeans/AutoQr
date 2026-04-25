# AutoQr Mobile

React Native (Expo) app for AutoQr owners. Shares the same backend APIs, realtime
layer, and admin-managed content as the web portal inside this monorepo.

## Stack

- Expo SDK 52 · Expo Router · TypeScript
- Zustand · TanStack Query · React Hook Form · Zod
- Socket.io client · WebRTC-ready peer manager
- Expo Notifications · Expo SecureStore · Reanimated

## Getting started

```bash
cd mobile-app
npm install
cp .env.example .env      # defaults point at https://api.autoqr.de
npx expo start
```

The app defaults to the production API at `https://api.autoqr.de`. Override
`EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SOCKET_URL`, and
`EXPO_PUBLIC_ASSETS_BASE_URL` in `.env` when pointing at a local backend.

## Scripts

- `npm start` — Expo dev server
- `npm run ios` / `npm run android` — native dev build
- `npm run prebuild` — generate native projects (`ios/`, `android/`)
- `npm run typecheck` — project-wide TS check

## Structure

```
app/            Expo Router routes (thin exports, logic lives in features/)
  (auth)/       Login, register, forgot, reset
  (tabs)/       Dashboard · Vehicles · Incidents · Settings
  activate      QR activation
  call/         Incoming + active call
  vehicles/     Create, detail
  incidents/    Detail
  settings/     Profile · password · legal/[slug] · support · calls

components/ui/  Design-system primitives
features/       Screen-level modules (auth, vehicles, incidents, call, ...)
hooks/          useBootstrap, useSocket, useIncomingCall, query hooks
schemas/        Zod form schemas
services/
  api/          Typed REST client + per-resource services
  socket/       Authenticated Socket.io singleton
  webrtc/       PeerConnection abstraction (enable by installing
                react-native-webrtc in a dev build)
  notifications/ Expo Notifications wiring
stores/         Zustand stores (auth, call, app toasts)
theme/          Colors, typography, spacing, shadows
```

## Backend integration

The app talks to `@autoqr/api` via REST + Socket.io:

- `POST /auth/login|register|refresh|logout|change-password|forgot|reset`
- `GET/POST/PUT/DELETE /owner/cars`
- `POST /owner/tags/activate`
- `GET /owner/incidents`, `GET /owner/incidents/:id`, `GET /owner/calls`
- `GET /public/content/:slug` for CMS legal pages
- Socket events: `call_ringing`, `call_accept`, `call_accepted`, `call_reject`,
  `call_end`, WebRTC signaling — see `types/call.ts`

Access tokens are kept in SecureStore and rotated through the
`refresh` interceptor in `services/api/client.ts`.

## WebRTC

`services/webrtc/peer.ts` is wired to a lazy `react-native-webrtc` loader.
Install `react-native-webrtc` inside an Expo dev build or bare project to
enable real audio — no other file has to change. Until then the call UI,
signaling, and lifecycle already work end-to-end.

## Design

Light theme, white background, blue primary (`#1D4ED8`). Tokens in
`theme/`. Matches the marketing site and admin panel.
