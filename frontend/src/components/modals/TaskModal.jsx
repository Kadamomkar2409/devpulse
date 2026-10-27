import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  workspaceMembers = [],
  defaultStatus = 'todo',
}) => {
  const isEditing = Boolean(initialData?._id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Threaded comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'comments'

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'todo');
      setPriority(initialData.priority || 'medium');
      setAssigneeId(initialData.assignee?._id || initialData.assigneeId || '');
      setTagsInput(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '');
      setErrorMsg('');

      // Fetch task comments if editing
      if (initialData._id) {
        fetchComments(initialData._id);
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setAssigneeId('');
      setTagsInput('');
      setComments([]);
      setErrorMsg('');
      setActiveTab('details');
    }
  }, [initialData, defaultStatus, isOpen]);

  const fetchComments = async (taskId) => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/tasks/${taskId}/comments`);
      if (res.data?.data) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch comments:', err.message);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !initialData?._id) return;

    try {
      const res = await api.post(`/tasks/${initialData._id}/comments`, {
        content: commentText.trim(),
        authorId: assigneeId || workspaceMembers[0]?.userId,
      });
      if (res.data?.data) {
        setComments((prev) => [...prev, res.data.data]);
        setCommentText('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit comment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setErrorMsg('Task title must be at least 3 characters long.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId || null,
      tags,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        id="task-create-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 className="modal-title">
              {isEditing ? 'Task Details & Activity' : 'Create New Task'}
            </h3>
            {isEditing && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className={`btn-secondary ${activeTab === 'details' ? 'active' : ''}`}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    borderColor: activeTab === 'details' ? 'var(--primary)' : 'var(--border-subtle)',
                  }}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  type="button"
                  className={`btn-secondary ${activeTab === 'comments' ? 'active' : ''}`}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    borderColor: activeTab === 'comments' ? 'var(--primary)' : 'var(--border-subtle)',
                  }}
                  onClick={() => setActiveTab('comments')}
                >
                  <MessageSquare size={11} /> Discussion ({comments.length})
                </button>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} id="btn-close-modal">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 24px',
              background: 'rgba(244, 63, 94, 0.1)',
              borderBottom: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#fda4af',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeTab === 'details' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="task-title-input">
                  Task Title *
                </label>
                <input
                  id="task-title-input"
                  type="text"
                  placeholder="e.g. Set up MongoDB compound indexing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ height: '38px', padding: '0 12px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-desc-input">
                  Description
                </label>
                <textarea
                  id="task-desc-input"
                  rows={4}
                  placeholder="Provide context, acceptance criteria, or technical details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ padding: '10px 12px', resize: 'vertical' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="task-status-select">
                    Kanban Status
                  </label>
                  <select
                    id="task-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ height: '38px', padding: '0 10px' }}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-priority-select">
                    Priority Level
                  </label>
                  <select
                    id="task-priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ height: '38px', padding: '0 10px' }}
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="task-assignee-select">
                    Assignee
                  </label>
                  <select
                    id="task-assignee-select"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    style={{ height: '38px', padding: '0 10px' }}
                  >
                    <option value="">Unassigned</option>
                    {workspaceMembers.map((m) => (
                      <option key={m.userId || m.email} value={m.userId}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-tags-input">
                    Tags (Comma-separated)
                  </label>
                  <input
                    id="task-tags-input"
                    type="text"
                    placeholder="e.g. backend, database, security"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    style={{ height: '38px', padding: '0 12px' }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                id="btn-submit-task"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        ) : (
          /* Comments & Activity Tab */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="modal-body" style={{ flex: 1 }}>
              {loadingComments ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading discussion...</p>
              ) : comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  <MessageSquare size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '13px' }}>No comments yet. Start the discussion below!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {comments.map((c) => (
                    <div
                      key={c._id}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '6px',
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {c.author?.name || 'Engineer'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={handleAddComment}
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '10px',
              }}
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ flex: 1, height: '38px', padding: '0 12px' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 16px' }}>
                <Send size={13} /> Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
