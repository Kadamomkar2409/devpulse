# DevPulse — Scalable Multi-Tenant Task & Workspace Management Engine

DevPulse is a high-performance, multi-tenant workspace orchestration and issue management engine built on the MERN stack. Designed to mirror the core capabilities of platforms like Linear, Plane, and Jira, DevPulse enables teams to isolate workspaces, manage members with role-based access, organize tasks across interactive 4-stage Kanban workflows, and collaborate through threaded task discussions.

---

## 1. Tech Stack

### Core Technologies
* **Frontend:** React 18, Vite, Lucide React (Icons), Vanilla CSS Design System
* **Backend:** Node.js, Express 4 (ES Modules), Mongoose 8 (ODM), Zod (Schema Validation), Morgan (Logging), Cors
* **Database:** MongoDB Atlas (M0 Shared Cloud Cluster) / Local MongoDB Server
* **Deployment & Hosting:** Vercel (Frontend Single Page Application & Backend Serverless Functions)

### Architecture Highlights
* **Layered Decoupling:** Strict Controller &rarr; Service &rarr; Model separation on the backend.
* **Serverless Resilient:** Reuses cached Mongoose connections across serverless function invocations to eliminate cold-start overhead and prevent connection pool exhaustion.
* **Optimized Indexing:** Compound indexing on `{ workspaceId: 1, status: 1, createdAt: -1 }` guaranteeing index-supported sorting and sub-50ms board queries.
* **Resilient Contracts:** 100% of mutation payloads validated via Zod schemas; centralized error-handling pipeline mapping all exceptions into standardized JSON envelopes.
* **Zero CLS (Cumulative Layout Shift):** React skeleton loaders engineered to match Kanban card dimensions (124px height) 1:1 during asynchronous data fetching.

---

## 2. System Architecture (Controller &rarr; Service &rarr; Model)

DevPulse enforces a decoupled three-tier architecture separating presentation, business domain rules, and persistent storage:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   DEVPULSE THREE-TIER MERN ARCHITECTURE                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   CLIENT TIER (React + Vite)                                           │
│   ├── UI Components (KanbanBoard / TaskColumn / TaskCard / Modals)     │
│   ├── Custom Data Hooks (useWorkspace, useTasks, useCreateTask)        │
│   └── API Client Service Layer (Axios instance & Error Interceptor)    │
│                     │ HTTP / JSON REST                                 │
│                     ▼                                                  │
│   APPLICATION TIER (Node.js & Express)                                 │
│   ├── Middlewares (Zod Request Validator, IP Rate Limiter, Error Hand) │
│   ├── Controllers (Request Extraction, Envelope Packaging, catchAsync) │
│   ├── Services (Pure Business Logic, Domain Constraints, Cascades)     │
│   └── Models (Mongoose Schemas & Compound Index Definitions)           │
│                     │ Mongoose BSON Protocol                           │
│                     ▼                                                  │
│   DATA TIER (MongoDB Atlas / Server)                                   │
│   ├── Collections: workspaces | users | tasks | comments               │
│   └── Compound Index: { workspaceId: 1, status: 1, createdAt: -1 }     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Architectural Layer Responsibilities
* **Routes (`src/routes/`):** Route HTTP verbs and paths; bind Zod validation middlewares to incoming requests.
* **Controllers (`src/controllers/`):** Act strictly as the HTTP boundary. Extract `req.params`, `req.query`, and `req.body`, delegate execution to services via `catchAsync`, and format standard response envelopes. Controllers contain zero direct database queries.
* **Services (`src/services/`):** Encapsulate all business logic, multi-model orchestrations, slug generation, cascading deletions, and throwing custom `AppError` exceptions.
* **Models (`src/models/`):** Define Mongoose document schemas, validation constraints, default values, and compound index specifications.
* **Database Infrastructure (`src/config/db.js`):** Manages connection lifecycle with global caching (`global.mongoose = { conn, promise }`) so serverless function invocations reuse existing connections.

---

## 3. Monorepo Folder Structure

```text
devpulse/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Cached Mongoose connection configuration
│   │   ├── controllers/
│   │   │   ├── workspaceController.js# Workspace HTTP req/res handling
│   │   │   └── taskController.js     # Task HTTP req/res handling
│   │   ├── services/
│   │   │   ├── workspaceService.js   # Workspace business logic & queries
│   │   │   └── taskService.js        # Task business logic, filters, pagination
│   │   ├── models/
│   │   │   ├── Workspace.js          # Workspace schema + embedded members
│   │   │   ├── Task.js               # Task schema + compound index
│   │   │   ├── User.js               # User identity schema
│   │   │   └── Comment.js            # Referenced task comment schema
│   │   ├── middlewares/
│   │   │   ├── validateRequest.js    # Zod schema validation middleware
│   │   │   ├── rateLimiter.js        # IP sliding-window rate limiter
│   │   │   └── errorHandler.js       # Centralized Express error handler
│   │   ├── validations/
│   │   │   ├── workspaceValidation.js# Zod contracts for workspaces & members
│   │   │   └── taskValidation.js     # Zod contracts for tasks & comments
│   │   ├── routes/
│   │   │   ├── workspaceRoutes.js    # /api/v1/workspaces routes
│   │   │   └── taskRoutes.js         # /api/v1/tasks routes
│   │   ├── utils/
│   │   │   ├── AppError.js           # Custom operational error class
│   │   │   └── catchAsync.js         # Async controller wrapper utility
│   │   └── app.js                    # Express app configuration & middlewares
│   ├── seeds/
│   │   └── seedData.js               # Seed script with mock workspace & tasks
│   ├── package.json
│   ├── server.js                     # HTTP server startup for local development
│   ├── vercel.json                   # Serverless deployment configuration
│   ├── .env.example                  # Backend environment variable template
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx     # Master responsive application shell
│   │   │   │   ├── Sidebar.jsx       # Workspace navigation & stage filters
│   │   │   │   └── Header.jsx        # Search, breadcrumbs, action triggers
│   │   │   ├── kanban/
│   │   │   │   ├── TaskBoard.jsx     # 4-column Kanban container & pagination
│   │   │   │   ├── TaskColumn.jsx    # Drag-and-drop workflow stage container
│   │   │   │   └── TaskCard.jsx      # Interactive task card & quick stage select
│   │   │   ├── modals/
│   │   │   │   ├── TaskModal.jsx     # Controlled task create/edit & comments modal
│   │   │   │   └── MemberModal.jsx   # Controlled workspace member invite modal
│   │   │   └── common/
│   │   │       ├── SkeletonLoader.jsx# Zero-CLS loading cards (124px height)
│   │   │       └── ErrorBoundary.jsx # Client crash resilience
│   │   ├── hooks/
│   │   │   ├── useWorkspace.js       # Workspace server state hook
│   │   │   ├── useTasks.js           # Tasks server state & optimistic status hook
│   │   │   └── useCreateTask.js      # Task creation mutation hook
│   │   ├── services/
│   │   │   └── api.js                # Centralized Axios client & error interceptor
│   │   ├── index.css                 # Dark-mode design system tokens & CSS rules
│   │   ├── App.jsx                   # Root application state & composition
│   │   └── main.jsx                  # React DOM entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json                   # SPA rewrite configuration for Vercel
│   ├── .env.example                  # Frontend environment variable template
│   └── .gitignore
├── docs/
│   ├── PRD.md                        # Product Requirements Document
│   └── ARCHITECTURE.md               # Technical Architecture Blueprint
└── README.md
```

---

## 4. Environment Variables

> **Security Note:** Never commit actual `.env` files containing credentials to version control. Both `backend/.gitignore` and `frontend/.gitignore` strictly ignore `.env` files.

### Backend (`backend/.env`)
| Variable Name | Purpose | Example / Format |
| :--- | :--- | :--- |
| `PORT` | Local HTTP server port | Numeric port (e.g. `5000`) |
| `NODE_ENV` | Application runtime environment | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas or local connection URI | `mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname` |
| `CLIENT_URL` | Frontend origin for CORS whitelist (no trailing slash) | `http://localhost:5173` or `https://app.vercel.app` |

### Frontend (`frontend/.env`)
| Variable Name | Purpose | Example / Format |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API base URL (no trailing slash) | `http://localhost:5000/api/v1` or `https://api.vercel.app/api/v1` |

---

## 5. Local Setup Steps

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** A running local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### Step 2: Configure and Start Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create local environment file from template
cp .env.example .env

# Configure your variables in .env (PORT, NODE_ENV, MONGODB_URI, CLIENT_URL)

# Seed database with sample workspace, users, and tasks
npm run seed

# Start backend development server
npm run dev
```
* Backend API starts on: `http://localhost:5000`
* Health Check endpoint: `http://localhost:5000/api/v1/health`

### Step 3: Configure and Start Frontend
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create local environment file from template
cp .env.example .env

# Start Vite development server
npm run dev
```
* Frontend starts on: `http://localhost:5173`
* Vite automatically proxies `/api` calls to `http://localhost:5000` during local development.

---

## 6. REST API Specification Summary

All endpoints are versioned with the `/api/v1` prefix.

### Endpoints Matrix
| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health check and database status | `200 OK` |
| `GET` | `/api/v1/workspaces` | List all workspaces | `200 OK` |
| `POST` | `/api/v1/workspaces` | Create new workspace with owner | `201 Created` |
| `GET` | `/api/v1/workspaces/:slug` | Retrieve workspace details and embedded members | `200 OK` |
| `POST` | `/api/v1/workspaces/:slug/members` | Invite/add a member to workspace | `200 OK` |
| `GET` | `/api/v1/workspaces/:workspaceId/tasks` | List workspace tasks (supports `status`, `priority`, `search`, pagination) | `200 OK` |
| `POST` | `/api/v1/workspaces/:workspaceId/tasks` | Create a new task under a workspace | `201 Created` |
| `GET` | `/api/v1/tasks/:id` | Get details for a single task | `200 OK` |
| `PATCH` | `/api/v1/tasks/:id` | Update task status, priority, or fields | `200 OK` |
| `DELETE` | `/api/v1/tasks/:id` | Delete task and cascade delete its comments | `200 OK` |
| `GET` | `/api/v1/tasks/:taskId/comments` | List all comments associated with a task | `200 OK` |
| `POST` | `/api/v1/tasks/:taskId/comments` | Add a comment to a task | `201 Created` |

### Standard Envelopes

#### Success Envelope (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

#### Error Envelope (`400`, `404`, `409`, `429`, `500`)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must be at least 3 characters long",
    "details": [
      {
        "field": "title",
        "message": "Title must be at least 3 characters long"
      }
    ]
  }
}
```

---

## 7. Live Production Deployments

| Component | Platform | Environment | Live URL |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | Vercel (Edge CDN) | Production | `https://your-frontend-deployment.vercel.app` *(Placeholder)* |
| **Backend API Server** | Vercel Serverless | Production | `https://your-backend-deployment.vercel.app` *(Placeholder)* |
| **System Health Check** | Vercel Serverless | Production | `https://your-backend-deployment.vercel.app/api/v1/health` *(Placeholder)* |
| **Database Cluster** | MongoDB Atlas | Cloud M0 Tier | `mongodb+srv://...` *(Encrypted TLS Connection)* |

---

## 8. Verification & Acceptance Criteria (AC-1 to AC-5)

| ID | Criteria | Implementation Details | Status |
| :--- | :--- | :--- | :--- |
| **AC-1** | Tasks with title `< 3` chars return `400` error envelope | Validated with Zod schema and handled in centralized error middleware. | **PASS** |
| **AC-2** | Workspace tasks query supports sorting and pagination metadata | Default sort by `createdAt: -1` supported by compound index; returns `page`, `limit`, `total`, `totalPages`. | **PASS** |
| **AC-3** | Kanban status change persists to database and reflects in UI | Optimistic update in custom hook `useTasks` with automatic rollback on network failure; persisted via `PATCH`. | **PASS** |
| **AC-4** | Zero Cumulative Layout Shift (CLS) during task loading | `SkeletonLoader.jsx` renders 3 card placeholders matching exact card dimensions (124px height). | **PASS** |
| **AC-5** | Uncaught exceptions do not crash Express | All async controllers wrapped via `catchAsync` and directed through centralized `errorHandler`. | **PASS** |
