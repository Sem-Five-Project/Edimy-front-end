"use client";

import { useState } from "react";

export default function TutorMeeting() {
  const [meeting, setMeeting] = useState<any>(null);

  const createMeeting = async () => {
    const res = await fetch("/api/zoom/createMeeting", { method: "POST" });
    const data = await res.json();
    console.log("Zoom Token Response:", data);
    setMeeting(data);
  };

  return (
    <div>
      <button onClick={createMeeting}>Create Meeting</button>
      {meeting && (
        <div>
          <p>
            Start Link (Host):{" "}
            <a href={meeting.start_url} target="_blank">
              {meeting.start_url}
            </a>
          </p>
          <p>Share with Students (Join Link): {meeting.join_url}</p>
        </div>
      )}
    </div>
  );
}
