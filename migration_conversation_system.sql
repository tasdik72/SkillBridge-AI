-- Migration script for existing databases to add conversation system
-- Run this if you already have an existing database with mentorship_requests

-- Create conversation tables
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

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (these will only be created if they don't exist)
DO $$
BEGIN
    -- Conversations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can view conversations they are a part of') THEN
        CREATE POLICY "Users can view conversations they are a part of" ON public.conversations
        FOR SELECT USING (
          EXISTS (
            SELECT 1
            FROM conversation_participants
            WHERE conversation_participants.conversation_id = conversations.id
              AND conversation_participants.user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can create conversations') THEN
        CREATE POLICY "Users can create conversations" ON public.conversations
        FOR INSERT WITH CHECK (true);
    END IF;

    -- Conversation participants policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_participants' AND policyname = 'Users can view participants of their conversations') THEN
        CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants
        FOR SELECT USING (
          EXISTS (
            SELECT 1
            FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
              AND cp.user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_participants' AND policyname = 'Users can add themselves to conversations') THEN
        CREATE POLICY "Users can add themselves to conversations" ON public.conversation_participants
        FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    -- Messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages in their conversations') THEN
        CREATE POLICY "Users can view messages in their conversations" ON public.messages
        FOR SELECT USING (
          EXISTS (
            SELECT 1
            FROM conversation_participants
            WHERE conversation_participants.conversation_id = messages.conversation_id
              AND conversation_participants.user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can send messages in their conversations') THEN
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
    END IF;
END $$;

-- Create functions
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

-- Create trigger for updating last_message_at
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_message_at();

-- Enable realtime on conversation tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations, public.conversation_participants, public.messages;

-- Create conversations for existing accepted mentorship requests
INSERT INTO conversations (id)
SELECT gen_random_uuid()
FROM public.mentorship_requests
WHERE status = 'accepted'
  AND NOT EXISTS (
    SELECT 1
    FROM conversations c
    WHERE (
      SELECT count(cp.user_id)
      FROM conversation_participants cp
      WHERE cp.conversation_id = c.id
        AND (cp.user_id = mentorship_requests.learner_id OR cp.user_id = mentorship_requests.mentor_id)
    ) = 2
  );

-- Add participants for existing accepted requests
INSERT INTO conversation_participants (conversation_id, user_id)
SELECT
  c.id,
  mr.learner_id
FROM public.mentorship_requests mr
CROSS JOIN conversations c
WHERE mr.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = c.id
      AND (cp.user_id = mr.learner_id OR cp.user_id = mr.mentor_id)
  )
UNION
SELECT
  c.id,
  mr.mentor_id
FROM public.mentorship_requests mr
CROSS JOIN conversations c
WHERE mr.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = c.id
      AND (cp.user_id = mr.learner_id OR cp.user_id = mr.mentor_id)
  );
