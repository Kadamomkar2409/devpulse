import { Router } from 'express';
import * as workspaceController from '../controllers/workspaceController.js';
import * as taskController from '../controllers/taskController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createWorkspaceSchema,
  addMemberSchema,
} from '../validations/workspaceValidation.js';
import { createTaskSchema } from '../validations/taskValidation.js';

const router = Router();

// Workspace collection routes
router.route('/')
  .get(workspaceController.listWorkspaces)
  .post(validateRequest(createWorkspaceSchema), workspaceController.createWorkspace);

// Workspace slug routes
router.route('/:slug')
  .get(workspaceController.getWorkspaceBySlug);

router.route('/:slug/members')
  .post(validateRequest(addMemberSchema), workspaceController.addMember);

// Workspace tasks nested routes
router.route('/:workspaceId/tasks')
  .get(taskController.getTasks)
  .post(validateRequest(createTaskSchema), taskController.createTask);

export default router;
