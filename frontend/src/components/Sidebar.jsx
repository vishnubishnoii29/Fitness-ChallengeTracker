import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { LayoutDashboard, Compass, Trophy, Medal, LogOut, Flame, Menu } from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = isCollapsed ? '80px' : '260px';

  return (
    <aside className="sidebar" style={{ 
      width: sidebarWidth, 
      transition: 'width 0.3s ease',
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      overflowX: 'hidden',
      padding: isCollapsed ? '1.5rem 0' : '1.5rem 1.25rem'
    }}>
      {/* Header with Toggle & Logo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: isCollapsed ? '0' : '1rem',
        marginBottom: '2.5rem',
        padding: isCollapsed ? '0' : '0 0.5rem'
      }}>
        <button 
          onClick={toggleSidebar}
          style={{ 
            color: 'var(--text-secondary)', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '0.6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            transition: 'background 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Menu size={24} />
        </button>

        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #fc4c02, #ff7849)', 
              padding: '0.5rem', 
              borderRadius: '10px', 
              color: 'white',
              boxShadow: '0 4px 15px rgba(252,76,2,0.3)',
              flexShrink: 0
            }}>
              <Flame size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fc4c02' }}>FitQuest</h2>
          </div>
        )}
      </div>

      <nav className="nav-links" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'stretch' }}>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Dashboard">
          <LayoutDashboard size={22} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Dashboard</span>}
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Explore">
          <Compass size={22} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Explore</span>}
        </NavLink>
        <NavLink to="/challenges" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Challenges">
          <Trophy size={22} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Challenges</span>}
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Leaderboard">
          <Medal size={22} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Leaderboard</span>}
        </NavLink>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto', alignItems: isCollapsed ? 'center' : 'stretch' }}>
        <button className="nav-link" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b6b', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start' }} title="Logout">
          <LogOut size={22} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
