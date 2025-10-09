-- Debug script to test Edge Function database access
-- Run this in your Supabase SQL Editor to manually test the Edge Function

-- SOLUTION: Fix the column length issue
-- The link_for_meeting column is limited to 255 characters, but Zoom URLs can be much longer
-- Let's change it to text type to allow longer URLs

ALTER TABLE session 
ALTER COLUMN link_for_meeting TYPE text;

-- Verify the column types are now correct
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'session' 
AND column_name IN ('link_for_meeting', 'link_for_host')
ORDER BY column_name;

-- Check your most recent sessions to see what session_ids were created
SELECT session_id, session_name, start_time, end_time, link_for_meeting, link_for_host, created_at
FROM session 
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC 
LIMIT 10;

-- Check if ANY sessions have Zoom links
SELECT session_id, session_name, link_for_meeting, link_for_host
FROM session 
WHERE link_for_meeting IS NOT NULL OR link_for_host IS NOT NULL
ORDER BY session_id DESC 
LIMIT 5;

-- Add some logging to help debug the trigger
-- Let's see what session_id is actually being sent to the Edge Function
-- Check the trigger function is working by adding a simple test
DO $$
DECLARE
    test_session_id integer;
BEGIN
    -- Get the most recent session
    SELECT session_id INTO test_session_id 
    FROM session 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    RAISE NOTICE 'Most recent session_id: %', test_session_id;
END $$;
