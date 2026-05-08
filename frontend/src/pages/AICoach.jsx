import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, Trash2, Zap, Activity, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiBaseURL } from '../api';
import '../index.css';

const getStoredToken = () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser).token || null;
  } catch (error) {
    console.error('Failed to parse stored user data:', error);
    localStorage.removeItem('user');
    return null;
  }
};

const AICoach = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse chat history:', error);
        localStorage.removeItem('chatHistory');
      }
    }

    return [
      { 
        role: 'model', 
        content: "👋 Hello! I'm your FitQuest AI Coach. I've analyzed your fitness metrics and I'm ready to help you reach Level 50! What's on your mind today?" 
      }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    { text: "How to reach Level 50?", icon: <Zap size={14} /> },
    { text: "Nutrition for recovery", icon: <Activity size={14} /> },
    { text: "Daily workout plan", icon: <Sparkles size={14} /> },
    { text: "Analyze my progress", icon: <Info size={14} /> }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e, text = null) => {
    if (e) e.preventDefault();
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    // Placeholder for AI response
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      const token = getStoredToken();
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBaseURL}ai/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMessage, history: history })
      });

      if (!response.ok) throw new Error('Stream request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const { text } = JSON.parse(data);
              // Update the last message in real-time by appending text
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content += text;
                return newMessages;
              });
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('AI Chat Stream Error:', err);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "I'm having trouble connecting to my fitness database. Please check your network or API key!";
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    setMessages([{ 
      role: 'model', 
      content: "History cleared! How can I help you today?" 
    }]);
    setShowClearConfirm(false);
  };

  return (
    <div className="ai-coach-page" style={{ 
      height: 'calc(100vh - 4rem)', // Account for 2rem top/bottom padding of main-content
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Prevent page scroll
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card" 
        style={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '0.75rem 1.5rem', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: 'var(--gradient-primary)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              boxShadow: '0 0 10px rgba(252, 76, 2, 0.2)'
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>FITQUEST AI</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, opacity: 0.8 }}>ONLINE</span>
              </div>
            </div>
          </div>
          <button 
            onClick={clearChat} 
            className="btn-icon"
            style={{ color: 'var(--danger-color)', opacity: 0.6, transition: '0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          scrollbarWidth: 'thin',
          background: 'radial-gradient(circle at top right, rgba(252, 76, 2, 0.03), transparent)'
        }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '12px',
                  alignItems: 'flex-end'
                }}
              >
                {msg.role === 'model' && (
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'var(--gradient-primary)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    marginBottom: '4px'
                  }}>
                    <Bot size={16} color="white" />
                  </div>
                )}
                
                <div style={{ 
                  maxWidth: '75%',
                  padding: '1.25rem 1.5rem',
                  borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                  background: msg.role === 'user' ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: msg.role === 'user' ? 'none' : 'blur(10px)',
                  color: 'white',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  boxShadow: msg.role === 'user' ? '0 10px 20px rgba(252, 76, 2, 0.2)' : '0 10px 30px rgba(0,0,0,0.2)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  wordBreak: 'break-word'
                }}>
                  {msg.role === 'model' ? (
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span style={{ fontWeight: 600 }}>{msg.content}</span>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'rgba(255, 255, 255, 0.1)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    marginBottom: '4px', border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <User size={16} color="white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: 'var(--gradient-primary)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={16} color="white" />
              </div>
              <div className="typing-indicator" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer with Prompts and Input */}
        <div style={{ 
          padding: '1rem 1.5rem', 
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid var(--border-color)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Predefined Prompts */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
            {suggestedPrompts.map((p, i) => (
              <button 
                key={i}
                onClick={() => handleSend(null, p.text)}
                style={{ 
                  whiteSpace: 'nowrap',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '0.4rem 0.8rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: '0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(252, 76, 2, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(252, 76, 2, 0.3)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {p.icon}
                {p.text}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={{ 
                flex: 1,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0.8rem 1.25rem',
                color: 'white',
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(252, 76, 2, 0.5)';
                e.target.style.background = 'rgba(0, 0, 0, 0.4)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.background = 'rgba(0, 0, 0, 0.3)';
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary"
              style={{ 
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                padding: 0,
                justifyContent: 'center'
              }}
            >
              <Send size={20} />
            </button>
          </form>
        </div>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: 'var(--card-bg, #1a1a1a)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '2rem',
                  maxWidth: '400px',
                  width: '100%',
                  textAlign: 'center',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(252, 76, 2, 0.1)', color: 'var(--danger-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Trash2 size={24} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontWeight: 800 }}>Clear Chat History?</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', fontSize: '0.95rem' }}>
                  This action cannot be undone. All your conversations with the AI Coach will be permanently deleted.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setShowClearConfirm(false)}
                    style={{
                      flex: 1, padding: '0.8rem', borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)', color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontWeight: 600, cursor: 'pointer', transition: '0.2s'
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={e => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmClearChat}
                    style={{
                      flex: 1, padding: '0.8rem', borderRadius: '8px',
                      background: 'var(--danger-color)', color: 'white',
                      border: 'none', fontWeight: 600, cursor: 'pointer', transition: '0.2s'
                    }}
                    onMouseEnter={e => e.target.style.opacity = 0.8}
                    onMouseLeave={e => e.target.style.opacity = 1}
                  >
                    Clear History
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      <style>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 1rem 1.25rem;
          border-radius: 24px 24px 24px 4px;
          align-items: center;
        }
        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        .markdown-content p { margin: 0 0 1.25em 0; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { 
          margin: 1.5rem 0 0.75rem 0; 
          color: white;
          font-weight: 900;
          letter-spacing: -0.01em;
        }
        .markdown-content ul, .markdown-content ol { 
          margin: 1rem 0; 
          padding-left: 1.5rem;
        }
        .markdown-content li { margin-bottom: 0.75rem; }
        .markdown-content strong { color: white; font-weight: 900; background: rgba(252, 76, 2, 0.2); padding: 0 4px; border-radius: 4px; }
        .markdown-content code {
          background: rgba(255,255,255,0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85em;
        }
        .markdown-content blockquote {
          border-left: 4px solid var(--primary-color);
          padding-left: 1rem;
          margin-left: 0;
          color: rgba(255,255,255,0.8);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default AICoach;
