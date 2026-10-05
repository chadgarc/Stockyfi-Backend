# Stockify Local — Backend

Backend Repo: https://github.com/chadgarc/Stockyfi-Backend <br>
Frontend Repo: https://github.com/chadgarc/Stockyfi-Frontend

Secure modular REST API for inventory + workforce management. Multi-store, jurisdictional RBAC (`owner` global, `manager`/`associate` scoped to `storeId`), stock-to-shelf tracking (`inStock` vs `inShelf`).

Base URL (local): `http://localhost:3000/api`

Auth: `Authorization: Bearer <JWT>` header on all protected routes. `401` = identity (no/bad token), `403` = permission (valid token, wrong store/role).

Roles: `owner | manager | associate`. Owner has `storeId = null` (global). Manager/associate require a valid `storeId`.

---

## 1. Auth

### POST /api/auth/setup — First-run setup (public, locked after first owner)

Creates Business + first owner. Second call → `403 Setup locked`.

Body (raw JSON):

```json
{
  "name": "SilverMart HQ",
  "streetAddress": "123 Main St",
  "city": "Dallas",
  "state": "TX",
  "zip": "75201",
  "ownerName": "Chad Owner",
  "email": "owner@silvermart.com",
  "password": "Password123"
}
```

Returns `201`:

```json
{ "token": "<JWT>" }
```

Errors: `400` missing fields, `403` locked, `500` failed.

### POST /api/auth/login — Login (public)

Body:

```json
{ "email": "owner@silvermart.com", "password": "Password123" }
```

Returns `200`:

```json
{ "token": "<JWT>" }
```

Errors: `400` missing, `401` invalid credentials.

### POST /api/auth/register — Create user (protected)

Requires `protect`. Owner can create `owner|manager|associate` anywhere (`null` storeId if owner). Manager can create `manager|associate` only in own store. Associate → `403`.

Body (owner creating manager):

```json
{
  "name": "Marta Manager",
  "email": "marta@silvermart.com",
  "password": "Password123",
  "role": "manager",
  "storeId": "<STORE_ID>"
}
```

Body (owner creating owner, no store needed):

```json
{
  "name": "Second Owner",
  "email": "owner2@silvermart.com",
  "password": "Password123",
  "role": "owner"
}
```

Returns `201`:

```json
{ "message": "User Marta Manager created successfully" }
```

Errors: `400` missing/duplicate/invalid role, `403` not authorized.

---

## 2. Stores

### POST /api/stores — Create store (owner only)

Body:

```json
{
  "name": "SilverMart Neighbourhood",
  "streetAddress": "789 Pine St",
  "city": "Fort Worth",
  "state": "TX",
  "zip": "76101"
}
```

Returns `201`:

```json
{ "message": "Store created successfully" }
```

Errors: `400` missing, `403` non-owner.

### GET /api/stores — List stores (protected)

- Owner → all stores array.
- Manager → own store object.
- Associate → own store (limited fields).

Returns `200`: array or object. Errors: `401/500`.

---

## 3. Items (nested, jurisdictional)

All require `protect + jurisdiction`. Owner bypasses store check; others must match `:storeId` to their `storeId`, else `403`.

Item shape: `{ name*, upc*, storeId*, inStock >= 0, inShelf 0..inStock, department? }`. UPC is unique per store (compound index `{storeId, upc}`): same UPC allowed across stores, blocked twice in the same store.

### POST /api/stores/:storeId/items — Create item (owner|manager only)

Body:

```json
{
  "name": "Coca 600ml",
  "upc": "123456789012",
  "storeId": "<STORE_ID>",
  "inStock": 100,
  "inShelf": 20,
  "department": "drinks"
}
```

Returns `201`:

```json
{ "message": "Item Coca 600ml created successfully" }
```

Errors: `400` missing/invalid/duplicate, `403` associate or wrong store.

### GET /api/stores/:storeId/items — List items (all roles)

Optional query `?upc=123456789012` → returns single match instead of list.

Returns `200`: array, or single object when `?upc`. Errors: `403/404/400`.

### GET /api/stores/:storeId/items/:itemId — Get one (all roles)

Optional `?upc=` verifies `item.upc` matches, else `404`. Verifies `item.storeId === :storeId`.

Returns `200`: item object. Errors: `403/404`.

### PUT /api/stores/:storeId/items/:itemId — Update (owner|manager full, associate stock-only)

Associate may change only `inStock/inShelf`; changing `name/upc/department` → `403`. Requires full body + `inShelf <= inStock`. Uses `{ new: true, runValidators: true }`.

Body:

```json
{
  "name": "Coca 600ml",
  "upc": "123456789012",
  "storeId": "<STORE_ID>",
  "inStock": 90,
  "inShelf": 30,
  "department": "drinks"
}
```

Returns `201`:

```json
{ "message": "Item Coca 600ml updated successfully" }
```

Errors: `400/403/404`.

### DELETE /api/stores/:storeId/items/:itemId — Delete by ID (owner|manager only)

Returns `200`:

```json
{ "message": "Item Coca 600ml deleted successfully" }
```

### DELETE /api/stores/:storeId/items?upc=123 — Delete by UPC (owner|manager only)

Deletes one by `{storeId, upc}`. Returns `200` message. `404` if not found.

### DELETE /api/stores/:storeId/items?all=true — Delete all (owner|manager only, cascade helper)

Deletes all items of the store via `deleteMany({storeId})`. Used for store cascade.
Returns `200`:

```json
{ "message": "Deleted 5 items from store <STORE_ID>" }
```

---

## 4. Planned (per AGENT.md, not yet exposed)

- `GET/PUT /api/business` owner only.
- `DELETE /api/stores/:storeId` owner only + cascade + block if staff remains.
- `DELETE /api/users/:id` with last-owner protection (`count owners <= 1` → `400`).

## 5. Status codes

`200` ok, `201` created, `400` bad body/validation/duplicate, `401` no/bad token, `403` forbidden store/role, `404` not found, `500` server.
