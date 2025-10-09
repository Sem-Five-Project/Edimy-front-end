#!/bin/bash

# Manual test of the Edge Function
# This will help us see the exact response and any errors

echo "Testing Zoom Edge Function directly..."

# Get the session_id from the test session you just created
SESSION_ID=$(psql -h your-supabase-host -p 5432 -U postgres -d postgres -t -c "
SELECT session_id 
FROM session 
WHERE session_name = 'Test Zoom Integration Meeting' 
ORDER BY session_id DESC 
LIMIT 1;
" | tr -d ' ')

echo "Found session_id: $SESSION_ID"

# Call the Edge Function directly
curl -X POST \
  'https://shownuxwvuiooypptqtf.supabase.co/functions/v1/create-zoom-meetings' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNob3dudXh3dnVpb285cHB0cXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Njc5MDEsImV4cCI6MjA2OTQ0MzkwMX0.mvXR0jG4eZbp4S7aueUtOE3ovHHVxVoXOUI9ShI7fwc' \
  -d '{
    "session_id": '$SESSION_ID',
    "session_name": "Test Zoom Integration Meeting",
    "start_time": "2024-10-10T15:00:00Z",
    "end_time": "2024-10-10T16:00:00Z"
  }'

echo ""
echo "Check the Edge Function logs in Supabase Dashboard for detailed error messages."
