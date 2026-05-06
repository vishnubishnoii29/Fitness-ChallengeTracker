import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trophy, Target, Clock, Gift, X, CheckCircle, Zap } from 'lucide-react';
import api from '../api';

const Challenges = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [levelUpNotification, setLevelUpNotification] = useState(null);
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

  const location = useLocation();

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowCreateModal(true);
      // Clear state so it doesn't reopen on refresh/back
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  const handleStopChallenge = async (challengeId) => {
    try {
      await api.delete(`users/challenges/${challengeId}/stop`);
      const [activeRes, allRes] = await Promise.all([
        api.get('challenges/active'),
        api.get('challenges')
      ]);
      setActiveChallenges(activeRes.data);
      const activeIds = activeRes.data.map(c => c._id);
      const available = allRes.data.filter(c => !activeIds.includes(c._id));
      setAvailableChallenges(available);
    } catch (err) {
      console.error('Error stopping challenge:', err);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      const res = await api.post(`users/challenges/${challengeId}/complete`);
      const [activeRes, allRes] = await Promise.all([
        api.get('challenges/active'),
        api.get('challenges')
      ]);
      setActiveChallenges(activeRes.data);
      const activeIds = activeRes.data.map(c => c._id);
      const available = allRes.data.filter(c => !activeIds.includes(c._id));
      setAvailableChallenges(available);

      if (res.data.levelUp?.leveledUp) {
        setLevelUpNotification(res.data.levelUp);
      }
    } catch (err) {
      console.error('Error completing challenge:', err);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <motion.div variants={cardVariants}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Challenges</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Push your limits and earn exclusive rewards.</p>
        </motion.div>
        <motion.button 
          variants={cardVariants} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary" 
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}
        >
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

      <section style={{ marginBottom: '4rem' }}>
        <motion.h2 variants={cardVariants} style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Target size={24} color="var(--primary-color)" /> Active Challenges
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {activeChallenges.map((c, i) => (
            <motion.div 
              key={i} 
              variants={cardVariants} 
              whileHover={{ y: -5 }}
              className="card" 
              style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderLeft: '4px solid var(--primary-color)', position: 'relative' }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{c.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{c.goalType} • {c.daysLeft} days left</p>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 900, fontSize: '1.25rem' }}>{c.progress}%</span>
                </div>
              </div>
              
              <div className="progress-container" style={{ height: '8px', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                <motion.div 
                  className="progress-bar" 
                  initial={{ width: 0 }}
                  animate={{ width: `${c.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ borderRadius: '20px', background: 'var(--gradient-primary)', boxShadow: '0 0 10px rgba(252, 76, 2, 0.4)' }}
                ></motion.div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 600 }}>
                <span>{c.current} / {c.goal}</span>
                {c.rewardXP && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Zap size={14} /> +{c.rewardXP} XP</span>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-success" 
                  style={{ flex: 2, justifyContent: 'center', padding: '0.75rem' }}
                  onClick={() => handleCompleteChallenge(c._id)}
                >
                  <CheckCircle size={18} /> Complete
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', color: 'var(--danger-color)' }}
                  onClick={() => handleStopChallenge(c._id)}
                >
                  <X size={18} /> Stop
                </button>
              </div>
            </motion.div>
          ))}
          {activeChallenges.length === 0 && (
            <motion.div variants={cardVariants} className="card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5, gridColumn: '1 / -1' }}>
               <Trophy size={40} style={{ margin: '0 auto 1rem' }} />
               <p>No active challenges. Ignite your journey below!</p>
            </motion.div>
          )}
        </div>
      </section>

      <section>
        <motion.h2 variants={cardVariants} style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Trophy size={24} color="#f59e0b" /> Available Challenges
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {availableChallenges.map((c, i) => (
            <motion.div 
              key={i} 
              variants={cardVariants} 
              whileHover={{ y: -5, scale: 1.02 }}
              className="card" 
              style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>CHALLENGE • {c.goalType}</p>
                <Trophy size={16} color="rgba(255,255,255,0.2)" />
              </div>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.3rem', fontWeight: 800 }}>{c.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 1.5rem 0', flex: 1, lineHeight: 1.5 }}>
                {c.description || `Target: ${c.goalValue} ${c.goalType === 'Distance' ? 'km' : 'units'} in ${c.durationDays} days.`}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <span style={{ opacity: 0.6 }}>{c.durationDays} Days</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>+{c.rewardXP} XP</span>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
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

      {levelUpNotification && (
        <motion.div 
          initial={{ opacity: 0, x: 50, scale: 0.9 }} 
          animate={{ opacity: 1, x: 0, scale: 1 }} 
          exit={{ opacity: 0, x: 20, scale: 0.9 }} 
          style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 4000, width: '320px' }}
        >
          <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--primary-color)', background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
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
              <button onClick={() => setLevelUpNotification(null)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '10px' }}>
                Awesome!
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Challenges;
