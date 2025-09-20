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
