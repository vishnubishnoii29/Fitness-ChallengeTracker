import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, Users, Globe, Calendar, ChevronUp, ChevronDown, Award } from 'lucide-react';
import api from '../api';

const Leaderboard = () => {
  const [filter, setFilter] = useState('Global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/users/leaderboard');
        setLeaderboardData(res.data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [filter]);

  if (loading) return <div>Loading Leaderboard...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Leaderboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>See how you stack up against the community.</p>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--surface-color)', padding: '0.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          {['Global', 'Friends', 'Weekly'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                background: filter === f ? 'var(--bg-color)' : 'transparent',
                color: filter === f ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: filter === f ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {f === 'Global' && <Globe size={16} />}
              {f === 'Friends' && <Users size={16} />}
              {f === 'Weekly' && <Calendar size={16} />}
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 'bold' }}>
            <Award size={16} /> RANK & USER
          </div>
          <div style={{ display: 'flex', gap: '4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 'bold' }}>
            <span style={{ width: '80px', textAlign: 'center' }}>LEVEL</span>
            <span style={{ width: '80px', textAlign: 'center' }}>STREAK</span>
            <span style={{ width: '100px', textAlign: 'right' }}>POINTS</span>
          </div>
        </div>

        <div>
          {leaderboardData.map((user, i) => (
            <div 
              key={i} 
              style={{ 
                padding: '1rem 1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: i !== leaderboardData.length - 1 ? '1px solid var(--border-color)' : 'none',
                background: user.isCurrentUser ? 'rgba(252, 76, 2, 0.05)' : 'transparent',
                transition: 'background 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '30px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem', color: user.rank <= 3 ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                  {user.rank}
                </div>
                <div style={{ position: 'relative' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--border-color)' }}></div>
                  )}
                  {user.rank === 1 && <Medal size={20} color="#f59e0b" style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--surface-color)', borderRadius: '50%' }} />}
                  {user.rank === 2 && <Medal size={20} color="#94a3b8" style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--surface-color)', borderRadius: '50%' }} />}
                  {user.rank === 3 && <Medal size={20} color="#b45309" style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--surface-color)', borderRadius: '50%' }} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0 }}>{user.username.replace('@', '')}</h4>
                    {user.isCurrentUser && <span className="badge badge-primary" style={{ padding: '0.1rem 0.5rem', fontSize: '0.65rem' }}>YOU</span>}
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.username}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
                <div style={{ width: '80px', textAlign: 'center', fontWeight: '600' }}>
                  {user.level}
                </div>
                <div style={{ width: '80px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--warning-color)', fontWeight: '600' }}>
                  🔥 {user.streak}
                </div>
                <div style={{ width: '100px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {user.trend === 'up' ? <ChevronUp size={16} color="var(--success-color)" /> : <ChevronDown size={16} color="var(--danger-color)" />}
                  <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{user.points ? user.points.toLocaleString() : 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
