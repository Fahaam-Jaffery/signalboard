import type {Metadata} from "next";
import {Suspense} from "react";
import {AuthForm} from "@/components/auth-form";

export const metadata: Metadata = { title: "Create your account" };

export default function Signup() {
  return (
    <main className="auth-experience grid min-h-screen lg:grid-cols-[1.02fr_.98fr]">
      <section className="auth-form-region relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="auth-mobile-glow pointer-events-none absolute inset-0 lg:hidden" />
        <Suspense fallback={<div className="auth-loading muted">Preparing your workspace…</div>}>
          <AuthForm mode="signup" />
        </Suspense>
      </section>
      <aside className="auth-story-panel relative hidden flex-col justify-between overflow-hidden p-10 text-white sm:p-12 lg:flex xl:p-16">
        <div className="auth-story-grid pointer-events-none absolute inset-0" />
        <div className="auth-story-orb auth-story-orb-one pointer-events-none absolute -right-24 top-[12%] h-[28rem] w-[28rem] rounded-full" />
        <div className="auth-story-orb auth-story-orb-two pointer-events-none absolute -bottom-32 -left-24 h-[24rem] w-[24rem] rounded-full" />
        <div className="relative flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span className="auth-brand-mark grid h-10 w-10 place-items-center rounded-xl"><span className="auth-brand-glyph">S</span></span>
          <span>signalboard<span className="text-violet-300">.</span></span>
        </div>
        <div className="auth-story-copy relative z-10 max-w-xl py-12">
          <div className="auth-story-kicker mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[.16em]"><span className="auth-story-pip" /> A better way to begin</div>
          <h2 className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-.06em] xl:text-6xl">Your curiosity<br /><span className="auth-luminous-type">is a competitive edge.</span></h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/65 xl:text-base">Shape the next product around your strengths, then get it in front of the people who might need it.</p>
          <div className="mt-9 flex flex-wrap gap-2.5">
            <span className="auth-proof-chip">Start with what you know</span>
            <span className="auth-proof-chip">Make a small experiment</span>
            <span className="auth-proof-chip">Follow the evidence</span>
          </div>
        </div>
        <div className="relative flex items-center justify-between gap-4 text-[11px] text-white/45">
          <span>SignalBoard · Make room for your next good idea.</span>
          <span className="hidden items-center gap-2 md:inline-flex"><span className="auth-story-pip" /> Thoughtful by design</span>
        </div>
      </aside>
    </main>
  );
}
