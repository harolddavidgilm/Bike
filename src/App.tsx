import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Garage from './pages/Garage';
import Documents from './pages/Documents';
import Maintenance from './pages/Maintenance';
import Settings from './pages/Settings';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[var(--color-neon-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-[var(--color-text-secondary)] text-xs font-mono uppercase tracking-widest">VERIFICANDO_ACCESO...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRedirect />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="garage" element={<Garage />} />
            <Route path="documents" element={<Documents />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Redirect logged-in users away from login page
const LoginRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
};

export default App;
