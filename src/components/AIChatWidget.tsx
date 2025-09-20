import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bot, X, Send, User } from 'lucide-react';

const AIChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      setMessages(prev => [...prev, { sender: 'ai', text: "AI Assistant is not configured. The API key is missing." }]);
      return;
    }

    const newMessages = [...messages, { sender: 'user' as 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3.1:free',
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Always respond in English.' },
            ...newMessages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }))
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Error Response:', errorBody);
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      setMessages(prevMessages => [...prevMessages, { sender: 'ai' as 'ai', text: aiMessage }]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai' as 'ai', text: 'Sorry, I am having trouble connecting. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconColor = () => {
    if (!user) return 'text-gray-500'; // Guest
    if (user.role === 'mentor') return 'text-blue-500'; // Mentor
    return 'text-green-500'; // Learner
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg transition-transform hover:scale-110 bg-gradient-to-r from-green-600 to-teal-600"
      >
        <Bot className="w-8 h-8 text-white" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 left-4 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col">
          <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="font-bold">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </header>
          <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && <Bot className={`w-6 h-6 ${getIconColor()}`} />}
                  <div className={`p-2 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white' : 'bg-gray-200'}`}>
                    {msg.text}
                  </div>
                  {msg.sender === 'user' && <User className="w-6 h-6 text-gray-400" />}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                    <Bot className={`w-6 h-6 ${getIconColor()}`} />
                    <div className="p-2 rounded-lg bg-gray-200">
                        <span className="animate-pulse">...</span>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>
          <footer className="p-2 border-t">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button onClick={handleSendMessage} className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-2 rounded-r-md hover:from-green-700 hover:to-teal-700 disabled:opacity-50" disabled={isLoading}>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
