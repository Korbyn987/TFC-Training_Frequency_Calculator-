-- Comprehensive script to fix all leg muscle group assignments
-- This script diagnoses and corrects muscle group assignments for quads, hamstrings, glutes, and calves

DO $$
DECLARE
    quads_id INT;
    hamstrings_id INT;
    glutes_id INT;
    calves_id INT;
    quad_count INT;
    hamstring_count INT;
    glute_count INT;
    calf_count INT;
BEGIN
    -- Get muscle group IDs
    SELECT id INTO quads_id FROM public.muscle_groups WHERE name = 'quads' LIMIT 1;
    SELECT id INTO hamstrings_id FROM public.muscle_groups WHERE name = 'hamstrings' LIMIT 1;
    SELECT id INTO glutes_id FROM public.muscle_groups WHERE name = 'glutes' LIMIT 1;
    SELECT id INTO calves_id FROM public.muscle_groups WHERE name = 'calves' LIMIT 1;

    -- Show current counts BEFORE fixes
    SELECT COUNT(*) INTO quad_count FROM public.exercises WHERE muscle_group_id = quads_id;
    SELECT COUNT(*) INTO hamstring_count FROM public.exercises WHERE muscle_group_id = hamstrings_id;
    SELECT COUNT(*) INTO glute_count FROM public.exercises WHERE muscle_group_id = glutes_id;
    SELECT COUNT(*) INTO calf_count FROM public.exercises WHERE muscle_group_id = calves_id;
    
    RAISE NOTICE 'BEFORE FIXES - Quads: %, Hamstrings: %, Glutes: %, Calves: %', quad_count, hamstring_count, glute_count, calf_count;

    -- Fix QUADS exercises
    IF quads_id IS NOT NULL THEN
        UPDATE public.exercises
        SET muscle_group_id = quads_id
        WHERE (
            LOWER(name) LIKE '%squat%'
            OR LOWER(name) LIKE '%leg press%'
            OR LOWER(name) LIKE '%lunge%'
            OR LOWER(name) LIKE '%step-up%'
            OR LOWER(name) LIKE '%goblet%'
            OR LOWER(name) LIKE '%hack squat%'
            OR LOWER(name) LIKE '%leg extension%'
            OR LOWER(name) LIKE '%quad%'
        ) AND muscle_group_id != quads_id;
        
        GET DIAGNOSTICS quad_count = ROW_COUNT;
        RAISE NOTICE 'Updated % exercises to QUADS', quad_count;
    END IF;

    -- Fix HAMSTRINGS exercises
    IF hamstrings_id IS NOT NULL THEN
        UPDATE public.exercises
        SET muscle_group_id = hamstrings_id
        WHERE (
            LOWER(name) LIKE '%deadlift%'
            OR LOWER(name) LIKE '%leg curl%'
            OR LOWER(name) LIKE '%hamstring%'
            OR LOWER(name) LIKE '%rdl%'
            OR LOWER(name) LIKE '%romanian%'
            OR LOWER(name) LIKE '%good morning%'
        ) AND muscle_group_id != hamstrings_id;
        
        GET DIAGNOSTICS hamstring_count = ROW_COUNT;
        RAISE NOTICE 'Updated % exercises to HAMSTRINGS', hamstring_count;
    END IF;

    -- Fix GLUTES exercises
    IF glutes_id IS NOT NULL THEN
        UPDATE public.exercises
        SET muscle_group_id = glutes_id
        WHERE (
            LOWER(name) LIKE '%hip thrust%'
            OR LOWER(name) LIKE '%glute%'
            OR LOWER(name) LIKE '%hip bridge%'
            OR LOWER(name) LIKE '%bulgarian%'
            OR LOWER(name) LIKE '%kickback%'
        ) AND muscle_group_id != glutes_id;
        
        GET DIAGNOSTICS glute_count = ROW_COUNT;
        RAISE NOTICE 'Updated % exercises to GLUTES', glute_count;
    END IF;

    -- Fix CALVES exercises
    IF calves_id IS NOT NULL THEN
        UPDATE public.exercises
        SET muscle_group_id = calves_id
        WHERE (
            LOWER(name) LIKE '%calf%'
            OR LOWER(name) LIKE '%raise%'
        ) AND muscle_group_id != calves_id;
        
        GET DIAGNOSTICS calf_count = ROW_COUNT;
        RAISE NOTICE 'Updated % exercises to CALVES', calf_count;
    END IF;

    -- Show final counts AFTER fixes
    SELECT COUNT(*) INTO quad_count FROM public.exercises WHERE muscle_group_id = quads_id;
    SELECT COUNT(*) INTO hamstring_count FROM public.exercises WHERE muscle_group_id = hamstrings_id;
    SELECT COUNT(*) INTO glute_count FROM public.exercises WHERE muscle_group_id = glutes_id;
    SELECT COUNT(*) INTO calf_count FROM public.exercises WHERE muscle_group_id = calves_id;
    
    RAISE NOTICE 'AFTER FIXES - Quads: %, Hamstrings: %, Glutes: %, Calves: %', quad_count, hamstring_count, glute_count, calf_count;
    
    RAISE NOTICE 'Muscle group assignment fixes completed!';
END $$;
