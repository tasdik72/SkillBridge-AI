import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, UserProfile } from './AuthContext';
import { supabase } from '../services/supabase';

// Data structure interfaces will be defined here based on the SQL schema
// For now, we'll use 'any' and then replace with specific types

interface DatabaseContextType {
  roadmaps: any[];
  transactions: any[];
  communityPosts: any[];
  mentors: UserProfile[];
  mentorshipRequests: any[];
  loading: boolean;
  createRoadmap: (data: any) => Promise<any>;
  updateMilestone: (roadmapId: string, milestoneId: string, updates: any) => Promise<void>;
  addTransaction: (transaction: any) => Promise<void>;
  createPost: (content: string, tags: string[]) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  sendMentorshipRequest: (mentorId: string, message: string) => Promise<void>;
  updateMentorshipRequest: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
  balance: number;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within DatabaseProvider');
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [mentors, setMentors] = useState<UserProfile[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchAllData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchRoadmaps(),
            fetchTransactions(),
            fetchCommunityPosts(),
            fetchMentors(),
            fetchMentorshipRequests(),
          ]);
        } catch (error) {
          console.error("Error fetching initial data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();

      // Set up realtime subscriptions
      const roadmapSub = supabase.channel('public:roadmaps').on('postgres_changes', { event: '*', schema: 'public', table: 'roadmaps' }, fetchRoadmaps).subscribe();
      const transactionSub = supabase.channel('public:transactions').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchTransactions).subscribe();
      const postSub = supabase.channel('public:community_posts').on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, fetchCommunityPosts).subscribe();
      const mentorshipSub = supabase.channel('public:mentorship_requests').on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_requests' }, fetchMentorshipRequests).subscribe();

      return () => {
        supabase.removeChannel(roadmapSub);
        supabase.removeChannel(transactionSub);
        supabase.removeChannel(postSub);
        supabase.removeChannel(mentorshipSub);
      };
    }
  }, [user]);

  const fetchRoadmaps = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('roadmaps').select('*').eq('user_id', user.id);
    if (error) console.error('Error fetching roadmaps:', error);
    else setRoadmaps(data || []);
  };

  const fetchTransactions = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('timestamp', { ascending: false });
    if (error) console.error('Error fetching transactions:', error);
    else {
      setTransactions(data);
      const newBalance = data.reduce((acc, t) => t.type === 'credit' ? acc + t.amount : acc - t.amount, 0);
      setBalance(newBalance);
    }
  };

  const fetchCommunityPosts = async () => {
    const { data, error } = await supabase.from('community_posts').select('*, author:profiles!author_id(*), likes(user_id), comments(count)').order('created_at', { ascending: false });
    if (error) console.error('Error fetching posts:', error);
    else setCommunityPosts(data || []);
  };

  const fetchMentors = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'mentor');
    if (error) console.error('Error fetching mentors:', error);
    else setMentors(data);
  };

  const fetchMentorshipRequests = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('mentorship_requests').select('*, learner:profiles!learner_id(*), mentor:profiles!mentor_id(*)');
    if (error) console.error('Error fetching mentorship requests:', error);
    else setMentorshipRequests(data || []);
  };

  const createRoadmap = async (data: any) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    try {
      const { data: newRoadmap, error } = await supabase.from('roadmaps').insert({ ...data, user_id: user.id }).select().single();
      if (error) throw error;
      setRoadmaps(prev => [...prev, newRoadmap]);
      return newRoadmap;
    } finally {
      setLoading(false);
    }
  };

  const updateMilestone = async (roadmapId: string, milestoneId: string, updates: any) => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.rpc('update_milestone_status_and_reward', {
      roadmap_id_arg: roadmapId,
      milestone_id_arg: milestoneId,
      new_status_arg: updates.status
    });
    if (error) throw error;
  };

  const addTransaction = async (transaction: any) => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.from('transactions').insert({ ...transaction, user_id: user.id });
    if (error) throw error;
  };

  const createPost = async (content: string, tags: string[]) => {
    if (!user) throw new Error('User not authenticated');
    const { data: newPost, error } = await supabase.from('community_posts').insert({ content, tags, author_id: user.id }).select('*, author:profiles!author_id(*), likes(user_id), comments(count)').single();
    if (error) throw error;
    setCommunityPosts(prev => [newPost, ...prev]);
  };

  const likePost = async (postId: string) => {
    if (!user) throw new Error('User not authenticated');
    // This would be a Supabase function to handle toggling likes atomically
    const { error } = await supabase.rpc('toggle_like', { post_id: postId, user_id: user.id });
    if (error) throw error;
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.from('comments').insert({ post_id: postId, content, author_id: user.id });
    if (error) throw error;
  };

  const sendMentorshipRequest = async (mentorId: string, message: string) => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.from('mentorship_requests').insert({ learner_id: user.id, mentor_id: mentorId, message });
    if (error) throw error;
  };

  const updateMentorshipRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.from('mentorship_requests').update({ status }).eq('id', requestId);
    if (error) throw error;
  };

  return (
    <DatabaseContext.Provider value={{
      roadmaps,
      transactions,
      communityPosts,
      mentors,
      mentorshipRequests,
      balance,
      loading,
      createRoadmap,
      updateMilestone,
      addTransaction,
      createPost,
      likePost,
      addComment,
      sendMentorshipRequest,
      updateMentorshipRequest
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};