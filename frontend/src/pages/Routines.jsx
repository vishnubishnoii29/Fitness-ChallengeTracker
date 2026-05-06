import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListTodo, Clock, X, CheckCircle, Target, Sparkles, Layout } from 'lucide-react';
import api from '../api';
import '../index.css';

const Routines = () => {
  const [activeRoutines, setActiveRoutines] = useState([]);
  const [availableRoutines, setAvailableRoutines] = useState([]);
  const [levelUpNotification, setLevelUpNotification] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [newRoutine, setNewRoutine] = useState({
    title: '',
    description: '',
    type: 'Consistency',
    duration: 'Daily',
    difficulty: 'Easy'
  });

  const fetchRoutines = async () => {
    try {
      const [activeRes, allRes] = await Promise.all([
        api.get('users/workouts/active'),
        api.get('workouts')
      ]);
      
      // Filter for routines only
      const active = (activeRes.data || []).filter(w => w.kind === 'Routine');
      const all = (allRes.data || []).filter(w => w.kind === 'Routine');
      
      setActiveRoutines(active);
      
      const activeIds = active.map(w => w.workoutId?._id || w._id);
      setAvailableRoutines(all.filter(w => !activeIds.includes(w._id)));
    } catch (err) {
      console.error('Error fetching routines:', err);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchRoutines();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleActivateRoutine = async (routineId) => {
    try {
      await api.post(`users/workouts/${routineId}/start`);
      fetchRoutines();
    } catch (err) {
      console.error('Error activating routine:', err);
    }
  };

  const handleDeactivateRoutine = async (routineId) => {
    try {
      await api.delete(`users/workouts/${routineId}/stop`);
      fetchRoutines();
    } catch (err) {
      console.error('Error deactivating routine:', err);
    }
  };

  const handleLogDaily = async (routineId) => {
    try {
      const res = await api.post(`users/workouts/${routineId}/complete`);
      fetchRoutines();
      if (res.data.levelUp?.leveledUp) {
        setLevelUpNotification(res.data.levelUp);
      }
    } catch (err) {
      console.error('Error logging routine:', err);
    }
  };

  const handleCreateRoutine = async () => {
    try {
      if (!newRoutine.title || !newRoutine.type) {
        setError('Please fill in all required fields');
        return;
      }

      await api.post('workouts', {
        ...newRoutine,
        kind: 'Routine'
      });

      setNewRoutine({ title: '', description: '', type: 'Consistency', duration: 'Daily', difficulty: 'Easy' });
      setShowCreateModal(false);
      fetchRoutines();
    } catch (err) {
      console.error('Error creating routine:', err);
      setError('Failed to create routine');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <motion.div variants={cardVariants}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Daily Routines</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Build lasting habits with recurring daily plans.</p>
        </motion.div>
        <motion.button 
          variants={cardVariants} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary" 
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}
        >
          <Plus size={20} /> Create Routine
        </motion.button>
      </div>

      {error && (
        <div className="error-msg" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Current Focus Section */}
      <section style={{ marginBottom: '4rem' }}>
        <motion.h2 variants={cardVariants} style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Target size={24} color="var(--primary-color)" /> Active Focus
        </motion.h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
          {activeRoutines.length > 0 ? (
            activeRoutines.map((r) => (
              <motion.div 
                key={r._id} 
                variants={cardVariants} 
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="card" 
                style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderLeft: '4px solid var(--primary-color)', position: 'relative', overflow: 'hidden' }}
              >
                {/* Visual Flair */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
                   <Sparkles size={120} color="var(--primary-color)" />
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem' }}>{r.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>DAILY HABIT • {r.type}</p>
                  <Target size={20} color="var(--primary-color)" />
                </div>

                <div style={{ marginBottom: '2rem', fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Consistency is key. Log your progress today to maintain your streak and earn XP.
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => handleLogDaily(r._id)} 
                    className="btn btn-success" 
                    style={{ flex: 3, justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', fontWeight: 900 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle size={24} /> Log Daily Progress
                  </button>
                  <button 
                    onClick={() => handleDeactivateRoutine(r._id)} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center', color: 'var(--danger-color)', fontWeight: 700 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div variants={cardVariants} className="card" style={{ padding: '4rem 2rem', textAlign: 'center', opacity: 0.5, gridColumn: '1 / -1', border: '2px dashed rgba(255,255,255,0.1)' }}>
              <Layout size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Active Routine</h3>
              <p>Choose a blueprint from the library to set your daily focus.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Routine Library */}
      <section>
        <motion.h2 variants={cardVariants} style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ListTodo size={24} color="#f59e0b" /> Routine Library
        </motion.h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {availableRoutines.map((r) => (
            <motion.div 
              key={r._id} 
              variants={cardVariants} 
              whileHover={{ y: -5, scale: 1.02 }}
              className="card" 
              style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>ROUTINE • {r.type}</p>
                <Clock size={16} color="rgba(255,255,255,0.2)" />
              </div>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.3rem', fontWeight: 800 }}>{r.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', flex: 1, lineHeight: 1.5 }}>
                {r.description || 'A balanced daily routine to optimize your fitness journey and mental clarity.'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <span style={{ opacity: 0.6 }}>Frequency</span> <strong>Daily Focus</strong>
              </div>
              
              <button 
                onClick={() => handleActivateRoutine(r._id)} 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
              >
                <Plus size={18} /> Activate Routine
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Creation Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 900 }}>Create Routine</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Routine Title" 
                value={newRoutine.title} 
                onChange={(e) => setNewRoutine({...newRoutine, title: e.target.value})} 
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
              />
              <textarea 
                placeholder="Blueprint Description" 
                rows={3}
                value={newRoutine.description} 
                onChange={(e) => setNewRoutine({...newRoutine, description: e.target.value})} 
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontFamily: 'inherit' }} 
              />
              <div className="grid-2">
                <input 
                  type="text" 
                  placeholder="Frequency (e.g. Daily)" 
                  value={newRoutine.duration} 
                  onChange={(e) => setNewRoutine({...newRoutine, duration: e.target.value})} 
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                />
                <select 
                  value={newRoutine.type} 
                  onChange={(e) => setNewRoutine({...newRoutine, type: e.target.value})} 
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                >
                  <option value="Consistency">Consistency</option>
                  <option value="Strength">Strength</option>
                  <option value="Mindfulness">Mindfulness</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Difficulty Level</label>
                <select 
                  value={newRoutine.difficulty} 
                  onChange={(e) => setNewRoutine({...newRoutine, difficulty: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleCreateRoutine} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create & Activate</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Level Up Notification */}
      <AnimatePresence>
        {levelUpNotification && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }} 
            style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 4000, width: '320px' }}
          >
            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--primary-color)', boxShadow: '0 10px 30px rgba(252,76,2,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎉</div>
                <button onClick={() => setLevelUpNotification(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>Level Up!</h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                You've reached <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>Level {levelUpNotification.newLevel}</span>
              </p>
              <button onClick={() => setLevelUpNotification(null)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Awesome!</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Routines;
