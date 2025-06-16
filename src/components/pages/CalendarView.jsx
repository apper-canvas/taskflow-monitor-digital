import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { addMonths, eachDayOfInterval, endOfMonth, format, isPast, isSameDay, isToday, startOfMonth, subMonths } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import TaskCard from "@/components/molecules/TaskCard";
import CreateTaskModal from "@/components/organisms/CreateTaskModal";
import Badge from "@/components/atoms/Badge";
import { taskService } from "@/services";

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
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-display font-bold text-gray-900 flex items-center">
              <ApperIcon name="Calendar" size={28} className="text-primary mr-3" />Calendar View
            </h1>
            <p className="text-gray-600 mt-1">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} scheduled
            </p>
          </div>
          <motion.button
            whileHover={{
              scale: 1.02
            }}
            whileTap={{
              scale: 0.98
            }}
            onClick={handleCreateNew}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <ApperIcon name="Plus" size={18} />
            <span>New Task</span>
          </motion.button>
        </div>
        {/* Month Navigation */}
        <div
          className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <button
            onClick={handlePreviousMonth}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <ApperIcon name="ChevronLeft" size={18} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">Today
            </button>
          </div>
          <button
            onClick={handleNextMonth}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="hidden sm:inline">Next</span>
            <ApperIcon name="ChevronRight" size={18} />
          </button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {/* Empty cells for days before month start */}
          {Array.from({ length: firstDayOfMonth }, (_, index) => (
            <div 
              key={`empty-${index}`} 
              className="h-32 bg-gray-50/50 border-b border-gray-200 p-2"
            >
              <div className="h-full flex items-center justify-center">
                <span className="text-gray-300 text-sm">•</span>
              </div>
            </div>
          ))}
          
          {/* Month days */}
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentDay = isToday(day);
            const isPastDay = isPast(day) && !isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`h-32 border-b border-gray-200 p-2 relative transition-all duration-200 ${
                  isCurrentDay 
                    ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                    : isPastDay 
                    ? 'bg-gray-50/30' 
                    : 'bg-white hover:bg-gray-50'
                } cursor-pointer`}
                onClick={() => dayTasks.length === 0 && handleCreateNew()}
              >
                <div className={`text-sm font-semibold mb-2 flex items-center justify-between ${
                  isCurrentDay ? 'text-blue-700' : isPastDay ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  <span>{format(day, 'd')}</span>
                  {isCurrentDay && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
                      Today
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map((task) => {
                    const taskDate = new Date(task.dueDate);
                    const isOverdue = isPast(taskDate) && !isToday(taskDate) && task.status !== 'completed';
                    const isCompleted = task.status === 'completed';
                    
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`text-xs p-2 rounded-md cursor-pointer transition-all duration-200 ${
                          isCompleted
                            ? 'bg-green-100 text-green-800 border border-green-300 shadow-sm'
                            : isOverdue
                            ? 'bg-red-100 text-red-800 border border-red-300 shadow-sm'
                            : 'bg-blue-100 text-blue-800 border border-blue-300 shadow-sm'
                        } hover:shadow-md`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                        title={`${task.title} - ${task.description || 'No description'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isCompleted
                              ? 'bg-green-600'
                              : isOverdue
                              ? 'bg-red-600'
                              : 'bg-blue-600'
                          }`}></div>
                          <span className="truncate font-medium leading-tight">{task.title}</span>
                        </div>
                        {task.priority && (
                          <div className="mt-1">
                            <Badge 
                              variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'secondary'}
                              size="xs"
                            >
                              {task.priority[0].toUpperCase() + task.priority.slice(1)}
                            </Badge>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-600 text-center bg-gray-100 rounded px-2 py-1 font-medium">
                      +{dayTasks.length - 2} more task{dayTasks.length - 2 !== 1 ? 's' : ''}
                    </div>
                  )}
                  
                  {dayTasks.length === 0 && !isPastDay && (
                    <div className="text-xs text-gray-400 text-center py-2 border-2 border-dashed border-gray-200 rounded-md hover:border-blue-300 hover:text-blue-500 transition-colors">
                      Click to add task
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