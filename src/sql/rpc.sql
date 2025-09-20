CREATE OR REPLACE FUNCTION get_conversation_between_users(user1_id uuid, user2_id uuid)
RETURNS TABLE(id uuid, created_at timestamptz, last_message_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.created_at, c.last_message_at
  FROM conversations c
  WHERE EXISTS (
    SELECT 1
    FROM conversation_participants cp1
    WHERE cp1.conversation_id = c.id AND cp1.user_id = user1_id
  )
  AND EXISTS (
    SELECT 1
    FROM conversation_participants cp2
    WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id
  )
  AND (
    SELECT count(*)
    FROM conversation_participants cp_count
    WHERE cp_count.conversation_id = c.id
  ) = 2;
END;
$$ LANGUAGE plpgsql;
