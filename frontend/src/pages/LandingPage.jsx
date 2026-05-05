import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Users, TrendingUp, Medal, BarChart3 } from 'lucide-react';


const LandingPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    { icon: Target, title: 'Challenge Yourself', desc: 'Create and join fitness challenges tailored to your goals — running, cycling, yoga, and more.' },
    { icon: Trophy, title: 'Earn Rewards & Badges', desc: 'Complete challenges to earn XP, unlock achievement badges, and level up your fitness profile.' },
    { icon: Medal, title: 'Climb the Leaderboard', desc: 'Compete with the community. Track your rank globally and see how you stack up.' },
    { icon: TrendingUp, title: 'Track Your Progress', desc: 'Visualize your weekly activity, streaks, and workout stats with beautiful charts.' },
    { icon: Users, title: 'Community Driven', desc: 'Join a growing community of athletes pushing their limits together every day.' },
    { icon: BarChart3, title: 'Explore Workouts', desc: 'Discover AI-recommended workouts, filter by category, and add them to your routine.' },
  ];

  const stats = [
    { value: '50+', label: 'Challenges Available' },
    { value: 'XP', label: 'Rewards System' },
    { value: 'Live', label: 'Leaderboard' },
    { value: '7-Day', label: 'Activity Charts' },
  ];

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.6, delay, ease: 'easeOut' },
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
          <Link to="/login" className="landing-nav-link">Sign In</Link>
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
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2.75rem', fontWeight: 500,
            letterSpacing: '0.06em', maxWidth: '600px',
            textShadow: '0 1px 12px rgba(0,0,0,0.9)',
          }}>
            Set goals, crush challenges, earn badges, and track every rep — all in one gamified fitness platform.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', fontWeight: 800 }}>
              Start Your Quest
            </Link>
            <Link to="/login" className="btn btn-glass" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', fontWeight: 800 }}>
              Sign In
            </Link>
          </div>
        </motion.div>


      </section>

      {/* ── STATS BAR ── */}
      <section id="stats" className="landing-section">
        <motion.div {...fadeUp()} className="card landing-container" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '2.5rem 2rem', gap: '1rem', textAlign: 'center', maxWidth: '900px',
        }}>
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
        <motion.div {...fadeUp()} className="card landing-container" style={{
          maxWidth: '800px',
          padding: '3.5rem 3rem', textAlign: 'center',
        }}>
          <span style={{ color: '#fc4c02', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>What Is FitQuest?</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2, color: 'white' }}>
            Your Fitness Journey, <span style={{ color: '#fc4c02' }}>Gamified</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,1)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '650px', margin: '0 auto' }}>
            FitQuest is a fitness challenge tracker that turns every workout into a rewarding experience.
            Set personal goals like running 100km or completing 30 days of yoga, track your daily progress
            with interactive charts, earn XP and achievement badges for consistency, and compete on a live
            leaderboard. Whether you're a beginner or an advanced athlete — FitQuest keeps you motivated,
            accountable, and always pushing forward.
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
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="landing-section">
        <motion.div {...fadeUp()} className="card landing-container" style={{
          maxWidth: '900px',
          padding: '3.5rem 3rem', textAlign: 'center',
        }}>
          <span style={{ color: '#fc4c02', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>How It Works</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, marginBottom: '2.5rem', color: 'white' }}>Get Started in 3 Simple Steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free and set up your fitness profile in seconds.' },
              { step: '02', title: 'Join Challenges', desc: 'Browse available challenges or create your own — running, yoga, cycling, and more.' },
              { step: '03', title: 'Track & Compete', desc: 'Log progress, earn XP and badges, and climb the global leaderboard.' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'rgba(252,76,2,0.15)', border: '2px solid rgba(252,76,2,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', fontWeight: 900, color: '#fc4c02',
                }}>{s.step}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,1)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="landing-section">
        <motion.div {...fadeUp()} className="card landing-container" style={{
          maxWidth: '700px',
          padding: '3.5rem 3rem', textAlign: 'center',
          background: 'rgba(252,76,2,0.08)',
          border: '1px solid rgba(252,76,2,0.25)',
        }}>
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
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>
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
