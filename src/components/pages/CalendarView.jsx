import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isPast } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import TaskCard from '@/components/molecules/TaskCard';
import CreateTaskModal from '@/components/organisms/CreateTaskModal';
import { taskService } from '@/services';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allTasks = await taskService.getAll();
      setTasks(allTasks);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
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
        status: task.status === 'completed' ? 'pending' : 'completed',
        completedAt: task.status === 'completed' ? null : new Date().toISOString()
      });

      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      toast.success(task.status === 'completed' ? 'Task marked as pending' : 'Task completed!');
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

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  // Get the first day of the month to calculate grid start
  const firstDayOfMonth = monthStart.getDay();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center">
              <ApperIcon name="Calendar" size={28} className="text-primary mr-3" />
              Calendar View
            </h1>
            <p className="text-gray-600 mt-1">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} scheduled
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNew}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={18} />
            <span>New Task</span>
          </motion.button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <button
            onClick={handlePreviousMonth}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ApperIcon name="ChevronLeft" size={18} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              Today
            </button>
          </div>
          
          <button
            onClick={handleNextMonth}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ApperIcon name="ChevronRight" size={18} />
          </button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month start */}
          {Array.from({ length: firstDayOfMonth }, (_, index) => (
            <div key={`empty-${index}`} className="h-32 border-r border-b border-gray-100"></div>
          ))}
          
          {/* Month days */}
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`h-32 border-r border-b border-gray-100 p-2 relative ${
                  isCurrentDay ? 'bg-primary/5' : 'hover:bg-gray-50'
                } transition-colors`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentDay ? 'text-primary' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                  {isCurrentDay && (
                    <span className="ml-1 text-xs bg-primary text-white px-1 rounded">
                      Today
                    </span>
                  )}
                </div>
<div className="space-y-1 overflow-y-auto max-h-20">
                  {dayTasks.slice(0, 2).map((task) => {
                    const taskDate = new Date(task.dueDate);
                    const isOverdue = isPast(taskDate) && !isToday(taskDate) && task.status !== 'completed';
                    const isCompleted = task.status === 'completed';
                    
                    return (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                          isCompleted
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : isOverdue
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        } hover:scale-105`}
                        onClick={() => handleEditTask(task)}
                        title={task.title}
                      >
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            isCompleted
                              ? 'bg-green-600'
                              : isOverdue
                              ? 'bg-orange-600'
                              : 'bg-yellow-600'
                          }`}></div>
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details Modal */}
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

export default CalendarView;