# AGENT.md — Stockify Local Backend Specialist

## 1. Objective

Build secure modular REST API for Stockify Local: closed inventory + workforce mgmt, multi-store, RBAC jurisdictional, stock-to-shelf `inStock` vs `inShelf`.

## 2. Stack / Structure

Node+Express, Mongoose Atlas, JWT, bcrypt, cors.
Folders: `models/ routes/ controllers/ middleware/ utils/`. Entry `server.js`.
Env: `PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRE`. CORS origins hardcoded in `server.js` (`allowedOrigins`): `https://chadgarc.github.io`, `http://localhost:5173` — to add another, edit the array there.

## 3. Models

- `Business{name:String*, streetAddress:String*, city:String*, state:String*, zip:String*, phone?:String 10 digits}` — single doc.
- `User{name*, email* unique, password* hashed, role: owner|manager|associate, storeId: null if owner else ObjectId Store*}`
- `Store{name*, streetAddress*, city*, state*, zip*}` — no default.
- `Item{name*, upc* (unique per store via compound index {storeId,upc}), department?, inStock:Number >=0, inShelf:Number 0<=x<=inStock, storeId ref Store*}`

## 4. Auth / First-Run

- `POST /api/auth/setup {name, streetAddress, city, state, zip, ownerName, email, password}` → creates Business + owner role, storeId=null. If owner count>0 → 403 locked.
- `POST /api/auth/login` → JWT.
- `POST /api/auth/register` → auth required. Owner can create owner|manager|associate any store (null if owner). Manager can create manager|associate only own store (force storeId from token, ignore body). Associate cannot access. No public signup.

## 5. Endpoints + RBAC

- `GET /api/info` all authenticated roles (navbar reads `name`; street/city/phone ignored by frontend).
- `PUT /api/info` owner only.
- `GET /api/stores` owner=all, manager/associate=own only.
- `POST /api/stores` owner only.
- `PUT /api/stores/:storeId` owner only (full body `name/streetAddress/city/state/zip`).
- `DELETE /api/stores/:storeId` owner only + cascade items+staff.
- `GET /api/stores/:storeId/items` all roles + jurisdiction check.
- `GET /api/stores/:storeId/items?upc=` single match.
- `POST /api/stores/:storeId/items` owner|manager only.
- `PUT /api/stores/:storeId/items/:itemId` owner|manager full, associate only `inStock/inShelf` else 403. Associate cannot delete.
- `DELETE /api/stores/:storeId/items/:itemId` by ID, `?upc=` by UPC, `?all=true` all — owner|manager only.
- `GET/PUT /api/users/me` own profile (never password; role/storeId ignored on PUT).
- `GET /api/stores/:storeId/users` staff by store (owner + manager of that store via jurisdiction). Shape: array of `{_id, name, email, role, storeId}` (never password).
- `PUT /api/stores/:storeId/users/:userId` with `{password}` is the password-update route (hashes via pre-save `save()`; manager never touches owners, last owner protected). No dedicated `/password` subroute.
- `POST/PUT/DELETE /api/users/owners[/:id]` owner admin (owners via register only).
- `GET/PUT/DELETE /api/users/:id` owner all, manager own store. If target is owner and `count owners<=1` → 403 last owner protected.

Shared helpers in `utils/roles.js`: `ROLES`, `isOwner/isManager/sameStore`, `canCreateStore/canDeleteStore/canManageBusiness/canCreateUser/canDeleteUser/canCreateItem/canDeleteItem/canReadStore/canUpdateItemField`.

Middleware: `protect` (JWT→DB user) + `jurisdiction` (owner bypass else `storeId == params.storeId`). Owner checks inline/`requireOwner` in users routes.

## 6. Validation

bcrypt pre-save (users hash only via save(); runValidators does not run pre-save hooks), items validate `inShelf<=inStock` and `>=0` by conditionals in the controller (no runValidators: the schema validator reads `this.inStock`, undefined on query updates), central error handler, 401/403/404 consistent JSON.

## 7. Backend Checklist

- [x] Env + Atlas connect verified
- [x] Models Business/User/Store/Item
- [x] Middleware auth/jurisdiction (+inline owner checks)
- [x] setup with auto-lock
- [x] login/register with role guards
- [x] business GET (all roles) / PUT owner only (/api/info)
- [x] stores CRUD + filtered GET + cascade delete
- [x] items nested CRUD + associate inStock/inShelf-only guard (+?upc/?all)
- [x] users me/owners/store-staff + last-owner protection
- [ ] Postman all endpoints pass
- [ ] Deploy Render Web Service
