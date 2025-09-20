import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string; 
  role: 'learner' | 'mentor';
  avatar_url?: string;
  skills?: string[];
  impact_score?: number;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  is_public?: boolean;
  joined_at?: string; 
  headline?: string;
  experience?: string;
  education?: string;
  certifications?: string[];
  projects?: string[];
  socials?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        throw error;
      }
      
      setUser(data || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    let email = identifier;

    // Check if the identifier is a username or an email
    if (!identifier.includes('@')) {
      const { data, error } = await supabase
        .from('profiles')
        .select('users(email)')
        .eq('username', identifier)
        .single();

      if (error || !data) {
        throw new Error('User not found');
      }
      // Supabase returns a nested object, so we need to access the email property
      const userEmail = (data as any)?.users?.email;
      if (!userEmail) {
        throw new Error('Email not found for this user');
      }
      email = userEmail;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (data: any) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          username: data.username,
          role: data.role,
          skills: data.skills,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Signup failed: no user returned');

    // The trigger will create the profile, so we just need to wait for the session and fetch it.
    // A small delay might be needed for the trigger to complete before fetching.
    setTimeout(() => {
        if(authData.session) {
            fetchUserProfile(authData.session);
        }
    }, 1000); // Wait 1 second
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedUser };
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};