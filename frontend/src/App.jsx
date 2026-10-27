import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { TaskBoard } from './components/kanban/TaskBoard';
import { TaskModal } from './components/modals/TaskModal';
import { MemberModal } from './components/modals/MemberModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useWorkspace } from './hooks/useWorkspace';
import { useTasks } from './hooks/useTasks';
import { useCreateTask } from './hooks/useCreateTask';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from './services/api';

export default function App() {
  // Workspace server state
  const { workspace, loading: workspaceLoading, addMember } = useWorkspace('acme-eng');

  // Client UI filtering & pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeStage, setActiveStage] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState('todo');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Toast feedback state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Debounce search input by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when search or stage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeStage]);

  // Tasks query filter object
  const taskFilters = useMemo(() => {
    const filters = { page: currentPage };
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
    if (activeStage !== 'all') filters.status = activeStage;
    return filters;
  }, [debouncedSearch, activeStage, currentPage]);

  // Tasks server state
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    pagination,
    refetch: refetchTasks,
    updateTaskStatus,
    removeTask,
  } = useTasks(workspace?._id, taskFilters);

  const { createTask } = useCreateTask(workspace?._id);

  // Compute stage count badges for sidebar
  const taskCounts = useMemo(() => {
    const counts = { backlog: 0, todo: 0, 'in-progress': 0, done: 0 };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status] += 1;
      }
    });
    return counts;
  }, [tasks]);

  // Modal action handlers
  const handleOpenNewTask = (status = 'todo') => {
    setEditingTask(null);
    setDefaultModalStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskPayload) => {
    if (editingTask?._id) {
      // Update existing task
      await api.patch(`/tasks/${editingTask._id}`, taskPayload);
      addToast('Task updated successfully!', 'success');
    } else {
      // Create new task
      await createTask(taskPayload);
      addToast('New task created!', 'success');
    }
    refetchTasks();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      addToast(`Moved to ${newStatus}`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await removeTask(taskId);
      addToast('Task deleted', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleInviteMember = async (memberData) => {
    try {
      await addMember(memberData);
      addToast(`Invited ${memberData.name} to workspace!`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to invite member', 'error');
      throw err;
    }
  };

  return (
    <ErrorBoundary>
      <AppLayout
        workspace={workspace}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeStage={activeStage}
        onStageSelect={setActiveStage}
        taskCounts={taskCounts}
        onOpenNewTask={() => handleOpenNewTask('todo')}
        onOpenInviteMember={() => setIsMemberModalOpen(true)}
      >
        <TaskBoard
          tasks={tasks}
          loading={tasksLoading}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          pagination={pagination}
          onPageChange={setCurrentPage}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onCardClick={handleOpenEditTask}
          onQuickAdd={handleOpenNewTask}
        />

        {/* Create / Edit Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleSaveTask}
          initialData={editingTask}
          workspaceMembers={workspace?.members || []}
          defaultStatus={defaultModalStatus}
        />

        {/* Member Invitation Modal */}
        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          onInvite={handleInviteMember}
        />

        {/* Global Toast Alerts */}
        <div className="toast-container" id="toast-alerts-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              {toast.type === 'success' ? (
                <CheckCircle2 size={16} color="#34d399" />
              ) : (
                <AlertCircle size={16} color="#f43f5e" />
              )}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
}
