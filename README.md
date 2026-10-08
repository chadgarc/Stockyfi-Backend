<div align="center">

# 🏪 Stockify Local — Backend API

**Modern RESTful API for smart inventory and staff management in small retail stores.**

![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT Auth](https://img.shields.io/badge/JWT-Protected-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![PNPM](https://img.shields.io/badge/pnpm-12.8-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

---

[🔗 Backend Repository](https://github.com/chadgarc/Stockyfi-Backend) &nbsp;|&nbsp; [🔗 Frontend Repository](https://github.com/chadgarc/Stockyfi-Frontend)

<br>

[🔗 Deployed at render.com](https://stockyfi-backend.onrender.com/)

<br/>

| Base URL (Local)            | Response Format    | Authentication                |
| :-------------------------- | :----------------- | :---------------------------- |
| `http://localhost:3000/api` | `application/json` | `Authorization: Bearer <JWT>` |

</div>

<br/>

> [!IMPORTANT]
> **One time initial setup:** No public signups. The initial setup registers the first **Business Owner**, who then invites managers and associates per store. Like a docker container.

> [!NOTE]
> **Stock-to-Shelf Tracking:** Stockify tracks total backroom stock (`inStock`) alongside real-time sales floor availability (`inShelf`).

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [👑 Role & Permissions Matrix](#-role--permissions-matrix)
- [🚀 Quickstart Flow](#-quickstart-flow)
- [📡 API Reference](#-api-reference)
  - [🔐 1. Authentication](#-1-authentication)
  - [🏬 2. Stores](#-2-stores)
  - [📦 3. Items & Inventory](#-3-items--inventory)
  - [🏢 4. Business Info](#-4-business-info)
  - [👥 5. Users & Staff](#-5-users--staff)
- [🧭 Status Codes Matrix](#-status-codes-matrix)
- [⚙️ Setup & Local Installation](#️-setup--local-installation)

---

## ✨ Key Features

- 📦 **Stock-to-Shelf Tracking:** Detailed inventory breakdown (`Backroom / inStock ➡️ Shelf / inShelf`).
- 🏬 **Multi-Store Jurisdiction:** Strict scope isolation of inventory and employees per store location.
- 🏷️ **UPC Indexing per Store:** The same barcode (UPC) can exist in multiple stores independently (compound indexing).
- 🔐 **Granular RBAC:** Role-Based Access Control enforcing `owner`, `manager`, and `associate` permissions.
- 🛡️ **Owner Safeguards:** Protection rules preventing zero-owner deadlock scenarios.

---

## 👑 Role & Permissions Matrix

| Module / Action                                     |  Owner 👑  |     Manager 🧑‍💼      |    Associate 🙋     |
| :-------------------------------------------------- | :--------: | :-----------------: | :-----------------: |
| First-Time Setup Wizard                             |     ✅     |         ❌          |         ❌          |
| Manage Stores (Create/Update/Delete)             |     ✅     |         ❌          |         ❌          |
| View Stores                                         | All stores | Assigned store only | Assigned store only |
| View Inventory                                      |     ✅     |         ✅          |         ✅          |
| Create / Delete Items                               |     ✅     |         ✅          |         ❌          |
| Edit Name / UPC / Department                        |     ✅     |         ✅          |         ❌          |
| Update Stock & Shelf Counts (`inStock` / `inShelf`) |     ✅     |         ✅          |         ✅          |
| Register Staff (Manager/Associate)                  |     ✅     |   ✅ (Own store)    |         ❌          |
| Manage Owners                                       |     ✅     |         ❌          |         ❌          |
| Edit Business Information                           |     ✅     |         ❌          |         ❌          |

---

## 🚀 Quickstart Flow

1. **Run Setup Wizard:** Call `POST /api/auth/setup` once to create the Business and the primary **Owner 👑** account.
2. **Authenticate:** Use the returned token in subsequent requests header (`Authorization: Bearer <token>`).
3. **Create Store Locations:** Register stores via `POST /api/stores`.
4. **Populate Inventory:** Add items under store scope in the URL: `/api/stores/:storeId/items`.
5. **Invite Team:** Register store managers and associates passing their `storeId` via `/api/auth/register`.

---

## 📡 API Reference

### 🔐 1. Authentication

<details>
<summary><b><code>POST</code> /api/auth/setup — First-Run Setup Wizard (Public / Locks After Execution)</b></summary>

<br/>

> Creates the Business profile and primary Owner account. **Can only be executed once.**

**Request Body:**

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

**Responses:**

- `201 Created` 🎉 → `{ "token": "<JWT>" }`
- `403 Forbidden` 🔒 → Service is locked (setup already completed).

</details>

<details>
<summary><b><code>POST</code> /api/auth/login — User Authentication (Public)</b></summary>

<br/>

**Request Body:**

```json
{
  "email": "owner@silvermart.com",
  "password": "Password123"
}
```

**Responses:**

- `200 OK` ✅ → `{ "token": "<JWT>" }`
- `401 Unauthorized` 🔑 → Invalid credentials.

</details>

<details>
<summary><b><code>POST</code> /api/auth/register — Register Staff (Protected 🔐)</b></summary>

<br/>

> **Owners 👑** can create any role in any store. **Managers 🧑‍💼** can create `manager` or `associate` accounts in their assigned store only.

**Request Body:**

```json
{
  "name": "Marta Manager",
  "email": "marta@silvermart.com",
  "password": "Password123",
  "role": "manager",
  "storeId": "<STORE_ID>"
}
```

**Responses:**

- `201 Created` ✅ → User created.
- `403 Forbidden` 🚫 → Insufficient jurisdiction or forbidden role assignment.

</details>

---

### 🏬 2. Stores

<details>
<summary><b><code>POST</code> /api/stores — Create Store Location (Owner 👑)</b></summary>

<br/>

**Request Body:**

```json
{
  "name": "SilverMart Neighbourhood",
  "streetAddress": "789 Pine St",
  "city": "Fort Worth",
  "state": "TX",
  "zip": "76101"
}
```

**Response:** `201 Created` ✅

</details>

<details>
<summary><b><code>GET</code> /api/stores — List Stores (Protected 🔐)</b></summary>

<br/>

- **Owner 👑:** Returns all store locations in the business.
- **Manager 🧑‍💼 / Associate 🙋:** Returns only their assigned store.

**Response:** `200 OK` ✅

</details>

<details>
<summary><b><code>PUT</code> /api/stores/:storeId — Update Store Location (Owner 👑)</b></summary>

<br/>

Full body required (`name`, `streetAddress`, `city`, `state`, `zip`):

```json
{
  "name": "SilverMart Neighbourhood",
  "streetAddress": "789 Pine St",
  "city": "Fort Worth",
  "state": "TX",
  "zip": "76101"
}
```

**Response:** `200 OK` ✅ (`404` if the store does not exist, `403` for non-owners).

</details>

<details>
<summary><b><code>DELETE</code> /api/stores/:storeId — Delete Store (Owner 👑, Cascade 💥)</b></summary>

<br/>

> [!WARNING]
> This permanently deletes the store along with **all items and staff assigned to it**.

**Response:** `200 OK` 💥

</details>

---

### 📦 3. Items & Inventory

> [!NOTE]
> `storeId` **must always be passed in the URL** (`/api/stores/:storeId/items`), never in the request payload body.

<details>
<summary><b><code>POST</code> /api/stores/:storeId/items — Create Item (Owner 👑 | Manager 🧑‍💼)</b></summary>

<br/>

**Request Body:**

```json
{
  "name": "Coca 600ml",
  "upc": "123456789012",
  "inStock": 100,
  "inShelf": 20,
  "department": "drinks"
}
```

**Response:** `201 Created` ✅ (Associates receive `403 Forbidden` 🚫).

</details>

<details>
<summary><b><code>GET</code> /api/stores/:storeId/items — Fetch Items (Protected 🔐)</b></summary>

<br/>

Supports optional barcode lookup via Query Parameter:

- `GET /api/stores/:storeId/items` (Fetch full inventory list)
- `GET /api/stores/:storeId/items?upc=123456789012` (Fetch single item by UPC)

**Response:** `200 OK` ✅

</details>

<details>
<summary><b><code>GET</code> /api/stores/:storeId/items/:itemId — Get Single Item</b></summary>

<br/>

**Response:** `200 OK` ✅ (If item does not belong to the target store, returns `404 Not Found` 🙈).

</details>

<details>
<summary><b><code>PUT</code> /api/stores/:storeId/items/:itemId — Update Item</b></summary>

<br/>

- **Owner / Manager:** Full field edit (`name`, `upc`, `inStock`, `inShelf`, `department`).
- **Associate 🙋:** Restricted edit (`inStock`, `inShelf` counts only).

```json
{
  "name": "Coca 600ml",
  "upc": "123456789012",
  "inStock": 90,
  "inShelf": 30,
  "department": "drinks"
}
```

**Response:** `200 OK` ✅

</details>

<details>
<summary><b><code>DELETE</code> /api/stores/:storeId/items — Delete Items (Owner 👑 | Manager 🧑‍💼)</b></summary>

<br/>

Supported deletion modes:

- `DELETE /api/stores/:storeId/items/:itemId` (By item ID)
- `DELETE /api/stores/:storeId/items?upc=123456789012` (By UPC)
- `DELETE /api/stores/:storeId/items?all=true` (Clear store inventory 💥)

**Response:** `200 OK` ✅

</details>

---

### 🏢 4. Business Info

<details>
<summary><b><code>GET</code> /api/info — Fetch Business Details (any authenticated role 👀)</b></summary>

<br/>

Read-only for owner, manager and associate — the navbar shows the business `name` for every role (frontend ignores street/city/phone).

**Response:** `200 OK` → `{ "name": "SilverMart HQ", "streetAddress": "...", "city": "...", "state": "...", "zip": "...", "phone": "..." }`

</details>

<details>
<summary><b><code>PUT</code> /api/info — Update Business Profile (Owner 👑)</b></summary>

<br/>

```json
{
  "name": "SilverMart HQ",
  "streetAddress": "123 Main St",
  "city": "Dallas",
  "state": "TX",
  "zip": "75201",
  "phone": "2145551234"
}
```

**Response:** `200 OK` ✅ (`phone` is optional, 10 digits format).

</details>

---

### 👥 5. Users & Staff

<details>
<summary><b><code>GET</code> /api/users/me — Current User Profile</b></summary>

<br/>

**Response:** `200 OK` → `{ "name": "...", "email": "...", "role": "...", "storeId": "..." }` _(Excludes password field 🤫)_.

</details>

<details>
<summary><b><code>PUT</code> /api/users/me — Update Self Profile</b></summary>

<br/>

> Edit own name, email, and password. `role` and `storeId` modifications are ignored on this endpoint.

```json
{
  "name": "New Name",
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response:** `200 OK` ✅

</details>

<details>
<summary><b><code>GET | PUT | DELETE</code> /api/stores/:storeId/users[/:userId] — Manage Store Staff</b></summary>

<br/>

> Allows Owners and Managers to manage workers assigned to a specific store. Managers cannot modify or remove Owner accounts. List shape: array of `{_id, name, email, role, storeId}` (never password). "Edit Password" = `PUT` .../:userId with `{password}` — it hashes via pre-save `save()`.

</details>

<details>
<summary><b><code>POST | PUT | DELETE</code> /api/users/owners[/:id] — Owner Administration (Owner 👑)</b></summary>

<br/>

> Manage Owner tier accounts. Includes active safeguards to prevent deleting the last remaining Owner in the system 🛡️.

</details>

---

## 🧭 Status Codes Matrix

| Code  | Status                | Context & Description                                                   |
| :---: | :-------------------- | :---------------------------------------------------------------------- |
| `200` | ✅ **OK**             | Request successfully processed.                                         |
| `201` | 🎉 **Created**        | Resource (User, Store, Item) successfully created.                      |
| `400` | ⚠️ **Bad Request**    | Missing required fields or invalid JSON format.                         |
| `401` | 🔑 **Unauthorized**   | Missing, invalid, or expired JWT token.                                 |
| `403` | 🚫 **Forbidden**      | Insufficient permissions or access outside assigned store jurisdiction. |
| `404` | 🙈 **Not Found**      | Resource or route not found.                                            |
| `500` | 🔥 **Internal Error** | Unhandled server exception.                                             |

---

## ⚙️ Setup & Local Installation

### Prerequisites

- **Node.js:** `v20.x` or higher
- **pnpm:** `v12.x` (`npm i -g pnpm`)
- **MongoDB:** Local instance or MongoDB Atlas connection URI

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/chadgarc/Stockyfi-Backend.git
cd Stockyfi-Backend
pnpm install or npm install
```

### 2. Configure Environment Variables (`.env`)

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=<MONGODB_URI>
JWT_SECRET=<JWT_SECRET>
JWT_EXPIRE=2h
```

> CORS origins are hardcoded in `server.js` (`allowedOrigins`): `https://chadgarc.github.io`, `http://localhost:5173`. To allow another frontend, edit that array.

### 3. Start Development Server

```bash
pnpm dev
```

The server will start at `http://localhost:3000` with hot-reload enabled via `nodemon`.

---

<div align="center">
  <sub>Built with ❤️ for Per Scholas Capstone | Stockify © 2026</sub>
</div>
