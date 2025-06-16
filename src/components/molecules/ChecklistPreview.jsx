import ApperIcon from '@/components/ApperIcon';

const ChecklistPreview = ({ checklist, completed, total }) => {
  if (!checklist || checklist.length === 0) return null;

  const visibleItems = checklist.slice(0, 2);
  const hasMore = checklist.length > 2;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span className="flex items-center">
          <ApperIcon name="CheckSquare" size={12} className="mr-1" />
          Checklist
        </span>
        <span>{completed}/{total} completed</span>
      </div>
      
      {visibleItems.map((item) => (
        <div key={item.id} className="flex items-center space-x-2 text-sm">
          <div className={`w-3 h-3 rounded border flex items-center justify-center ${
            item.completed 
              ? 'bg-success border-success text-white' 
              : 'border-gray-300'
          }`}>
            {item.completed && <ApperIcon name="Check" size={8} />}
          </div>
          <span className={`text-gray-600 break-words ${
            item.completed ? 'line-through text-gray-400' : ''
          }`}>
            {item.text}
          </span>
        </div>
      ))}
      
      {hasMore && (
        <div className="text-xs text-gray-500 ml-5">
          +{checklist.length - 2} more items
        </div>
      )}
    </div>
  );
};

export default ChecklistPreview;