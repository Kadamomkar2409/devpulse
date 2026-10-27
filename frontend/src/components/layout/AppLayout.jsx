import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = ({
  workspace,
  searchQuery,
  onSearchChange,
  activeStage,
  onStageSelect,
  taskCounts,
  onOpenNewTask,
  onOpenInviteMember,
  children,
}) => {
  return (
    <div className="app-container" id="devpulse-app-root">
      <Sidebar
        workspace={workspace}
        activeStage={activeStage}
        onStageSelect={onStageSelect}
        taskCounts={taskCounts}
        onOpenInviteMember={onOpenInviteMember}
      />
      <div className="main-content">
        <Header
          workspaceName={workspace?.name}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenNewTask={onOpenNewTask}
          onOpenInviteMember={onOpenInviteMember}
        />
        <main className="workspace-viewport">{children}</main>
      </div>
    </div>
  );
};
