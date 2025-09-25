import type { Handler } from "@netlify/functions";

function getCookie(name: string, cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(cookieHeader.split(/;\s*/).map((p) => {
    const i = p.indexOf("=");
    return [decodeURIComponent(p.substring(0, i)), decodeURIComponent(p.substring(i + 1))];
  }));
  return (cookies as any)[name] ?? null;
}

function setCookie(headers: Headers, name: string, value: string, maxAge = 60 * 60 * 12) {
  headers.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
}

export const handler: Handler = async (event) => {
  const query = new URLSearchParams(event.rawQuery || "");
  const code = query.get("code");
  const state = query.get("state");

  const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "whop_access";
  const cookieState = getCookie(`${SESSION_COOKIE_NAME}_state`, event.headers.cookie);
  if (!code || !state || !cookieState || cookieState !== state) {
    return new Response("Invalid OAuth state.", { status: 400 });
  }

  const tokenRes = await fetch("https://api.whop.com/v5/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.WHOP_CLIENT_ID!,
      client_secret: process.env.WHOP_CLIENT_SECRET!,
      redirect_uri: process.env.WHOP_REDIRECT_URI!,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    return new Response(`Token exchange failed: ${body}`, { status: 401 });
  }

  const data = await tokenRes.json();
  const access_token = data.access_token as string;
  const expires_in = (data.expires_in as number) || 43200;

  const headers = new Headers({ Location: "/members" });
  setCookie(headers, SESSION_COOKIE_NAME, access_token, Math.min(60 * 60 * 24, expires_in));
  headers.append("Set-Cookie", `${SESSION_COOKIE_NAME}_state=; Path=/; Max-Age=0`);
  return new Response("", { status: 302, headers });
};