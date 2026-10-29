import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useWorkspace = (slug = 'acme-eng') => {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First try fetching by slug
      const res = await api.get(`/workspaces/${slug}`);
      if (res.data?.data) {
        setWorkspace(res.data.data);
      }
    } catch (err) {
      // If slug not found, try getting list of workspaces
      try {
        const listRes = await api.get('/workspaces');
        if (listRes.data?.data && listRes.data.data.length > 0) {
          setWorkspace(listRes.data.data[0]);
        } else {
          setWorkspace(null);
        }
      } catch (innerErr) {
        setError(innerErr.message || 'Failed to load workspace');
        setWorkspace(null);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    let ignore = false;

    const loadWorkspace = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/workspaces/${slug}`);
        if (!ignore && res.data?.data) {
          setWorkspace(res.data.data);
        }
      } catch (err) {
        if (ignore) return;
        try {
          const listRes = await api.get('/workspaces');
          if (!ignore && listRes.data?.data && listRes.data.data.length > 0) {
            setWorkspace(listRes.data.data[0]);
          } else if (!ignore) {
            setWorkspace(null);
          }
        } catch (innerErr) {
          if (!ignore) {
            setError(innerErr.message || 'Failed to load workspace');
            setWorkspace(null);
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadWorkspace();

    return () => {
      ignore = true;
    };
  }, [slug]);

  const addMember = async (memberData) => {
    if (!workspace?.slug) {
      throw new Error('Workspace not loaded yet.');
    }
    const res = await api.post(`/workspaces/${workspace.slug}/members`, memberData);
    if (res.data?.data) {
      setWorkspace(res.data.data);
    }
    return res.data?.data;
  };

  return { workspace, loading, error, refetch: fetchWorkspace, addMember };
};
