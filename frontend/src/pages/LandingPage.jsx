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
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="https://player.vimeo.com/external/494252666.sd.mp4?s=72ad57a58268c2353ccf03c976220c5aed038510&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="bg-orange-600 p-4 rounded-2xl text-white mb-6 shadow-2xl shadow-orange-600/20">
            <Flame size={48} />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Fitness <span className="text-orange-500">Challenge</span> Tracker
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 font-medium tracking-wide">
            Track. Compete. Improve.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-xl hover:shadow-orange-600/40 text-lg"
            >
              Start Your Quest
            </Link>
            <Link
              to="/login"
              className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all backdrop-blur-md border border-white/20 transform hover:scale-105 text-lg"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-sm font-medium uppercase tracking-[0.2em]"
        >
          Join 10,000+ athletes worldwide
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
