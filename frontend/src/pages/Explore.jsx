import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, Play, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '../api';
import '../index.css';

const Explore = () => {
  const location = useLocation();
  const [filter, setFilter] = useState('All');
  const [kindFilter, setKindFilter] = useState(() => {
    if (location.pathname === '/workouts') return 'Workout';
    if (location.pathname === '/routines') return 'Routine';
    return 'All';
  });
  
  const [recommendations, setRecommendations] = useState([]);
  const [exploreItems, setExploreItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync filter when path changes
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (location.pathname === '/workouts') setKindFilter('Workout');
      else if (location.pathname === '/routines') setKindFilter('Routine');
      else setKindFilter('All');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const pageTitle = location.pathname === '/workouts' ? 'Workouts' : 
                    location.pathname === '/routines' ? 'Routines' : 'Explore';

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const fetchExploreData = async () => {
        try {
          const [recRes, workoutRes, challengeRes] = await Promise.allSettled([
            api.get('ai/recommendations'),
            api.get('workouts'),
            api.get('challenges')
          ]);
          
          const recommendationsData = recRes.status === 'fulfilled' ? recRes.value.data : [];
          if (recRes.status === 'rejected') {
            setNotification({ type: 'error', message: recRes.reason?.response?.data?.message || 'Failed to load AI recommendations' });
          }
          const workoutsData = workoutRes.status === 'fulfilled' ? workoutRes.value.data : [];
          const challengesData = challengeRes.status === 'fulfilled' ? challengeRes.value.data : [];

          // Map challenges to fit workout structure for explore grid
          const mappedChallenges = challengesData.map(c => ({
            ...c,
            kind: 'Challenge',
            type: c.goalType || 'Challenge',
            duration: `${c.durationDays} Days`,
            image: c.image || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500&q=80'
          }));

          setRecommendations(recommendationsData);
          setExploreItems([...workoutsData, ...mappedChallenges]);
        } catch (err) {
          console.error('Error fetching explore data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchExploreData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const categories = ['All', 'Cardio', 'Strength', 'Flexibility', 'HIIT', 'Yoga', 'Distance', 'Consistency'];
  const kinds = ['All', 'Workout', 'Routine', 'Challenge'];

  const handleAction = async (item) => {
    try {
      if (item.kind === 'Challenge') {
        await api.post(`users/challenges/${item._id}/join`);
        setNotification({ type: 'success', message: `Joined ${item.title}!` });
      } else {
        await api.post(`users/workouts/${item._id}/start`);
        setNotification({ type: 'success', message: `Started ${item.title}!` });
      }
    } catch (err) {
      console.error('Action error:', err);
      const msg = err.response?.data?.message || 'Action failed. Please try again.';
      setNotification({ type: 'error', message: msg });
    }
  };

  // Filter exploreItems based on both type and kind filters
  const filteredExploreItems = (exploreItems || []).filter(item => {
    if (!item) return false;
    const itemType = item.type || '';
    const itemKind = item.kind || '';

    const typeMatch = filter === 'All' || itemType.toLowerCase() === filter.toLowerCase();
    const kindMatch = kindFilter === 'All' || itemKind.toLowerCase() === kindFilter.toLowerCase();
    const searchMatch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemType.toLowerCase().includes(searchQuery.toLowerCase());
      
    return typeMatch && kindMatch && searchMatch;
  });

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

  if (loading) return (
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
      <p style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.8 }}>Discovering new workouts...</p>
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <motion.div variants={cardVariants}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: '#fc4c02', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{pageTitle}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            {pageTitle === 'Workouts' ? 'Discover new exercises to fuel your journey.' : 
             pageTitle === 'Routines' ? 'Personalized sets for your daily goals.' : 
             'Discover new workouts and challenges.'}
          </p>
        </motion.div>
        <motion.div variants={cardVariants} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', width: '250px' }} 
            />
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.75rem', position: 'relative' }}
            onClick={() => {
              setSearchQuery('');
              setFilter('All');
              setKindFilter('All');
            }}
            title="Clear all filters"
          >
            <Filter size={20} />
            {(filter !== 'All' || kindFilter !== 'All' || searchQuery) && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', background: 'var(--primary-color)', borderRadius: '50%', border: '2px solid var(--surface-color)' }} />
            )}
          </button>
        </motion.div>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <motion.h2 variants={cardVariants} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Sparkles color="var(--primary-color)" /> AI Recommended for You
        </motion.h2>
        <div className="grid-2">
          {recommendations.map((item, i) => (
            <motion.div key={i} variants={cardVariants} 
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                className="card" 
                style={{ padding: 0, overflow: 'hidden', position: 'relative', height: '200px' }}
              >
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ color: 'white' }}>
                      <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>{item.match} Match</span>
                      <h3 style={{ color: 'white', margin: '0 0 0.25rem 0', fontWeight: 900, fontSize: '1.1rem' }}>{item.title}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', margin: 0, fontWeight: 600 }}>{item.difficulty} • {item.duration}</p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => handleAction(item)}><Play size={14} /> Start</button>
                  </div>
                </div>
              </motion.div>
              
              {item.aiReason && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    background: 'rgba(252, 76, 2, 0.1)', 
                    border: '1px solid rgba(252, 76, 2, 0.2)', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <Sparkles size={16} color="var(--primary-color)" style={{ marginTop: '2px' }} />
                  <p style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, margin: 0, lineHeight: '1.4' }}>
                    {item.aiReason}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <motion.div variants={cardVariants} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)', minWidth: '85px' }}>CATEGORY:</span>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilter(cat)}
                  className={filter === cat ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={cardVariants} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)', minWidth: '85px' }}>FORMAT:</span>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {kinds.map(k => (
                <button 
                  key={k} 
                  onClick={() => setKindFilter(k)}
                  className={kindFilter === k ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {k}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid-4">
          {filteredExploreItems.length > 0 ? (
            filteredExploreItems.map((item, i) => (
              <motion.div key={item._id || i} variants={cardVariants} 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="card" 
                style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ height: '150px', position: 'relative' }}>
                  <img src={item.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.05em', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {item.kind?.toUpperCase() || 'WORKOUT'}
                  </span>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className={`badge ${item.difficulty === 'Easy' ? 'badge-success' : item.difficulty === 'Medium' ? 'badge-warning' : 'badge-primary'}`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{item.difficulty || 'Medium'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>{item.duration || '20 min'}</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800 }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0', fontWeight: 500 }}>{item.type}</p>
                  
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', fontWeight: 700 }}
                    onClick={() => handleAction(item)}
                  >
                    {item.kind === 'Challenge' ? 'Join Challenge' : item.kind === 'Routine' ? 'Add Routine' : 'Start Workout'}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div variants={cardVariants} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
              <Filter size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>No {kindFilter === 'All' ? 'items' : kindFilter.toLowerCase() + 's'} found</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try adjusting your category or format filters.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Cinematic Toast Notification - Elegant Bottom-Right */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.75rem',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              color: 'white',
              minWidth: '350px'
            }}
          >
            {notification.type === 'success' ? (
              <CheckCircle color="#22c55e" size={24} />
            ) : (
              <AlertCircle color="#ef4444" size={24} />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: notification.type === 'success' ? '#22c55e' : '#ef4444' }}>
                {notification.type === 'success' ? 'Success' : 'Action Failed'}
              </p>
              <p style={{ margin: '0.1rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem', opacity: 0.5 }}
            >
              <X size={18} />
            </button>
            
            {/* Progress bar timer */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                background: notification.type === 'success' ? '#22c55e' : '#ef4444',
                borderRadius: '0 0 0 var(--radius-lg)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Explore;
