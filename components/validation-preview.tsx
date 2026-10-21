"use client";

import { useState } from "react";
import { ArrowUpRight, Check, CircleDot, Eye, Users, Zap, Target } from "lucide-react";

export function ValidationPreview() {
  const [mode, setMode] = useState<"page" | "signal">("page");
  const [joined, setJoined] = useState(false);
  return <div className="validation-demo relative overflow-hidden rounded-[25px]">
    <div className="validation-demo-top flex items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
      <div className="flex items-center gap-2.5"><span className="validation-brand"><CircleDot size={16}/></span><span className="text-xs font-semibold text-white">Fieldnotes <span className="text-white/50">/ concept preview</span></span></div>
      <div className="validation-switch" role="tablist" aria-label="Landing page preview mode">
        <button type="button" role="tab" aria-selected={mode === "page"} onClick={() => setMode("page")}><Eye size={12}/> Page</button>
        <button type="button" role="tab" aria-selected={mode === "signal"} onClick={() => setMode("signal")}><Zap size={12}/> Signal</button>
      </div>
    </div>
    {mode === "page" ? <div className="validation-page p-5 sm:p-7">
      <div className="validation-page-art"><div className="validation-art-orbit orbit-a"/><div className="validation-art-orbit orbit-b"/><div className="validation-art-core"><CircleDot size={29}/></div><span className="validation-art-star star-a">✳</span><span className="validation-art-star star-b">✦</span></div>
      <div className="mt-6 text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-200">A little more intention</div>
      <h3 className="mt-3 max-w-sm text-2xl font-semibold leading-tight tracking-[-.04em] text-white sm:text-3xl">Make room for your best ideas.</h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">A calmer daily ritual to collect thoughts, find patterns, and turn inspiration into action.</p>
      <button type="button" onClick={() => setJoined(true)} className="validation-join mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold">{joined ? <><Check size={14}/> You’re on the sample list</> : <>Join the sample waitlist <ArrowUpRight size={14}/></>}</button>
      <p className="mt-3 text-[10px] text-white/55">Interactive demo only · no data is submitted</p>
    </div> : <div className="validation-signal p-5 sm:p-7">
      <div className="flex items-center gap-2 text-sm font-semibold text-white"><Zap size={16} className="text-cyan-200"/> What a useful signal looks like</div>
      <p className="mt-2 text-xs leading-5 text-white/65">A sample experiment dashboard—not live analytics. Look for a clear question, one action, and feedback you can learn from.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="signal-metric"><span className="signal-metric-icon cyan"><Users size={15}/></span><span className="signal-metric-label">Audience clarity</span><strong>Specific</strong><small>Who it is for</small></div>
        <div className="signal-metric"><span className="signal-metric-icon violet"><Target size={15}/></span><span className="signal-metric-label">Test question</span><strong>One thing</strong><small>What you want to learn</small></div>
        <div className="signal-metric"><span className="signal-metric-icon pink"><Check size={15}/></span><span className="signal-metric-label">Next action</span><strong>Obvious</strong><small>What visitors can do</small></div>
        <div className="signal-metric"><span className="signal-metric-icon green"><Zap size={15}/></span><span className="signal-metric-label">Feedback loop</span><strong>Repeatable</strong><small>How you improve</small></div>
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[.035] p-4"><div className="flex items-center justify-between text-xs text-white/70"><span>Experiment checklist</span><span className="text-cyan-200">3 steps</span></div><div className="mt-3 flex gap-1.5"><span className="h-1.5 flex-1 rounded-full bg-cyan-300"/><span className="h-1.5 flex-1 rounded-full bg-violet-400"/><span className="h-1.5 flex-1 rounded-full bg-pink-400"/></div></div>
    </div>}
  </div>;
}
