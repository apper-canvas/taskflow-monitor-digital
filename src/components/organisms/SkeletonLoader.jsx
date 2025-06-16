import { motion } from 'framer-motion';

const SkeletonCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay }}
    className="bg-white rounded-lg border border-gray-200 p-4"
  >
    <div className="animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-5 h-5 bg-gray-200 rounded border-2 mt-1"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="w-12 h-5 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
      
      <div className="flex space-x-2 mb-3">
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        <div className="h-5 bg-gray-200 rounded-full w-20"></div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  </motion.div>
);

const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} delay={index * 0.1} />
      ))}
    </div>
  );
};

export default SkeletonLoader;