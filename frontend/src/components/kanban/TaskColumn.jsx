import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const TaskColumn = ({
  title,
  statusKey,
  tasks = [],
  loading = false,
  onStatusChange,
  onDelete,
  onCardClick,
  onQuickAdd,
  onDropTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (taskData && taskData.status !== statusKey) {
        onDropTask(taskData._id, statusKey);
      }
    } catch (err) {
      console.error('Failed to parse dropped task payload', err);
    }
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="kanban-column"
      id={`kanban-column-${statusKey}`}
      style={{
        borderColor: isDragOver ? 'var(--primary)' : 'var(--border-subtle)',
        boxShadow: isDragOver ? 'var(--shadow-glow)' : 'none',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title-left">
          <div className={`column-dot ${statusKey}`} />
          <h3 className="column-name">{title}</h3>
          <span className="count-badge" id={`column-count-${statusKey}`}>
            {loading ? '...' : tasks.length}
          </span>
        </div>

        <button
          className="btn-secondary"
          style={{ padding: '3px 8px', fontSize: '11px' }}
          onClick={() => onQuickAdd && onQuickAdd(statusKey)}
          title={`Add task to ${title}`}
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="column-card-list">
        {loading ? (
          <SkeletonLoader count={3} />
        ) : tasks.length === 0 ? (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            No tasks in {title.toLowerCase()}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onClick={onCardClick}
              onDragStart={handleDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};
