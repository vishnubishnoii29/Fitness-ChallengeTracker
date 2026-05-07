import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Workouts from './pages/Workouts';
import Routines from './pages/Routines';
import Challenges from './pages/Challenges';
import Leaderboard from './pages/Leaderboard';
import Social from './pages/Social';
import ProfileSettings from './pages/ProfileSettings';
import Notifications from './pages/Notifications';
import Achievements from './pages/Achievements';
import AICoach from './pages/AICoach';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: 'white', fontWeight: 'bold' }}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="app-container">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
      />
      <main className="main-content" style={{ 
        marginLeft: isSidebarCollapsed ? '80px' : '260px',
        transition: 'margin-left 0.3s ease',
        maxWidth: isSidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 260px)'
      }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/social" element={<Social />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const GlobalErrorOverlay = () => {
  const [errorData, setErrorData] = useState(null);

  useEffect(() => {
    const handleError = (e) => {
      setErrorData(e.detail);
    };
    window.addEventListener('app-error', handleError);
    
    // Also catch unhandled promises and errors globally
    const handleGlobalError = (event) => {
      setErrorData({
        message: event.message || 'A runtime error occurred',
        context: 'Global Runtime Error',
        details: event.error?.stack || ''
      });
    };
    const handleUnhandledRejection = (event) => {
      setErrorData({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        context: 'Global Promise Rejection',
        details: event.reason?.stack || JSON.stringify(event.reason)
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('app-error', handleError);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <AnimatePresence>
      {errorData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '2rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            style={{
              background: '#1a1a1a',
              border: '1px solid #ef4444',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '800px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
              color: 'white',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#ef4444' }}>
              <AlertCircle size={32} />
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>System Error Detected</h2>
              <button 
                onClick={() => setErrorData(null)}
                style={{ marginLeft: 'auto', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fca5a5' }}>Error Message</h3>
              <p style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444', margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
                {errorData.message || 'An unknown error occurred.'}
              </p>
            </div>

            {errorData.context && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Context / Endpoint</h3>
                <code style={{ display: 'block', background: '#0a0a0a', padding: '0.75rem', borderRadius: '8px', color: '#fbbf24', border: '1px solid #374151' }}>
                  {errorData.context}
                </code>
              </div>
            )}

            {errorData.details && (
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Exact Error Details</h3>
                <pre style={{ 
                  background: '#0a0a0a', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  overflowX: 'auto',
                  color: '#9ca3af',
                  fontSize: '0.9rem',
                  border: '1px solid #374151',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {errorData.details}
                </pre>
              </div>
            )}
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setErrorData(null)}
                className="btn btn-primary"
                style={{ background: '#ef4444', border: 'none' }}
              >
                Dismiss Error
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    // Prevent browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Scroll to top on initial load
    window.scrollTo(0, 0);
  }, []);

  return (
    <AuthProvider>
      <Router>
        {/* Global Background Image */}
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fm=jpg&q=80&w=3000&auto=format&fit=crop"
          alt="Gym background"
          className="gym-bg-fixed"
        />

        {/* Global Dark Overlay */}
        <div className="overlay-fixed" />
        
        <GlobalErrorOverlay />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
