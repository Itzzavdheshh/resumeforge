import { NextResponse } from "next/server";

export async function POST() {
  const isConfigured = !!process.env.GITHUB_CLIENT_ID;

  const response = NextResponse.json({
    connected: false,
    configured: isConfigured,
  });

  // Clear HTTP-only session cookies
  response.cookies.delete("github_access_token");
  response.cookies.delete("github_oauth_state");

  return response;
}
