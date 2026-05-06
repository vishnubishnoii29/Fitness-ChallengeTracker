import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, Activity, X, CheckCircle, Zap, Flame, PlayCircle } from 'lucide-react';
import api from '../api';
import '../index.css';

const Workouts = () => {
  const [activeWorkouts, setActiveWorkouts] = useState([]);
  const [availableWorkouts, setAvailableWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelUpNotification, setLevelUpNotification] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    description: '',
    duration: '',
    type: 'Strength',
    calories: '300',
    difficulty: 'Medium'
  });

  const fetchWorkouts = async () => {
    try {
      const [activeRes, allRes] = await Promise.all([
        api.get('users/workouts/active'),
        api.get('workouts')
      ]);
      
      // Filter out routines from basic workouts
      const active = (activeRes.data || []).filter(w => w.kind !== 'Routine');
      const all = (allRes.data || []).filter(w => w.kind !== 'Routine');
      
      setActiveWorkouts(active);
      
      const activeIds = active.map(w => w.workoutId?._id || w._id);
      setAvailableWorkouts(all.filter(w => !activeIds.includes(w._id)));
    } catch (err) {
      console.error('Error fetching workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleStartWorkout = async (workoutId) => {
    try {
      await api.post(`users/workouts/${workoutId}/start`);
      fetchWorkouts();
    } catch (err) {
      console.error('Error starting workout:', err);
    }
  };

  const handleStopWorkout = async (workoutId) => {
    try {
      await api.delete(`users/workouts/${workoutId}/stop`);
      fetchWorkouts();
    } catch (err) {
      console.error('Error stopping workout:', err);
    }
  };

  const handleCompleteWorkout = async (workoutId) => {
    try {
      const res = await api.post(`users/workouts/${workoutId}/complete`);
      fetchWorkouts();
      if (res.data.levelUp?.leveledUp) {
        setLevelUpNotification(res.data.levelUp);
      }
    } catch (err) {
      console.error('Error completing workout:', err);
    }
  };

  const handleCreateWorkout = async () => {
    try {
      if (!newWorkout.title || !newWorkout.duration || !newWorkout.type) {
        setError('Please fill in all required fields');
        return;
      }

      await api.post('workouts', {
        ...newWorkout,
        kind: 'Workout'
      });

      setNewWorkout({ title: '', description: '', duration: '', type: 'Strength', calories: '300', difficulty: 'Medium' });
      setShowCreateModal(false);
      fetchWorkouts();
    } catch (err) {
      console.error('Error creating workout:', err);
      setError('Failed to create workout');
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Workouts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Crush your goals with guided sessions.</p>
        </motion.div>
        <motion.button 
          variants={cardVariants} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary" 
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}
        >
          <Plus size={20} /> Create Workout
        </motion.button>
      </div>

      {/* Active Workouts Section */}
      <section style={{ marginBottom: '4rem' }}>
        <motion.h2 variants={cardVariants} style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={24} color="var(--primary-color)" /> Active Sessions
        </motion.h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {activeWorkouts.length > 0 ? (
            activeWorkouts.map((w) => (
              <motion.div 
                key={w._id} 
                variants={cardVariants} 
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="card" 
                style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderLeft: '4px solid var(--primary-color)', position: 'relative' }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{w.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{w.type} • {w.duration}</p>
                  <Activity size={18} color="var(--primary-color)" />
                </div>

                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                  <Flame size={18} color="var(--primary-color)" /> 
                  <span>Estimated: <strong style={{ color: 'white' }}>{w.calories || '350'} kcal</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleCompleteWorkout(w._id)} 
                    className="btn btn-success" 
                    style={{ flex: 2, justifyContent: 'center', padding: '0.75rem' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle size={18} /> Complete
                  </button>
                  <button 
                    onClick={() => handleStopWorkout(w._id)} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', color: 'var(--danger-color)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X size={18} /> Stop
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div variants={cardVariants} className="card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5, gridColumn: '1 / -1' }}>
              <PlayCircle size={40} style={{ margin: '0 auto 1rem' }} />
              <p>No active sessions. Pick a workout below to begin!</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Discovery Library */}
      <section>
        <motion.h2 variants={cardVariants} style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Dumbbell size={24} color="#f59e0b" /> Workout Library
        </motion.h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {availableWorkouts.map((w) => (
            <motion.div 
              key={w._id} 
              variants={cardVariants} 
              whileHover={{ y: -5, scale: 1.02 }}
              className="card" 
              style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>WORKOUT • {w.type}</p>
                <Dumbbell size={16} color="rgba(255,255,255,0.2)" />
              </div>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.3rem', fontWeight: 800 }}>{w.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                {w.description || 'A professional workout session designed to build strength and endurance.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <span style={{ opacity: 0.6 }}>Duration</span> <strong>{w.duration}</strong>
              </div>
              
              <button 
                onClick={() => handleStartWorkout(w._id)} 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
              >
                <Plus size={18} /> Start Workout
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Creation Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 900 }}>Create Workout</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Workout Title" 
                value={newWorkout.title} 
                onChange={(e) => setNewWorkout({...newWorkout, title: e.target.value})} 
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
              />
              <textarea 
                placeholder="Description" 
                rows={3}
                value={newWorkout.description} 
                onChange={(e) => setNewWorkout({...newWorkout, description: e.target.value})} 
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontFamily: 'inherit' }} 
              />
              <div className="grid-2">
                <input 
                  type="text" 
                  placeholder="Duration (e.g. 30 min)" 
                  value={newWorkout.duration} 
                  onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})} 
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                />
                <select 
                  value={newWorkout.type} 
                  onChange={(e) => setNewWorkout({...newWorkout, type: e.target.value})} 
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Flexibility">Flexibility</option>
                </select>
              </div>
              <div className="grid-2">
                <input 
                  type="number" 
                  placeholder="Est. Calories" 
                  value={newWorkout.calories} 
                  onChange={(e) => setNewWorkout({...newWorkout, calories: e.target.value})} 
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                />
                <select 
                  value={newWorkout.difficulty} 
                  onChange={(e) => setNewWorkout({...newWorkout, difficulty: e.target.value})} 
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleCreateWorkout} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create & Start</button>
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

export default Workouts;
