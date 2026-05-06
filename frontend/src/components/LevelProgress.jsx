import { motion } from 'framer-motion';

const LevelProgress = ({ user }) => {
  if (!user) return null;

  const xp = user.xp !== undefined ? user.xp : user.points || 0;
  const currentLevel = user.level || 1;
  
  // Progress bar logic - authoritative min/max XP for the current level
  const getXPForLevel = (l) => l <= 1 ? 0 : 500 * (l * l - l);

  const currentLevelMinXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  
  const progressXP = xp - currentLevelMinXP;
  const xpRange = nextLevelXP - currentLevelMinXP;
  const progressPercent = (progressXP / xpRange) * 100;

  const getLevelTitle = (level) => {
    const titles = {
      1: 'Beginner', 2: 'Novice', 3: 'Amateur', 4: 'Skilled', 5: 'Expert',
      10: 'Master', 15: 'Legend', 20: 'Elite', 25: 'Champion', 30: 'Grandmaster'
    };
    
    // Find the highest title level <= current level
    let title = 'Beginner';
    for (const [titleLevel, titleName] of Object.entries(titles)) {
      if (parseInt(titleLevel) <= level) {
        title = titleName;
      }
    }
    return title;
  };

  const levelTitle = getLevelTitle(currentLevel);
  const xpToNextLevel = nextLevelXP - xp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
    >
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: 'var(--radius-md)', 
        background: 'linear-gradient(135deg, #fc4c02 0%, #ff6b35 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: 900
      }}>
        {currentLevel}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
              Level Progress
            </p>
            <h3 style={{ 
              margin: 0, 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: '0.25rem',
              fontSize: '1rem'
            }}>
              Level {currentLevel} <span style={{ fontSize: '0.75rem', color: '#fc4c02', fontWeight: 'normal' }}>{levelTitle}</span>
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fc4c02' }}>
              {xp.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              XP
            </div>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="progress-container" style={{ marginBottom: '0.5rem' }}>
          <motion.div 
            className="progress-bar" 
            style={{ 
              background: 'linear-gradient(90deg, #fc4c02 0%, #ff6b35 100%)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <span>{Math.round(progressPercent)}%</span>
          <span>{xpToNextLevel.toLocaleString()} XP to next level</span>
        </div>
      </div>
    </motion.div>
  );
};

export default LevelProgress;
