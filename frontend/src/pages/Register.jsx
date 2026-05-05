import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Flame } from 'lucide-react';

const BG_IMG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fm=jpg&q=80&w=3000&auto=format&fit=crop';

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem 0.85rem 2.75rem',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, background 0.2s ease',
};

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(username, email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const fieldStyle = (name) => ({
    ...inputStyle,
    borderColor: focusedField === name ? 'rgba(252,76,2,0.7)' : 'rgba(255,255,255,0.15)',
    background: focusedField === name ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)',
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: '440px',
          margin: '1.5rem',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.13)',
          borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
          padding: '2.75rem 2.5rem',
          color: 'white',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ 
            background: 'linear-gradient(135deg, #fc4c02, #ff7849)',
            padding: '0.9rem', borderRadius: '16px',
            boxShadow: '0 0 30px rgba(252,76,2,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Flame size={34} color="white" />
          </Link>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', color: '#fc4c02', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Join the fitness community today
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {error && (
            <div style={{
              background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)',
              borderRadius: '10px', padding: '0.75rem 1rem',
              color: '#ff8080', fontSize: '0.875rem', textAlign: 'center',
            }}>{error}</div>
          )}

          {/* Username */}
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              required
              style={fieldStyle('username')}
            />
          </div>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)', pointerEvents: 'none' }} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              style={fieldStyle('email')}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)', pointerEvents: 'none' }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              style={fieldStyle('password')}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%', marginTop: '0.5rem',
              padding: '0.9rem',
              background: 'linear-gradient(135deg, #fc4c02, #ff7849)',
              color: 'white', fontWeight: 700, fontSize: '1rem',
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(252,76,2,0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(252,76,2,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(252,76,2,0.4)'; }}
          >
            Create Account
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#fc4c02', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
