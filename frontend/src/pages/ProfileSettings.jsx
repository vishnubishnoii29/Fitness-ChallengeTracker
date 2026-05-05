import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Camera, Check, AlertCircle, Save, ChevronLeft, ArrowLeft, Calendar, Ruler, Weight } from 'lucide-react';

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

  const username = profile.username ? profile.username.replace('@', '') : 'User';
  const xpValue = profile.xp !== undefined ? profile.xp : profile.points;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fc4c02', marginBottom: '0.5rem', textShadow: '0 4px 20px rgba(252,76,2,0.3)' }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your fitness journey and security.</p>
        </div>
        <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
          <ArrowLeft size={18} /> <span className="hide-sm">Dashboard</span>
        </Link>
      </div>

      <div className="glass" style={{ padding: '3rem', position: 'relative' }}>
        <div className="profile-settings-layout">
          {/* Left Column: Profile Info */}
          <div className="profile-info-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="profile-menu-avatar" style={{ width: '100px', height: '100px', fontSize: '2.5rem', border: '4px solid var(--primary-color)', flexShrink: 0, boxShadow: '0 0 30px rgba(252,76,2,0.3)' }}>
                {profile.avatar ? (
                  <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  username[0]?.toUpperCase()
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{username}</h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '1rem' }}>LVL {profile.level}</div>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{xpValue ?? 0} XP</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Age</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profile.age || '--'} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>yrs</span></div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Streak</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning-color)' }}>🔥 {profile.streak} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>days</span></div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Height</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profile.height || '--'} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>cm</span></div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Weight</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profile.weight || '--'} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>kg</span></div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.6 }}>Email</span>
                <span style={{ fontWeight: 500 }}>{profile.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.6 }}>Joined</span>
                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form Section */}
          <div className="profile-actions-section">
            <AnimatePresence mode="wait">
              {view === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <h3 style={{ marginBottom: '0.25rem', fontSize: '1.5rem', fontWeight: 800 }}>Account Access</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Control your public presence and account security settings from this panel.
                  </p>
                  
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { setStatus({ type: '', message: '' }); setView('edit'); }}
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                  >
                    <Camera size={20} /> Edit Profile Info
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => { setStatus({ type: '', message: '' }); setView('password'); }}
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                  >
                    <Lock size={20} /> Change Password
                  </button>
                </motion.div>
              )}

              {view === 'edit' && (
                <motion.div 
                  key="edit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <button onClick={() => setView('overview')} className="btn-icon" style={{ color: 'var(--primary-color)' }}>
                      <ChevronLeft size={24} />
                    </button>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Edit Identity</h3>
                  </div>

                  <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {status.message && (
                      <div className={`status-msg ${status.type}`}>
                        {status.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        {status.message}
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="input-group">
                        <label>Username</label>
                        <div style={{ position: 'relative' }}>
                          <User size={16} className="input-icon" />
                          <input 
                            type="text" 
                            value={editForm.username}
                            onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Age</label>
                        <div style={{ position: 'relative' }}>
                          <Calendar size={16} className="input-icon" />
                          <input 
                            type="number" 
                            value={editForm.age}
                            onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="input-group">
                        <label>Height (cm)</label>
                        <div style={{ position: 'relative' }}>
                          <Ruler size={16} className="input-icon" />
                          <input 
                            type="number" 
                            value={editForm.height}
                            onChange={(e) => setEditForm({...editForm, height: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Weight (kg)</label>
                        <div style={{ position: 'relative' }}>
                          <Weight size={16} className="input-icon" />
                          <input 
                            type="number" 
                            value={editForm.weight}
                            onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>


                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setView('overview')}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
                        {submitting ? 'Saving...' : <><Save size={18} /> Update Info</>}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <button onClick={() => setView('overview')} className="btn-icon" style={{ color: 'var(--primary-color)' }}>
                      <ChevronLeft size={24} />
                    </button>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Update Security</h3>
                  </div>

                  <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {status.message && (
                      <div className={`status-msg ${status.type}`}>
                        {status.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        {status.message}
                      </div>
                    )}
                    
                    <div className="input-group">
                      <div style={{ position: 'relative' }}>
                        <Lock size={18} className="input-icon" />
                        <input 
                          type="password" 
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          placeholder="Current Password" 
                          required
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <div style={{ position: 'relative' }}>
                        <Lock size={18} className="input-icon" />
                        <input 
                          type="password" 
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          placeholder="New Password" 
                          required
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <div style={{ position: 'relative' }}>
                        <Lock size={18} className="input-icon" />
                        <input 
                          type="password" 
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          placeholder="Confirm New Password" 
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setView('overview')}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
                        {submitting ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
