import { NextResponse } from "next/server";

async function getZoomToken() {
  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
  });

  return res.json();
}

export async function GET() {
  const token = await getZoomToken();
  return NextResponse.json(token);
}
