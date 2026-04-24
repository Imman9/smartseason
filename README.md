# SmartSeason Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season. Built as part of the Shamba Records Software Engineer Intern technical assessment.

---

## Live Demo

> **URL:** `https://smartseason-pme5.vercel.app/`
> 
> **Demo credentials:**
> ADMIN :admin@smartseason.dev /admin123
> AGENT :agent@smartseason.dev / agent123


---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Node.js · Express 5 · TypeScript        |
| Frontend | React 19 · TypeScript · Tailwind CSS v4 |
| Database | PostgreSQL · Sequelize ORM              |
| Auth     | JWT (jsonwebtoken) · bcryptjs           |
| Build    | Vite 8 · ts-node-dev                    |

---

## Project Structure

```
smartseason/
├── smartseason-backend/
│   ├── src/
│   │   ├── config/          # Database connection & test
│   │   ├── controllers/     # Auth, fields, field updates, dashboard
│   │   ├── middleware/       # JWT auth, role-based access
│   │   ├── migrations/      # FK repair utility
│   │   ├── models/          # User, Field, FieldUpdate + associations
│   │   ├── routes/          # Auth, fields, field updates, dashboard
│   │   ├── utils/           # JWT helpers, status computation
│   │   └── server.ts        # App entry point
│   ├── .env
│   └── package.json
│
└── smartseason-frontend/
    ├── src/
    │   ├── api/             # Axios client + typed endpoint functions
    │   ├── components/      # Navbar, Modal, StatusBadge
    │   ├── context/         # AuthContext (JWT + user state)
    │   ├── pages/           # LoginPage, RegisterPage, AdminDashboard,
    │   │                    # AdminFields, AdminAgents, AgentDashboard
    │   └── utils/           # Client-side status mirror
    └── package.json
```

---

## Setup & Running Locally

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 13 running locally
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smartseason.git
cd smartseason
```

### 2. Backend setup

```bash
cd smartseason-backend
npm install
```

Create a `.env` file (or update the existing one):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartseason
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=smartseason_secret_key_2024
```

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE smartseason;"
```

Start the backend (auto-syncs tables on first run):

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### 3. Frontend setup

```bash
cd ../smartseason-frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and proxies `/api` requests to the backend automatically via the Vite config.

### 4. Seed demo accounts

Register the first user via the UI or API — the first registered user is automatically assigned the `ADMIN` role. All subsequent registrations become `AGENT`.

```bash
# Register admin (first user)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@smartseason.dev","password":"admin123"}'

# Register an agent
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Field Agent","email":"agent1@smartseason.dev","password":"agent123"}'
```

---

## API Reference

### Auth

| Method | Endpoint              | Access | Description         |
|--------|-----------------------|--------|---------------------|
| POST   | `/api/auth/register`  | Public | Register a new user |
| POST   | `/api/auth/login`     | Public | Login, returns JWT  |

### Fields

| Method | Endpoint                   | Access | Description                     |
|--------|----------------------------|--------|---------------------------------|
| GET    | `/api/fields`              | Both   | List fields (scoped by role)    |
| POST   | `/api/fields`              | Admin  | Create a field                  |
| GET    | `/api/fields/:id`          | Both   | Get a single field              |
| PATCH  | `/api/fields/:id/assign`   | Admin  | Assign or unassign an agent     |
| GET    | `/api/fields/agents`       | Admin  | List all registered agents      |

### Field Updates

| Method | Endpoint                     | Access | Description                        |
|--------|------------------------------|--------|------------------------------------|
| POST   | `/api/fields/:id/update`     | Agent  | Submit a stage update with notes   |
| GET    | `/api/fields/:id/updates`    | Both   | Get update history for a field     |
| GET    | `/api/fields/updates/all`    | Admin  | Get latest 20 updates across all fields |

### Dashboard

| Method | Endpoint          | Access | Description                               |
|--------|-------------------|--------|-------------------------------------------|
| GET    | `/api/dashboard`  | Both   | Stats + fields + recent updates (role-scoped) |

---

## Design Decisions

### Status is computed, not stored

`status` (`ACTIVE`, `AT_RISK`, `COMPLETED`) is deliberately absent from the database schema. Storing derived state introduces sync bugs — if a `plantingDate` is corrected, a stored status would become stale. By computing it at read time in `src/utils/status.ts`, the database remains the single source of truth.

The same logic is mirrored in `smartseason-frontend/src/utils/status.ts` so the frontend can compute status client-side without an extra round-trip on pages that don't use the dashboard endpoint.

```
Status logic:
  HARVESTED stage          → COMPLETED
  > 90 days since planting
    AND stage is not READY → AT_RISK
  Everything else          → ACTIVE
```

The 90-day threshold and stage conditions are intentionally isolated in a single function. For a real multi-crop platform serving Kenyan agribusinesses — where maize, tea, and vegetables have very different growth cycles — this function would be the natural extension point for per-crop-type rules without touching the API layer.

### Role assignment at registration

The first registered user becomes `ADMIN`; all subsequent users become `AGENT`. This avoids a chicken-and-egg problem (who creates the first admin?) while keeping the auth flow simple. In a production system this would be replaced with an invite-based onboarding flow.

### FK migration utility

Sequelize's `sync({ alter: true })` created `fields.assignedAgentId` referencing the `fields` table instead of `users` on the first sync run. Rather than dropping and recreating the database (destructive in any shared environment), `src/migrations/fixFieldsFk.ts` repairs the constraint at server startup — dropping the bad FK and recreating it pointing to `users.id`. The function is idempotent: it silently skips if the constraint is already correct.

### Frontend API proxy via Vite

The frontend never hardcodes `http://localhost:3000`. All requests go to `/api/*` and Vite proxies them to the backend during development. This means the same frontend build works against any backend URL by changing a single environment variable at deploy time.

### Field scoping by role

Both the fields endpoint and dashboard endpoint scope results by role at the database query level — not in application logic after fetching everything. Agents only ever receive their own assigned fields from the API, so there is no risk of accidentally rendering data that leaks through a frontend conditional.

---

## Assumptions Made

- **Single-season scope.** Fields are not versioned across seasons. A "harvest" is terminal for the current record.
- **One agent per field.** The data model supports a single `assignedAgentId`. Multi-agent assignment would require a junction table.
- **No email verification.** Registration is open; in production, agent accounts would be invite-only or admin-provisioned.
- **Status thresholds are crop-agnostic.** The 90-day AT_RISK rule is a placeholder. Real thresholds would vary by `cropType`.
- **Soft delete not implemented.** Deleting a field would orphan its update history. A `deletedAt` column (Sequelize `paranoid: true`) would be the right approach but was out of scope for this assessment.

---

## What I Would Add With More Time

- **Crop-specific status thresholds** — a lookup table mapping `cropType` to expected growth durations, so maize and tea are assessed against different timelines
- **Offline-aware agent updates** — a service worker queue for agents submitting field updates in low-connectivity areas (relevant for field agents working in rural Kenya)
- **Soft delete with audit trail** — `paranoid: true` on the Field model so historical update records are preserved when a field is archived
- **Pagination** on the fields table and update history endpoints
- **Image uploads** on field updates, so agents can attach photos of crop conditions

---

## Health Check

```bash
curl http://localhost:3000/health
# → { "status": "OK", "message": "SmartSeason API running" }
```
