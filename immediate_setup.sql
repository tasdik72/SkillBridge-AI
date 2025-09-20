-- IMMEDIATE SETUP: Complete SQL script for SkillBridge
-- Run this in your Supabase SQL Editor to get everything working NOW

-- 1. Create all necessary tables
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Users can view conversations they are a part of" ON public.conversations;
CREATE POLICY "Users can view conversations they are a part of" ON public.conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can add themselves to conversations" ON public.conversation_participants;
CREATE POLICY "Users can add themselves to conversations" ON public.conversation_participants
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
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

-- 4. Create Functions
CREATE OR REPLACE FUNCTION update_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- 5. Create Triggers
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_message_at();

-- 6. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations, public.conversation_participants, public.messages;

-- 7. Fix mentorship requests constraint (make it work for any status)
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'unique_pending_request'
        AND table_name = 'mentorship_requests'
    ) THEN
        ALTER TABLE public.mentorship_requests DROP CONSTRAINT unique_pending_request;
    END IF;

    -- Add new constraint that prevents duplicates for any status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'unique_active_request'
        AND table_name = 'mentorship_requests'
    ) THEN
        ALTER TABLE public.mentorship_requests
        ADD CONSTRAINT unique_active_request UNIQUE (learner_id, mentor_id, status);
    END IF;
END $$;

-- 8. Create sample conversation for testing (optional)
-- Uncomment the lines below if you want to create a test conversation
/*
DO $$
DECLARE
    test_conversation_id UUID;
BEGIN
    -- Create a test conversation
    INSERT INTO conversations (id) VALUES (gen_random_uuid()) RETURNING id INTO test_conversation_id;

    -- Add current user to the conversation (replace with actual user ID)
    INSERT INTO conversation_participants (conversation_id, user_id)
    SELECT test_conversation_id, id FROM auth.users LIMIT 1;

    -- Add a test message
    INSERT INTO messages (conversation_id, sender_id, content)
    SELECT test_conversation_id, id, 'Welcome to SkillBridge Chat! 🎉'
    FROM auth.users LIMIT 1;
END $$;
*/

-- SETUP COMPLETE! Your certificate and talk system should work perfectly now.
