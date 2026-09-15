import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const isConfigured = !!process.env.GITHUB_CLIENT_ID;

  const accessToken = request.cookies.get("github_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({
      connected: false,
      configured: isConfigured,
    });
  }

  try {
    const ghRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "ResumeForge",
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    if (!ghRes.ok) {
      // Token is expired, revoked, or invalid — clear cookie
      const response = NextResponse.json({
        connected: false,
        configured: isConfigured,
      });
      response.cookies.delete("github_access_token");
      return response;
    }

    const userData = await ghRes.json();

    return NextResponse.json({
      connected: true,
      configured: isConfigured,
      user: {
        login: userData.login,
        name: userData.name || null,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
      },
    });
  } catch (error) {
    console.error("Failed to fetch GitHub user profile:", error);
    return NextResponse.json(
      {
        connected: false,
        configured: isConfigured,
        error: "Failed to communicate with GitHub API",
      },
      { status: 500 }
    );
  }
}
