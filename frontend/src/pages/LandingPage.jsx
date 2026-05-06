import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/auth.js';
import { Flame, Trophy, Target, Users, TrendingUp, Medal, BarChart3 } from 'lucide-react';
import { useEffect } from 'react';
import '../index.css';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    // Handle hash-based scrolling
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    { icon: Target, title: 'Smart Challenge Creation', desc: 'Create personalized fitness challenges with specific goals — distance targets, rep counts, time-based workouts, or duration-based commitments. Set your own rules and timeline.' },
    { icon: Trophy, title: 'Advanced Gamification', desc: 'Earn XP points for every completed activity, unlock achievement badges for milestones, level up your profile, and maintain streaks to showcase your consistency.' },
    { icon: Medal, title: 'Multi-Tier Leaderboards', desc: 'Compete globally, with friends, or in weekly rankings. Track your position across different categories and watch your ranking improve as you progress.' },
    { icon: TrendingUp, title: 'Comprehensive Analytics', desc: 'Visualize your fitness journey with interactive 7-day activity charts, track calories burned, monitor workout duration, and analyze performance trends over time.' },
    { icon: Users, title: 'Social Fitness Community', desc: 'Connect with like-minded athletes, share achievements, get motivated by community progress, and participate in group challenges for extra accountability.' },
    { icon: BarChart3, title: 'AI-Powered Recommendations', desc: 'Get personalized workout suggestions based on your fitness level and preferences. Explore curated challenges and discover new ways to push your limits.' },
  ];

  const stats = [
    { value: '100+', label: 'Challenge Types' },
    { value: '15+', label: 'Achievement Badges' },
    { value: 'Real-Time', label: 'Progress Tracking' },
    { value: 'Unlimited', label: 'Custom Goals' },
  ];

  const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30, scale: 0.95 },
  whileInView: { opacity: 0.999, y: 0, scale: 1 },
  viewport: { once: true, margin: '-50px' },
  transition: { 
    type: 'spring',
    stiffness: 70,
    damping: 15,
    delay,
    opacity: { duration: 0.6 }
  },
});

  return (
    <div className="landing-page">
      {/* Top Nav */}
      <nav className="landing-nav" aria-label="Landing navigation">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            background: 'var(--gradient-primary)',
            padding: '0.45rem',
            borderRadius: '10px',
            color: 'white',
            boxShadow: '0 0 25px rgba(252,76,2,0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Flame size={18} />
          </span>
          <span style={{ fontWeight: 900, letterSpacing: '-0.02em' }}>FITQUEST</span>
        </Link>

        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link hide-sm">Features</a>
          <a href="#how-it-works" className="landing-nav-link hide-sm">How it works</a>
          <a href="#stats" className="landing-nav-link hide-sm">Stats</a>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <Link to="/login" className="landing-nav-link">Sign In</Link>
          </motion.div>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1rem', fontWeight: 800 }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="landing-hero">

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            position: 'relative', zIndex: 2,
            textAlign: 'center', padding: '0 1.5rem',
            maxWidth: '900px', display: 'flex',
            flexDirection: 'column', alignItems: 'center',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #fc4c02, #ff7849)',
            padding: '1.1rem', borderRadius: '1.25rem',
            color: 'white', marginBottom: '1.75rem',
            boxShadow: '0 0 40px rgba(252,76,2,0.4)',
          }}>
            <Flame size={52} />
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 900, color: 'white',
            marginBottom: '1rem', lineHeight: 1.1,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.6)',
          }}>
            Fitness <span style={{ color: '#fc4c02' }}>Challenge</span> Tracker
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)',
            color: 'rgba(255,255,255,1)',
            marginBottom: '2.75rem', fontWeight: 600,
            letterSpacing: '0.04em', maxWidth: '700px',
            textShadow: '0 2px 15px rgba(0,0,0,1)',
          }}>
            Transform your fitness journey with intelligent challenge tracking, AI-powered recommendations, and a thriving community. 
            Set personalized goals, earn rewards, and watch your progress soar with interactive analytics and gamification.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.div {...fadeUp(0.1)} style={{ display: 'inline-block' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', fontWeight: 800 }}>
                Start Your Quest
              </Link>
            </motion.div>
            <motion.div {...fadeUp(0.2)} 
              whileHover={{ y: -5, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'inline-block' }}
            >
              <Link to="/login" className="btn btn-glass" style={{ 
                padding: '1rem 2.5rem', 
                fontSize: '1.05rem', 
                fontWeight: 800
              }}>
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>


      </section>

      {/* ── STATS BAR ── */}
      <section id="stats" className="landing-section">
        <motion.div {...fadeUp()} 
          whileHover={{ y: -10, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="card landing-container" 
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            padding: '2.5rem 2rem', gap: '1rem', textAlign: 'center', maxWidth: '1000px',
          }}
        >
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fc4c02', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,1)', fontSize: '0.85rem', marginTop: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── WHAT IS FITQUEST ── */}
      <section className="landing-section">
        <motion.div {...fadeUp()} 
          whileHover={{ y: -10, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="card landing-container" 
          style={{
            maxWidth: '800px',
            padding: '3.5rem 3rem', textAlign: 'center',
          }}
        >
          <span style={{ color: '#fc4c02', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>What Is FitQuest?</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2, color: 'white' }}>
            Your Fitness Journey, <span style={{ color: '#fc4c02' }}>Gamified</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,1)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto' }}>
            FitQuest is a comprehensive fitness ecosystem that transforms your health journey into an engaging, 
            rewarding adventure. Create custom challenges with specific metrics (distance, reps, time, or duration), 
            track real-time progress with beautiful visualizations, earn XP and unlock achievements for consistency, 
            and compete across multiple leaderboard categories. Our AI engine provides personalized workout recommendations, 
            while our vibrant community keeps you motivated every step of the way.
          </p>
        </motion.div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="landing-section">
        <div className="landing-container">
        <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#fc4c02', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Key Features</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'white' }}>Everything You Need to Stay on Track</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {features.map((f, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)}
              whileHover={{ y: -12, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="card"
              style={{ padding: '2rem' }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(252,76,2,0.15)', color: '#fc4c02',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <f.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="landing-section">
        <motion.div {...fadeUp()} 
          whileHover={{ y: -10, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="card landing-container" 
          style={{
            maxWidth: '900px',
            padding: '3.5rem 3rem', textAlign: 'center',
          }}
        >
          <span style={{ color: '#fc4c02', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>How It Works</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, marginBottom: '2.5rem', color: 'white' }}>Get Started in 4 Simple Steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { 
                step: '01', 
                title: 'Create Your Profile', 
                desc: 'Sign up in seconds, set your fitness level, and tell us your goals. Your profile becomes your fitness headquarters.',
                details: 'Personal stats, achievement tracking, and progress history all in one place.'
              },
              { 
                step: '02', 
                title: 'Choose Your Challenges', 
                desc: 'Browse 100+ challenges or create custom ones. Set goals by distance, reps, time, or duration.',
                details: 'From 5K runs to 30-day yoga streaks, find challenges that match your ambition.'
              },
              { 
                step: '03', 
                title: 'Track & Progress', 
                desc: 'Log workouts, track calories, monitor activity, and watch your stats update in real-time.',
                details: 'Interactive charts show your 7-day activity trends and performance metrics.'
              },
              { 
                step: '04', 
                title: 'Earn & Compete', 
                desc: 'Rack up XP, unlock badges, maintain streaks, and climb leaderboards.',
                details: 'Global rankings, friend competitions, and weekly challenges keep you motivated.'
              },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'rgba(252,76,2,0.15)', border: '2px solid rgba(252,76,2,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 900, color: '#fc4c02',
                }}>{s.step}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', margin: 0 }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,1)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>{s.desc}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>{s.details}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── APP CAPABILITIES ── */}
      <section className="landing-section">
        <div className="landing-container">
          <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: '#fc4c02', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Platform Capabilities</span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Built for Performance, Designed for Results</h2>
            <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
              Experience a feature-rich platform that combines cutting-edge technology with fitness science to deliver measurable results.
            </p>
          </motion.div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                title: 'Real-Time Analytics',
                description: 'Track calories burned, distance covered, workout duration, and activity patterns with live updating charts and insights.',
                icon: '📊'
              },
              {
                title: 'Smart Goal Setting',
                description: 'Set SMART goals with specific metrics, timelines, and difficulty levels. Get AI-powered recommendations for optimal challenge selection.',
                icon: '🎯'
              },
              {
                title: 'Social Motivation',
                description: 'Connect with friends, join groups, share achievements, and participate in community events to stay accountable and motivated.',
                icon: '👥'
              },
              {
                title: 'Adaptive Workouts',
                description: 'Receive personalized workout recommendations that adapt to your fitness level, preferences, and progress history.',
                icon: '💪'
              },
              {
                title: 'Achievement System',
                description: 'Unlock 15+ unique badges, earn XP for every activity, maintain streaks, and level up your fitness profile.',
                icon: '🏆'
              },
              {
                title: 'Cross-Platform Sync',
                description: 'Access your data seamlessly across all devices. Your progress syncs instantly so you never miss a beat.',
                icon: '🔄'
              }
            ].map((capability, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} 
                whileHover={{ y: -12, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="card" 
                style={{ padding: '2rem' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{capability.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>{capability.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{capability.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="landing-section">
        <motion.div {...fadeUp()} 
          whileHover={{ y: -8, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="card landing-container" 
          style={{
            maxWidth: '700px',
            padding: '3.5rem 3rem', textAlign: 'center',
            background: 'rgba(252,76,2,0.08)',
            border: '1px solid rgba(252,76,2,0.25)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
            Ready to Level Up?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Create your free account and start your first challenge in under a minute.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', fontWeight: 900 }}>
            Get Started — It's Free
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'relative', zIndex: 2,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '3.5rem 1.5rem 2.5rem', textAlign: 'center',
        color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem',
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)',
        width: '100%',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem', color: 'white' }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '0.4rem', borderRadius: '8px' }}>
              <Flame size={20} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>FITQUEST</span>
          </div>
          <p style={{ marginBottom: '1rem', color: 'white', fontWeight: 600, fontSize: '1.1rem' }}>
            Elevate Your Performance. Master Your Discipline.
          </p>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            Join thousands of athletes pushing their limits every day. FitQuest is more than a tracker — it's your competitive edge in the pursuit of greatness.
          </p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} FitQuest Global. All Rights Reserved. Designed for the elite.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
