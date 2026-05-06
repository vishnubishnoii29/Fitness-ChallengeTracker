import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Trash2, ShieldCheck, Clock, CheckCircle2, ArrowLeft, CheckSquare } from 'lucide-react';
import '../index.css';

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('notifications');
      setItems(res.data);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchNotifications();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`notifications/${id}/read`);
      setItems(items.map(item => item._id === id ? { ...item, read: true } : item));
    } catch (err) {
      console.error('Mark read failed', err);
    }
  };

  const markAllRead = async () => {
    try {
      setSubmitting(true);
      await api.put('notifications/mark-all-read');
      setItems(items.map(item => ({ ...item, read: true })));
    } catch (err) {
      console.error('Mark all read failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const clearAll = async () => {
    try {
      setSubmitting(true);
      await api.delete('notifications/clear-all');
      setItems([]);
    } catch (err) {
      console.error('Clear all failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTest = async () => {
    try {
      setSubmitting(true);
      await api.post('notifications/test');
      fetchNotifications();
    } catch (err) {
      console.error('Test failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
      style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}
    >
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            color: 'var(--primary-color)', 
            margin: 0, 
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Stay synced with your fitness journey.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleTest}
            disabled={submitting}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <ShieldCheck size={16} /> Test
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={markAllRead}
            disabled={submitting || !items.some(i => !i.read)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <CheckSquare size={16} /> Mark Read
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={clearAll}
            disabled={submitting || items.length === 0}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <Trash2 size={16} /> Clear
          </button>

          <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        whileHover={{ y: -2, scale: 1.002 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="card" 
        style={{ minHeight: '500px', padding: '1.5rem' }}
      >
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-secondary)' }}
            >
              <BellOff size={64} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
              <h3 style={{ margin: 0, fontWeight: 800 }}>All caught up!</h3>
              <p style={{ opacity: 0.6 }}>No new messages to show.</p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((n) => (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ x: 5, background: 'rgba(255,255,255,0.06)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="card"
                    style={{ 
                      padding: '1.25rem', 
                      background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                      borderLeft: n.read ? '1px solid rgba(255,255,255,0.1)' : '4px solid var(--primary-color)',
                      display: 'flex',
                      gap: '1.25rem',
                      alignItems: 'center',
                      cursor: 'default'
                    }}
                  >
                  <div style={{ 
                    width: '45px', 
                    height: '45px', 
                    borderRadius: '12px', 
                    background: n.read ? 'rgba(255,255,255,0.05)' : 'var(--gradient-primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: n.read ? 'none' : '0 4px 15px rgba(252,76,2,0.3)'
                  }}>
                    <Bell size={20} color={n.read ? 'var(--text-secondary)' : 'white'} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {n.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, opacity: 0.6 }}>
                        <Clock size={14} />
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                    <p style={{ margin: '0.4rem 0 0 0', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: n.read ? 0.6 : 0.9, lineHeight: 1.5, fontSize: '0.95rem' }}>
                      {n.message}
                    </p>
                  </div>

                  {!n.read && (
                    <button 
                      onClick={() => markRead(n._id)}
                      className="btn-icon"
                      style={{ 
                        color: 'var(--primary-color)', 
                        background: 'rgba(252, 76, 2, 0.1)', 
                        border: '1px solid rgba(252, 76, 2, 0.2)',
                        padding: '0.6rem',
                        borderRadius: '10px'
                      }}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Notifications;
