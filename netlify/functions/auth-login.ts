import type { Handler } from "@netlify/functions";
import crypto from "node:crypto";

const WHOP_CLIENT_ID = process.env.WHOP_CLIENT_ID!;
const WHOP_REDIRECT_URI = process.env.WHOP_REDIRECT_URI!;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "whop_access";

/**
 * Netlify function handler for initiating the Whop OAuth login flow. Generates
 * a random state parameter, stores it in a secure cookie, and redirects the
 * user to the Whop authorization endpoint. Returns a plain object rather
 * than a Response instance to satisfy the Node.js runtime.
 */
export const handler: Handler = async () => {
  const state = crypto.randomBytes(16).toString("hex");

  // Construct the Whop OAuth URL with the necessary query parameters.
  const login = new URL("https://whop.com/oauth");
  login.searchParams.set("client_id", WHOP_CLIENT_ID);
  login.searchParams.set("redirect_uri", WHOP_REDIRECT_URI);
  login.searchParams.set("response_type", "code");

  // Build the Set-Cookie header for storing the state. Netlify will send
  // multiple cookies using the multiValueHeaders field.
  const setCookie = `${SESSION_COOKIE_NAME}_state=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;

  return {
    statusCode: 302,
    headers: { Location: login.toString() },
    multiValueHeaders: { "Set-Cookie": [setCookie] },
    body: "",
  };
};
