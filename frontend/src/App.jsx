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
    const saved = localStorage.getItem('sidebar_preference');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_preference', String(isSidebarCollapsed));
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
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => setErrorData(null), 6000);
      return () => clearTimeout(timer);
    };
    window.addEventListener('app-error', handleError);
    
    const handleGlobalError = (event) => {
      setErrorData({
        message: event.message || 'A runtime error occurred',
        context: 'Global Runtime Error'
      });
    };
    const handleUnhandledRejection = (event) => {
      setErrorData({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        context: 'Global Promise Rejection'
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
          initial={{ opacity: 0, x: 100, y: 0, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            background: 'rgba(26, 26, 26, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            color: 'white',
            maxWidth: '400px',
            cursor: 'pointer'
          }}
          onClick={() => setErrorData(null)}
        >
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            padding: '10px', 
            borderRadius: '12px', 
            color: '#ef4444',
            display: 'flex'
          }}>
            <AlertCircle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              System Notice
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, opacity: 0.9, lineHeight: '1.4' }}>
              {errorData.message || 'An unexpected error occurred.'}
            </p>
            {errorData.context && (
              <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontFamily: 'monospace' }}>
                {errorData.context}
              </p>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setErrorData(null); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>

          {/* Progress bar timer */}
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 6, ease: 'linear' }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              background: '#ef4444',
              borderRadius: '0 0 0 16px'
            }}
          />
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
