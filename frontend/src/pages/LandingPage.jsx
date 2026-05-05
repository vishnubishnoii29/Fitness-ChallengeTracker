import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a'
    }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        {/* Female fitness video from Pexels (free, no auth required) */}
        <source src="https://videos.pexels.com/video-files/4753879/4753879-sd_640_360_25fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)',
        zIndex: 1
      }} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 1.5rem',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Logo Icon */}
        <div style={{
          background: 'linear-gradient(135deg, #fc4c02, #ff7849)',
          padding: '1.1rem',
          borderRadius: '1.25rem',
          color: 'white',
          marginBottom: '1.75rem',
          boxShadow: '0 0 40px rgba(252,76,2,0.4)'
        }}>
          <Flame size={52} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          fontWeight: 900,
          color: 'white',
          marginBottom: '1rem',
          lineHeight: 1.1,
          letterSpacing: '-0.02em'
        }}>
          Fitness <span style={{ color: '#fc4c02' }}>Challenge</span> Tracker
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          color: 'rgba(255,255,255,0.75)',
          marginBottom: '2.75rem',
          fontWeight: 500,
          letterSpacing: '0.08em'
        }}>
          Track. Compete. Improve.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/register"
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #fc4c02, #ff7849)',
              color: 'white',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '1.05rem',
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(252,76,2,0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'inline-block'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(252,76,2,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(252,76,2,0.4)';
            }}
          >
            Start Your Quest
          </Link>

          <Link
            to="/login"
            style={{
              padding: '1rem 2.5rem',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '1.05rem',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(12px)',
              transition: 'transform 0.2s ease, background 0.2s ease',
              display: 'inline-block'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            Sign In
          </Link>
        </div>
      </motion.div>

      {/* Bottom badge */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.8rem',
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          zIndex: 2,
          whiteSpace: 'nowrap'
        }}
      >
        Join 10,000+ Athletes Worldwide
      </motion.p>
    </div>
  );
};

export default LandingPage;
