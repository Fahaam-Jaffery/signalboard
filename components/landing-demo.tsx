"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, CircleDot, Compass, Layers3, Sparkles, TrendingUp, Users, Zap } from "lucide-react";

const views = [
  { id: "discover", label: "Discover", eyebrow: "IDEA SIGNAL", title: "QuietHours", category: "Creator tools", desc: "A calmer way for independent creators to protect deep-work time.", score: "Example only", fit: 82, icon: Compass, stat: "82", statLabel: "illustrative fit score" },
  { id: "validate", label: "Validate", eyebrow: "TEST YOUR ANGLE", title: "A page with a purpose", category: "Waitlist experiment", desc: "Explain the promise clearly and give the right people one useful next step.", score: "Hypothesis", fit: 68, icon: Layers3, stat: "68%", statLabel: "example test metric" },
  { id: "learn", label: "Learn", eyebrow: "REAL-WORLD FEEDBACK", title: "Signals you can learn from", category: "Early signal", desc: "Bring signups and audience feedback together before you commit to the full build.", score: "Illustrative", fit: 91, icon: TrendingUp, stat: "12", statLabel: "sample signups · demo" },
] as const;

export function LandingDemo() {
  const [active, setActive] = useState(0);
  const view = views[active];
  const Icon = view.icon;
  return <div className="landing-demo relative mt-5 overflow-hidden rounded-[25px] lg:mt-8">
    <div className="demo-topbar flex items-center justify-between border-b px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3"><span className="demo-brand-mark grid h-9 w-9 place-items-center rounded-xl"><CircleDot size={18}/></span><div><div className="text-xs font-semibold text-white/90">SignalBoard workspace</div><div className="mt-1 text-[10px] text-white/35">Illustrative workflow · sample data</div></div></div>
      <div className="demo-live inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[.12em]"><span/> Sample preview</div>
    </div>
    <div className="p-4 sm:p-6">
      <div className="demo-tabs grid grid-cols-3 gap-1 rounded-xl p-1" role="tablist" aria-label="Preview workflow">
        {views.map((item, index) => <button key={item.id} role="tab" aria-selected={active === index} onClick={() => setActive(index)} className={"demo-tab rounded-lg px-2 py-2.5 text-xs font-medium transition-colors " + (active === index ? "is-active" : "")}>{item.label}</button>)}
      </div>
      <div className="demo-panel mt-4 rounded-2xl p-4 sm:p-5" role="tabpanel" key={view.id}>
        <div className="flex items-center justify-between"><span className="demo-eyebrow">{view.eyebrow}</span><span className="demo-index">0{active + 1} / 03</span></div>
        <div className="mt-5 flex items-start gap-3"><div className="demo-feature-icon grid h-11 w-11 shrink-0 place-items-center rounded-xl"><Icon size={19}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold tracking-tight text-white">{view.title}</h3><span className="demo-category rounded-full px-2 py-1 text-[9px]">{view.category}</span></div><p className="mt-2 text-xs leading-5 text-white/45">{view.desc}</p></div><ArrowUpRight size={16} className="mt-1 shrink-0 text-white/35"/></div>
        <div className="demo-score-row mt-6 rounded-xl p-4">
          <div className="flex items-end justify-between gap-3"><div><div className="text-[10px] text-white/40">{view.statLabel}</div><div className="mt-1 text-3xl font-semibold tracking-tight text-white">{view.stat}<span className="ml-1 text-sm font-medium text-white/35">{view.id === "discover" ? "/100" : ""}</span></div></div><span className="demo-score-label inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-medium"><Check size={11}/>{view.score}</span></div>
          <div className="demo-meter mt-4 h-1.5 overflow-hidden rounded-full"><div className="demo-meter-fill h-full rounded-full transition-all duration-300" style={{ width: view.fit + "%" }}/></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="demo-mini-card rounded-xl p-3"><div className="flex items-center gap-2 text-[10px] text-white/40"><Sparkles size={12}/> Next step</div><div className="mt-2 text-xs font-semibold text-white/80">{active === 0 ? "Shape the concept" : active === 1 ? "Share the page" : "Review feedback"}</div></div>
          <div className="demo-mini-card rounded-xl p-3"><div className="flex items-center gap-2 text-[10px] text-white/40"><Users size={12}/> Audience</div><div className="mt-2 text-xs font-semibold text-white/80">{active === 0 ? "Solo creators" : active === 1 ? "Early adopters" : "Real visitors"}</div></div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4"><div className="flex items-center gap-2 text-[10px] text-white/35"><Zap size={13} className="text-white/60"/> Illustrative UI · not live customer data</div><Link href="/signup" className="demo-cta inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold">Try it <ArrowRight size={13}/></Link></div>
    </div>
  </div>;
}