import { NextResponse } from "next/server";

async function getZoomToken() {
  const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const body = await res.text();
  try {
    return JSON.parse(body);
  } catch (e) {
    return { error: "Failed to parse response", body };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { start_time, duration, topic } = body;
    
    // Calculate end time
    const startTime = new Date(start_time || new Date());
    const endTime = new Date(startTime.getTime() + (duration || 45) * 60000);
    const currentTime = new Date();
    
    // Check if meeting has already ended
    if (currentTime > endTime) {
      return NextResponse.json({ 
        error: "Cannot start meeting - scheduled end time has passed",
        endTime: endTime.toISOString(),
        currentTime: currentTime.toISOString()
      }, { status: 400 });
    }
    
    const { access_token } = await getZoomToken();

    if (!access_token) {
      return NextResponse.json({ error: "Failed to get Zoom token" }, { status: 401 });
    }

    const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: topic || "Classroom Session",
        type: 2,
        start_time: start_time || new Date().toISOString(),
        duration: duration || 45,
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

    const meeting = await res.json();
    console.log("Created Meeting:***************", meeting);
    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}