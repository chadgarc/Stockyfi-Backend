# AGENT.md — Stockify Local Backend Specialist

## 1. Objective

Build secure modular REST API for Stockify Local: closed inventory + workforce mgmt, multi-store, RBAC jurisdictional, stock-to-shelf `inStock` vs `inShelf`.

## 2. Stack / Structure

Node+Express, Mongoose Atlas, JWT, bcryptjs.
Folders: `models/ routes/ controllers/ middleware/`. Entry `server.js`.
Env: `PORT, MONGO_URI, JWT_SECRET`.

## 3. Models

- `Business{name:String*, streetAddress:String*, city:String*, state:String*, zip:String*}` — single doc.
- `User{name*, email* unique, password* hashed, role: owner|manager|associate, storeId: null if owner else ObjectId Store*}`
- `Store{name*, streetAddress*, city*, state*, zip*}` — no default.
- `Item{name*, upc* unique, department?, inStock:Number >=0, inShelf:Number 0<=x<=inStock, storeId ref Store*}`

## 4. Auth / First-Run

- `POST /api/auth/setup-owner {name, streetAddress, city, state, zip, ownerName, email, password}` → creates Business + owner role, storeId=null. If owner count>0 → 403 locked.
- `POST /api/auth/login` → JWT.
- `POST /api/auth/register` → auth required. Owner can create owner|manager|associate any store (null if owner). Manager can create manager|associate only own store (force storeId from token, ignore body). Associate cannot access. No public signup.

## 5. Endpoints + RBAC

- `GET /api/business` owner only — others 403, business name private.
- `PUT /api/business` owner only.
- `GET /api/stores` owner=all, manager/associate=own only.
- `POST /api/stores` owner only.
- `GET /api/stores/:storeId/items` all roles + jurisdiction check.
- `POST /api/stores/:storeId/items` owner|manager only.
- `PUT /api/stores/:storeId/items/:itemId` owner|manager full, associate only `inShelf` field else 403.
- `DELETE /api/stores/:storeId/items/:itemId` owner|manager only.

Middleware: `auth` verify JWT, `requireOwner`, `jurisdiction` owner bypass else `req.user.storeId == params.storeId`.

## 6. Validation

bcryptjs pre-save, `inShelf<=inStock`, `inStock>=0`, central error handler, 401/403/404 consistent JSON.

## 7. Backend Checklist

- [ ] Env + Atlas connect verified
- [ ] Models Business/User/Store/Item
- [ ] Middleware auth/requireOwner/jurisdiction
- [ ] setup-owner with auto-lock
- [ ] login/register with role guards
- [ ] business GET/PUT owner only
- [ ] stores CRUD + filtered GET
- [ ] items nested CRUD + associate inShelf-only guard
- [ ] Postman all endpoints pass
- [ ] Deploy Render Web Service
