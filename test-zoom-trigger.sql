-- Test script to manually test the Zoom meeting trigger
-- Run this in your Supabase SQL Editor

-- First, enable the required extensions
CREATE EXTENSION IF NOT EXISTS http;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- First, let's see the current structure of the session table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'session'
ORDER BY ordinal_position;

-- Check if the trigger exists
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'create_zoom_meeting_trigger';

-- Test insert a new session (adjust values as needed for your table structure)
-- Make sure to use a future date for start_time
-- First, let's see what class_id values are available
SELECT class_id FROM class LIMIT 5;

-- Check existing session statuses to see what values are used
SELECT DISTINCT status FROM session WHERE status IS NOT NULL LIMIT 10;

-- Check available tutor_id values
SELECT tutor_id FROM tutor_profile LIMIT 5;

-- Insert test session with all required fields
INSERT INTO session (
    class_id,           -- Required field - use an existing class_id
    tutor_id,           -- Required field - use an existing tutor_id
    session_name, 
    start_time, 
    end_time,
    link_for_meeting,
    link_for_host,
    status              -- Required field - appears to be a string/varchar
) VALUES (
    1,                  -- Replace with a valid class_id from your class table
    1,                  -- Replace with a valid tutor_id from your tutor table
    'Test Zoom Integration Meeting',
    (NOW() + INTERVAL '1 hour')::timestamptz,
    (NOW() + INTERVAL '2 hours')::timestamptz,
    NULL,
    NULL,
    'scheduled'         -- or whatever status value is appropriate
);

-- Check if the meeting links were created
SELECT session_id, session_name, start_time, end_time, link_for_meeting, link_for_host 
FROM session 
WHERE session_name = 'Test Zoom Integration Meeting'
ORDER BY session_id DESC 
LIMIT 1;

-- Also check all recent sessions to see if any have Zoom links
SELECT session_id, session_name, link_for_meeting, link_for_host, created_at
FROM session 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC 
LIMIT 5;
