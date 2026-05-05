import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trophy, Target, Clock, Gift } from 'lucide-react';
import api from '../api';

const Challenges = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [error, setError] = useState('');
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    durationDays: '',
    goalType: '',
    goalValue: '',
    difficulty: 'Medium'
  });

  const handleJoinChallenge = async (challengeId) => {
    try {
      await api.post(`users/challenges/${challengeId}/join`);
      
      // Refresh challenges after joining
      const [activeRes, allRes] = await Promise.all([
        api.get('challenges/active'),
        api.get('challenges')
      ]);
      setActiveChallenges(activeRes.data);
      
      const activeIds = activeRes.data.map(c => c._id);
      const available = allRes.data.filter(c => !activeIds.includes(c._id));
      setAvailableChallenges(available);
    } catch (err) {
      console.error('Error joining challenge:', err);
      setError('Failed to join challenge. Please try again.');
    }
  };

  const handleCreateChallenge = async () => {
    try {
      // Validate required fields
      if (!newChallenge.title || !newChallenge.durationDays || !newChallenge.goalType || !newChallenge.goalValue) {
        setError('Please fill in all required fields');
        return;
      }

      await api.post('challenges', {
        title: newChallenge.title,
        description: newChallenge.description,
        durationDays: parseInt(newChallenge.durationDays),
        goalType: newChallenge.goalType,
        goalValue: parseInt(newChallenge.goalValue),
        difficulty: newChallenge.difficulty
      });

      // Reset form and close modal
      setNewChallenge({
        title: '',
        description: '',
        durationDays: '',
        goalType: '',
        goalValue: '',
        difficulty: 'Medium'
      });
      setError('');
      setShowCreateModal(false);

      // Refresh challenges list
      const [activeRes, allRes] = await Promise.all([
        api.get('challenges/active'),
        api.get('challenges')
      ]);
      setActiveChallenges(activeRes.data);
      
      const activeIds = activeRes.data.map(c => c._id);
      const available = allRes.data.filter(c => !activeIds.includes(c._id));
      setAvailableChallenges(available);
    } catch (err) {
      console.error('Error creating challenge:', err);
      setError(err.response?.data?.message || 'Failed to create challenge. Please try again.');
    }
  };

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const [activeRes, allRes] = await Promise.all([
          api.get('challenges/active'),
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <motion.div variants={cardVariants}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: '#fc4c02', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Challenges</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Push your limits and earn rewards.</p>
        </motion.div>
        <motion.button variants={cardVariants} className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} /> Create Challenge
        </motion.button>
      </div>

      {/* Global error banner */}
      {error && (
        <motion.div variants={cardVariants} className="error-msg" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: 0 }}>×</button>
        </motion.div>
      )}

      <section style={{ marginBottom: '3rem' }}>
        <motion.h2 variants={cardVariants} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Target color="var(--primary-color)" /> Active Challenges</motion.h2>
        <div className="grid-2">
          {activeChallenges.map((c, i) => (
            <motion.div key={i} variants={cardVariants} className="card">
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
            </motion.div>
          ))}
          {activeChallenges.length === 0 && <motion.p variants={cardVariants}>No active challenges. Join one below!</motion.p>}
        </div>
      </section>

      <section>
        <motion.h2 variants={cardVariants} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trophy color="var(--warning-color)" /> Available Challenges</motion.h2>
        <div className="grid-3">
          {availableChallenges.map((c, i) => (
            <motion.div key={i} variants={cardVariants} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
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

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleJoinChallenge(c._id)}
              >
                Join Challenge
              </button>
            </motion.div>
          ))}
          {availableChallenges.length === 0 && <motion.p variants={cardVariants}>No available challenges at the moment.</motion.p>}
        </div>
      </section>

      {/* Modal would go here */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="card" 
            style={{ width: '100%', maxWidth: '500px' }}
          >
            <h2 style={{ marginBottom: '1.5rem' }}>Create Challenge</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Challenge Title" 
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
              />
              <textarea 
                placeholder="Description" 
                rows={3}
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              ></textarea>
              <div className="grid-2">
                <select 
                  value={newChallenge.goalType}
                  onChange={(e) => setNewChallenge({...newChallenge, goalType: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                >
                  <option value="">Goal Type</option>
                  <option value="Distance">Distance</option>
                  <option value="Time">Time</option>
                  <option value="Reps">Reps</option>
                  <option value="Consistency">Consistency</option>
                  <option value="Weight Loss">Weight Loss</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Target Value" 
                  value={newChallenge.goalValue}
                  onChange={(e) => setNewChallenge({...newChallenge, goalValue: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                />
              </div>
              <div className="grid-2">
                <input 
                  type="number" 
                  placeholder="Duration (Days)" 
                  value={newChallenge.durationDays}
                  onChange={(e) => setNewChallenge({...newChallenge, durationDays: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                />
                <select 
                  value={newChallenge.difficulty}
                  onChange={(e) => setNewChallenge({...newChallenge, difficulty: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreateChallenge}>Create</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default Challenges;
