import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const DEFAULT_WORKSPACE = {
  _id: 'default-acme-id',
  name: 'Acme Engineering',
  slug: 'acme-eng',
  description: 'High-throughput platform & core services engineering team.',
  members: [
    { name: 'Sarah Lead', email: 'lead@acme.com', role: 'owner' },
    { name: 'Alex Rivera', email: 'alex@acme.com', role: 'admin' },
    { name: 'Omkar Kadam', email: 'omkar@acme.com', role: 'member' },
  ],
};

export const useWorkspace = (slug = 'acme-eng') => {
  const [workspace, setWorkspace] = useState(DEFAULT_WORKSPACE);
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
          // If no workspace in DB yet, create or keep default
          setWorkspace(DEFAULT_WORKSPACE);
        }
      } catch (innerErr) {
        // Fallback to default in offline / transient mode
        setWorkspace(DEFAULT_WORKSPACE);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const addMember = async (memberData) => {
    const res = await api.post(`/workspaces/${workspace.slug}/members`, memberData);
    if (res.data?.data) {
      setWorkspace(res.data.data);
    }
    return res.data?.data;
  };

  return { workspace, loading, error, refetch: fetchWorkspace, addMember };
};
