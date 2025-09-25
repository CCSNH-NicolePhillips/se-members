import type { Handler } from "@netlify/functions";

const SIGNUP = process.env.WHOP_SIGNUP_URL || "https://whop.com/social-experiment-tts/";
const COMPANY_ID = process.env.WHOP_COMPANY_ID;
const PRODUCT_ID = process.env.WHOP_PRODUCT_ID;
const ADMIN_IDS = (process.env.ADMIN_WHOP_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "whop_access";

function getCookie(name: string, cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(cookieHeader.split(/;\s*/).map((p) => {
    const i = p.indexOf("=");
    return [decodeURIComponent(p.substring(0, i)), decodeURIComponent(p.substring(i + 1))];
  }));
  return (cookies as any)[name] ?? null;
}

export const handler: Handler = async (event) => {
  const token = getCookie(SESSION_COOKIE_NAME, event.headers.cookie);
  const loginUrl = "/api/auth/login";

  if (!token) {
    return new Response(JSON.stringify({ hasAccess: false, accessLevel: "no_access", signupUrl: SIGNUP, loginUrl }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const meRes = await fetch("https://api.whop.com/v5/me", { headers: { Authorization: `Bearer ${token}` } });
  if (!meRes.ok) {
    return new Response(JSON.stringify({ hasAccess: false, accessLevel: "no_access", signupUrl: SIGNUP, loginUrl }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  const me = await meRes.json();
  const userId = me?.id || me?.user_id || me?.data?.id || "";
  const username = me?.username || me?.data?.username || null;
  const email = me?.email || me?.data?.email || null;

  const url = new URL("https://api.whop.com/v5/me/memberships");
  url.searchParams.set("valid", "true");
  if (COMPANY_ID) url.searchParams.set("company_id", COMPANY_ID);
  if (PRODUCT_ID) url.searchParams.set("product_id", PRODUCT_ID);
  const memRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const isMember = memRes.ok ? (((await memRes.json())?.data?.length) || 0) > 0 : false;

  const isAdmin = userId && ADMIN_IDS.includes(userId);
  const hasAccess = !!(isAdmin || isMember);
  const accessLevel = (isAdmin && "admin") || (isMember && "customer") || "no_access";

  return new Response(JSON.stringify({ hasAccess, accessLevel, user: { id: userId, username, email }, signupUrl: SIGNUP, loginUrl }), { status: 200, headers: { "Content-Type": "application/json" } });
};