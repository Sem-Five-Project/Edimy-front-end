// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Deno types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore: Deno global
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getZoomToken() {
  const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${Deno.env.get('ZOOM_ACCOUNT_ID')}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        btoa(
          Deno.env.get('ZOOM_CLIENT_ID') + ":" + Deno.env.get('ZOOM_CLIENT_SECRET')
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  
  const body = await res.text();
  console.log('Zoom token response status:', res.status);
  console.log('Zoom token response body:', body);
  
  try {
    const tokenData = JSON.parse(body);
    if (tokenData.error) {
      console.error("Zoom token error:", tokenData);
      return { error: tokenData.error_description || tokenData.error };
    }
    return tokenData;
  } catch (e) {
    console.error("Failed to parse Zoom token response:", e);
    return { error: "Failed to parse response", body };
  }
}

async function createZoomMeeting(sessionData: any) {
  const { access_token } = await getZoomToken();
  
  if (!access_token) {
    throw new Error("Failed to get Zoom token");
  }

  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: sessionData.topic || `Session: ${sessionData.session_name}`,
      type: 2, // Scheduled meeting
      start_time: sessionData.start_time,
      duration: sessionData.duration || 45,
      settings: {
        host_video: true,
        participant_video: true,
        local_recording: true,
        cloud_recording: true,
        auto_recording: "none",
        allow_multiple_devices: false,
        waiting_room: true,
        mute_upon_entry: true,
      },
    }),
  });

  console.log('Zoom meeting response status:', res.status);
  const meeting = await res.json();
  console.log('Zoom meeting response:', meeting);
  
  if (meeting.error || res.status >= 400) {
    throw new Error(`Zoom API error: ${meeting.message || meeting.error || 'Unknown error'}`);
  }
  
  return meeting;
}

serve(async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body to get session data from trigger
    let sessionData = null;
    try {
      if (req.headers.get('content-type')?.includes('application/json')) {
        const body = await req.json();
        sessionData = body;
        console.log('Received session data:', sessionData);
      }
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (!sessionData || !sessionData.session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const results = [];

    try {
      console.log(`Creating meeting for session: ${sessionData.session_id}`);
      
      // Calculate duration from start_time and end_time
      const startTime = new Date(sessionData.start_time);
      const endTime = new Date(sessionData.end_time);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // duration in minutes
      
      const meeting = await createZoomMeeting({
        session_name: sessionData.session_name,
        topic: sessionData.session_name,
        start_time: sessionData.start_time,
        duration: duration
      });

      // Update the session with Zoom meeting details using existing columns
      const { error: updateError } = await supabaseClient
        .from('session')
        .update({
          link_for_host: meeting.start_url,        // Use existing link_for_host column
          link_for_meeting: meeting.join_url       // Use existing link_for_meeting column
        })
        .eq('session_id', sessionData.session_id);

      if (updateError) {
        console.error(`Failed to update session ${sessionData.session_id}:`, updateError);
        results.push({ 
          session_id: sessionData.session_id, 
          status: 'error', 
          error: updateError.message 
        });
      } else {
        console.log(`Successfully created meeting for session ${sessionData.session_id}`);
        results.push({ 
          session_id: sessionData.session_id, 
          status: 'success', 
          meeting_id: meeting.id,
          host_link: meeting.start_url,
          participant_link: meeting.join_url
        });
      }
    } catch (meetingError) {
      console.error(`Failed to create meeting for session ${sessionData.session_id}:`, meetingError);
      results.push({ 
        session_id: sessionData.session_id, 
        status: 'error', 
        error: typeof meetingError === 'object' && meetingError !== null && 'message' in meetingError 
          ? (meetingError as Error).message 
          : String(meetingError)
      });
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed session ${sessionData.session_id}`,
        results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message 
          : String(error),
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
