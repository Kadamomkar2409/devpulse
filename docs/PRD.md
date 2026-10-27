# Product Requirements Document (PRD)
**Project Name:** DevPulse — Scalable Multi-Tenant Task & Workspace Management Engine  
**Module:** Module 1 — MERN Stack, System Design & Architecture  
**Target Engineers:** Shivansh Singh & Omkar Kadam (Independent Implementations)  
**Version:** 1.0.0 &bull; Production Spec  
**Hard Deadline:** Wednesday, October 28, 2026 at 12:00 PM (Noon)  
**Parent Roadmap:** [MERN_MODULE_TASKS_AND_ASSIGNMENTS.md](file:///Users/admin/Desktop/intern-cource/docs/MERN_MODULE_TASKS_AND_ASSIGNMENTS.md)

---

## 1. Executive Summary & Product Vision

**DevPulse** is a high-performance, multi-tenant workspace and task orchestration engine designed for engineering and product teams. It mirrors the core capabilities of platforms like Plane, Linear, and Jira.

The system allows organizations to create isolated workspaces, manage member access, organize tasks across interactive Kanban stages, filter by priority and assignee, and track discussions through threaded task comments.

### Core Engineering Objectives
* **Strict Architecture:** Implement a decoupled, layered architecture on the backend (Controller &rarr; Service &rarr; Model) and modern state segregation on the frontend (Server State vs. Client UI State).
* **Database Scalability:** Eliminate MongoDB document bloat by applying strict embedding vs. referencing rules and leveraging compound indexing.
* **Resilient Contracts:** Every request validated with Zod; every failure processed through a centralized error-handling pipeline.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   DEVPULSE CORE USER JOURNEY & WORKFLOW                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [1. Create Workspace] ──► [2. Invite Team Members via Email & Role]  │
│             │                                                          │
│             ▼                                                          │
│   [3. Create / Import Tasks] (Title, Priority, Assignee, Tags)         │
│             │                                                          │
│             ▼                                                          │
│   [4. Manage Kanban Board] ──► Drag/Toggle Status (Backlog ─► Done)    │
│             │                                                          │
│             ▼                                                          │
│   [5. Task Details & Comments] ──► Threaded Activity & Audit Log       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Target Personas & Core User Stories

### Personas
1. **Workspace Owner / Lead (Admin):** Sets up workspaces, configures team members, and oversees sprint status.
2. **Team Member (Engineer):** Creates tasks, updates task statuses, filters by assigned work, and collaborates via comments.

### User Stories
* **US-1 (Workspace Provisioning):** *As a lead, I want to create a workspace with a unique slug so that my team has an isolated environment for tasks.*
* **US-2 (Member Management):** *As a lead, I want to view all workspace members and invite new members with specific roles (`owner`, `admin`, `member`).*
* **US-3 (Task Creation):** *As an engineer, I want to create a task with a title, description, priority, and assignee so that work items are clearly defined.*
* **US-4 (Kanban Board Management):** *As an engineer, I want to view tasks in a 4-stage Kanban board and quickly transition status (e.g. `todo` &rarr; `in-progress` &rarr; `done`).*
* **US-5 (Filtering & Search):** *As an engineer, I want to filter tasks by status and priority, and search by title, without reloading the page.*
* **US-6 (Task Discussions):** *As an engineer, I want to comment on a task so that discussion history is preserved without bloating the parent task record.*

---

## 3. Functional Requirements

### 3.1 Workspace Management (FR-1)
* **Workspace Creation:** Creates a workspace with `name`, unique auto-generated or user-supplied `slug`, and `description`.
* **Membership Embedding:** Workspace documents embed a `members` list containing `{ userId, role, joinedAt }`.
  - Permitted roles: `owner`, `admin`, `member`.
* **Workspace Resolution:** Workspaces must be retrievable by their unique `slug`.

### 3.2 Task & Issue Lifecycle (FR-2)
* **Task Fields:**
  - `title`: String (3 to 120 characters, required).
  - `description`: String (optional, up to 2000 characters).
  - `status`: Enum (`backlog`, `todo`, `in-progress`, `done`), default `todo`.
  - `priority`: Enum (`low`, `medium`, `high`, `urgent`), default `medium`.
  - `workspaceId`: ObjectId (required reference).
  - `assigneeId`: ObjectId (optional reference to User).
  - `tags`: Array of Strings (embedded, e.g. `["frontend", "bug"]`).
  - `createdAt`, `updatedAt`: Timestamps (auto-managed).

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        TASK STATUS STATE MACHINE                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌───────────┐      ┌───────────┐      ┌─────────────┐      ┌──────┐  │
│   │  BACKLOG  │ ──►  │   TODO    │ ──►  │ IN PROGRESS │ ──►  │ DONE │  │
│   └───────────┘      └───────────┘      └─────────────┘      └──────┘  │
│         ▲                  ▲                   │                 │     │
│         │                  └───────────────────┴─────────────────┘     │
│         └─────────────────────── Reopen / Move Back ───────────────────┘     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Querying, Filtering & Pagination (FR-3)
* The task listing endpoint (`GET /api/v1/workspaces/:workspaceId/tasks`) must support:
  - `status`: Filter by single status or multiple statuses.
  - `priority`: Filter by priority level.
  - `search`: Case-insensitive title regex matching.
  - `page` & `limit`: Cursor or offset pagination (default `page=1`, `limit=20`).
  - `sort`: Default sorting by `createdAt` descending (`-1`).

### 3.4 Comments & Activity (FR-4)
* Tasks support threaded comments stored in a separate `comments` collection referencing `taskId`.
* Comment payload: `{ content, authorId, taskId }`.

---

## 4. Non-Functional & Scalability Requirements

* **Performance:** Task board queries must resolve in **< 50ms** locally using compound index `{ workspaceId: 1, status: 1, createdAt: -1 }`.
* **Zero Cumulative Layout Shift (CLS):** React client must render skeleton loaders matching exact card dimensions while data fetches.
* **Error Envelope Consistency:** 100% of API error responses must adhere to the standardized JSON error structure.
* **Cloud Deployment & Live Handshake:** The application must be deployed live on **Vercel** (frontend and backend) using **MongoDB Atlas (M0 Free Tier)** as the cloud database. The deployed frontend must communicate with the deployed backend over HTTPS with zero CORS or mixed-content issues.

---

## 5. Complete REST API Contract Specification

All API endpoints must be prefixed with `/api/v1`.

### 5.1 Standard Response Envelopes

#### Success Response Envelope (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

#### Error Response Envelope (HTTP 400 / 404 / 409 / 500)
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
        "message": "String must contain at least 3 character(s)"
      }
    ]
  }
}
```

---

### 5.2 API Endpoints Matrix

| HTTP Verb | Path | Description | Success Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health check & DB status | `200 OK` |
| `POST` | `/api/v1/workspaces` | Create new workspace | `201 Created` |
| `GET` | `/api/v1/workspaces/:slug` | Get workspace details & members | `200 OK` |
| `POST` | `/api/v1/workspaces/:slug/members` | Add member to workspace | `200 OK` |
| `GET` | `/api/v1/workspaces/:workspaceId/tasks` | List tasks with filtering/pagination | `200 OK` |
| `POST` | `/api/v1/workspaces/:workspaceId/tasks` | Create task under workspace | `201 Created` |
| `GET` | `/api/v1/tasks/:id` | Get single task details | `200 OK` |
| `PATCH` | `/api/v1/tasks/:id` | Update task status, priority, or fields | `200 OK` |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task | `200 OK` |
| `GET` | `/api/v1/tasks/:taskId/comments` | List comments for a task | `200 OK` |
| `POST` | `/api/v1/tasks/:taskId/comments` | Add comment to a task | `201 Created` |

---

### 5.3 Detailed Request & Response Payloads

#### 1. Create Workspace (`POST /api/v1/workspaces`)
* **Request Body:**
  ```json
  {
    "name": "Acme Engineering",
    "slug": "acme-eng",
    "ownerEmail": "lead@acme.com",
    "ownerName": "Sarah Lead"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "671e3b5e4f1a2b3c4d5e6f7a",
      "name": "Acme Engineering",
      "slug": "acme-eng",
      "members": [
        {
          "userId": "671e3b5e4f1a2b3c4d5e6f7b",
          "email": "lead@acme.com",
          "name": "Sarah Lead",
          "role": "owner",
          "joinedAt": "2026-10-27T12:00:00.000Z"
        }
      ],
      "createdAt": "2026-10-27T12:00:00.000Z"
    },
    "error": null
  }
  ```

#### 2. List Tasks (`GET /api/v1/workspaces/:workspaceId/tasks?status=todo&priority=high&page=1&limit=20`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "_id": "671e402e4f1a2b3c4d5e6f8c",
          "workspaceId": "671e3b5e4f1a2b3c4d5e6f7a",
          "title": "Set up MongoDB compound indexing",
          "description": "Index on workspaceId, status, and createdAt",
          "status": "todo",
          "priority": "high",
          "assignee": {
            "_id": "671e3b5e4f1a2b3c4d5e6f7b",
            "name": "Sarah Lead",
            "email": "lead@acme.com"
          },
          "tags": ["backend", "database"],
          "createdAt": "2026-10-27T12:10:00.000Z",
          "updatedAt": "2026-10-27T12:10:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1,
        "totalPages": 1
      }
    },
    "error": null
  }
  ```

#### 3. Create Task (`POST /api/v1/workspaces/:workspaceId/tasks`)
* **Request Body:**
  ```json
  {
    "title": "Implement Zod request validation",
    "description": "Validate req.body before passing to controller",
    "status": "todo",
    "priority": "urgent",
    "assigneeId": "671e3b5e4f1a2b3c4d5e6f7b",
    "tags": ["backend", "security"]
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "671e411e4f1a2b3c4d5e6f9d",
      "workspaceId": "671e3b5e4f1a2b3c4d5e6f7a",
      "title": "Implement Zod request validation",
      "description": "Validate req.body before passing to controller",
      "status": "todo",
      "priority": "urgent",
      "assigneeId": "671e3b5e4f1a2b3c4d5e6f7b",
      "tags": ["backend", "security"],
      "createdAt": "2026-10-27T12:15:00.000Z"
    },
    "error": null
  }
  ```

#### 4. Update Task Status (`PATCH /api/v1/tasks/:id`)
* **Request Body:**
  ```json
  {
    "status": "in-progress"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "671e411e4f1a2b3c4d5e6f9d",
      "status": "in-progress",
      "updatedAt": "2026-10-27T12:20:00.000Z"
    },
    "error": null
  }
  ```

---

## 6. Acceptance Criteria

| ID | Criteria | Validation Method |
| :--- | :--- | :--- |
| **AC-1** | Attempting to create a task with `< 3` character title returns HTTP `400` with descriptive error envelope. | Test with Postman / cURL. |
| **AC-2** | Fetching tasks for a workspace returns tasks sorted with pagination metadata. | Validate against seeded database. |
| **AC-3** | Toggling a task status from the Kanban board updates the database and reflects immediately in the UI. | Verified in React browser view. |
| **AC-4** | Loading the UI does not produce layout shifts (skeleton loaders render before data). | Chrome DevTools inspection. |
| **AC-5** | Uncaught exceptions inside service or controller do not crash the Express process. | Centralized error handler verification. |
| **AC-6** | Application is deployed live on Vercel with MongoDB Atlas (M0 Free Tier) cloud database. | Public URL verification. |
| **AC-7** | Live frontend creates and updates tasks on live backend with zero CORS errors. | Live browser end-to-end verification. |
