import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Crown, Star, Lock, CheckCircle, Award, Medal, Zap, ArrowLeft } from 'lucide-react';
import api from '../api';

const Achievements = () => {
  const [activeTab, setActiveTab] = useState('challenges');
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, challengesRes, leaderboardRes] = await Promise.all([
          api.get('users/profile'),
          api.get('challenges'),
          api.get('leaderboard')
        ]);
        setProfile(profileRes.data);
        setChallenges(challengesRes.data || []);
        setLeaderboard(leaderboardRes.data || []);
      } catch (err) {
        console.error('Error fetching achievements data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate real stats from fetched data
  const userStats = {
    level: profile?.level || 1,
    xp: profile?.xp !== undefined ? profile.xp : profile?.points || 0,
    streak: profile?.streak || 0,
    challengesCompleted: challenges.filter(c => c.completed).length,
    totalChallenges: challenges.length,
    leaderboardPosition: leaderboard.findIndex(u => u._id === profile?._id) + 1,
    totalUsers: leaderboard.length
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  const challengeAchievements = [
    {
      id: 'first_challenge',
      title: 'First Steps',
      description: 'Complete your first challenge',
      icon: <Target size={24} />,
      unlocked: userStats.challengesCompleted >= 1,
      progress: Math.min((userStats.challengesCompleted / 1) * 100, 100),
      reward: '50 XP',
      color: '#10b981'
    },
    {
      id: 'challenge_rookie',
      title: 'Rookie Achiever',
      description: 'Complete 5 challenges',
      icon: <Star size={24} />,
      unlocked: userStats.challengesCompleted >= 5,
      progress: Math.min((userStats.challengesCompleted / 5) * 100, 100),
      reward: '100 XP',
      color: '#3b82f6'
    },
    {
      id: 'challenge_warrior',
      title: 'Challenge Warrior',
      description: 'Complete 10 challenges',
      icon: <Trophy size={24} />,
      unlocked: userStats.challengesCompleted >= 10,
      progress: Math.min((userStats.challengesCompleted / 10) * 100, 100),
      reward: '200 XP',
      color: '#8b5cf6'
    },
    {
      id: 'challenge_veteran',
      title: 'Challenge Veteran',
      description: 'Complete 15 challenges',
      icon: <Medal size={24} />,
      unlocked: userStats.challengesCompleted >= 15,
      progress: Math.min((userStats.challengesCompleted / 15) * 100, 100),
      reward: '300 XP',
      color: '#06b6d4'
    },
    {
      id: 'challenge_elite',
      title: 'Elite Performer',
      description: 'Complete 20 challenges',
      icon: <Award size={24} />,
      unlocked: userStats.challengesCompleted >= 20,
      progress: Math.min((userStats.challengesCompleted / 20) * 100, 100),
      reward: '400 XP',
      color: '#ec4899'
    },
    {
      id: 'challenge_master',
      title: 'Challenge Master',
      description: 'Complete 25 challenges',
      icon: <Crown size={24} />,
      unlocked: userStats.challengesCompleted >= 25,
      progress: Math.min((userStats.challengesCompleted / 25) * 100, 100),
      reward: '500 XP',
      color: '#f59e0b'
    },
    {
      id: 'challenge_legend',
      title: 'Challenge Legend',
      description: 'Complete 50 challenges',
      icon: <Trophy size={24} />,
      unlocked: userStats.challengesCompleted >= 50,
      progress: Math.min((userStats.challengesCompleted / 50) * 100, 100),
      reward: '1000 XP',
      color: '#fbbf24'
    },
    {
      id: 'perfect_week',
      title: 'Perfect Week',
      description: 'Complete all daily challenges for a week',
      icon: <Star size={24} />,
      unlocked: userStats.streak >= 7,
      progress: Math.min((userStats.streak / 7) * 100, 100),
      reward: '150 XP',
      color: '#ef4444'
    },
    {
      id: 'perfect_month',
      title: 'Perfect Month',
      description: 'Maintain a 30-day streak',
      icon: <Flame size={24} />,
      unlocked: userStats.streak >= 30,
      progress: Math.min((userStats.streak / 30) * 100, 100),
      reward: '500 XP',
      color: '#f97316'
    }
  ];

  const streakAchievements = [
    {
      id: 'streak_beginner',
      title: 'Getting Started',
      description: 'Maintain a 3-day streak',
      icon: <Flame size={24} />,
      unlocked: userStats.streak >= 3,
      progress: Math.min((userStats.streak / 3) * 100, 100),
      reward: '30 XP',
      color: '#f59e0b'
    },
    {
      id: 'streak_weekly',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: <Zap size={24} />,
      unlocked: userStats.streak >= 7,
      progress: Math.min((userStats.streak / 7) * 100, 100),
      reward: '100 XP',
      color: '#ef4444'
    },
    {
      id: 'streak_fortnight',
      title: 'Fortnight Fighter',
      description: 'Maintain a 14-day streak',
      icon: <Star size={24} />,
      unlocked: userStats.streak >= 14,
      progress: Math.min((userStats.streak / 14) * 100, 100),
      reward: '200 XP',
      color: '#3b82f6'
    },
    {
      id: 'streak_monthly',
      title: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: <Medal size={24} />,
      unlocked: userStats.streak >= 30,
      progress: Math.min((userStats.streak / 30) * 100, 100),
      reward: '300 XP',
      color: '#8b5cf6'
    },
    {
      id: 'streak_quarterly',
      title: 'Quarterly Champion',
      description: 'Maintain a 90-day streak',
      icon: <Trophy size={24} />,
      unlocked: userStats.streak >= 90,
      progress: Math.min((userStats.streak / 90) * 100, 100),
      reward: '750 XP',
      color: '#ec4899'
    },
    {
      id: 'streak_century',
      title: 'Century Streak',
      description: 'Maintain a 100-day streak',
      icon: <Crown size={24} />,
      unlocked: userStats.streak >= 100,
      progress: Math.min((userStats.streak / 100) * 100, 100),
      reward: '1000 XP',
      color: '#fbbf24'
    },
    {
      id: 'streak_yearly',
      title: 'Year of Dedication',
      description: 'Maintain a 365-day streak',
      icon: <Award size={24} />,
      unlocked: userStats.streak >= 365,
      progress: Math.min((userStats.streak / 365) * 100, 100),
      reward: '5000 XP',
      color: '#10b981'
    }
  ];

  const leaderboardAchievements = [
    {
      id: 'leaderboard_top100',
      title: 'Top 100 Club',
      description: 'Reach top 100 on leaderboard',
      icon: <Star size={24} />,
      unlocked: userStats.leaderboardPosition <= 100 && userStats.leaderboardPosition > 0,
      progress: userStats.totalUsers > 0 ? Math.max(0, 100 - (userStats.leaderboardPosition / userStats.totalUsers) * 100) : 0,
      reward: '100 XP',
      color: '#6b7280'
    },
    {
      id: 'leaderboard_top50',
      title: 'Rising Star',
      description: 'Reach top 50 on leaderboard',
      icon: <Star size={24} />,
      unlocked: userStats.leaderboardPosition <= 50 && userStats.leaderboardPosition > 0,
      progress: userStats.totalUsers > 0 ? Math.max(0, 100 - (userStats.leaderboardPosition / userStats.totalUsers) * 100) : 0,
      reward: '150 XP',
      color: '#3b82f6'
    },
    {
      id: 'leaderboard_top25',
      title: 'Elite Contender',
      description: 'Reach top 25 on leaderboard',
      icon: <Award size={24} />,
      unlocked: userStats.leaderboardPosition <= 25 && userStats.leaderboardPosition > 0,
      progress: userStats.totalUsers > 0 ? Math.max(0, 100 - (userStats.leaderboardPosition / userStats.totalUsers) * 100) : 0,
      reward: '250 XP',
      color: '#06b6d4'
    },
    {
      id: 'leaderboard_top10',
      title: 'Elite Performer',
      description: 'Reach top 10 on leaderboard',
      icon: <Trophy size={24} />,
      unlocked: userStats.leaderboardPosition <= 10 && userStats.leaderboardPosition > 0,
      progress: userStats.totalUsers > 0 ? Math.max(0, 100 - (userStats.leaderboardPosition / userStats.totalUsers) * 100) : 0,
      reward: '300 XP',
      color: '#8b5cf6'
    },
    {
      id: 'leaderboard_top5',
      title: 'Top 5 Elite',
      description: 'Reach top 5 on leaderboard',
      icon: <Medal size={24} />,
      unlocked: userStats.leaderboardPosition <= 5 && userStats.leaderboardPosition > 0,
      progress: userStats.totalUsers > 0 ? Math.max(0, 100 - (userStats.leaderboardPosition / userStats.totalUsers) * 100) : 0,
      reward: '400 XP',
      color: '#ec4899'
    },
    {
      id: 'leaderboard_top3',
      title: 'Podium Finish',
      description: 'Reach top 3 on leaderboard',
      icon: <Medal size={24} />,
      unlocked: userStats.leaderboardPosition <= 3 && userStats.leaderboardPosition > 0,
      progress: userStats.totalUsers > 0 ? Math.max(0, 100 - (userStats.leaderboardPosition / userStats.totalUsers) * 100) : 0,
      reward: '500 XP',
      color: '#f59e0b'
    },
    {
      id: 'leaderboard_runnerup',
      title: 'Runner Up',
      description: 'Reach #2 on leaderboard',
      icon: <Trophy size={24} />,
      unlocked: userStats.leaderboardPosition === 2,
      progress: userStats.totalUsers > 0 ? Math.max(0, 100 - (userStats.leaderboardPosition / userStats.totalUsers) * 100) : 0,
      reward: '750 XP',
      color: '#c0c0c0'
    },
    {
      id: 'leaderboard_champion',
      title: 'Champion',
      description: 'Reach #1 on leaderboard',
      icon: <Crown size={24} />,
      unlocked: userStats.leaderboardPosition === 1,
      progress: userStats.totalUsers > 0 ? Math.max(0, 100 - (userStats.leaderboardPosition / userStats.totalUsers) * 100) : 0,
      reward: '1000 XP',
      color: '#fbbf24'
    }
  ];

  const xpAchievements = [
    {
      id: 'xp_100',
      title: 'Century Club',
      description: 'Earn 100 XP',
      icon: <Zap size={24} />,
      unlocked: userStats.xp >= 100,
      progress: Math.min((userStats.xp / 100) * 100, 100),
      reward: 'Level Up',
      color: '#10b981'
    },
    {
      id: 'xp_500',
      title: 'XP Master',
      description: 'Earn 500 XP',
      icon: <Star size={24} />,
      unlocked: userStats.xp >= 500,
      progress: Math.min((userStats.xp / 500) * 100, 100),
      reward: 'Level Up',
      color: '#3b82f6'
    },
    {
      id: 'xp_1000',
      title: 'XP Legend',
      description: 'Earn 1,000 XP',
      icon: <Trophy size={24} />,
      unlocked: userStats.xp >= 1000,
      progress: Math.min((userStats.xp / 1000) * 100, 100),
      reward: 'Level Up',
      color: '#8b5cf6'
    },
    {
      id: 'xp_2500',
      title: 'XP Elite',
      description: 'Earn 2,500 XP',
      icon: <Award size={24} />,
      unlocked: userStats.xp >= 2500,
      progress: Math.min((userStats.xp / 2500) * 100, 100),
      reward: 'Level Up',
      color: '#ec4899'
    },
    {
      id: 'xp_5000',
      title: 'XP Champion',
      description: 'Earn 5,000 XP',
      icon: <Crown size={24} />,
      unlocked: userStats.xp >= 5000,
      progress: Math.min((userStats.xp / 5000) * 100, 100),
      reward: 'Level Up',
      color: '#f59e0b'
    },
    {
      id: 'xp_10000',
      title: 'XP God',
      description: 'Earn 10,000 XP',
      icon: <Trophy size={24} />,
      unlocked: userStats.xp >= 10000,
      progress: Math.min((userStats.xp / 10000) * 100, 100),
      reward: 'Level Up',
      color: '#fbbf24'
    }
  ];

  const getAchievementsByTab = () => {
    switch (activeTab) {
      case 'challenges':
        return challengeAchievements;
      case 'streak':
        return streakAchievements;
      case 'leaderboard':
        return leaderboardAchievements;
      case 'xp':
        return xpAchievements;
      default:
        return challengeAchievements;
    }
  };

  const unlockedCount = (achievements) => achievements.filter(a => a.unlocked).length;
  const totalCount = (achievements) => achievements.length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fc4c02', marginBottom: '0.5rem', textShadow: '0 4px 20px rgba(252,76,2,0.3)' }}>
            <Trophy size={40} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Achievements
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Track your progress and unlock rewards as you conquer challenges
          </p>
        </div>
        
        <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
          <ArrowLeft size={18} /> <span className="hide-sm">Dashboard</span>
        </Link>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fc4c02' }}>{userStats.level}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Current Level</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{userStats.xp}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total XP</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>{userStats.streak}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Day Streak</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8b5cf6' }}>
              #{userStats.leaderboardPosition || '--'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Leaderboard</div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { id: 'challenges', label: 'Challenge Achievements', icon: <Target size={18} /> },
            { id: 'streak', label: 'Streak Achievements', icon: <Flame size={18} /> },
            { id: 'leaderboard', label: 'Leaderboard Achievements', icon: <Crown size={18} /> },
            { id: 'xp', label: 'XP Milestones', icon: <Zap size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.75rem 1.5rem'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
                {unlockedCount(getAchievementsByTab())}/{totalCount(getAchievementsByTab())}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {getAchievementsByTab().map((achievement) => (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.02 }}
              className="glass"
              style={{
                padding: '1.5rem',
                border: achievement.unlocked ? `2px solid ${achievement.color}` : '2px solid rgba(255,255,255,0.1)',
                background: achievement.unlocked 
                  ? `linear-gradient(135deg, ${achievement.color}20 0%, transparent 100%)` 
                  : 'rgba(255,255,255,0.02)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Achievement Icon */}
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '15px', 
                background: achievement.unlocked ? achievement.color : 'rgba(255,255,255,0.1)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem',
                color: 'white'
              }}>
                {achievement.unlocked ? achievement.icon : <Lock size={24} />}
              </div>

              {/* Achievement Content */}
              <div>
                <h3 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1.1rem', 
                  fontWeight: 800,
                  color: achievement.unlocked ? 'white' : 'var(--text-secondary)'
                }}>
                  {achievement.title}
                </h3>
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4
                }}>
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ 
                    height: '6px', 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${achievement.progress}%`,
                      background: achievement.unlocked ? achievement.color : 'rgba(255,255,255,0.3)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--text-secondary)', 
                    marginTop: '0.25rem',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{Math.round(achievement.progress)}% Complete</span>
                    {achievement.unlocked && <CheckCircle size={14} color={achievement.color} />}
                  </div>
                </div>

                {/* Reward */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: achievement.unlocked ? achievement.color : 'var(--text-secondary)'
                }}>
                  <Award size={16} />
                  {achievement.reward}
                </div>
              </div>

              {/* Unlocked Badge */}
              {achievement.unlocked && (
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem',
                  background: achievement.color,
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  UNLOCKED
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Achievements;
