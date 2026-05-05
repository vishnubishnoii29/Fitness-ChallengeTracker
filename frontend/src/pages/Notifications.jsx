import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, Trash2, ShieldCheck, Clock, CheckCircle2, ArrowLeft, LayoutDashboard, CheckSquare } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    fetchNotifications();
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '950px', margin: '0 auto', padding: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            color: '#fc4c02', 
            margin: 0, 
            textShadow: '0 0 30px rgba(252,76,2,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Bell size={32} /> Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Stay synced with your fitness journey.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/dashboard')}
            style={{ borderRadius: '12px', padding: '0.75rem 1.25rem' }}
          >
            <LayoutDashboard size={18} /> <span className="hide-sm">Dashboard</span>
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={markAllRead}
            disabled={submitting || !items.some(i => !i.read)}
            style={{ borderRadius: '12px', padding: '0.75rem 1.25rem' }}
          >
            <CheckSquare size={18} /> <span className="hide-sm">Mark All Read</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={clearAll}
            disabled={submitting || items.length === 0}
            style={{ borderRadius: '12px', padding: '0.75rem 1.25rem', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <Trash2 size={18} /> <span className="hide-sm">Clear All</span>
          </button>

          <button 
            className="btn btn-primary" 
            onClick={handleTest}
            disabled={submitting}
            style={{ borderRadius: '12px', padding: '0.75rem 1.25rem' }}
          >
            <ShieldCheck size={18} /> <span className="hide-sm">Test</span>
          </button>
        </div>
      </div>

      <div className="glass" style={{ minHeight: '500px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-secondary)' }}
            >
              <BellOff size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
              <h3 style={{ margin: 0, fontWeight: 700 }}>No messages yet</h3>
              <p style={{ opacity: 0.6 }}>We'll notify you when your progress updates.</p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((n, i) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass"
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '16px',
                    background: n.read ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                    borderLeft: n.read ? '1px solid rgba(255,255,255,0.05)' : '4px solid #fc4c02',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '14px', 
                    background: n.read ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #fc4c02, #ff7b00)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: n.read ? 'none' : '0 8px 20px rgba(252,76,2,0.3)'
                  }}>
                    <Bell size={22} color="white" />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: n.read ? 'var(--text-secondary)' : 'white' }}>
                        {n.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                        <Clock size={14} />
                        {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <p style={{ margin: '0.5rem 0 0 0', color: n.read ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                      {n.message}
                    </p>
                  </div>

                  {!n.read && (
                    <button 
                      onClick={() => markRead(n._id)}
                      className="btn-icon"
                      style={{ color: '#fc4c02', background: 'rgba(252,76,2,0.1)', padding: '0.6rem' }}
                      title="Mark as Read"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Notifications;
