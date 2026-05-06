import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
