# Backend request — Stockify

## 1. Open GET /api/info to all authenticated roles (read-only)
- Today `GET /api/info` is owner-only. The frontend navbar needs the
  business `name` for every role (owner, manager, associate).
- Please change `GET /api/info` from `requireOwner` to `protect` only.
- Keep `PUT /api/info` strictly owner-only (no change).
- Frontend will only read `name`; it ignores street/city/phone.

## 2. Confirm staff listing route for the frontend
- Frontend will call `GET /api/stores/:storeId/users` to list staff
  of one store (owner + manager of that store).
- Please confirm query shape: array of `{_id, name, email, role, storeId}`.

## 3. Confirm password-update route
- Frontend needs "Edit Password" (forgotten passwords).
- Please confirm method+path, e.g. `PUT /api/stores/:storeId/users/:userId`
  with `{password}` or a dedicated `/password` subroute.

## 4. Enable CORS for the frontend origins (login currently blocked)
- Browser blocks `POST /api/auth/login` from `http://localhost:5173`
  to the Render deploy: `200` responds but without
  `Access-Control-Allow-Origin`, so the SPA reads it as a network error.
- Please enable `cors` middleware with:
  `origin: ["http://localhost:5173", "<frontend deploy URL>"]`,
  `allowedHeaders: ["Content-Type", "Authorization"]` (plus OPTIONS
  preflight handling), then redeploy.
