import React from 'react';
import { 
  Kanban, 
  Layers, 
  Users, 
  Settings, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Archive,
  ChevronDown
} from 'lucide-react';

export const Sidebar = ({
  workspace,
  activeStage = 'all',
  onStageSelect,
  taskCounts = { backlog: 0, todo: 0, 'in-progress': 0, done: 0 },
  onOpenInviteMember,
}) => {
  const members = workspace?.members || [];

  return (
    <aside className="app-sidebar" id="app-master-sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">DP</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="logo-text">{workspace?.name || 'DevPulse'}</span>
            <span className="logo-tag">MERN</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            /{workspace?.slug || 'acme-eng'}
          </span>
        </div>
      </div>

      <div className="sidebar-nav">
        {/* Workspace Views */}
        <div>
          <div className="sidebar-section-title">Views</div>
          <div
            className={`sidebar-nav-item ${activeStage === 'all' ? 'active' : ''}`}
            onClick={() => onStageSelect && onStageSelect('all')}
          >
            <div className="sidebar-nav-item-left">
              <Kanban size={15} />
              <span>Kanban Board</span>
            </div>
            <span className="count-badge">
              {Object.values(taskCounts).reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </div>

        {/* Workflow Stages */}
        <div>
          <div className="sidebar-section-title">Workflow Stages</div>
          <div
            className={`sidebar-nav-item ${activeStage === 'backlog' ? 'active' : ''}`}
            onClick={() => onStageSelect && onStageSelect('backlog')}
          >
            <div className="sidebar-nav-item-left">
              <Archive size={14} color="var(--status-backlog)" />
              <span>Backlog</span>
            </div>
            <span className="count-badge">{taskCounts.backlog || 0}</span>
          </div>

          <div
            className={`sidebar-nav-item ${activeStage === 'todo' ? 'active' : ''}`}
            onClick={() => onStageSelect && onStageSelect('todo')}
          >
            <div className="sidebar-nav-item-left">
              <ListTodo size={14} color="var(--status-todo)" />
              <span>Todo</span>
            </div>
            <span className="count-badge">{taskCounts.todo || 0}</span>
          </div>

          <div
            className={`sidebar-nav-item ${activeStage === 'in-progress' ? 'active' : ''}`}
            onClick={() => onStageSelect && onStageSelect('in-progress')}
          >
            <div className="sidebar-nav-item-left">
              <Clock size={14} color="var(--status-in-progress)" />
              <span>In Progress</span>
            </div>
            <span className="count-badge">{taskCounts['in-progress'] || 0}</span>
          </div>

          <div
            className={`sidebar-nav-item ${activeStage === 'done' ? 'active' : ''}`}
            onClick={() => onStageSelect && onStageSelect('done')}
          >
            <div className="sidebar-nav-item-left">
              <CheckCircle2 size={14} color="var(--status-done)" />
              <span>Done</span>
            </div>
            <span className="count-badge">{taskCounts.done || 0}</span>
          </div>
        </div>

        {/* Workspace Members */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              marginBottom: '6px',
            }}
          >
            <span className="sidebar-section-title" style={{ padding: 0, margin: 0 }}>
              Team ({members.length})
            </span>
            <button
              onClick={onOpenInviteMember}
              style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}
            >
              + Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {members.map((m) => (
              <div
                key={m.userId || m.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                }}
              >
                <div
                  className="avatar-circle"
                  style={{ width: '22px', height: '22px', fontSize: '10px' }}
                >
                  {m.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {m.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {m.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="avatar-circle">OK</div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              Omkar Kadam
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Target Engineer
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
