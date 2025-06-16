import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session on app start
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { user: loggedInUser } = await authService.login(email, password);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const { user: newUser } = await authService.signup(userData);
      setUser(newUser);
      setIsAuthenticated(true);
      toast.success(`Welcome to TaskFlow, ${newUser.name}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.info('You have been logged out');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};