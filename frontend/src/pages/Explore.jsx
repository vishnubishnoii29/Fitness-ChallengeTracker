import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles, Plus, Play } from 'lucide-react';

const Explore = () => {
  const [filter, setFilter] = useState('All');

  const recommendations = [
    { title: 'HIIT Cardio Blast', type: 'Cardio', difficulty: 'Hard', duration: '30 min', match: '98%', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80' },
    { title: 'Core Strength Builder', type: 'Strength', difficulty: 'Medium', duration: '45 min', match: '92%', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80' }
  ];

  const exploreItems = [
    { title: 'Morning Yoga Flow', type: 'Flexibility', difficulty: 'Easy', duration: '20 min', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80' },
    { title: '5K Run Prep', type: 'Cardio', difficulty: 'Medium', duration: '4 Weeks', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&q=80' },
    { title: 'Powerlifting Basics', type: 'Strength', difficulty: 'Hard', duration: '60 min', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' },
    { title: 'Desk Worker Stretch', type: 'Flexibility', difficulty: 'Easy', duration: '10 min', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=500&q=80' }
  ];

  const categories = ['All', 'Cardio', 'Strength', 'Flexibility', 'Challenges'];

  // Filter exploreItems based on selected filter
  const filteredExploreItems = filter === 'All' 
    ? exploreItems 
    : exploreItems.filter(item => item.type === filter);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Explore</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discover new workouts and challenges.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Search..." style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', width: '250px' }} />
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.75rem' }}><Filter size={20} /></button>
        </div>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Sparkles color="var(--primary-color)" /> AI Recommended for You
        </h2>
        <div className="grid-2">
          {recommendations.map((item, i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative', height: '250px' }}>
              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ color: 'white' }}>
                    <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>{item.match} Match</span>
                    <h3 style={{ color: 'white', margin: '0 0 0.25rem 0' }}>{item.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0 }}>{item.difficulty} • {item.duration} • {item.type}</p>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}><Play size={16} /> Start</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={filter === cat ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid-4">
          {filteredExploreItems.length > 0 ? (
            filteredExploreItems.map((item, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '150px' }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className={`badge ${item.difficulty === 'Easy' ? 'badge-success' : item.difficulty === 'Medium' ? 'badge-warning' : 'badge-primary'}`}>{item.difficulty}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{item.duration}</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>{item.type}</p>
                  
                  <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
                    <Plus size={16} /> Add to Routine
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <p>No items found for "{filter}" category.</p>
            </div>
          )}
        </div>
      </section>

    </motion.div>
  );
};

export default Explore;
