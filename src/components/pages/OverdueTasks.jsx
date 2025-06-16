import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import TaskList from '@/components/organisms/TaskList';
import CreateTaskModal from '@/components/organisms/CreateTaskModal';
import { taskService } from '@/services';

const OverdueTasks = () => {
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
      
      const overdueTasks = await taskService.getOverdue();
      setTasks(overdueTasks);
    } catch (err) {
      setError(err.message || 'Failed to load overdue tasks');
      toast.error('Failed to load overdue tasks');
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
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      setTasks(prev => prev.filter(t => t.id !== task.id));
      toast.success('Overdue task completed! 🎉');
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
            <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center">
              <span className="w-3 h-3 bg-error rounded-full mr-3"></span>
              Overdue Tasks
            </h1>
            <p className="text-gray-600 mt-1">
              {tasks.length} {tasks.length === 1 ? 'task needs' : 'tasks need'} immediate attention
            </p>
          </div>
        </div>
        
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 bg-error/5 border border-error/20 rounded-lg"
          >
            <p className="text-sm text-error font-medium">
              ⚠️ These tasks have passed their due date. Complete them as soon as possible to stay on track.
            </p>
          </motion.div>
        )}
      </motion.div>

      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEditTask}
        emptyIcon="CheckCircle2"
        emptyTitle="No overdue tasks"
        emptyDescription="Great job! You're staying on top of your deadlines. Keep up the excellent work!"
        emptyAction="Create New Task"
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

export default OverdueTasks;