-- TFC Muscle Groups Simple Cleanup Script
-- This script consolidates existing duplicates and removes empty groups

-- Step 1: Show current muscle groups and their exercise counts
SELECT 'Current Muscle Groups Analysis:' as analysis_step;
SELECT 
    mg.id,
    mg.name as muscle_group,
    COUNT(e.id) as exercise_count
FROM muscle_groups mg
LEFT JOIN exercises e ON mg.id = e.muscle_group_id
GROUP BY mg.id, mg.name
ORDER BY mg.name;

-- Step 2: Consolidate existing duplicate muscle groups
-- Only consolidate if both source and target exist

-- Consolidate 'back' -> 'Back' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Back')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'back')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Back')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'back');

-- Consolidate 'biceps' -> 'Biceps' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Biceps')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'biceps')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Biceps')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'biceps');

-- Consolidate 'chest' -> 'Chest' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Chest')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'chest')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Chest')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'chest');

-- Consolidate 'shoulders' -> 'Shoulders' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Shoulders')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'shoulders')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Shoulders')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'shoulders');

-- Consolidate 'triceps' -> 'Triceps' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Triceps')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'triceps')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Triceps')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'triceps');

-- Consolidate 'quads' -> 'Quadriceps' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Quadriceps')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'quads')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Quadriceps')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'quads');

-- Consolidate 'hamstrings' -> 'Hamstrings' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Hamstrings')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'hamstrings')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Hamstrings')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'hamstrings');

-- Consolidate 'glutes' -> 'Glutes' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Glutes')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'glutes')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Glutes')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'glutes');

-- Consolidate 'calves' -> 'Calves' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Calves')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'calves')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Calves')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'calves');

-- Consolidate 'forearms' -> 'Forearms' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Forearms')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'forearms')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Forearms')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'forearms');

-- Consolidate 'abs' -> 'Core' (if both exist)
UPDATE exercises 
SET muscle_group_id = (SELECT id FROM muscle_groups WHERE name = 'Core')
WHERE muscle_group_id IN (SELECT id FROM muscle_groups WHERE name = 'abs')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'Core')
AND EXISTS (SELECT 1 FROM muscle_groups WHERE name = 'abs');

-- Step 3: Remove empty muscle groups (those with no exercises)
DELETE FROM muscle_groups 
WHERE id NOT IN (
    SELECT DISTINCT muscle_group_id 
    FROM exercises 
    WHERE muscle_group_id IS NOT NULL
);

-- Step 4: Show final results
SELECT 'Final Muscle Groups After Cleanup:' as analysis_step;
SELECT 
    mg.id,
    mg.name as muscle_group,
    COUNT(e.id) as exercise_count
FROM muscle_groups mg
LEFT JOIN exercises e ON mg.id = e.muscle_group_id
GROUP BY mg.id, mg.name
HAVING COUNT(e.id) > 0
ORDER BY mg.name;

-- Step 5: Show sample exercises for verification (simplified)
SELECT 'Sample Exercises by Muscle Group (After Cleanup):' as analysis_step;
WITH first_exercises AS (
    SELECT 
        mg.name as muscle_group,
        e.name as exercise_name,
        ROW_NUMBER() OVER (PARTITION BY mg.id ORDER BY e.name) as rn
    FROM muscle_groups mg
    JOIN exercises e ON mg.id = e.muscle_group_id
)
SELECT 
    muscle_group,
    STRING_AGG(exercise_name, ', ' ORDER BY exercise_name) as first_5_exercises
FROM first_exercises 
WHERE rn <= 5
GROUP BY muscle_group
ORDER BY muscle_group;
