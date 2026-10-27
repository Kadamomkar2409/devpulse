# System Architecture Specification
**Project Name:** DevPulse — Scalable Multi-Tenant Task & Workspace Management Engine  
**Module:** Module 1 — MERN Stack, System Design & Architecture  
**Target Engineers:** Shivansh Singh & Omkar Kadam (Independent Implementations)  
**Version:** 1.0.0 &bull; Technical Architecture Blueprint  
**Hard Deadline:** Wednesday, October 28, 2026 at 12:00 PM (Noon)  
**Companion Spec:** [PRD.md](file:///Users/admin/Desktop/intern-cource/docs/project-spec/PRD.md)

---

## 1. High-Level System Architecture

DevPulse is architected as a decoupled, multi-tier system separating presentation, business logic, and persistent storage.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   DEVPULSE THREE-TIER MERN ARCHITECTURE                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   CLIENT TIER (React + Vite)                                           │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ UI Components (Kanban / Cards / Modals)                        │   │
│   │                              │                                 │   │
│   │                              ▼                                 │   │
│   │ Custom Data Hooks (useWorkspace, useTasks, useCreateTask)      │   │
│   │                              │                                 │   │
│   │                              ▼                                 │   │
│   │ API Client Service Layer (Token & Error Interceptor)           │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  │ HTTP / JSON REST                    │
│                                  ▼                                     │
│   APPLICATION TIER (Node.js & Express)                                 │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Route Layer & Middlewares (Zod Validator, Rate Limiter)        │   │
│   │                              │                                 │   │
│   │                              ▼                                 │   │
│   │ Controllers (Req Extraction, Status Code, Envelope Formatting) │   │
│   │                              │                                 │   │
│   │                              ▼                                 │   │
│   │ Services (Pure Business Logic, Domain Rules, Orchestration)    │   │
│   │                              │                                 │   │
│   │                              ▼                                 │   │
│   │ Models (Mongoose Schemas, Index Definitions, Query Logic)      │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  │ Mongoose BSON Protocol              │
│                                  ▼                                     │
│   DATA TIER (MongoDB Server)                                           │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Collections: workspaces | users | tasks | comments             │   │
│   │ Compound Indexes: { workspaceId: 1, status: 1, createdAt: -1 } │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & Monorepo Structure

Both engineers must organize their repository into this canonical full-stack structure:

```text
devpulse/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Mongoose connection & pool config
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
│   │   │   └── errorHandler.js       # Centralized Express error handler
│   │   ├── routes/
│   │   │   ├── workspaceRoutes.js    # /api/v1/workspaces routes
│   │   │   └── taskRoutes.js         # /api/v1/tasks routes
│   │   ├── utils/
│   │   │   ├── AppError.js           # Custom operational error class
│   │   │   └── catchAsync.js         # Async controller wrapper utility
│   │   └── app.js                    # Express app configuration & middlewares
│   ├── seeds/
│   │   └── seedData.js               # 30+ mock tasks & test workspace seeder
│   ├── package.json
│   ├── server.js                     # HTTP server startup & graceful shutdown
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx     # Master responsive shell
│   │   │   │   ├── Sidebar.jsx       # Workspace & status navigation
│   │   │   │   └── Header.jsx        # Search, switcher, New Task button
│   │   │   ├── kanban/
│   │   │   │   ├── TaskBoard.jsx     # 4-column Kanban container
│   │   │   │   ├── TaskColumn.jsx    # Column (Backlog, Todo, InProg, Done)
│   │   │   │   └── TaskCard.jsx      # Individual task card & status toggle
│   │   │   ├── modals/
│   │   │   │   └── TaskModal.jsx     # Controlled create/edit modal
│   │   │   └── common/
│   │   │       ├── SkeletonLoader.jsx# Zero-CLS loading cards
│   │   │       └── ErrorBoundary.jsx # Client crash resilience
│   │   ├── hooks/
│   │   │   ├── useWorkspace.js       # Custom hook: Workspace state
│   │   │   ├── useTasks.js           # Custom hook: Task list & filtering
│   │   │   └── useCreateTask.js      # Custom hook: Task creation mutation
│   │   ├── services/
│   │   │   └── api.js                # Centralized Axios / Fetch instance
│   │   ├── index.css                 # Design system tokens & CSS variables
│   │   ├── App.jsx                   # Root application routing/view
│   │   └── main.jsx                  # React DOM entry point
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
└── README.md
```

---

## 3. Data Architecture & MongoDB Modeling

### Embedding vs. Referencing Rationale
1. **Workspace Members (Embedded):**
   * *Decision:* Embed `members: [{ userId, role, joinedAt }]` inside `Workspace`.
   * *Rationale:* Workspace teams are bounded in size (< 100 members). Embedding eliminates an expensive `$lookup` / join query on every workspace page load.
2. **Tasks (Referenced):**
   * *Decision:* Store `Task` documents in an independent `tasks` collection referencing `workspaceId`.
   * *Rationale:* Tasks in an active organization grow unbounded (thousands of tasks). Storing tasks inside a workspace document would quickly exceed MongoDB’s **16MB BSON document limit** and destroy write concurrency.
3. **Comments (Referenced):**
   * *Decision:* Store `Comment` documents in an independent `comments` collection referencing `taskId`.
   * *Rationale:* Comments grow unbounded. Embedding them inside tasks degrades task list query performance.

### Compound Indexing Strategy
```javascript
// backend/src/models/Task.js
TaskSchema.index(
  { workspaceId: 1, status: 1, createdAt: -1 },
  { name: 'idx_workspace_status_created' }
);
```
* **Why this order?**
  1. `workspaceId (Equality)`: Narrows the scan from millions of documents to the target tenant.
  2. `status (Equality / In-list)`: Partitions tasks into the 4 Kanban columns (`backlog`, `todo`, `in-progress`, `done`).
  3. `createdAt (Range / Sort)`: Satisfies the default sort order without requiring an in-memory memory-sort operation (index-supported sort).

---

## 4. Backend Architecture: Controller-Service-Repository Pattern

### Rule of Responsibility
* **Routes (`src/routes/`):** Map HTTP verbs to controller actions; attach validation middleware.
* **Controllers (`src/controllers/`):** Pure HTTP boundary. Extract `req.params`, `req.query`, and `req.body`. Call service methods. Send standardized JSON envelopes. **Zero Mongoose queries allowed here.**
* **Services (`src/services/`):** Pure business logic. Orchestrate multiple queries, calculate states, enforce tenant access rules, throw custom `AppError` exceptions.
* **Models (`src/models/`):** Define Mongoose schemas, data types, validators, and indexes.

### Controller Implementation Template (`catchAsync`)
```javascript
// backend/src/utils/catchAsync.js
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// backend/src/controllers/taskController.js
export const createTask = catchAsync(async (req, res) => {
  const { workspaceId } = req.params;
  const task = await taskService.createTask(workspaceId, req.body);
  
  res.status(201).json({
    success: true,
    data: task,
    error: null,
  });
});
```

---

## 5. Centralized Error Handling Pipeline

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   CENTRALIZED ERROR HANDLING PIPELINE                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [Client HTTP Request]                                                │
│             │                                                          │
│             ▼                                                          │
│   [Zod Validation Middleware]                                          │
│        └──► Invalid Request Body ──► [400 ValidationError] ──┐         │
│             │ (Valid Schema)                                 │         │
│             ▼                                                │         │
│   [Express Controller (catchAsync)]                          │         │
│             │                                                │         │
│             ▼                                                │         │
│   [Service Layer (Domain Rules)]                             │         │
│        └──► Document Missing     ──► [404 NotFoundError]   ──┤         │
│        └──► Duplicate Key / Slug ──► [409 ConflictError]   ──┤         │
│             │ (Success)                                      │         │
│             ▼                                                ▼         │
│   [200 / 201 Success Envelope]                 [Global Error Handler]  │
│   { success: true, data: { ... } }                           │         │
│                                                              ▼         │
│                                                [Standard JSON Error]   │
│                                                { success: false, ... } │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Custom `AppError` Class
```javascript
// backend/src/utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Centralized Error Handler Middleware
```javascript
// backend/src/middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred.';
  let details = err.details || [];

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_IDENTIFIER';
    message = `Invalid format for resource ID: ${err.value}`;
  }

  // MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    const field = Object.keys(err.keyValue)[0];
    message = `A resource with ${field} '${err.keyValue[field]}' already exists.`;
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request payload validation failed.';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
    },
  });
};
```

---

## 6. Frontend Architecture: State Segregation & Hooks

### Server State vs. Client UI State
* **Server State (Remote & Asynchronous):** Tasks list, workspace metadata, members. Owned by the database; managed exclusively via custom hooks (`useTasks`, `useWorkspace`) with cache invalidation on mutations.
* **Client UI State (Local & Ephemeral):** Search filter input text, active modal open/closed toggle, active column drag states. Kept inside React `useState` within local components.

### Custom Hook Pattern: `useTasks`
```javascript
// frontend/src/hooks/useTasks.js
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useTasks = (workspaceId, filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/workspaces/${workspaceId}/tasks`, {
        params: filters,
      });
      setTasks(response.data.data.tasks);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
};
```

---

## 7. Zero Cumulative Layout Shift (CLS) Strategy

* **The Problem:** When loading tasks over the network, rendering a blank screen and then snapping 20 cards into place causes massive layout shifts (poor UX).
* **The Architectural Fix:**
  - Define `SkeletonLoader.jsx` with exact CSS `height` and `min-height` matching `TaskCard.jsx`.
  - While `loading === true`, render 3 skeleton card placeholders in each column.
  - When data loads, replace skeletons with zero DOM jump.

---

## 8. Cloud Production Deployment: Vercel & MongoDB Atlas

Both engineers must deploy their project to production so the full-stack system is live and accessible via public URLs before the 12:00 PM deadline.

```text
┌────────────────────────────────────────────────────────────────────────┐
│               CLOUD PRODUCTION DEPLOYMENT ARCHITECTURE                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   VERCEL (Frontend Host)                 VERCEL (Backend Serverless)   │
│   ┌──────────────────────────┐           ┌─────────────────────────┐   │
│   │ • React (Vite) App       │   HTTPS   │ • Express App Handler   │   │
│   │ • Vercel Edge CDN        │ ────────► │ • Node.js Serverless    │   │
│   │ • Env: VITE_API_URL      │   REST    │ • CORS Origin Whitelist │   │
│   └──────────────────────────┘           └────────────┬────────────┘   │
│                                                       │                │
│                                                       │ Mongoose TLS   │
│                                                       ▼                │
│                                          MONGODB ATLAS (Cloud DB)      │
│                                          ┌─────────────────────────┐   │
│                                          │ • M0 Free Tier Cluster  │   │
│                                          │ • Network IP: 0.0.0.0/0 │   │
│                                          │ • User: devpulse_user   │   │
│                                          └─────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. MongoDB Atlas (M0 Free Tier) Setup
1. Create a free shared cluster (`M0 Sandbox`) on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access:** Create a database user with read/write privileges (e.g., `devpulse_user` + password).
3. **Network Access:** Add IP Address `0.0.0.0/0` (Allow Access from Anywhere). This is required because Vercel executes serverless functions on dynamic IP pools.
4. **Connection String:** Extract the SRV URI:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/devpulse?retryWrites=true&w=majority
   ```

### 2. Backend Deployment on Vercel (via Vercel CLI)
Express can be deployed directly to Vercel as a serverless handler.

1. **Create `backend/vercel.json`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/app.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/app.js"
       }
     ]
   }
   ```
2. **Export the Express App:** Ensure `backend/src/app.js` exports the app instance (`export default app` or `module.exports = app`).
3. **CORS Configuration:** Allow requests from your deployed frontend origin:
   ```javascript
   import cors from 'cors';

   app.use(cors({
     origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
     credentials: true,
   }));
   ```
4. **Deploy using Vercel CLI:**
   ```bash
   cd backend
   npx vercel --prod
   ```
   Configure environment variables on Vercel: `MONGODB_URI`, `CLIENT_URL`, `NODE_ENV=production`.

### 3. Frontend Deployment on Vercel
1. Set the production backend API URL in `frontend/.env.production`:
   ```env
   VITE_API_URL=https://your-backend-project.vercel.app/api/v1
   ```
2. **Deploy using Vercel CLI:**
   ```bash
   cd frontend
   npx vercel --prod
   ```

### 4. Live Verification Checklist
* [ ] `GET https://your-backend.vercel.app/api/v1/health` returns `{ "success": true, "status": "UP" }`.
* [ ] Deployed frontend opens without console errors.
* [ ] Creating a task on the live frontend sends a POST request to the live backend and saves to MongoDB Atlas.
* [ ] Refreshing the live frontend retrieves the tasks persisted in MongoDB Atlas.
