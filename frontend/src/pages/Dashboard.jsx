import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Flame, Trophy, Zap, TrendingUp, Calendar, Plus, X, CheckCircle, Target, Sparkles, AlertCircle } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.js';
import '../index.css';
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
  const [activeWorkouts, setActiveWorkouts] = useState([]);
  const [activeTab, setActiveTab] = useState('challenges');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [weeklyActivity, setWeeklyActivity] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [error, setError] = useState(null);
  const [levelUpNotification, setLevelUpNotification] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({ age: '', height: '', weight: '' });
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const username = profile?.username ? profile.username.replace('@', '') : 'User';
  const xpValue = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  
  // Progress bar logic - we still need this for the UI ring
  const getXPForLevel = (l) => l <= 1 ? 0 : 500 * (l * l - l);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const currentLevelMinXP = getXPForLevel(currentLevel);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const processActivityData = useCallback((activities) => {
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    activities.forEach(activity => {
      const activityDate = new Date(activity.createdAt);
      if (activityDate >= weekStart) {
        const dayIndex = activityDate.getDay();
        const calories = Number(activity.data?.calories) || 0;
        weeklyData[dayIndex] += calories;
      }
    });

    setWeeklyActivity(weeklyData);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, challengesRes, workoutsRes, activityRes, allChallengesRes] = await Promise.all([
        api.get('users/profile'),
        api.get('challenges/active'),
        api.get('users/workouts/active'),
        api.get('activity/user'),
        api.get('challenges')
      ]);

      setProfile(profileRes.data);
      setActiveChallenges(challengesRes.data);
      setActiveWorkouts(workoutsRes.data);
      
      // Trigger onboarding if metrics are missing
      if (!profileRes.data.age || !profileRes.data.height || !profileRes.data.weight) {
        setShowOnboarding(true);
      }
      
      const allChallenges = allChallengesRes.data;
      processActivityData(activityRes.data || [], challengesRes.data || [], allChallenges || []);

      // Fetch AI Insight
      setLoadingAI(true);
      try {
        const aiRes = await api.get('ai/insights', { _silent: true });
        console.log('[DEBUG] Dashboard AI Insight response:', aiRes.data);
        setAiInsight(aiRes.data.insight);
      } catch (err) {
        console.error('Error fetching AI insight:', err);
        const exactError = err.response?.data?.message || err.message;
        setAiInsight(`AI Error: ${exactError}`);
      } finally {
        setLoadingAI(false);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  }, [processActivityData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const handleStopChallenge = async (challengeId) => {
    try {
      await api.delete(`users/challenges/${challengeId}/stop`);
      await fetchData();
    } catch (err) {
      console.error('Error stopping challenge:', err);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    const challengeToComplete = activeChallenges.find(c => c._id === challengeId);
    setActiveChallenges(prev => prev.filter(c => c._id !== challengeId));
    
    setStatusMessage({ type: 'success', text: `Challenge "${challengeToComplete?.title || ''}" Completed!` });
    setTimeout(() => setStatusMessage(null), 3000);

    try {
      const response = await api.post(`users/challenges/${challengeId}/complete`);
      await fetchData();
      
      if (response.data.levelUp?.leveledUp) {
        setLevelUpNotification(response.data.levelUp);
        setTimeout(() => setLevelUpNotification(null), 8000);
      }
    } catch (err) {
      console.error('Error completing challenge:', err);
      fetchData();
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setOnboardingSubmitting(true);
    try {
      await api.put('users/profile', {
        age: parseInt(onboardingForm.age),
        height: parseInt(onboardingForm.height),
        weight: parseInt(onboardingForm.weight)
      });
      setShowOnboarding(false);
      fetchData();
      setStatusMessage({ type: 'success', text: 'Profile completed!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setOnboardingSubmitting(false);
    }
  };

  const handleStopWorkout = async (workoutId) => {
    try {
      await api.delete(`users/workouts/${workoutId}/stop`);
      await fetchData();
    } catch (err) {
      console.error('Error stopping workout:', err);
    }
  };

  const handleCompleteWorkout = async (workoutId) => {
    setActiveWorkouts(prev => prev.filter(w => w._id !== workoutId));

    setStatusMessage({ type: 'success', text: `Activity Completed!` });
    setTimeout(() => setStatusMessage(null), 3000);

    try {
      const response = await api.post(`users/workouts/${workoutId}/complete`);
      await fetchData();
      
      if (response.data.levelUp?.leveledUp) {
        setLevelUpNotification(response.data.levelUp);
        setTimeout(() => setLevelUpNotification(null), 8000);
      }
    } catch (err) {
      console.error('Error completing workout:', err);
      fetchData();
    }
  };

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileMenuOpen]);

  const chartData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{ 
      fill: true, 
      label: 'Calories Burned', 
      data: weeklyActivity, 
      borderColor: 'var(--primary-color)', 
      backgroundColor: 'rgba(252, 76, 2, 0.1)', 
      tension: 0.4 
    }],
  };

  const chartOptions = { 
    responsive: true, 
    plugins: { legend: { display: false } }, 
    scales: { 
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { weight: '600' } }
      }, 
      x: { 
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { weight: '600' } }
      } 
    } 
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

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', color: 'white' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)', maxWidth: '350px' }}>
        <AlertCircle size={32} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Connection Issue</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{error}</p>
        <button onClick={() => { setError(null); fetchData(); }} className="btn btn-primary" style={{ background: '#ef4444', border: 'none', width: '100%' }}>
          Reconnect
        </button>
      </motion.div>
    </div>
  );

  if (!profile) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'white' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(252, 76, 2, 0.2)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
      <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Loading your fitness journey...</p>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="dashboard-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <motion.div variants={cardVariants}>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>Welcome back, {username}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>You're on a {profile.streak || 1}-day streak. Keep it up!</p>
        </motion.div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>LEVEL</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-color)', lineHeight: 1 }}>{currentLevel || 1}</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{(xpValue || 0).toLocaleString()}</span>
              <span style={{ margin: '0 0.25rem', opacity: 0.5 }}>/</span>
              <span>{(nextLevelXP || 1000).toLocaleString()} XP</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <motion.div 
              style={{ position: 'relative', cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              {/* Progress Ring */}
              <svg width="60" height="60" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: -7, left: -7 }}>
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                  fill="none"
                />
                <motion.circle
                  cx="30"
                  cy="30"
                  r="26"
                  stroke="var(--primary-color)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="163.36"
                  initial={{ strokeDashoffset: 163.36 }}
                  animate={{ strokeDashoffset: 163.36 - (163.36 * Math.min(1, Math.max(0, (xpValue - currentLevelMinXP) / (nextLevelXP - currentLevelMinXP)))) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px var(--primary-color))' }}
                />
              </svg>

              {/* Profile Image with Glow */}
              <div style={{ 
                width: '45px', 
                height: '45px', 
                borderRadius: '50%', 
                padding: '2px',
                background: 'linear-gradient(45deg, var(--primary-color), #ff7849)',
                boxShadow: '0 0 15px rgba(252, 76, 2, 0.2)',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0a0a0a' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, border: '2px solid #0a0a0a' }}>
                    {username[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Level Badge */}
              <div style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                background: 'var(--primary-color)',
                color: 'white',
                fontSize: '0.6rem',
                fontWeight: 900,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0a0a0a',
                zIndex: 2,
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
              }}>
                {currentLevel || 1}
              </div>
            </motion.div>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div ref={profileMenuRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="profile-dropdown" style={{ top: '55px', right: 0, zIndex: 1000 }}>
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 800 }}>{username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Level {currentLevel} • {xpValue} XP</div>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <button className="dropdown-item" onClick={() => navigate('/profile')}>Account Settings</button>
                    <button className="dropdown-item" onClick={() => navigate('/notifications')}>Notifications</button>
                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
                    <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--danger-color)' }}>Sign Out</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* AI Insight Bar - ALWAYS VISIBLE */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card" 
        style={{ 
          marginBottom: '2rem', 
          padding: '1rem 1.5rem', 
          background: 'linear-gradient(90deg, rgba(252, 76, 2, 0.15), rgba(255, 120, 73, 0.05))',
          border: '1px solid rgba(252, 76, 2, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div style={{ 
          background: 'var(--primary-color)', 
          padding: '0.6rem', 
          borderRadius: '10px', 
          color: 'white',
          boxShadow: '0 4px 10px rgba(252, 76, 2, 0.3)'
        }}>
          <Sparkles size={20} className={loadingAI ? "spin-pulse" : ""} />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.1rem' }}>AI COACH INSIGHT</span>
          <div style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>
            {aiInsight || (loadingAI ? "Syncing with AI Coach..." : "Ready to guide your fitness journey!")}
          </div>
        </div>
        <button 
          onClick={() => navigate('/ai-coach')}
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '0.5rem 1rem', 
            color: 'white', 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            cursor: 'pointer' 
          }}
        >
          Chat Now
        </button>
      </motion.div>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="grid-4">
            {[
              { label: 'Burned Calories', value: `${Math.round(profile?.stats?.burnedCalories || 0).toLocaleString()}`, unit: 'kcal', icon: Flame, color: '#fc4c02' },
              { label: 'Total Distance', value: `${(profile?.stats?.totalDistance || 0).toFixed(1)}`, unit: 'km', icon: Activity, color: '#4f46e5' },
              { label: 'Workout Time', value: `${(profile?.stats?.workoutTime / 60 || 0).toFixed(1)}`, unit: 'hrs', icon: Zap, color: '#10b981' },
              { label: 'Challenges Won', value: `${profile?.stats?.challengesWon || 0}`, unit: '', icon: Trophy, color: '#f59e0b' }
            ].map((stat, i) => (
              <motion.div key={i} variants={cardVariants} 
                whileHover={{ y: -5, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'default' }}
              >
                <div style={{ 
                  color: stat.color, 
                  background: `${stat.color}20`, 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0,
                  border: `1px solid ${stat.color}30`
                }}>
                  <stat.icon size={26} strokeWidth={2.5} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap' }}>{stat.label}</p>
                  <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 900, display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    {stat.value}
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>{stat.unit}</span>
                  </h2>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={cardVariants} className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
              {['challenges', 'workouts', 'routines'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '1rem', fontSize: '0.85rem', fontWeight: 800, color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : 'none', background: activeTab === tab ? 'rgba(255,255,255,0.03)' : 'none' }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '500px' }}>
              {activeTab === 'challenges' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {activeChallenges.length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '3rem 1rem' }}>
                      <Trophy size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p style={{ fontSize: '0.9rem' }}>No active challenges</p>
                    </div>
                  ) : (
                    activeChallenges.map(c => (
                      <motion.div 
                        key={c._id} 
                        variants={cardVariants} 
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="card" 
                        style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderLeft: '4px solid var(--primary-color)', position: 'relative' }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{c.title}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{c.goalType} • {c.daysLeft} days left</p>
                          <span style={{ color: 'var(--primary-color)', fontWeight: 900, fontSize: '1rem' }}>{c.progress}%</span>
                        </div>
                        
                        <div className="progress-container" style={{ height: '8px', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                          <motion.div 
                            className="progress-bar" 
                            initial={{ width: 0 }}
                            animate={{ width: `${c.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ borderRadius: '20px', background: 'var(--gradient-primary)', boxShadow: '0 0 10px rgba(252, 76, 2, 0.4)' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', fontWeight: 600 }}>
                          <span>{c.current || 0} / {c.goal || 0}</span>
                          {c.rewardXP && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Zap size={14} /> +{c.rewardXP} XP</span>}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button 
                            onClick={() => handleCompleteChallenge(c._id)} 
                            className="btn btn-success" 
                            style={{ flex: 2, justifyContent: 'center', padding: '0.75rem' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle size={18} /> Complete
                          </button>
                          <button 
                            onClick={() => handleStopChallenge(c._id)} 
                            className="btn btn-secondary" 
                            style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', color: 'var(--danger-color)' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <X size={18} /> Stop
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
              {activeTab === 'workouts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {activeWorkouts.filter(w => w.kind !== 'Routine').length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '3rem 1rem' }}>
                      <Activity size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p style={{ fontSize: '0.9rem' }}>No active workouts</p>
                    </div>
                  ) : (
                    activeWorkouts.filter(w => w.kind !== 'Routine').map(w => (
                      <motion.div 
                        key={w._id} 
                        variants={cardVariants} 
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="card" 
                        style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderLeft: '4px solid var(--primary-color)', position: 'relative' }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{w.title}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{w.type} • {w.duration}</p>
                          <Activity size={18} color="var(--primary-color)" />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button 
                            onClick={() => handleCompleteWorkout(w._id)} 
                            className="btn btn-success" 
                            style={{ flex: 2, justifyContent: 'center', padding: '0.75rem' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle size={18} /> Complete
                          </button>
                          <button 
                            onClick={() => handleStopWorkout(w._id)} 
                            className="btn btn-secondary" 
                            style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', color: 'var(--danger-color)' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <X size={18} /> Stop
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
              {activeTab === 'routines' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {activeWorkouts.filter(w => w.kind === 'Routine').length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '3rem 1rem' }}>
                      <Calendar size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p style={{ fontSize: '0.9rem' }}>No active routines</p>
                    </div>
                  ) : (
                    activeWorkouts.filter(w => w.kind === 'Routine').map(r => (
                      <motion.div 
                        key={r._id} 
                        variants={cardVariants} 
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="card" 
                        style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderLeft: '4px solid var(--primary-color)', position: 'relative' }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{r.title}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{r.type} • Daily Habit</p>
                          <Target size={18} color="var(--primary-color)" />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button 
                            onClick={() => handleCompleteWorkout(r._id)} 
                            className="btn btn-success" 
                            style={{ flex: 2, justifyContent: 'center', padding: '0.75rem' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle size={18} /> Log Daily
                          </button>
                          <button 
                            onClick={() => handleStopWorkout(r._id)} 
                            className="btn btn-secondary" 
                            style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', color: 'var(--danger-color)' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <X size={18} /> Stop
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div 
            variants={cardVariants} 
            whileHover={{ y: -3, scale: 1.005 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="card" 
            style={{ padding: '1.25rem' }}
          >
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} color="var(--primary-color)" /> Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.6rem', fontSize: '0.8rem' }} 
                onClick={() => navigate('/explore')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                New Workout
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.6rem', fontSize: '0.8rem' }} 
                onClick={() => navigate('/challenges')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                View Challenges
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.6rem', fontSize: '0.8rem' }} 
                onClick={() => navigate('/challenges', { state: { openCreate: true } })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Create Challenge
              </button>
            </div>
          </motion.div>

          <motion.div 
            variants={cardVariants} 
            className="card" 
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1.25rem 1.25rem 0 1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={20} color="var(--primary-color)" /> Activity Overview
              </h3>
            </div>
            <div style={{ height: '350px', padding: '0 1.25rem 1.25rem 1.25rem' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {statusMessage && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}>
            <div className="card" style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', background: 'rgba(16, 185, 129, 0.9)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <CheckCircle size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{statusMessage.text}</span>
            </div>
          </motion.div>
        )}
        {levelUpNotification && (
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }} 
            exit={{ opacity: 0, x: 20, scale: 0.9 }} 
            style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 4000, width: '320px' }}
          >
            <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              {/* Animated glow effect */}
              <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(252,76,2,0.1) 0%, transparent 70%)', zIndex: 0 }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 5px 15px rgba(252,76,2,0.3)' }}>
                    🎉
                  </div>
                  <button onClick={() => setLevelUpNotification(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>
                
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem', color: 'white' }}>Level Up!</h2>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  You've reached <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>Level {levelUpNotification.newLevel}</span>
                </p>
                
                <button 
                  onClick={() => setLevelUpNotification(null)} 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '10px' }}
                >
                  Awesome!
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {showOnboarding && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, backdropFilter: 'blur(20px)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="card" 
              style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <TrendingUp size={24} color="white" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>Complete Profile</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Set your metrics to start tracking progress.</p>
              </div>

              <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Age</label>
                  <input 
                    type="number" 
                    placeholder="Enter your age"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                    value={onboardingForm.age}
                    onChange={(e) => setOnboardingForm({...onboardingForm, age: e.target.value})}
                    required
                  />
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Height (cm)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 175"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                      value={onboardingForm.height}
                      onChange={(e) => setOnboardingForm({...onboardingForm, height: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 70"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                      value={onboardingForm.weight}
                      onChange={(e) => setOnboardingForm({...onboardingForm, weight: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={onboardingSubmitting}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {onboardingSubmitting ? 'Saving...' : 'Start My Journey'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
