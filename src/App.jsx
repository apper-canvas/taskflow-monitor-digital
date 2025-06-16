import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from '@/Layout';
import { routes, routeArray, authRoutes } from '@/config/routes';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          {authRoutes.map(route => (
            <Route
              key={route.id}
              path={route.path}
              element={<route.component />}
            />
          ))}
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/upcoming" replace />} />
            {routeArray.map(route => (
              <Route
                key={route.id}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="z-[9999]"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;