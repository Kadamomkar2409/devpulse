import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

export const useTasks = (workspaceId, filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  
  // Keep ref of previous tasks for rollback on error
  const prevTasksRef = useRef([]);

  const fetchTasks = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/workspaces/${workspaceId}/tasks`, {
        params: { limit: 50, ...filters },
      });
      const data = response.data?.data;
      if (data && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        prevTasksRef.current = data.tasks;
        if (data.pagination) setPagination(data.pagination);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Optimistic status update with instant UI reflection (AC-3)
  const updateTaskStatus = async (taskId, newStatus) => {
    const previous = [...tasks];
    prevTasksRef.current = previous;

    // Optimistically update
    setTasks((current) =>
      current.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${taskId}`, { status: newStatus });
      const updated = res.data?.data;
      if (updated) {
        setTasks((current) =>
          current.map((t) => (t._id === taskId ? { ...t, ...updated } : t))
        );
      }
      return updated;
    } catch (err) {
      // Rollback on failure
      setTasks(previous);
      throw err;
    }
  };

  const removeTask = async (taskId) => {
    const previous = [...tasks];
    setTasks((current) => current.filter((t) => t._id !== taskId));
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      setTasks(previous);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    pagination,
    refetch: fetchTasks,
    updateTaskStatus,
    removeTask,
  };
};
