"use client";

import { useEffect, useState } from "react";
const ZOOM_SDK_KEY = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID;

interface Props {
  url: string;
  userName: string;
  userEmail: string;
}

export default function ZoomMeeting({ url, userName, userEmail }: Props) {
  const [ZoomMtg, setZoomMtg] = useState<any>(null);

  // useEffect(() => {
  //   let isMounted = true;
  //     import("@zoomus/websdk").then((mod) => {
  //     if (isMounted) setZoomMtg(mod.ZoomMtg);
  //   });
  //   return () => { isMounted = false; };
  // }, []);

  // useEffect(() => {
  //   if (!ZOOM_SDK_KEY) {
  //     console.log("****************************", ZOOM_SDK_KEY);
  //     console.error("❌ NEXT_PUBLIC_ZOOM_CLIENT_ID is not set. Check your .env.local and restart the dev server.");
  //     throw new Error("NEXT_PUBLIC_ZOOM_CLIENT_ID is missing. Zoom SDK cannot initialize.");
  //   }
  //   if (!ZoomMtg) return;

  //   function parseZoomHostLink(zoomUrl: string) {
  //     const urlObj = new URL(zoomUrl);
  //     // meeting number is after /s/
  //     const parts = urlObj.pathname.split("/");
  //     const meetingNumber = parts[parts.length - 1];
  //     // ZAK token is in query
  //     const zak = urlObj.searchParams.get("zak") || "";
  //     return { meetingNumber, zak };
  //   }

  //   const { meetingNumber, zak } = parseZoomHostLink(url);
  //   const startMeeting = async () => {
  //     try {
  //       const res = await fetch("/api/zoom-signature", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ meetingNumber, role: 0 }),
  //       });
  //       if (!res.ok) throw new Error("Failed to fetch Zoom signature");
  //       const { signature } = await res.json();
  //       if (!signature) throw new Error("No signature returned");

  //       ZoomMtg.preLoadWasm();
  //       ZoomMtg.prepareWebSDK();
  //       ZoomMtg.init({
  //         leaveUrl: "/",
  //         success: () => {
  //           ZoomMtg.join({
  //             signature,
  //             sdkKey: ZOOM_SDK_KEY,
  //             meetingNumber,
  //             userName,
  //             userEmail,
  //             zak,
  //             success: () => console.log("✅ Joined Zoom meeting"),
  //             error: (err: unknown) => console.error("❌ Join error", err),
  //           });
  //         },
  //         error: (err: unknown) => console.error("❌ Init error", err),
  //       });
  //     } catch (err) {
  //       console.error("❌ Zoom meeting error:", err);
  //     }
  //   };
  //   startMeeting();
  // }, [url, userName, userEmail, ZoomMtg]);

  // return <div id="zmmtg-root" style={{ width: "100vw", height: "100vh", zIndex: 999 }}></div>;
  return <div>Loading Zoom...{ZOOM_SDK_KEY}</div>;
}
