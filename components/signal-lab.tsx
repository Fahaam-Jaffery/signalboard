"use client";

import { useState } from "react";
import { BrainCircuit, Heart, Lightbulb, Sparkles, Target, WandSparkles } from "lucide-react";

const lanes = [
  { id: "creator", label: "Creator tools", title: "Give creators their focus back", desc: "A lightweight space to protect deep work, manage creative energy, and ship consistently.", fit: "Your skills → workflow design", icon: WandSparkles, color: "violet", tags: ["Solo creators", "Focus", "Workflow"] },
  { id: "community", label: "Community", title: "Make local communities easier to join", desc: "Help people find small, welcoming groups around a shared interest, without endless scrolling.", fit: "Your interests → belonging", icon: Heart, color: "pink", tags: ["Local groups", "Discovery", "Connection"] },
  { id: "learning", label: "Learning", title: "Turn learning goals into tiny wins", desc: "Help curious people turn a big goal into a short daily practice they can actually maintain.", fit: "Your curiosity → daily progress", icon: BrainCircuit, color: "cyan", tags: ["Micro-learning", "Habits", "Progress"] },
];

export function SignalLab() {
  const [active, setActive] = useState(0);
  const item = lanes[active];
  const Icon = item.icon;
  return <div className="signal-lab-grid grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
    <div className="signal-lab-choices flex flex-col gap-3">
      {lanes.map((lane, index) => {
        const LaneIcon = lane.icon;
        return <button type="button" key={lane.id} onClick={() => setActive(index)} aria-pressed={active === index} className={"signal-choice signal-choice-" + lane.color + " flex items-center gap-4 rounded-2xl p-4 text-left transition-all " + (active === index ? "is-active is-active-" + lane.color : "")}>
          <span className="signal-choice-icon"><LaneIcon size={20}/></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">{lane.label}</span><span className="mt-1 block text-xs text-white/65">Explore this direction</span></span>
          <span className="signal-choice-index">0{index + 1}</span>
        </button>;
      })}
    </div>
    <div className={"signal-result signal-result-" + item.color + " relative overflow-hidden rounded-[26px] p-6 sm:p-9"} key={item.id}>
      <div className="signal-result-orb" />
      <div className="relative flex items-center justify-between"><span className="signal-result-label"><Sparkles size={13}/> IDEA DIRECTION</span><span className="signal-result-count">0{active + 1} / 03</span></div>
      <div className="relative mt-8 flex items-start gap-4">
        <div className="signal-result-icon"><Icon size={25}/></div>
        <div><h3 className="max-w-lg text-2xl font-semibold tracking-[-.04em] text-white sm:text-3xl">{item.title}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-white/80">{item.desc}</p></div>
      </div>
      <div className="relative mt-8 flex flex-wrap gap-2">{item.tags.map(tag => <span key={tag} className="signal-tag">{tag}</span>)}</div>
      <div className="relative mt-8 flex flex-col gap-4 border-t border-white/[.12] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/60">Potential starting point</div><div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-white"><Target size={15} className="text-cyan-200"/>{item.fit}</div></div>
        <span className="signal-lab-hint"><Lightbulb size={14}/> A prompt, not a prediction</span>
      </div>
    </div>
  </div>;
}
