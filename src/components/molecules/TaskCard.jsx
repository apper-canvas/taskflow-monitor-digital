import { motion } from 'framer-motion';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import ProgressRing from '@/components/atoms/ProgressRing';
import ChecklistPreview from '@/components/molecules/ChecklistPreview';

const TaskCard = ({ task, onToggleComplete, onEdit, className = '' }) => {
  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== 'completed';
  const completedCount = task.checklist?.filter(item => item.completed).length || 0;
  const totalCount = task.checklist?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const formatDueDate = (date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const formatDueTime = (date) => {
    return format(date, 'h:mm a');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleComplete(task)}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              task.status === 'completed'
                ? 'bg-success border-success text-white'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            {task.status === 'completed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="animate-spring"
              >
                <ApperIcon name="Check" size={12} />
              </motion.div>
            )}
          </motion.button>

          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-gray-900 break-words ${
              task.status === 'completed' ? 'line-through text-gray-500' : ''
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2 break-words">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-2">
          {totalCount > 0 && (
            <ProgressRing progress={progress} size={32} strokeWidth={2} />
          )}
          
          <Badge variant={task.priority} size="sm">
            {task.priority}
          </Badge>
        </div>
      </div>

      {/* Due Date */}
      <div className={`flex items-center space-x-2 text-sm mb-3 ${
        isOverdue ? 'text-error' : 'text-gray-600'
      }`}>
        <ApperIcon name="Clock" size={14} />
        <span>
          {formatDueDate(dueDate)} at {formatDueTime(dueDate)}
        </span>
        {isOverdue && (
          <Badge variant="error" size="sm" icon="AlertCircle">
            Overdue
          </Badge>
        )}
      </div>

      {/* Checklist Preview */}
      {totalCount > 0 && (
        <ChecklistPreview
          checklist={task.checklist}
          completed={completedCount}
          total={totalCount}
        />
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.map((tag, index) => (
            <Badge key={index} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(task)}
          className="text-gray-400 hover:text-primary transition-colors p-1"
        >
          <ApperIcon name="Edit2" size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TaskCard;