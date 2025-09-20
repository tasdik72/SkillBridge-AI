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
