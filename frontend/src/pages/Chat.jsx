import React, { useState, useRef, useEffect } from 'react';
import { Send, Dumbbell, Apple, BarChart3, Zap, Bot, User, Loader2 } from 'lucide-react';
import { sendMessage } from '../utils/api';

const quickActions = [
  { icon: '💪', label: 'Workout Plan', message: 'Give me a personalized workout plan for today' },
  { icon: '🥗', label: 'Meal Plan', message: 'Suggest a healthy meal plan for today' },
  { icon: '📊', label: 'My Progress', message: 'Show me my progress report' },
  { icon: '📏', label: 'Calculate BMI', message: 'Calculate my BMI. My weight is 70kg and height is 170cm' },
  { icon: '🏆', label: 'My Stats', message: 'Show me my points, level, and achievements' },
  { icon: '🔥', label: 'Motivation', message: 'I need some motivation today' },
];

export default function Chat() {
  // ✅ Load from localStorage in initial state (like Workouts.jsx)
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load chat history', e);
        return [{ role: 'assistant', content: 'Hey there! 👋 I\'m your **FitCoach AI** — your personal fitness coach powered by multi-agent AI.\n\nI can help you with:\n- 💪 Personalized workout plans\n- 🥗 Nutrition & diet advice\n- 📊 Progress tracking & BMI\n- 🏆 Points, levels & achievements\n\nWhat would you like to start with? Or tell me about yourself so I can personalize your experience!', agent: 'general' }];
      }
    }
    return [{ role: 'assistant', content: 'Hey there! 👋 I\'m your **FitCoach AI** — your personal fitness coach powered by multi-agent AI.\n\nI can help you with:\n- 💪 Personalized workout plans\n- 🥗 Nutrition & diet advice\n- 📊 Progress tracking & BMI\n- 🏆 Points, levels & achievements\n\nWhat would you like to start with? Or tell me about yourself so I can personalize your experience!', agent: 'general' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only close if clicking outside the dropdown menu
      if (!e.target.hasAttribute('data-menu-target') && !e.target.closest('[data-menu-target]')) {
        setOpenMenuIndex(null);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendMessage(msg);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        agent: data.agent,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, something went wrong. Please make sure the backend server is running and try again!',
        agent: 'error',
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const deleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllMessages = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      const defaultMessages = [
        { role: 'assistant', content: 'Hey there! 👋 I\'m your **FitCoach AI** — your personal fitness coach powered by multi-agent AI.\n\nI can help you with:\n- 💪 Personalized workout plans\n- 🥗 Nutrition & diet advice\n- 📊 Progress tracking & BMI\n- 🏆 Points, levels & achievements\n\nWhat would you like to start with? Or tell me about yourself so I can personalize your experience!', agent: 'general' }
      ];
      setMessages(defaultMessages);
      localStorage.setItem('chatMessages', JSON.stringify(defaultMessages));
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content.replace(/<[^>]+>/g, ''));
    alert('Message copied to clipboard!');
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditText(messages[index].content);
  };

  const saveEdit = (index) => {
    const updatedMessages = [...messages];
    updatedMessages[index].content = editText;
    setMessages(updatedMessages);
    setEditingIndex(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
  };

  const getAgentBadge = (agent) => {
    const badges = {
      workout: { label: '💪 Workout Agent', color: 'bg-blue-500/20 text-blue-400' },
      nutrition: { label: '🥗 Nutrition Agent', color: 'bg-green-500/20 text-green-400' },
      progress: { label: '📊 Progress Agent', color: 'bg-purple-500/20 text-purple-400' },
      motivation: { label: '🏆 Motivation Agent', color: 'bg-amber-500/20 text-amber-400' },
      general: { label: '🤖 FitCoach', color: 'bg-primary-500/20 text-primary-400' },
    };
    return badges[agent] || badges.general;
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/#{1,3}\s(.*)/g, '<strong style="font-size:1.1em">$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-auto px-4 py-6 space-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 message-enter group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar with Dropdown */}
            <div className="flex flex-col items-center gap-1">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-700'
                  : 'bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-700/50'
                }
              `}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Dropdown Button Below Avatar */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuIndex(openMenuIndex === i ? null : i);
                  }}
                  className="text-xs px-1 py-0.5 rounded hover:bg-dark-700 transition"
                  title="More options"
                  data-menu-target
                >
                  ⋯
                </button>

                {/* Dropdown Menu */}
                {openMenuIndex === i && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-12 glass rounded-lg shadow-lg z-50 overflow-hidden" data-menu-target onClick={(e) => e.stopPropagation()}>
                    {/* Copy */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyMessage(messages[i].content);
                        setOpenMenuIndex(null);
                      }}
                      className="w-full text-left px-1 py-2 text-xs hover:bg-blue-500/20 flex items-center gap-2 transition"
                    >
                      📋 Copy
                    </button>

                    {/* Edit (only user) */}
                    {msg.role === 'user' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(i);
                          setOpenMenuIndex(null);
                        }}
                        className="w-full text-left px-1 py-2 text-xs hover:bg-yellow-500/20 flex items-center gap-2 transition"
                      >
                        ✏️ Edit
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(i);
                        setOpenMenuIndex(null);
                      }}
                      className="w-full text-left px-1 py-2 text-xs hover:bg-red-500/20 flex items-center gap-2 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              {/* Always show agent badge */}
              {msg.agent && (
                <div className={`inline-block text-xs px-2 py-0.5 rounded-full w-fit ${getAgentBadge(msg.agent).color}`}>
                  {getAgentBadge(msg.agent).label}
                </div>
              )}

              <div
                className={`
                      inline-block max-w-[70%] min-w-[120px]
                      rounded-2xl px-4 py-3 break-words
                      ${msg.role === 'user'
                    ? 'bg-primary-600/20 border border-primary-500/20'
                    : 'glass'
                  }
  `}
              >
                {editingIndex === i ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="text-xs px-2 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(i)}
                        className="text-xs px-2 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-xs px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      className="text-sm leading-relaxed text-dark-200/90"
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 message-enter">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-700/50 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-1">
              <div className="typing-dot w-2 h-2 bg-primary-500 rounded-full" />
              <div className="typing-dot w-2 h-2 bg-primary-500 rounded-full" />
              <div className="typing-dot w-2 h-2 bg-primary-500 rounded-full" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSend(action.message)}
                className="px-3 py-2 glass rounded-xl text-xs hover:bg-dark-800/80 hover:border-primary-500/30 transition-all flex items-center gap-1.5"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-dark-700/30">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about fitness, workouts, nutrition..."
            className="flex-1 bg-dark-900/50 border border-dark-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-200/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/20"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
          <div className="ml-4 flex items-center">
            <button
              onClick={clearAllMessages}
              className="text-xs px-4 py-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
            >
              Clear All Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
