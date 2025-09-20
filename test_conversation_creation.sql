-- Test script to verify conversation creation works
-- Run this in the Supabase SQL editor to test the conversation creation flow

-- Test 1: Check if the function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'create_conversation_if_not_exists'
  AND routine_type = 'FUNCTION';

-- Test 2: Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('conversations', 'conversation_participants', 'messages');

-- Test 3: Test the function with sample data
-- Replace these UUIDs with actual user IDs from your auth.users table
DO $$
DECLARE
    test_user1 UUID := 'your-learner-uuid-here'::UUID;
    test_user2 UUID := 'your-mentor-uuid-here'::UUID;
    conversation_count_before INT;
    conversation_count_after INT;
BEGIN
    -- Count existing conversations
    SELECT COUNT(*) INTO conversation_count_before
    FROM conversations c
    WHERE (
        SELECT COUNT(cp.user_id)
        FROM conversation_participants cp
        WHERE cp.conversation_id = c.id
          AND (cp.user_id = test_user1 OR cp.user_id = test_user2)
    ) = 2;

    RAISE NOTICE 'Conversations before: %', conversation_count_before;

    -- Create conversation
    PERFORM create_conversation_if_not_exists(test_user1, test_user2);

    -- Count conversations after
    SELECT COUNT(*) INTO conversation_count_after
    FROM conversations c
    WHERE (
        SELECT COUNT(cp.user_id)
        FROM conversation_participants cp
        WHERE cp.conversation_id = c.id
          AND (cp.user_id = test_user1 OR cp.user_id = test_user2)
    ) = 2;

    RAISE NOTICE 'Conversations after: %', conversation_count_after;

    -- Verify participants were added
    IF conversation_count_after = conversation_count_before + 1 THEN
        RAISE NOTICE 'SUCCESS: Conversation created successfully';
    ELSE
        RAISE NOTICE 'ERROR: Conversation was not created';
    END IF;
END $$;
