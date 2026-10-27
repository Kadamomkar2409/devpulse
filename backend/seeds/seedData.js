import dotenv from 'dotenv';
dotenv.config();

import dns from 'node:dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Gracefully fallback
}

import mongoose from 'mongoose';
import { Workspace } from '../src/models/Workspace.js';
import { User } from '../src/models/User.js';
import { Task } from '../src/models/Task.js';
import { Comment } from '../src/models/Comment.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devpulse';

const seed = async () => {
  console.log('[Seed] Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('[Seed] Connected.');

  console.log('[Seed] Resetting existing seed collections...');
  await Task.deleteMany({});
  await Comment.deleteMany({});
  await Workspace.deleteMany({ slug: 'acme-eng' });
  await User.deleteMany({
    email: { $in: ['lead@acme.com', 'alex@acme.com', 'omkar@acme.com', 'elena@acme.com'] },
  });

  console.log('[Seed] Creating core users...');
  const sarah = await User.create({
    name: 'Sarah Lead',
    email: 'lead@acme.com',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  });

  const alex = await User.create({
    name: 'Alex Rivera',
    email: 'alex@acme.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });

  const omkar = await User.create({
    name: 'Omkar Kadam',
    email: 'omkar@acme.com',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  });

  const elena = await User.create({
    name: 'Elena Rostova',
    email: 'elena@acme.com',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  const users = [sarah, alex, omkar, elena];

  console.log('[Seed] Creating default workspace: Acme Engineering...');
  const workspace = await Workspace.create({
    name: 'Acme Engineering',
    slug: 'acme-eng',
    description: 'High-throughput platform & core services engineering team.',
    members: [
      { userId: sarah._id, email: sarah.email, name: sarah.name, role: 'owner', joinedAt: new Date() },
      { userId: alex._id, email: alex.email, name: alex.name, role: 'admin', joinedAt: new Date() },
      { userId: omkar._id, email: omkar.email, name: omkar.name, role: 'member', joinedAt: new Date() },
      { userId: elena._id, email: elena.email, name: elena.name, role: 'member', joinedAt: new Date() },
    ],
  });

  console.log('[Seed] Generating 32 comprehensive tasks across all Kanban stages...');

  const rawTasks = [
    // BACKLOG
    {
      title: 'Audit third-party npm package licensing & CVEs',
      description: 'Run automated snyk / audit sweeps to identify and replace GPL / unmaintained libraries before SOC2 compliance review.',
      status: 'backlog',
      priority: 'low',
      assigneeId: elena._id,
      tags: ['security', 'compliance'],
    },
    {
      title: 'Investigate OpenTelemetry tracing for Express middleware',
      description: 'Benchmark span propagation latency and evaluate distributed tracing with Jaeger / Honeycomb.',
      status: 'backlog',
      priority: 'medium',
      assigneeId: alex._id,
      tags: ['observability', 'infra'],
    },
    {
      title: 'Design user profile settings and dark-mode preferences drawer',
      description: 'Create Figma wireframes and token definitions for user theme persistence across browser sessions.',
      status: 'backlog',
      priority: 'low',
      assigneeId: omkar._id,
      tags: ['design', 'frontend'],
    },
    {
      title: 'Evaluate GraphQL vs tRPC for internal developer dashboard',
      description: 'Prepare an architectural trade-off spike detailing bundle footprint and caching ergonomics.',
      status: 'backlog',
      priority: 'low',
      assigneeId: sarah._id,
      tags: ['architecture', 'research'],
    },
    {
      title: 'Implement Redis caching layer for workspace lookup',
      description: 'Cache workspace slug resolutions with a 300-second TTL and automatic write-through invalidation.',
      status: 'backlog',
      priority: 'medium',
      assigneeId: alex._id,
      tags: ['backend', 'performance', 'redis'],
    },
    {
      title: 'Add webhook notification system for Jira bi-directional sync',
      description: 'Support configurable HMAC-signed event dispatch on task lifecycle state changes.',
      status: 'backlog',
      priority: 'medium',
      assigneeId: omkar._id,
      tags: ['integrations', 'backend'],
    },
    {
      title: 'Write automated performance benchmark for 100k task collections',
      description: 'Measure p99 query duration under high concurrent load with k6 testing harness.',
      status: 'backlog',
      priority: 'high',
      assigneeId: elena._id,
      tags: ['testing', 'benchmarks'],
    },
    {
      title: 'Support CSV / Jira task export and bulk import pipeline',
      description: 'Allow engineers to migrate existing team backlogs via streaming file upload.',
      status: 'backlog',
      priority: 'low',
      assigneeId: sarah._id,
      tags: ['feature', 'dx'],
    },

    // TODO
    {
      title: 'Implement Zod schema validation across all request endpoints',
      description: 'Enforce strict typing and boundary sanitation on req.body, req.query, and req.params before controllers execute.',
      status: 'todo',
      priority: 'urgent',
      assigneeId: omkar._id,
      tags: ['backend', 'security', 'zod'],
    },
    {
      title: 'Set up MongoDB compound indexing on tasks collection',
      description: 'Establish index { workspaceId: 1, status: 1, createdAt: -1 } to guarantee sub-50ms Kanban query resolution.',
      status: 'todo',
      priority: 'high',
      assigneeId: alex._id,
      tags: ['database', 'indexing', 'performance'],
    },
    {
      title: 'Create zero-CLS skeleton cards matching TaskCard dimensions',
      description: 'Prevent cumulative layout shift during network fetching by replicating card geometry pixel-for-pixel.',
      status: 'todo',
      priority: 'high',
      assigneeId: omkar._id,
      tags: ['frontend', 'performance', 'ux'],
    },
    {
      title: 'Build member invitation modal with role selection',
      description: 'Enable workspace leads to invite teammates by email and assign owner, admin, or member privileges.',
      status: 'todo',
      priority: 'medium',
      assigneeId: sarah._id,
      tags: ['frontend', 'workspace'],
    },
    {
      title: 'Configure rate limiting middleware on task mutation endpoints',
      description: 'Throttle rapid POST / PATCH requests to prevent accidental double submissions and denial of service.',
      status: 'todo',
      priority: 'medium',
      assigneeId: alex._id,
      tags: ['security', 'backend'],
    },
    {
      title: 'Implement real-time search input with 250ms debouncing',
      description: 'Filter Kanban view in real-time without thrashing the backend on rapid keypresses.',
      status: 'todo',
      priority: 'medium',
      assigneeId: elena._id,
      tags: ['frontend', 'search'],
    },
    {
      title: 'Add status indicator pills with accessible ARIA labels',
      description: 'Ensure color-coded priority and status indicators meet WCAG AA contrast standards.',
      status: 'todo',
      priority: 'low',
      assigneeId: omkar._id,
      tags: ['accessibility', 'frontend'],
    },
    {
      title: 'Prepare Vercel serverless deployment config for backend handler',
      description: 'Configure vercel.json rewrite rules and test environment variable isolation.',
      status: 'todo',
      priority: 'high',
      assigneeId: sarah._id,
      tags: ['devops', 'deployment'],
    },

    // IN PROGRESS
    {
      title: 'Interactive 4-column drag & drop Kanban board implementation',
      description: 'Develop smooth drag mechanics allowing tickets to effortlessly glide between backlog, todo, in-progress, and done.',
      status: 'in-progress',
      priority: 'urgent',
      assigneeId: omkar._id,
      tags: ['frontend', 'kanban', 'core'],
    },
    {
      title: 'Centralized Express error handling pipeline & custom AppError',
      description: 'Standardize 100% of API error payloads into structured envelopes with machine-readable error codes.',
      status: 'in-progress',
      priority: 'urgent',
      assigneeId: alex._id,
      tags: ['backend', 'architecture'],
    },
    {
      title: 'Threaded task comment sidebar with markdown preview',
      description: 'Allow team members to discuss implementation specifics and reference code snippets inside tasks.',
      status: 'in-progress',
      priority: 'high',
      assigneeId: elena._id,
      tags: ['frontend', 'collaboration'],
    },
    {
      title: 'Decoupled state management with custom useTasks hook',
      description: 'Segregate server cache from client UI state with automatic mutation refetching.',
      status: 'in-progress',
      priority: 'high',
      assigneeId: omkar._id,
      tags: ['frontend', 'architecture', 'hooks'],
    },
    {
      title: 'Design system tokens and responsive application layout shell',
      description: 'Build sleek modern dark theme with CSS variables, collapsible sidebar, and glassmorphic header.',
      status: 'in-progress',
      priority: 'medium',
      assigneeId: sarah._id,
      tags: ['ui', 'design-system'],
    },
    {
      title: 'Task priority filter pills with count badges',
      description: 'Allow engineers to instantly isolate urgent blockers and high-impact tasks on the board.',
      status: 'in-progress',
      priority: 'medium',
      assigneeId: alex._id,
      tags: ['frontend', 'ux'],
    },
    {
      title: 'Database connection pooling and graceful shutdown handling',
      description: 'Handle SIGTERM and SIGINT events cleanly without dropping in-flight HTTP connections.',
      status: 'in-progress',
      priority: 'high',
      assigneeId: elena._id,
      tags: ['backend', 'database'],
    },
    {
      title: 'Error boundary wrapper with localized component recovery',
      description: 'Prevent entire React component tree crashes when rendering unexpected remote payloads.',
      status: 'in-progress',
      priority: 'medium',
      assigneeId: omkar._id,
      tags: ['frontend', 'resilience'],
    },

    // DONE
    {
      title: 'Initialize multi-tier monorepo architecture and workspace schema',
      description: 'Formulate Decoupled Controller-Service-Model layers adhering to clean code guidelines.',
      status: 'done',
      priority: 'urgent',
      assigneeId: sarah._id,
      tags: ['architecture', 'setup'],
    },
    {
      title: 'Define REST API contract and standard JSON response envelopes',
      description: 'Document endpoints, request bodies, error response codes, and status code matrices.',
      status: 'done',
      priority: 'high',
      assigneeId: alex._id,
      tags: ['api-spec', 'documentation'],
    },
    {
      title: 'Set up MongoDB Atlas M0 cluster and network whitelist',
      description: 'Provisioned cloud database cluster with 0.0.0.0/0 IP access for serverless deployment.',
      status: 'done',
      priority: 'high',
      assigneeId: omkar._id,
      tags: ['database', 'devops', 'atlas'],
    },
    {
      title: 'Implement embedded workspace membership schema',
      description: 'Store bounded workspace team members in subdocuments to eliminate slow lookup joins.',
      status: 'done',
      priority: 'medium',
      assigneeId: elena._id,
      tags: ['database', 'schema'],
    },
    {
      title: 'Configure Vite development server with hot module replacement',
      description: 'Instantiate rapid frontend tooling with fast refresh and JSX support.',
      status: 'done',
      priority: 'medium',
      assigneeId: omkar._id,
      tags: ['frontend', 'tooling'],
    },
    {
      title: 'Build automated health check endpoint with database handshake',
      description: 'GET /api/v1/health exposes system uptime and real-time MongoDB connectivity status.',
      status: 'done',
      priority: 'high',
      assigneeId: alex._id,
      tags: ['backend', 'monitoring'],
    },
    {
      title: 'Enforce task title bounds (3 to 120 chars) in model validator',
      description: 'Ensure boundary testing validates and rejects short or empty task submissions.',
      status: 'done',
      priority: 'medium',
      assigneeId: sarah._id,
      tags: ['validation', 'backend'],
    },
    {
      title: 'Create comprehensive mock task seeder with 30+ engineering tasks',
      description: 'Seed script populates realistic engineering tickets and team discussions for testing.',
      status: 'done',
      priority: 'medium',
      assigneeId: omkar._id,
      tags: ['seeder', 'testing'],
    },
  ];

  const createdTasks = [];
  for (const t of rawTasks) {
    const task = await Task.create({
      workspaceId: workspace._id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      tags: t.tags,
    });
    createdTasks.push(task);
  }

  console.log(`[Seed] Seeded ${createdTasks.length} tasks successfully.`);

  console.log('[Seed] Seeding sample discussions & comments on top tasks...');
  const urgentTask = createdTasks.find((t) => t.priority === 'urgent');
  if (urgentTask) {
    await Comment.create({
      taskId: urgentTask._id,
      authorId: sarah._id,
      content: 'Make sure this adheres strictly to the Zod schema specs in section 5 of the PRD.',
    });
    await Comment.create({
      taskId: urgentTask._id,
      authorId: omkar._id,
      content: 'Understood Sarah! Unit tests are in place, validating boundary conditions now.',
    });
  }

  const kanbanTask = createdTasks.find((t) => t.title.includes('Kanban'));
  if (kanbanTask) {
    await Comment.create({
      taskId: kanbanTask._id,
      authorId: alex._id,
      content: 'Checked the drag mechanics, status update triggers a smooth optimistic UI update.',
    });
  }

  console.log('[Seed] Database seeding completed successfully!');
  console.log(`[Seed] Workspace Slug: ${workspace.slug}`);
  console.log(`[Seed] Workspace ID: ${workspace._id}`);
  console.log(`[Seed] Total Tasks Seeded: ${createdTasks.length}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
