import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Compass, Trophy, Medal, Settings, LogOut, Sun, Moon, Flame } from 'lucide-react';

const Sidebar = ({ theme, toggleTheme }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--gradient-primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
          <Flame size={24} />
        </div>
        <h2 style={{ margin: 0 }} className="text-gradient">FitQuest</h2>
      </div>

      <nav className="nav-links" style={{ flex: 1 }}>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Compass size={20} />
          <span>Explore</span>
        </NavLink>
        <NavLink to="/challenges" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Trophy size={20} />
          <span>Challenges</span>
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Medal size={20} />
          <span>Leaderboard</span>
        </NavLink>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--gradient-primary)', color: 'white', border: 'none' }}>
          <h4 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>Pro Plan</h4>
          <p style={{ fontSize: '0.875rem', margin: '0 0 1rem 0', opacity: 0.9 }}>Unlock all premium features</p>
          <button className="btn" style={{ background: 'white', color: 'var(--primary-color)', width: '100%', fontSize: '0.875rem' }}>Upgrade Now</button>
        </div>

        <button className="nav-link" onClick={toggleTheme} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button className="nav-link" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--danger-color)' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
