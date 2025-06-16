import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const ReminderPreview = ({ taskTitle, dueDate, className = '' }) => {
  const dueDateObj = new Date(dueDate);
  const oneHourBefore = new Date(dueDateObj.getTime() - 60 * 60 * 1000);
  const thirtyMinsBefore = new Date(dueDateObj.getTime() - 30 * 60 * 1000);

  const reminderItems = [
    {
      type: '1 hour before',
      time: oneHourBefore,
      icon: 'Clock',
      color: 'info'
    },
    {
      type: '30 minutes before',
      time: thirtyMinsBefore,
      icon: 'Bell',
      color: 'warning'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface rounded-lg p-4 border border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex items-center">
          <ApperIcon name="Mail" size={16} className="mr-2 text-primary" />
          Email Reminders
        </h4>
        <Badge variant="info" size="sm">
          Scheduled
        </Badge>
      </div>

      <div className="space-y-3">
        {reminderItems.map((reminder, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white rounded border border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                reminder.color === 'info' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
              }`}>
                <ApperIcon name={reminder.icon} size={14} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {reminder.type}
                </p>
                <p className="text-xs text-gray-500">
                  {format(reminder.time, 'MMM d, yyyy \'at\' h:mm a')}
                </p>
              </div>
            </div>
            <Badge variant={reminder.color} size="sm">
              Pending
            </Badge>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <p className="flex items-start">
          <ApperIcon name="Info" size={14} className="mr-2 mt-0.5 text-primary" />
          You'll receive email notifications for "{taskTitle}" at the scheduled times above.
        </p>
      </div>
    </motion.div>
  );
};

export default ReminderPreview;