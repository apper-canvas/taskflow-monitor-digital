import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ChecklistManager = ({ checklist = [], onChange }) => {
  const [newItemText, setNewItemText] = useState('');

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        completed: false
      };
      onChange([...checklist, newItem]);
      setNewItemText('');
    }
  };

  const removeItem = (id) => {
    onChange(checklist.filter(item => item.id !== id));
  };

  const toggleItem = (id) => {
    onChange(
      checklist.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const updateItemText = (id, text) => {
    onChange(
      checklist.map(item =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3">
      {/* Add new item */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a checklist item..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        />
        <Button
          type="button"
          onClick={addItem}
          disabled={!newItemText.trim()}
          size="sm"
          icon="Plus"
        >
          Add
        </Button>
      </div>

      {/* Checklist items */}
      <AnimatePresence>
        {checklist.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                item.completed
                  ? 'bg-success border-success text-white'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {item.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="animate-spring"
                >
                  <ApperIcon name="Check" size={10} />
                </motion.div>
              )}
            </motion.button>

            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItemText(item.id, e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-sm ${
                item.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            />

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="text-gray-400 hover:text-error transition-colors p-1"
            >
              <ApperIcon name="Trash2" size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {checklist.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <ApperIcon name="CheckSquare" size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No checklist items yet</p>
          <p className="text-xs">Add items to break down your task</p>
        </div>
      )}
    </div>
  );
};

export default ChecklistManager;