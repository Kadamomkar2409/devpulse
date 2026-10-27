import { Workspace } from '../models/Workspace.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const createWorkspace = async ({ name, slug, ownerEmail, ownerName, description }) => {
  const finalSlug = (slug || generateSlug(name) || `ws-${Date.now()}`).toLowerCase();

  const existingWorkspace = await Workspace.findOne({ slug: finalSlug });
  if (existingWorkspace) {
    throw new AppError(`Workspace with slug '${finalSlug}' already exists.`, 409, 'DUPLICATE_RESOURCE');
  }

  // Find or create the owner User
  let owner = await User.findOne({ email: ownerEmail.toLowerCase() });
  if (!owner) {
    owner = await User.create({
      name: ownerName,
      email: ownerEmail.toLowerCase(),
      role: 'owner',
    });
  }

  const workspace = await Workspace.create({
    name,
    slug: finalSlug,
    description: description || '',
    members: [
      {
        userId: owner._id,
        email: owner.email,
        name: owner.name,
        role: 'owner',
        joinedAt: new Date(),
      },
    ],
  });

  return workspace;
};

export const getWorkspaceBySlug = async (slug) => {
  const workspace = await Workspace.findOne({ slug: slug.toLowerCase() });
  if (!workspace) {
    throw new AppError(`Workspace with slug '${slug}' not found.`, 404, 'NOT_FOUND');
  }
  return workspace;
};

export const getWorkspaceById = async (id) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) {
    throw new AppError(`Workspace with ID '${id}' not found.`, 404, 'NOT_FOUND');
  }
  return workspace;
};

export const addMemberToWorkspace = async (slug, { email, name, role = 'member' }) => {
  const workspace = await Workspace.findOne({ slug: slug.toLowerCase() });
  if (!workspace) {
    throw new AppError(`Workspace with slug '${slug}' not found.`, 404, 'NOT_FOUND');
  }

  const normalizedEmail = email.toLowerCase();
  const alreadyMember = workspace.members.some(
    (m) => m.email.toLowerCase() === normalizedEmail
  );

  if (alreadyMember) {
    throw new AppError(
      `User '${normalizedEmail}' is already a member of this workspace.`,
      409,
      'DUPLICATE_RESOURCE'
    );
  }

  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = await User.create({
      name,
      email: normalizedEmail,
      role: role || 'member',
    });
  }

  workspace.members.push({
    userId: user._id,
    email: user.email,
    name: user.name,
    role: role || 'member',
    joinedAt: new Date(),
  });

  await workspace.save();
  return workspace;
};

export const listWorkspaces = async () => {
  return await Workspace.find().sort({ createdAt: -1 });
};
