import React, { useEffect, useMemo, useState } from "react";

type Status = {
  hasAccess: boolean;
  accessLevel: "admin" | "customer" | "no_access";
  user?: { id: string; username?: string | null; email?: string | null };
  signupUrl: string;
  loginUrl: string;
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function MembersOnly(): JSX.Element {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJSON<Status>("/api/me-status")
      .then((s) => {
        setStatus(s);
        if (!s.hasAccess) {
          setTimeout(() => { window.location.assign(s.signupUrl); }, 3000);
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  const gated = useMemo(() => status && !status.hasAccess, [status]);

  return (
    <div className="min-h-screen w-full bg-black text-white p-8 md:p-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(137,90,255,0.18),rgba(0,0,0,0)_60%)]" />
      <main className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Members Area</h1>
        <p className="text-white/70 mt-2">Locked for non-members/admins. Visible with a blur + redirect.</p>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
          {gated && (
            <div className="absolute inset-0 backdrop-blur-sm bg-black/40 grid place-items-center">
              <div className="text-center max-w-md p-6 rounded-xl bg-black/60 border border-white/10">
                <div className="text-lg md:text-xl font-semibold">Access required</div>
                <p className="text-white/70 mt-2">
                  This area is for <span className="text-[#A984FF]">Social Experiment WHOP Members</span> and admins.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <a href={status?.loginUrl ?? "/api/auth/login"} className="px-5 py-2 rounded-lg bg-[#8A5AFF] hover:bg-[#7a49ff] font-semibold">Login with Whop</a>
                  <a href={status?.signupUrl ?? "https://whop.com/social-experiment-tts/"} className="px-5 py-2 rounded-lg border border-white/20 font-semibold">Join on WHOP</a>
                </div>
                <p className="text-white/50 text-xs mt-3">Redirecting you to join in 3 seconds…</p>
              </div>
            </div>
          )}

          <div className={gated ? "pointer-events-none select-none blur-sm" : ""}>
            <h2 className="text-2xl font-bold">Dummy Member Content</h2>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-white/90">
              <li>Welcome, {status?.user?.username ?? "Guest"}.</li>
              <li>Access level: {status?.accessLevel ?? "unknown"}.</li>
              <li>Blur disappears when you have access.</li>
            </ul>
          </div>
        </section>

        {error && <div className="mt-6 text-red-300">Error: {error}</div>}
      </main>
    </div>
  );
}