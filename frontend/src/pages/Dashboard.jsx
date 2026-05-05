import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Trophy, Zap, TrendingUp, Calendar } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [notifUnread, setNotifUnread] = useState(0);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const username = profile?.username ? profile.username.replace('@', '') : 'User';
  const xpValue = profile?.xp !== undefined ? profile.xp : profile?.points;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, challengesRes] = await Promise.all([
          api.get('users/profile'),
          api.get('challenges/active')
        ]);
        setProfile(profileRes.data);
        setActiveChallenges(challengesRes.data);
        // fetch unread notifications count
        try {
          const nres = await api.get('notifications');
          const unread = (nres.data || []).filter(n => !n.read).length;
          setNotifUnread(unread);
        } catch (err) {
          console.error('Unable to fetch notifications count', err);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setProfileMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Active Minutes',
        data: [45, 60, 30, 90, 45, 120, 60],
        borderColor: '#fc4c02',
        backgroundColor: 'rgba(252, 76, 2, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.1)' } },
      x: { grid: { display: false } },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  if (!profile) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'white', gap: '1rem' }}>
      <span style={{
        display: 'inline-block',
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#fc4c02',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.8 }}>Loading dashboard...</p>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <motion.div variants={cardVariants}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: '#fc4c02', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Welcome back, {profile.username ? profile.username.replace('@', '') : 'User'}!</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>You're on a {profile.streak}-day streak. Keep it up!</p>
        </motion.div>
        <motion.div variants={cardVariants} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 'bold', margin: 0 }}>Level {profile.level}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{profile.xp !== undefined ? profile.xp : profile.points} XP</p>
          </div>

          <div className="profile-dropdown-wrap" ref={profileMenuRef}>
            {notifUnread > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--danger-color)', color: 'white', borderRadius: '999px', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 700, border: '2px solid var(--background-color)', zIndex: 10 }}>
                {notifUnread}
              </span>
            )}
            <button
              type="button"
              className="profile-avatar-trigger"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen((v) => !v)}
              title="Profile menu"
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                username[0]?.toUpperCase() || '?'
              )}
            </button>

            {profileMenuOpen && (
              <div className="profile-menu" role="menu" aria-label="Profile menu">
                <div className="profile-menu-header">
                  <div className="profile-menu-avatar">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      username[0]?.toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <div className="profile-menu-title">{username}</div>
                    <div className="profile-menu-subtitle">
                      Level {profile.level} • {xpValue ?? 0} XP
                    </div>
                  </div>
                </div>

                <button
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/profile');
                  }}
                >
                  <span>Profile Settings</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 900 }}>→</span>
                </button>

                <button
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/achievements');
                  }}
                >
                  <span>Achievements</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 900 }}>→</span>
                </button>

                <button
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/notifications');
                  }}
                >
                  <span>Notifications</span>
                  {notifUnread > 0 && <span style={{ marginLeft: 8 }} className="badge badge-primary">{notifUnread}</span>}
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 900 }}>→</span>
                </button>

                <div className="profile-menu-divider" />

                <button
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <span>Logout</span>
                  <span style={{ color: 'var(--danger-color)', fontWeight: 900 }}>→</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </header>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { title: 'Active Calories', value: '1,240', unit: 'kcal', icon: Flame, color: '#fc4c02', bg: 'rgba(252, 76, 2, 0.1)' },
          { title: 'Total Distance', value: '24.5', unit: 'km', icon: Activity, color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
          { title: 'Workout Time', value: '4.2', unit: 'hrs', icon: Zap, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { title: 'Challenges Won', value: '12', unit: '', icon: Trophy, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        ].map((stat, i) => (
          <motion.div key={i} variants={cardVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>{stat.title}</p>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                {stat.value} <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{stat.unit}</span>
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid-2">
        <motion.div variants={cardVariants} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={20} color="var(--primary-color)" /> Activity Overview</h3>
            <select style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div style={{ height: '300px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={20} color="var(--secondary-color)" /> Active Challenges</h3>
            <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeChallenges.map((challenge, i) => (
              <div key={i} style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{challenge.title}</h4>
                  <span className="badge badge-primary">{challenge.goalType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>{challenge.progress}% completed</span>
                  <span>{challenge.daysLeft} days left</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${challenge.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
