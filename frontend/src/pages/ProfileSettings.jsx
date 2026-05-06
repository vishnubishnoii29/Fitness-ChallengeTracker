import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/auth.js';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Check, AlertCircle, ArrowLeft, Calendar, Ruler, Weight, Flame } from 'lucide-react';
import '../index.css';

const ProfileSettings = () => {
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState('overview');
  const [editForm, setEditForm] = useState({ 
    username: '', 
    age: 0,
    height: 0,
    weight: 0
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('users/profile');
        setProfile(res.data);
        setEditForm({
          username: res.data.username || '',
          age: res.data.age || 0,
          height: res.data.height || 0,
          weight: res.data.weight || 0
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await api.put('users/profile', {
        username: editForm.username,
        age: parseInt(editForm.age),
        height: parseInt(editForm.height),
        weight: parseInt(editForm.weight)
      });
      setProfile(res.data);
      const updatedAuthUser = { ...authUser, ...res.data };
      setAuthUser(updatedAuthUser);
      localStorage.setItem('user', JSON.stringify(updatedAuthUser));
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => {
        setView('overview');
        setStatus({ type: '', message: '' });
      }, 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      await api.put('users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setStatus({ type: 'success', message: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setView('overview');
        setStatus({ type: '', message: '' });
      }, 1500);
    } catch (err) {
      console.error('Password update error details:', err.response || err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update password';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'white', gap: '1rem' }}>
      <span className="spinner" />
      <p style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.8 }}>Loading settings...</p>
    </div>
  );

  if (!profile) return (
    <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
      <AlertCircle size={48} color="var(--danger-color)" style={{ marginBottom: '1rem' }} />
      <h2 style={{ color: 'white' }}>Profile Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We couldn't retrieve your profile data. Please try again.</p>
      <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
    </div>
  );

  const username = profile?.username ? profile.username.replace('@', '') : 'User';
  const xpValue = profile?.xp || 0;
  const currentLevel = profile?.level || 1;

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
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.5rem 1rem' }}
    >
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '0' }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your fitness journey and security.</p>
        </div>
        <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </motion.div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 2fr', gap: '1rem' }}>
        {/* Left Column: Profile Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <motion.div 
            variants={itemVariants} 
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="card" 
            style={{ padding: '1.25rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  padding: '4px',
                  background: 'linear-gradient(45deg, var(--primary-color), #ff7849)',
                  boxShadow: '0 0 30px rgba(252, 76, 2, 0.3)',
                }}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #0a0a0a' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 900, border: '4px solid #0a0a0a' }}>
                      {username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '5px',
                  right: '5px',
                  background: 'var(--primary-color)',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #0a0a0a',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}>
                  {currentLevel}
                </div>
              </div>
              
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>{username}</h2>
                <div style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.85rem', marginTop: '0' }}>
                  {(xpValue || 0).toLocaleString()} XP
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
              {[
                { label: 'Age', value: profile.age || '--', unit: 'yrs', icon: Calendar, color: '#4f46e5' },
                { label: 'Streak', value: profile.streak, unit: 'days', icon: Flame, color: '#fc4c02' },
                { label: 'Height', value: profile.height || '--', unit: 'cm', icon: Ruler, color: '#10b981' },
                { label: 'Weight', value: profile.weight || '--', unit: 'kg', icon: Weight, color: '#f59e0b' }
              ].map((stat, i) => (
                <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>
                    {stat.value}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.5, marginLeft: '0.25rem' }}>{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', marginTop: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.6 }}>Email</span>
                <span style={{ fontWeight: 600 }}>{profile.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.6 }}>Joined</span>
                <span style={{ fontWeight: 600 }}>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Actions */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -2, scale: 1.002 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="card" 
          style={{ padding: '1.5rem' }}
        >
          <AnimatePresence mode="wait">
            {view === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Account Security</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Manage your personal information and security settings. Your profile details help us calculate your fitness metrics accurately.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { setStatus({ type: '', message: '' }); setView('edit'); }}
                    style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                  >
                    <User size={20} /> Edit Personal Info
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => { setStatus({ type: '', message: '' }); setView('password'); }}
                    style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                  >
                    <Lock size={20} /> Change Password
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'edit' && (
              <motion.div 
                key="edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                  </button>
                  <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Edit Profile</h3>
                </div>

                <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {status.message && (
                    <div className={`status-msg ${status.type}`} style={{ padding: '1rem', borderRadius: '12px', background: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {status.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                      {status.message}
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Username</label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input 
                          type="text" 
                          className="btn-secondary"
                          style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                          value={editForm.username}
                          onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Age</label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input 
                          type="number" 
                          className="btn-secondary"
                          style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                          value={editForm.age}
                          onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Height (cm)</label>
                      <div style={{ position: 'relative' }}>
                        <Ruler size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input 
                          type="number" 
                          className="btn-secondary"
                          style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                          value={editForm.height}
                          onChange={(e) => setEditForm({...editForm, height: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Weight (kg)</label>
                      <div style={{ position: 'relative' }}>
                        <Weight size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input 
                          type="number" 
                          className="btn-secondary"
                          style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                          value={editForm.weight}
                          onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setView('overview')}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {view === 'password' && (
              <motion.div 
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                  </button>
                  <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Update Security</h3>
                </div>

                <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {status.message && (
                    <div className={`status-msg ${status.type}`} style={{ padding: '1rem', borderRadius: '12px', background: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {status.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                      {status.message}
                    </div>
                  )}
                  
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                      <input 
                        type="password" 
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                      <input 
                        type="password" 
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                      <input 
                        type="password" 
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setView('overview')}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                      {submitting ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
