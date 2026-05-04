import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trophy, Target, Clock, Gift } from 'lucide-react';
import api from '../api';

const Challenges = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const [activeRes, allRes] = await Promise.all([
          api.get('challenges/list/active'),
          api.get('challenges')
        ]);
        setActiveChallenges(activeRes.data);
        
        // Let's filter out the active ones from available ones for realism (mock logic)
        const activeIds = activeRes.data.map(c => c._id);
        const available = allRes.data.filter(c => !activeIds.includes(c._id));
        setAvailableChallenges(available);
      } catch (err) {
        console.error('Error fetching challenges:', err);
      }
    };
    fetchChallenges();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Challenges</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Push your limits and earn rewards.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} /> Create Challenge
        </button>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Target color="var(--primary-color)" /> Active Challenges</h2>
        <div className="grid-2">
          {activeChallenges.map((c, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0' }}>{c.title}</h3>
                  <span className="badge badge-primary">{c.goalType}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{c.progress}%</span>
                </div>
              </div>
              
              <div className="progress-container" style={{ height: '12px', marginBottom: '1rem' }}>
                <div className="progress-bar" style={{ width: `${c.progress}%` }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <span>{c.current} / {c.goal}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {c.daysLeft} days left</span>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Gift size={16} color="var(--warning-color)" /> Reward: <strong>{c.rewardXP} XP - {c.rewardBadge}</strong>
              </div>
            </div>
          ))}
          {activeChallenges.length === 0 && <p>No active challenges. Join one below!</p>}
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trophy color="var(--warning-color)" /> Available Challenges</h2>
        <div className="grid-3">
          {availableChallenges.map((c, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className={`badge ${c.difficulty === 'Easy' ? 'badge-success' : c.difficulty === 'Medium' ? 'badge-warning' : 'badge-primary'}`}>{c.difficulty}</span>
                <span className="badge" style={{ background: 'var(--bg-color)' }}>{c.goalType}</span>
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{c.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 1.5rem 0', flex: 1 }}>
                Goal: {c.goalValue} {c.goalType === 'Distance' ? 'km' : c.goalType === 'Consistency' ? 'Days' : c.goalType === 'Weight Loss' ? 'kcal' : ''}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Duration:</span> <strong>{c.durationDays} Days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Reward:</span> <strong style={{ color: 'var(--warning-color)' }}>{c.rewardXP} XP</strong>
                </div>
              </div>

              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Join Challenge</button>
            </div>
          ))}
          {availableChallenges.length === 0 && <p>No available challenges at the moment.</p>}
        </div>
      </section>

      {/* Modal would go here */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create Challenge</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Challenge Title" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} />
              <textarea placeholder="Description" rows={3} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontFamily: 'inherit' }}></textarea>
              <div className="grid-2">
                <select style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                  <option>Goal Type</option>
                  <option>Distance</option>
                  <option>Time</option>
                  <option>Reps</option>
                </select>
                <input type="number" placeholder="Target Value" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default Challenges;
