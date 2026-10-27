import React from 'react';
import { Search, Plus, UserPlus, Activity } from 'lucide-react';

export const Header = ({
  workspaceName = 'Acme Engineering',
  searchQuery = '',
  onSearchChange,
  onOpenNewTask,
  onOpenInviteMember,
}) => {
  return (
    <header className="app-header" id="app-master-header">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span>DevPulse</span>
          <span>/</span>
          <strong>{workspaceName}</strong>
          <span>/</span>
          <span>Active Board</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-box">
          <Search size={15} />
          <input
            id="global-search-input"
            type="text"
            className="search-input"
            placeholder="Search tasks by title, tag, or keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn-secondary"
          onClick={onOpenInviteMember}
          id="btn-header-invite"
          title="Invite member to workspace"
        >
          <UserPlus size={14} /> Invite
        </button>

        <button
          className="btn-primary"
          onClick={onOpenNewTask}
          id="btn-header-new-task"
        >
          <Plus size={15} /> New Task
        </button>
      </div>
    </header>
  );
};
