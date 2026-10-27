import React, { useMemo } from 'react';
import { TaskColumn } from './TaskColumn';
import { Filter, Layers, CheckCircle2, Clock } from 'lucide-react';

const COLUMNS = [
  { key: 'backlog', title: 'Backlog' },
  { key: 'todo', title: 'Todo' },
  { key: 'in-progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
];

export const TaskBoard = ({
  tasks = [],
  loading = false,
  priorityFilter = 'all',
  onPriorityFilterChange,
  pagination = null,
  onPageChange,
  onStatusChange,
  onDeleteTask,
  onCardClick,
  onQuickAdd,
}) => {
  // Partition tasks into columns based on current status and priority filter
  const columnData = useMemo(() => {
    const map = {
      backlog: [],
      todo: [],
      'in-progress': [],
      done: [],
    };

    tasks.forEach((task) => {
      // Apply priority filtering
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return;
      }

      if (map[task.status]) {
        map[task.status].push(task);
      } else {
        map.todo.push(task); // Fallback to todo if undefined
      }
    });

    return map;
  }, [tasks, priorityFilter]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Board Controls & Filter Header */}
      <div className="board-header">
        <div className="board-title-group">
          <h2 className="board-title">Sprint Board</h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Clock size={12} color="#fbbf24" />
            <span>{inProgressTasks} In Progress</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <CheckCircle2 size={12} color="#34d399" />
            <span>{completionPercentage}% Done</span>
          </div>
        </div>

        {/* Priority Filter Bar */}
        <div className="filter-pills-bar" id="priority-filter-bar">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <Filter size={12} /> Priority:
          </span>
          {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              id={`filter-priority-${p}`}
              className={`filter-pill ${priorityFilter === p ? 'active' : ''}`}
              onClick={() => onPriorityFilterChange && onPriorityFilterChange(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Pagination Controls */}
        {pagination && (
          <div
            className="pagination-controls"
            id="board-pagination-controls"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
            </span>
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className="filter-pill"
                  disabled={pagination.page <= 1}
                  onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                  style={{
                    padding: '2px 8px',
                    opacity: pagination.page <= 1 ? 0.4 : 1,
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                  id="btn-pagination-prev"
                >
                  Prev
                </button>
                <button
                  className="filter-pill"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                  style={{
                    padding: '2px 8px',
                    opacity: pagination.page >= pagination.totalPages ? 0.4 : 1,
                    cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  }}
                  id="btn-pagination-next"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4-Column Kanban Grid */}
      <div className="kanban-columns-container" id="kanban-board-grid">
        {COLUMNS.map((col) => (
          <TaskColumn
            key={col.key}
            statusKey={col.key}
            title={col.title}
            tasks={columnData[col.key]}
            loading={loading}
            onStatusChange={onStatusChange}
            onDelete={onDeleteTask}
            onCardClick={onCardClick}
            onQuickAdd={onQuickAdd}
            onDropTask={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};
