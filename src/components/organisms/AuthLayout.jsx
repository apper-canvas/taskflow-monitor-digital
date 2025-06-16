import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 p-8">
          {children}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/10 rounded-full blur-sm"></div>
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-indigo-500/10 rounded-full blur-sm"></div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;