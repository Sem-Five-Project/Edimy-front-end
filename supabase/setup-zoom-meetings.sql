-- SQL script to set up trigger for Zoom meeting creation
-- Using existing session table with columns:
-- - link_for_meeting (participant join URL)
-- - link_for_host (host start URL)
-- Note: Your existing schema already has the necessary columns

-- Enable the http extension for HTTP functionality
CREATE EXTENSION IF NOT EXISTS http;

-- Alternative: Use Supabase's pg_net extension (preferred for Supabase)
-- This extension is usually pre-installed in Supabase
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a trigger-based approach for immediate meeting creation
-- This will trigger when a new session is inserted into the database

CREATE OR REPLACE FUNCTION trigger_zoom_meeting_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create meeting if start_time is in the future and no meeting exists
  IF NEW.start_time > NOW() AND NEW.link_for_meeting IS NULL THEN
    PERFORM net.http_post(
      url := 'https://shownuxwvuiooypptqtf.supabase.co/functions/v1/create-zoom-meetings',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNob3dudXh3dnVpb295cHB0cXRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg2NzkwMSwiZXhwIjoyMDY5NDQzOTAxfQ.-ui0ge4jreAs3q8Rr4DbyilBvOzYzKhZyKUzOvVuA9s'
      ),
      body := json_build_object(
        'session_id', NEW.session_id,
        'session_name', NEW.session_name,
        'start_time', NEW.start_time,
        'end_time', NEW.end_time
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS create_zoom_meeting_trigger ON session;
CREATE TRIGGER create_zoom_meeting_trigger
  AFTER INSERT ON session
  FOR EACH ROW
  EXECUTE FUNCTION trigger_zoom_meeting_creation();

-- Queries for monitoring and management:

-- Query to check if the trigger exists
-- SELECT * FROM information_schema.triggers WHERE trigger_name = 'create_zoom_meeting_trigger';

-- Query to manually trigger meeting creation for existing sessions without meetings
-- SELECT trigger_zoom_meeting_creation() FROM session WHERE link_for_meeting IS NULL AND start_time > NOW();

-- Query to disable the trigger if needed
-- DROP TRIGGER IF EXISTS create_zoom_meeting_trigger ON session;
