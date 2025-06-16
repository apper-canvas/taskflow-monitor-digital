import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import TaskList from '@/components/organisms/TaskList';
import CreateTaskModal from '@/components/organisms/CreateTaskModal';
import { taskService } from '@/services';

const UpcomingTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Update task statuses first
      await taskService.updateTaskStatuses();
      
      const upcomingTasks = await taskService.getUpcoming();
      setTasks(upcomingTasks);
    } catch (err) {
      setError(err.message || 'Failed to load upcoming tasks');
      toast.error('Failed to load upcoming tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    
    // Auto-refresh every minute to update overdue statuses
    const interval = setInterval(loadTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskService.update(task.id, {
        status: task.status === 'completed' ? 'pending' : 'completed',
        completedAt: task.status === 'completed' ? null : new Date().toISOString()
      });

      setTasks(prev => prev.filter(t => t.id !== task.id));
      
      if (updatedTask.status === 'completed') {
        toast.success('Task completed! 🎉');
      } else {
        toast.success('Task marked as pending');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsCreateModalOpen(true);
  };

  const handleTaskCreated = () => {
    loadTasks();
    setSelectedTask(null);
  };

  const handleCreateNew = () => {
    setSelectedTask(null);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Upcoming Tasks</h1>
            <p className="text-gray-600 mt-1">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} scheduled
            </p>
          </div>
        </div>
      </motion.div>

      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEditTask}
        emptyIcon="Calendar"
        emptyTitle="No upcoming tasks"
        emptyDescription="You're all caught up! Create a new task to stay organized and productive."
        emptyAction="Create First Task"
        onEmptyAction={handleCreateNew}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default UpcomingTasks;