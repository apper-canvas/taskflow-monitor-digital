import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import TagInput from '@/components/molecules/TagInput';
import ChecklistManager from '@/components/organisms/ChecklistManager';
import { taskService, reminderService } from '@/services';

const CreateTaskModal = ({ isOpen, onClose, task = null, onTaskCreated }) => {
const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    dueTime: task?.dueDate ? new Date(task.dueDate).toISOString().slice(11, 16) : '',
    priority: task?.priority || 'medium',
    tags: task?.tags || [],
    checklist: task?.checklist || []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tagSuggestions = ['work', 'personal', 'urgent', 'meeting', 'review', 'documentation', 'client', 'team', 'presentation', 'research'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (!formData.dueTime) {
      newErrors.dueTime = 'Due time is required';
    }
    
    if (formData.dueDate && formData.dueTime) {
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
      const now = new Date();
      if (dueDateTime <= now) {
        newErrors.dueDate = 'Due date and time must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let savedTask;
      
if (task) {
        // Update existing task
        const combinedDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString();
        savedTask = await taskService.update(task.id, {
          ...formData,
          dueDate: combinedDateTime
        });
        toast.success('Task updated successfully!');
      } else {
        // Create new task
        const combinedDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString();
        savedTask = await taskService.create({
          ...formData,
          dueDate: combinedDateTime
        });
        
        // Create email reminders
        await reminderService.createForTask(savedTask.id, savedTask.dueDate);
        toast.success('Task created successfully!');
      }
      
      onTaskCreated?.(savedTask);
      handleClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
setFormData({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '',
        priority: 'medium',
        tags: [],
        checklist: []
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <FormField
              label="Task Title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={errors.title}
              required
              placeholder="Enter task title..."
            />
            
            {/* Description */}
            <FormField label="Description">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                placeholder="Add a description (optional)..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              />
            </FormField>
{/* Due Date, Time & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<FormField
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                error={errors.dueDate}
                required
              />
              
<FormField
                label="Due Time"
                type="time"
                value={formData.dueTime}
                onChange={(e) => handleInputChange('dueTime', e.target.value)}
                error={errors.dueTime}
                required
              />
              
              <FormField label="Priority">
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </FormField>
            </div>
            
            {/* Tags */}
            <FormField label="Tags">
              <TagInput
                value={formData.tags}
                onChange={(tags) => handleInputChange('tags', tags)}
                suggestions={tagSuggestions}
                placeholder="Add tags to organize your task..."
              />
            </FormField>
            
            {/* Checklist */}
            <FormField label="Checklist">
              <ChecklistManager
                checklist={formData.checklist}
                onChange={(checklist) => handleInputChange('checklist', checklist)}
              />
            </FormField>
            
            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={task ? "Save" : "Plus"}
              >
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTaskModal;