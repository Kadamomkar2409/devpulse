import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

export const useTasks = (workspaceId, filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  
  // Keep ref of previous tasks for rollback on error
  const prevTasksRef = useRef([]);

  const filtersKey = JSON.stringify(filters);

  // Manual refetch handler (e.g. after task creation or mutation)
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
  }, [workspaceId, filtersKey]);

  useEffect(() => {
    // Guard: Do not fetch until a valid workspace id is available
    if (!workspaceId) {
      setTasks([]);
      setLoading(true);
      return;
    }

    let ignore = false;

    const runFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/workspaces/${workspaceId}/tasks`, {
          params: { limit: 50, ...filters },
        });
        if (ignore) return;
        const data = response.data?.data;
        if (data && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
          prevTasksRef.current = data.tasks;
          if (data.pagination) setPagination(data.pagination);
        } else {
          setTasks([]);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to fetch tasks');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    runFetch();

    return () => {
      ignore = true;
    };
  }, [workspaceId, filtersKey]);

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
    loading: !workspaceId || loading,
    error,
    pagination,
    refetch: fetchTasks,
    updateTaskStatus,
    removeTask,
  };
};
