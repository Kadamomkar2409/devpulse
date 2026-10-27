import { useState } from 'react';
import { api } from '../services/api';

export const useCreateTask = (workspaceId) => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const createTask = async (taskPayload) => {
    if (!workspaceId) {
      throw new Error('Workspace ID is required to create a task.');
    }
    setCreating(true);
    setError(null);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/tasks`, taskPayload);
      return res.data?.data;
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return { createTask, creating, error };
};
