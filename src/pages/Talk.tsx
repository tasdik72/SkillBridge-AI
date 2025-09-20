import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const Talk = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (id && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === id);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [id, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      const subscription = supabase
        .channel(`messages:${selectedConversation.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` }, (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(id, created_at, last_message_at),
          profiles!inner(id, name, username, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('conversations[0].last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
        return;
      }

      // Transform the data to group by conversation
      const conversationsMap = new Map();
      data?.forEach((participant) => {
        const convId = participant.conversation_id;
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, {
            id: convId,
            created_at: participant.conversations?.[0]?.created_at || null,
            last_message_at: participant.conversations?.[0]?.last_message_at || null,
            conversation_participants: data.filter(p => p.conversation_id === convId)
          });
        }
      });

      const conversations = Array.from(conversationsMap.values());
      setConversations(conversations);

      // If no conversations exist, create a welcome message
      if (conversations.length === 0) {
        console.log('No conversations found, user can start new ones');
      }

    } catch (error) {
      console.error('Exception fetching conversations:', error);
      setConversations([]);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(*)')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Exception fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage.trim(),
        },
      ]);

      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Exception sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with conversations */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Conversations</h2>
        </div>
        <div className="overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((convo) => (
              <div
                key={convo.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedConversation?.id === convo.id ? 'bg-gray-100' : ''}`}
                onClick={() => setSelectedConversation(convo)}
              >
                <p className="font-semibold">
                  {convo.conversation_participants
                    .filter((p: any) => p.profiles.id !== user?.id)
                    .map((p: any) => p.profiles.name || p.profiles.username)
                    .join(', ')}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4">
              <p>No conversations yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {selectedConversation.conversation_participants
                  .filter((p: any) => p.profiles.id !== user?.id)
                  .map((p: any) => p.profiles.name || p.profiles.username)
                  .join(', ')}
              </h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`mb-4 ${msg.sender_id === user?.id ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block p-2 rounded-lg ${msg.sender_id === user?.id ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                    <p className="font-semibold">{msg.profiles.name || msg.profiles.username}</p>
                    <p>{msg.content}</p>
                    <p className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Talk;
