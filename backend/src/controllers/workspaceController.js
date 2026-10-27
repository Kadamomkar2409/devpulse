import { catchAsync } from '../utils/catchAsync.js';
import * as workspaceService from '../services/workspaceService.js';

export const createWorkspace = catchAsync(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.body);
  res.status(201).json({
    success: true,
    data: workspace,
    error: null,
  });
});

export const getWorkspaceBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const workspace = await workspaceService.getWorkspaceBySlug(slug);
  res.status(200).json({
    success: true,
    data: workspace,
    error: null,
  });
});

export const addMember = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const workspace = await workspaceService.addMemberToWorkspace(slug, req.body);
  res.status(200).json({
    success: true,
    data: workspace,
    error: null,
  });
});

export const listWorkspaces = catchAsync(async (req, res) => {
  const workspaces = await workspaceService.listWorkspaces();
  res.status(200).json({
    success: true,
    data: workspaces,
    error: null,
  });
});
