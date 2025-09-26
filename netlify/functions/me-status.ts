import type { Handler } from "@netlify/functions";

const SIGNUP = process.env.WHOP_SIGNUP_URL || "https://whop.com/social-experiment-tts/";
const COMPANY_ID = process.env.WHOP_COMPANY_ID;
const PRODUCT_ID = process.env.WHOP_PRODUCT_ID;
const ADMIN_IDS = (process.env.ADMIN_WHOP_USER_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
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

  // If there is no session token, immediately return no access.
  if (!token) {
    return new Response(
      JSON.stringify({
        hasAccess: false,
        accessLevel: "no_access",
        signupUrl: SIGNUP,
        loginUrl,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Fetch the current user from Whop. If this request fails (network
  // error or non-OK status), return no access. Wrapping the fetch in
  // try/catch prevents unhandled exceptions from causing the lambda to
  // return an invalid status code.
  let me: any;
  try {
    const meRes = await fetch("https://api.whop.com/v5/me", {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!meRes.ok) {
      throw new Error("Whop /me responded " + meRes.status);
    }
    me = await meRes.json();
  } catch (err) {
    return new Response(
      JSON.stringify({
        hasAccess: false,
        accessLevel: "no_access",
        signupUrl: SIGNUP,
        loginUrl,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Extract user details from the response.
  const userId = me?.id || me?.user_id || me?.data?.id || "";
  const username = me?.username || me?.data?.username || null;
  const email = me?.email || me?.data?.email || null;

  // Determine if the user has an active membership. If the API call
  // fails, treat as false rather than throwing.
  let isMember = false;
  try {
    const url = new URL("https://api.whop.com/v5/me/memberships");
    url.searchParams.set("valid", "true");
    if (COMPANY_ID) url.searchParams.set("company_id", COMPANY_ID);
    if (PRODUCT_ID) url.searchParams.set("product_id", PRODUCT_ID);

    const memRes = await fetch(url.toString(), {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (memRes.ok) {
      const memData = await memRes.json();
      isMember = ((memData?.data?.length) || 0) > 0;
    }
  } catch (_) {
    // ignore fetch errors; isMember remains false
  }

  const isAdmin = userId && ADMIN_IDS.includes(userId);
  const hasAccess = !!(isAdmin || isMember);
  const accessLevel = (isAdmin && "admin") || (isMember && "customer") || "no_access";

  return new Response(
    JSON.stringify({
      hasAccess,
      accessLevel,
      user: { id: userId, username, email },
      signupUrl: SIGNUP,
      loginUrl,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
