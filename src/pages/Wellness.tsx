import React, { useState, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { 
  Heart, 
  MessageCircle, 
  Activity, 
  Sun, 
  Cloud, 
  CloudRain,
  Lightbulb,
  Clock,
  TrendingUp,
  Phone
} from 'lucide-react';

const Wellness = () => {
  const { getWellnessResponse } = useAI();
  const [currentMood, setCurrentMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Array<{date: string, mood: string}>>([]);

  useEffect(() => {
    // Load mood history from localStorage
    const saved = localStorage.getItem('wellness_mood_history');
    if (saved) {
      setMoodHistory(JSON.parse(saved));
    }
  }, []);

  const handleMoodCheck = async (mood: 'happy' | 'neutral' | 'sad') => {
    setCurrentMood(mood);
    setLoading(true);

    // Save mood to history
    const today = new Date().toISOString().split('T')[0];
    const newMoodHistory = [...moodHistory.filter(m => m.date !== today), { date: today, mood }];
    setMoodHistory(newMoodHistory);
    localStorage.setItem('wellness_mood_history', JSON.stringify(newMoodHistory));

    try {
      const response = await getWellnessResponse(mood);
      setAiResponse(response);
    } catch (error) {
      setAiResponse('Thank you for sharing. Remember that every day is a new opportunity to feel better.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputMessage
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await getWellnessResponse(currentMood || 'neutral', inputMessage);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: response
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: 'I appreciate you sharing with me. If you need professional support, please reach out to a counselor or mental health professional.'
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'neutral': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'sad': return <CloudRain className="w-6 h-6 text-blue-500" />;
      default: return <Heart className="w-6 h-6 text-gray-400" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'neutral': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sad': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const wellnessTips = [
    {
      icon: Activity,
      title: '5-Minute Breathing',
      description: 'Try deep breathing: 4 counts in, hold for 4, exhale for 6',
      action: 'Start Exercise'
    },
    {
      icon: Lightbulb,
      title: 'Quick Mindfulness',
      description: 'Focus on 3 things you can see, 2 you can hear, 1 you can touch',
      action: 'Try Now'
    },
    {
      icon: TrendingUp,
      title: 'Progress Reflection',
      description: 'List 3 achievements from this week, no matter how small',
      action: 'Reflect'
    }
  ];

  const emergencyResources = [
    {
      title: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
      description: '24/7 crisis support via text message'
    },
    {
      title: 'National Suicide Prevention Lifeline',
      contact: '988',
      description: 'Free and confidential emotional support 24/7'
    },
    {
      title: 'SAMHSA National Helpline',
      contact: '1-800-662-4357',
      description: 'Treatment referral and information service'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wellness Companion</h1>
        <p className="text-gray-600">Check in with yourself and get personalized wellness support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Check-In */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Heart className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Daily Mood Check-In</h2>
            </div>

            <p className="text-gray-600 mb-6">How are you feeling today?</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => handleMoodCheck('happy')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  currentMood === 'happy' 
                    ? 'border-yellow-300 bg-yellow-50' 
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                <Sun className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="font-medium text-gray-900">Great</p>
                <p className="text-sm text-gray-600">😊</p>
              </button>

              <button
                onClick={() => handleMoodCheck('neutral')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  currentMood === 'neutral' 
                    ? 'border-gray-300 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Cloud className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="font-medium text-gray-900">Okay</p>
                <p className="text-sm text-gray-600">😐</p>
              </button>

              <button
                onClick={() => handleMoodCheck('sad')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  currentMood === 'sad' 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <CloudRain className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <p className="font-medium text-gray-900">Tough</p>
                <p className="text-sm text-gray-600">😔</p>
              </button>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Getting personalized support...</p>
              </div>
            )}

            {aiResponse && !loading && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900 mb-1">Wellness Assistant</h3>
                    <p className="text-green-800">{aiResponse}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          {currentMood && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Talk It Out</h3>
              </div>

              <div className="h-64 overflow-y-auto mb-4 space-y-3 border rounded-lg p-4 bg-gray-50">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Share what's on your mind. I'm here to listen and provide support.
                  </p>
                ) : (
                  chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 text-gray-900 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Wellness Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Wellness Activities</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wellnessTips.map((tip, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <tip.icon className="w-8 h-8 text-green-600 mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">{tip.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    {tip.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mood History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood Trend</h3>
            {moodHistory.length > 0 ? (
              <div className="space-y-3">
                {moodHistory.slice(-7).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getMoodIcon(entry.mood)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                        {entry.mood}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Check in daily to track your mood trends</p>
            )}
          </div>

          {/* Emergency Resources */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Need Immediate Help?</h3>
            </div>
            <div className="space-y-4">
              {emergencyResources.map((resource, index) => (
                <div key={index} className="border-b border-red-200 pb-3 last:border-b-0 last:pb-0">
                  <h4 className="font-medium text-red-900">{resource.title}</h4>
                  <p className="font-bold text-red-800">{resource.contact}</p>
                  <p className="text-sm text-red-700">{resource.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wellness Tips */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-3">Daily Wellness Reminder</h3>
            <p className="text-sm text-purple-100 mb-4">
              Your mental health is just as important as your physical health. Take time to care for both.
            </p>
            <div className="text-xs text-purple-100 space-y-1">
              <p>✨ Practice gratitude daily</p>
              <p>💪 Stay physically active</p>
              <p>🤝 Connect with others</p>
              <p>😴 Get adequate sleep</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wellness;