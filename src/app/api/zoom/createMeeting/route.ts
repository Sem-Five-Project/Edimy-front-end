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
    // No body needed for this request
  });
  const body = await res.text();
  try {
    return JSON.parse(body);
  } catch (e) {
    return { error: "Failed to parse response", body };
  }
}

export async function POST() {
  const { access_token } = await getZoomToken();


  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: "Classroom Session",
      type: 2, // Scheduled meeting
      start_time: new Date().toISOString(),
      duration: 45,
      settings: {
        host_video: true,
        participant_video: true,
    local_recording: true,      // Host can record locally
    cloud_recording: true,      // Host can record to cloud
    auto_recording: "none",    // No auto recording
    // No participant recording option
        allow_multiple_devices: false,
        waiting_room: true,
        mute_upon_entry: true,
      },
    }),
  });

  const meeting = await res.json();
  console.log("Created Meeting:***************", meeting);
  return NextResponse.json(meeting);
}
