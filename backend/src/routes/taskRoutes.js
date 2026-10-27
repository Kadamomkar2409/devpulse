import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  updateTaskSchema,
  createCommentSchema,
} from '../validations/taskValidation.js';

const router = Router();

// Single task operations
router.route('/:id')
  .get(taskController.getTaskById)
  .patch(validateRequest(updateTaskSchema), taskController.updateTask)
  .delete(taskController.deleteTask);

// Task comments
router.route('/:taskId/comments')
  .get(taskController.getComments)
  .post(validateRequest(createCommentSchema), taskController.createComment);

export default router;
