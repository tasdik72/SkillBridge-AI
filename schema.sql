-- This script will completely recreate your database schema.
-- 1. Create all tables
-- 2. Set up Row Level Security (RLS) for each table
-- 3. Create all database functions and triggers
-- 4. Enable realtime for all relevant tables

-- Step 1: Create Tables

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner',
  avatar_url TEXT,
  skills TEXT[],
  impact_score INT DEFAULT 0,
  bio TEXT,
  location TEXT,
  website TEXT,
  phone TEXT,
  is_public BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now(),
  headline TEXT,
  experience TEXT,
  education TEXT,
  certifications TEXT[],
  projects TEXT[],
  socials JSONB,
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_valid_chars CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create roadmaps table
CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  milestones JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'completed',
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- Step 2: Set up Row Level Security

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow anonymous users to read profiles for login." ON public.profiles FOR SELECT USING (true);

-- Roadmaps RLS
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roadmaps." ON public.roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own roadmaps." ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own roadmaps." ON public.roadmaps FOR UPDATE USING (auth.uid() = user_id);

-- Transactions RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert transactions." ON public.transactions FOR INSERT WITH CHECK (true); -- In production, this would be more restrictive

-- Community Posts RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view community posts." ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts." ON public.community_posts FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update their own posts." ON public.community_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own posts." ON public.community_posts FOR DELETE USING (auth.uid() = author_id);

-- Comments RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view comments." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments." ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own comments." ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Likes RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create mentorship_requests table
CREATE TABLE public.mentorship_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_active_request UNIQUE (learner_id, mentor_id, status)
);

-- Mentorship Requests RLS
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Learners can see their own sent requests." ON public.mentorship_requests FOR SELECT USING (auth.uid() = learner_id);
CREATE POLICY "Mentors can see their own received requests." ON public.mentorship_requests FOR SELECT USING (auth.uid() = mentor_id);
CREATE POLICY "Learners can create requests." ON public.mentorship_requests FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Mentors can update the status of their requests." ON public.mentorship_requests FOR UPDATE USING (auth.uid() = mentor_id) WITH CHECK (status IN ('accepted', 'rejected'));
CREATE POLICY "All users can view likes." ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts." ON public.likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can unlike posts." ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Create Functions and Triggers

-- Function to handle new user signup and create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the new user function on auth insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to toggle likes on a post
CREATE OR REPLACE FUNCTION toggle_like(post_id UUID, user_id UUID)
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.likes WHERE post_id = $1 AND user_id = $2) THEN
    DELETE FROM public.likes WHERE post_id = $1 AND user_id = $2;
  ELSE
    INSERT INTO public.likes (post_id, user_id) VALUES ($1, $2);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update milestone status and grant rewards
CREATE OR REPLACE FUNCTION public.update_milestone_status_and_reward(
    roadmap_id_arg UUID,
    milestone_id_arg TEXT,
    new_status_arg TEXT
)
RETURNS void AS $$
DECLARE
    roadmap_record RECORD;
    milestone_obj JSONB;
    milestone_index INT;
    updated_milestones JSONB;
    reward_amount NUMERIC;
BEGIN
    -- Select the specific roadmap
    SELECT * INTO roadmap_record FROM public.roadmaps WHERE id = roadmap_id_arg AND user_id = auth.uid();

    -- Find the milestone and its index
    SELECT value, index - 1 INTO milestone_obj, milestone_index
    FROM jsonb_array_elements(roadmap_record.milestones) WITH ORDINALITY arr(value, index)
    WHERE value->>'id' = milestone_id_arg;

    -- If the milestone is found, update its status
    IF milestone_obj IS NOT NULL THEN
        milestone_obj := jsonb_set(milestone_obj, '{status}', to_jsonb(new_status_arg));
        updated_milestones := jsonb_set(roadmap_record.milestones, ARRAY[milestone_index::text], milestone_obj);

        -- If the new status is 'completed', create a transaction
        IF new_status_arg = 'completed' THEN
            reward_amount := (milestone_obj->>'reward')::NUMERIC;
            IF reward_amount > 0 THEN
                INSERT INTO public.transactions (user_id, amount, type, reason, status)
                VALUES (auth.uid(), reward_amount, 'credit', 'Milestone completed: ' || (milestone_obj->>'title'), 'completed');
            END IF;

            -- Unlock the next milestone if it exists
            IF milestone_index + 1 < jsonb_array_length(updated_milestones) THEN
                updated_milestones := jsonb_set(updated_milestones, ARRAY[(milestone_index + 1)::text, 'status'], '"available"');
            END IF;
        END IF;

        -- Update the roadmap with the new milestones array
        UPDATE public.roadmaps
        SET milestones = updated_milestones
        WHERE id = roadmap_id_arg;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ
);

-- Create conversation_participants table
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security for conversation tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they are a part of" ON public.conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (true);

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add themselves to conversations" ON public.conversation_participants
FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their conversations" ON public.messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
  )
  AND sender_id = auth.uid()
);

-- Function to update last_message_at on new message
CREATE OR REPLACE FUNCTION update_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_message_at
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_message_at();

-- Function to get conversation between two users
CREATE OR REPLACE FUNCTION get_conversation_between_users(user1_id uuid, user2_id uuid)
RETURNS TABLE(id uuid, created_at timestamptz, last_message_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.created_at, c.last_message_at
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE cp1.user_id = user1_id AND cp2.user_id = user2_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create conversation if it doesn't exist
CREATE OR REPLACE FUNCTION create_conversation_if_not_exists(p_user1_id uuid, p_user2_id uuid)
RETURNS void AS $$
DECLARE
    v_conversation_id uuid;
BEGIN
    -- More robustly find a conversation with exactly these two participants
    SELECT c.id INTO v_conversation_id
    FROM conversations c
    WHERE (
        SELECT count(cp.user_id)
        FROM conversation_participants cp
        WHERE cp.conversation_id = c.id AND (cp.user_id = p_user1_id OR cp.user_id = p_user2_id)
    ) = 2
    AND (
        SELECT count(cp.user_id)
        FROM conversation_participants cp
        WHERE cp.conversation_id = c.id
    ) = 2
    LIMIT 1;

    -- If no conversation exists, create one
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (id) VALUES (gen_random_uuid()) RETURNING id INTO v_conversation_id;

        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (v_conversation_id, p_user1_id), (v_conversation_id, p_user2_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Enable Realtime

-- Enable realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles, public.roadmaps, public.transactions, public.community_posts, public.comments, public.likes, public.conversations, public.conversation_participants, public.messages;
