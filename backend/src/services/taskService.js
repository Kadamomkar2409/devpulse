import { Task } from '../models/Task.js';
import { Workspace } from '../models/Workspace.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const createTask = async (workspaceId, data) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new AppError(`Workspace with ID '${workspaceId}' not found.`, 404, 'NOT_FOUND');
  }

  const task = await Task.create({
    workspaceId,
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    assigneeId: data.assigneeId || null,
    tags: data.tags || [],
  });

  const populatedTask = await Task.findById(task._id).populate('assigneeId', 'name email avatar');
  return formatTaskResponse(populatedTask);
};

export const getTasks = async (workspaceId, query = {}) => {
  const filter = { workspaceId };

  // Status filtering (supports single or comma-separated list)
  if (query.status) {
    if (query.status.includes(',')) {
      filter.status = { $in: query.status.split(',') };
    } else {
      filter.status = query.status;
    }
  }

  // Priority filtering (supports single or comma-separated list)
  if (query.priority) {
    if (query.priority.includes(',')) {
      filter.priority = { $in: query.priority.split(',') };
    } else {
      filter.priority = query.priority;
    }
  }

  // Search by title (case-insensitive regex)
  if (query.search && query.search.trim() !== '') {
    filter.title = { $regex: query.search.trim(), $options: 'i' };
  }

  // Pagination
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Leverage compound index { workspaceId: 1, status: 1, createdAt: -1 }
  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assigneeId', 'name email avatar')
      .lean(),
    Task.countDocuments(filter),
  ]);

  const formattedTasks = tasks.map((t) => formatTaskResponse(t));

  return {
    tasks: formattedTasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getTaskById = async (id) => {
  const task = await Task.findById(id).populate('assigneeId', 'name email avatar');
  if (!task) {
    throw new AppError(`Task with ID '${id}' not found.`, 404, 'NOT_FOUND');
  }
  return formatTaskResponse(task);
};

export const updateTask = async (id, updateData) => {
  const task = await Task.findById(id);
  if (!task) {
    throw new AppError(`Task with ID '${id}' not found.`, 404, 'NOT_FOUND');
  }

  const allowedUpdates = ['title', 'description', 'status', 'priority', 'assigneeId', 'tags'];
  allowedUpdates.forEach((field) => {
    if (updateData[field] !== undefined) {
      task[field] = updateData[field];
    }
  });

  await task.save();
  const populated = await Task.findById(task._id).populate('assigneeId', 'name email avatar');
  return formatTaskResponse(populated);
};

export const deleteTask = async (id) => {
  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    throw new AppError(`Task with ID '${id}' not found.`, 404, 'NOT_FOUND');
  }

  // Cascade delete comments associated with this task
  await Comment.deleteMany({ taskId: id });

  return { id, deleted: true };
};

export const getComments = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(`Task with ID '${taskId}' not found.`, 404, 'NOT_FOUND');
  }

  const comments = await Comment.find({ taskId })
    .sort({ createdAt: 1 })
    .populate('authorId', 'name email avatar')
    .lean();

  return comments.map((c) => ({
    _id: c._id,
    taskId: c.taskId,
    content: c.content,
    author: c.authorId
      ? {
          _id: c.authorId._id,
          name: c.authorId.name,
          email: c.authorId.email,
          avatar: c.authorId.avatar,
        }
      : null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
};

export const createComment = async (taskId, commentData) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(`Task with ID '${taskId}' not found.`, 404, 'NOT_FOUND');
  }

  let authorId = commentData.authorId;
  if (!authorId) {
    // If not supplied, fall back to task assignee or workspace owner or first user
    if (task.assigneeId) {
      authorId = task.assigneeId;
    } else {
      const anyUser = await User.findOne();
      if (anyUser) {
        authorId = anyUser._id;
      }
    }
  }

  if (!authorId) {
    throw new AppError('Author ID could not be determined.', 400, 'VALIDATION_ERROR');
  }

  const comment = await Comment.create({
    taskId,
    authorId,
    content: commentData.content,
  });

  const populated = await Comment.findById(comment._id).populate('authorId', 'name email avatar');

  return {
    _id: populated._id,
    taskId: populated.taskId,
    content: populated.content,
    author: populated.authorId
      ? {
          _id: populated.authorId._id,
          name: populated.authorId.name,
          email: populated.authorId.email,
          avatar: populated.authorId.avatar,
        }
      : null,
    createdAt: populated.createdAt,
    updatedAt: populated.updatedAt,
  };
};

// Helper to format task object and rename assigneeId to assignee if populated
function formatTaskResponse(taskDoc) {
  if (!taskDoc) return null;
  const obj = taskDoc.toObject ? taskDoc.toObject() : { ...taskDoc };
  if (obj.assigneeId && typeof obj.assigneeId === 'object' && obj.assigneeId.name) {
    obj.assignee = {
      _id: obj.assigneeId._id,
      name: obj.assigneeId.name,
      email: obj.assigneeId.email,
      avatar: obj.assigneeId.avatar,
    };
  } else if (!obj.assignee) {
    obj.assignee = null;
  }
  return obj;
}
