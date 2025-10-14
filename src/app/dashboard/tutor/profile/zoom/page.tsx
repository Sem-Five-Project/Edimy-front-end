"use client";
import { useSearchParams } from "next/navigation";
import ZoomMeeting from "@/app/dashboard/tutor/profile/ZoomMeet";

export default function ZoomPage() {
  const params = useSearchParams();

  const zoomUrl = params.get("url") || "";
  const userName = params.get("userName") || "Guest";
  const userEmail = params.get("userEmail") || "";


  if (!zoomUrl) {
    return <p>❌ No Zoom link provided</p>;
  }

  return (
    <ZoomMeeting
      url={zoomUrl}
      userName={userName}
      userEmail={userEmail}
    />
    // <div>
    //     HI
    // </div>
  );
}
