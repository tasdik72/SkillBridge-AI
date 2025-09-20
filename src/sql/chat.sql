-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they are a part of" ON conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" ON conversations
FOR INSERT WITH CHECK (true);

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add themselves to conversations" ON conversation_participants
FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their conversations" ON messages
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
