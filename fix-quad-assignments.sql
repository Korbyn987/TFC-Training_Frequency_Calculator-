-- This script fixes the muscle group assignment for quad exercises.
-- It finds all exercises that should be categorized as 'quads' and updates their muscle_group_id.

DO $$
DECLARE
    quads_muscle_group_id INT;
BEGIN
    -- 1. Find the ID for the 'quads' muscle group.
    SELECT id INTO quads_muscle_group_id FROM public.muscle_groups WHERE name = 'quads' LIMIT 1;

    -- 2. If the 'quads' muscle group is found, update the exercises.
    IF quads_muscle_group_id IS NOT NULL THEN
        RAISE NOTICE 'Found muscle group "quads" with ID: %', quads_muscle_group_id;

        UPDATE public.exercises
        SET muscle_group_id = quads_muscle_group_id
        WHERE
            -- Identify quad exercises by name using a case-insensitive search
            LOWER(name) LIKE '%squat%'
            OR LOWER(name) LIKE '%leg press%'
            OR LOWER(name) LIKE '%lunge%'
            OR LOWER(name) LIKE '%step-up%'
            OR LOWER(name) LIKE '%goblet%'
            OR LOWER(name) LIKE '%hack squat%'
            OR LOWER(name) LIKE '%leg extension%';

        RAISE NOTICE 'Updated quad exercises to use the correct muscle_group_id.';
    ELSE
        RAISE WARNING 'Muscle group "quads" not found. No exercises were updated.';
    END IF;
END $$;
