import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import TaskList from '@/components/organisms/TaskList';
import CreateTaskModal from '@/components/organisms/CreateTaskModal';
import { taskService } from '@/services';

const CompletedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const completedTasks = await taskService.getCompleted();
      setTasks(completedTasks);
    } catch (err) {
      setError(err.message || 'Failed to load completed tasks');
      toast.error('Failed to load completed tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskService.update(task.id, {
        status: 'pending',
        completedAt: null
      });

      setTasks(prev => prev.filter(t => t.id !== task.id));
      toast.success('Task marked as pending');
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
              <span className="w-3 h-3 bg-success rounded-full mr-3"></span>
              Completed Tasks
            </h1>
            <p className="text-gray-600 mt-1">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} completed
            </p>
          </div>
        </div>
        
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 bg-success/5 border border-success/20 rounded-lg"
          >
            <p className="text-sm text-success font-medium">
              🎉 Congratulations on completing these tasks! Your productivity is paying off.
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
        emptyIcon="Trophy"
        emptyTitle="No completed tasks yet"
        emptyDescription="Start working on your tasks to see your accomplishments here. Every completed task is a step toward your goals!"
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

export default CompletedTasks;