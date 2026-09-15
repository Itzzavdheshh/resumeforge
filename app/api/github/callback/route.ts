import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // User cancelled or GitHub returned OAuth error
  if (errorParam || !code) {
    const errorUrl = new URL("/?github_error=cancelled", request.url);
    const res = NextResponse.redirect(errorUrl);
    res.cookies.delete("github_oauth_state");
    return res;
  }

  // Retrieve saved CSRF state from HTTP-only cookie
  const savedState = request.cookies.get("github_oauth_state")?.value;

  // Validate state parameter to prevent CSRF attacks
  if (!state || !savedState || state !== savedState) {
    console.error("GitHub OAuth error: State mismatch or missing state parameter.");
    const errorUrl = new URL("/?github_error=state_mismatch", request.url);
    const res = NextResponse.redirect(errorUrl);
    res.cookies.delete("github_oauth_state");
    return res;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("GitHub OAuth error: Missing server environment configuration.");
    const errorUrl = new URL("/?github_error=unconfigured", request.url);
    const res = NextResponse.redirect(errorUrl);
    res.cookies.delete("github_oauth_state");
    return res;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectUri = `${appUrl}/api/github/callback`;

  try {
    // Server-to-server POST token exchange (never exposed to client browser)
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error("GitHub OAuth token exchange failed:", tokenRes.statusText);
      const errorUrl = new URL("/?github_error=auth_failed", request.url);
      const res = NextResponse.redirect(errorUrl);
      res.cookies.delete("github_oauth_state");
      return res;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("GitHub OAuth error: No access token in response:", tokenData.error_description || tokenData.error);
      const errorUrl = new URL("/?github_error=auth_failed", request.url);
      const res = NextResponse.redirect(errorUrl);
      res.cookies.delete("github_oauth_state");
      return res;
    }

    // Success: Redirect to workspace home page with success status
    const successUrl = new URL("/?github=connected", request.url);
    const response = NextResponse.redirect(successUrl);

    // Secure HTTP-only cookie storage for access token (30 day TTL)
    response.cookies.set("github_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    // Clear state cookie
    response.cookies.delete("github_oauth_state");

    return response;
  } catch (error) {
    console.error("GitHub OAuth callback exception:", error);
    const errorUrl = new URL("/?github_error=server_error", request.url);
    const res = NextResponse.redirect(errorUrl);
    res.cookies.delete("github_oauth_state");
    return res;
  }
}
