import React from 'react';
import { 
  AlertCircle, 
  ArrowUp, 
  ArrowRight, 
  Minus, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  CircleDot 
} from 'lucide-react';

export const TaskCard = ({
  task,
  onStatusChange,
  onDelete,
  onClick,
  onDragStart,
  onDragEnd,
}) => {
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="priority-pill urgent">
            <AlertCircle size={11} /> Urgent
          </span>
        );
      case 'high':
        return (
          <span className="priority-pill high">
            <ArrowUp size={11} /> High
          </span>
        );
      case 'medium':
        return (
          <span className="priority-pill medium">
            <ArrowRight size={11} /> Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="priority-pill low">
            <Minus size={11} /> Low
          </span>
        );
    }
  };

  const getAssigneeInitials = (assignee) => {
    if (!assignee || !assignee.name) return 'UN';
    return assignee.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusSelect = (e) => {
    e.stopPropagation();
    onStatusChange(task._id, e.target.value);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete task "${task.title}"?`)) {
      onDelete(task._id);
    }
  };

  return (
    <div
      className="task-card"
      id={`task-card-${task._id}`}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick && onClick(task)}
    >
      <div className="card-top">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <h4 className="card-title">{task.title}</h4>
          {task.description && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.description}
            </p>
          )}
        </div>
        {getPriorityBadge(task.priority)}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="card-tags">
          {task.tags.map((tag, i) => (
            <span key={i} className="tag-badge">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="card-footer-left">
          <div
            className="avatar-circle"
            style={{ width: '22px', height: '22px', fontSize: '10px' }}
            title={task.assignee?.name ? `Assigned to: ${task.assignee.name}` : 'Unassigned'}
          >
            {task.assignee?.avatar ? (
              <img src={task.assignee.avatar} alt={task.assignee.name} />
            ) : (
              getAssigneeInitials(task.assignee)
            )}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {task.assignee?.name ? task.assignee.name.split(' ')[0] : 'Unassigned'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="status-quick-select"
            value={task.status}
            onChange={handleStatusSelect}
            onClick={(e) => e.stopPropagation()}
            title="Move to stage"
          >
            <option value="backlog">Backlog</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <button
            onClick={handleDelete}
            style={{ color: 'var(--text-muted)', padding: '2px' }}
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
