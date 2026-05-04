import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Trophy, Zap, TrendingUp, Calendar } from 'lucide-react';
import api from '../api';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, challengesRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/challenges/active')
        ]);
        setProfile(profileRes.data);
        setActiveChallenges(challengesRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

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

  if (!profile) return <div>Loading...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Welcome back, <span className="text-gradient">{profile.username.replace('@', '')}!</span> 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>You're on a {profile.streak}-day streak. Keep it up!</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 'bold', margin: 0 }}>Level {profile.level}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{profile.xp || profile.points} XP</p>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem', overflow: 'hidden' }}>
            {profile.avatar ? <img src={profile.avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : profile.username[1].toUpperCase()}
          </div>
        </div>
      </header>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { title: 'Active Calories', value: '1,240', unit: 'kcal', icon: Flame, color: '#fc4c02', bg: 'rgba(252, 76, 2, 0.1)' },
          { title: 'Total Distance', value: '24.5', unit: 'km', icon: Activity, color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
          { title: 'Workout Time', value: '4.2', unit: 'hrs', icon: Zap, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { title: 'Challenges Won', value: '12', unit: '', icon: Trophy, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>{stat.title}</p>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                {stat.value} <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{stat.unit}</span>
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
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
        </div>

        <div className="card">
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
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
