import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, UserPlus, Check, X, Clock, Flame, Trophy, CheckCircle } from 'lucide-react';
import api from '../api';

const Social = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('users/friends'),
        api.get('users/friends/requests')
      ]);
      setFriends(friendsRes.data || []);
      setRequests(requestsRes.data || []);
    } catch (err) {
      console.error('Error fetching social data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const res = await api.get(`users/search?q=${searchQuery}`);
          setSearchResults(res.data || []);
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const sendRequest = async (targetId) => {
    setSubmitting(true);
    try {
      await api.post(`users/friends/request/${targetId}`);
      // Update local search results state
      setSearchResults(prev => prev.map(u => 
        u._id === targetId ? { ...u, friendshipStatus: 'pending' } : u
      ));
      showStatus('Friend request sent!');
    } catch (err) {
      console.error('Error sending request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const respondToRequest = async (requestId, status) => {
    setSubmitting(true);
    try {
      await api.post(`users/friends/request/${requestId}/respond`, { status });
      await fetchData();
      showStatus(status === 'accepted' ? 'New friend added!' : 'Request ignored.');
    } catch (err) {
      console.error('Error responding to request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheer = async (friendId, username) => {
    try {
      await api.post(`users/friends/${friendId}/cheer`);
      showStatus(`Cheered for ${username}!`);
    } catch (err) {
      console.error('Cheer error:', err);
    }
  };

  const showStatus = (text) => {
    setStatusMessage(text);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'white' }}>
      <div className="spinner" />
      <p style={{ marginTop: '1rem', opacity: 0.6 }}>Syncing your circle...</p>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Social</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Connect, compete, and cheer with other athletes.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 2fr' }}>
        {/* Left Column: Requests & Discovery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Find Athletes */}
          <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={20} color="var(--primary-color)" /> Find Athletes
            </h3>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <AnimatePresence mode="popLayout">
                {searchResults.map(user => (
                  <motion.div 
                    key={user._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        {user.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.username}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Level {user.level}</div>
                      </div>
                    </div>

                    {user.friendshipStatus === 'friend' ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--success-color)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Check size={14} /> Friend
                      </span>
                    ) : user.friendshipStatus === 'pending' ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--warning-color)', opacity: 0.8 }}>Pending...</span>
                    ) : (
                      <button 
                        onClick={() => sendRequest(user._id)}
                        disabled={submitting}
                        className="btn-icon" 
                        style={{ padding: '0.4rem', background: 'var(--primary-color)', color: 'white', borderRadius: '8px' }}
                      >
                        <UserPlus size={16} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Pending Requests */}
          <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--warning-color)" /> Friend Requests
              {requests.length > 0 && <span className="badge badge-primary">{requests.length}</span>}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence mode="popLayout">
                {requests.map(req => (
                  <motion.div 
                    key={req._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="card"
                    style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        {req.from.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{req.from.username}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Level {req.from.level} Athlete</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => respondToRequest(req._id, 'accepted')} className="btn btn-success" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}><Check size={16} /> Accept</button>
                      <button onClick={() => respondToRequest(req._id, 'rejected')} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}><X size={16} /> Ignore</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {requests.length === 0 && <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.85rem' }}>No pending requests.</p>}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Friends List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div variants={itemVariants} className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={28} color="var(--primary-color)" /> My Community
              </h2>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1.2rem', borderRadius: '12px' }}>{friends.length} Friends</span>
            </div>

            {friends.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {friends.map(friend => (
                  <motion.div 
                    key={friend._id}
                    layout
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="card"
                    style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '55px', height: '55px', borderRadius: '15px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.3rem', boxShadow: '0 4px 15px rgba(252,76,2,0.2)' }}>
                        {friend.avatar ? <img src={friend.avatar} style={{ width: '100%', height: '100%', borderRadius: '15px' }} /> : friend.username[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{friend.username}</h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 700 }}>Level {friend.level}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 800, marginBottom: '0.25rem' }}>Streak</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <Flame size={16} color="#fc4c02" /> {friend.streak}
                        </div>
                      </div>
                      <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 800, marginBottom: '0.25rem' }}>Total XP</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <Trophy size={16} color="#f59e0b" /> {friend.xp?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>

                    <motion.button 
                      onClick={() => handleCheer(friend._id, friend.username)}
                      className="btn btn-secondary" 
                      style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontWeight: 700 }}
                      whileHover={{ scale: 1.05, background: 'rgba(252,76,2,0.1)', borderColor: 'var(--primary-color)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkles size={18} /> Cheer Athlete
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', opacity: 0.4 }}>
                <Users size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
                <h3>Community is waiting</h3>
                <p>Add friends to compete and keep each other motivated!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Status Toast */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 5000 }}
          >
            <div className="card" style={{ padding: '0.8rem 1.5rem', borderRadius: '50px', background: 'var(--success-color)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <CheckCircle size={18} />
              <span style={{ fontWeight: 700 }}>{statusMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Simple Sparkles icon if not available in lucide
const Sparkles = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

export default Social;
