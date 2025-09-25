import type { Handler } from "@netlify/functions";
import crypto from "node:crypto";

const WHOP_CLIENT_ID = process.env.WHOP_CLIENT_ID!;
const WHOP_REDIRECT_URI = process.env.WHOP_REDIRECT_URI!;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "whop_access";

function setCookie(headers: Headers, name: string, value: string, maxAge = 600) {
  headers.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
}

export const handler: Handler = async () => {
  const state = crypto.randomBytes(16).toString("hex");
  const login = new URL("https://whop.com/oauth");
  login.searchParams.set("client_id", WHOP_CLIENT_ID);
  login.searchParams.set("redirect_uri", WHOP_REDIRECT_URI);
  login.searchParams.set("response_type", "code");

  const headers = new Headers({ Location: login.toString() });
  setCookie(headers, `${SESSION_COOKIE_NAME}_state`, state, 600);
  return new Response("", { status: 302, headers });
};