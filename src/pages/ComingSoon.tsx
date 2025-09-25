import React from "react";

const LOGO_SRC = "/Orbit.jpg";

export default function ComingSoon(): JSX.Element {
  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(137,90,255,0.18),rgba(0,0,0,0)_60%)]" />
      <main className="relative z-10 max-w-5xl w-full">
        <section className="rounded-2xl shadow-xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12">
          <div className="w-full flex items-center justify-center mb-8">
            <img src={LOGO_SRC} alt="Social Experiment logo" className="w-[520px] max-w-full" style={{ filter: "drop-shadow(0 0 40px rgba(137,90,255,0.35))" }} />
          </div>
          <h1 className="text-center font-extrabold tracking-tight leading-tight">
            <span className="block text-3xl md:text-5xl">Coming soon.</span>
            <span className="block text-lg md:text-2xl text-white/70 mt-2">
              Full access is reserved for <span className="text-[#A984FF]">Social Experiment WHOP Members</span>.
            </span>
          </h1>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://whop.com/social-experiment-tts/" className="px-6 py-3 rounded-xl" style={{ background: "#8A5AFF", boxShadow: "0 10px 24px rgba(138,90,255,0.25)" }}>
              <span className="font-semibold">Join on WHOP</span>
            </a>
            <a href="https://discord.gg/GqEVtMeNR6" target="_blank" rel="noreferrer" className="px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 transition font-semibold">
              Join Discord
            </a>
            <a href="/members" className="px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 transition font-semibold">
              Members Area
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}