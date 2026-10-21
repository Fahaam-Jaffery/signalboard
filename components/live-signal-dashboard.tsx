"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Eye, MousePointer2, RadioTower, Sparkles, Users, Zap } from "lucide-react";

const periods = ["7 days", "30 days", "90 days"] as const;
const snapshots = {
  "7 days": { visitors: "1,284", change: "+18.6%", interest: "8.4%", actions: "108", series: [24,32,28,45,38,57,52,68,62,78,71,90] },
  "30 days": { visitors: "4,892", change: "+24.2%", interest: "9.1%", actions: "445", series: [19,24,22,35,30,44,39,54,51,67,73,88] },
  "90 days": { visitors: "12,640", change: "+31.8%", interest: "7.8%", actions: "986", series: [16,28,23,32,41,36,53,47,62,68,74,92] },
};

export function LiveSignalDashboard() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("30 days");
  const [metric, setMetric] = useState<"visitors" | "interest">("visitors");
  const data = snapshots[period];
  const points = useMemo(() => data.series.map((value, i) => (i * 100) + "," + (104 - value)).join(" "), [data]);
  const svgPoints = useMemo(() => data.series.map((value, i) => (i * 100) + "," + (104 - value)).join(" "), [data]);
  const metrics = [
    { id: "visitors" as const, label: "Page visitors", value: data.visitors, change: data.change, icon: Eye, color: "violet" },
    { id: "interest" as const, label: "Interest rate", value: data.interest, change: "+2.3 pts", icon: MousePointer2, color: "cyan" },
  ];
  return <div className="live-dashboard">
    <div className="live-dashboard-top">
      <div className="flex min-w-0 items-center gap-3"><span className="live-dashboard-mark"><RadioTower size={17}/></span><div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-white">Signal overview</h3><span className="sample-badge"><i/> SAMPLE DATA</span></div><p className="mt-1 text-xs text-white/50">A preview of the signals you could track</p></div></div>
      <div className="period-switch" aria-label="Choose sample time range">{periods.map(p => <button type="button" key={p} aria-pressed={period === p} onClick={() => setPeriod(p)}>{p}</button>)}</div>
    </div>
    <div className="live-metrics-grid">{metrics.map(m => {const Icon=m.icon;return <button type="button" key={m.id} onClick={() => setMetric(m.id)} aria-pressed={metric === m.id} className={"live-metric-card " + (metric === m.id ? "is-selected" : "")}><div className="flex items-center justify-between"><span className="live-metric-label">{m.label}</span><span className={"live-metric-icon " + m.color}><Icon size={15}/></span></div><div className="mt-4 flex items-end justify-between gap-2"><strong>{m.value}</strong><span className="live-metric-change"><ArrowUpRight size={12}/>{m.change}</span></div><span className="live-metric-hint">{metric === m.id ? "Showing trend below" : "Click to inspect trend"}</span></button>})}
      <div className="live-metric-card compact"><div className="flex items-center justify-between"><span className="live-metric-label">Waitlist actions</span><span className="live-metric-icon pink"><Users size={15}/></span></div><div className="mt-4"><strong>{data.actions}</strong></div><span className="live-metric-hint">Sample conversions</span></div>
    </div>
    <div className="live-chart-panel">
      <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-medium text-white/80">{metric === "visitors" ? "Visitor activity" : "Interest conversion"}</div><div className="mt-1 text-[10px] text-white/45">Illustrative trend · {period}</div></div><span className="chart-legend"><i className={metric === "visitors" ? "violet" : "cyan"}/>{metric === "visitors" ? "Visitors" : "Interest"}</span></div>
      <div className="live-chart-wrap"><div className="chart-y-labels"><span>High</span><span>Mid</span><span>Low</span></div><svg viewBox="0 0 1100 120" preserveAspectRatio="none" role="img" aria-label={"Illustrative " + metric + " trend for " + period}><defs><linearGradient id="signal-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={metric === "visitors" ? "#9c8bff" : "#6fe7ff"} stopOpacity=".28"/><stop offset="100%" stopColor={metric === "visitors" ? "#9c8bff" : "#6fe7ff"} stopOpacity="0"/></linearGradient></defs>{[18,48,78,108].map(y=><line key={y} x1="0" x2="1100" y1={y} y2={y} stroke="rgba(255,255,255,.08)" strokeDasharray="4 8"/>)}<polygon points={"0,120 " + svgPoints.replace(/(\d+),(\d+)/g,(_,x,y)=>String(Number(x)*11)+","+String(Number(y))) + " 1100,120"} fill="url(#signal-chart-fill)"/><polyline points={svgPoints.replace(/(\d+),(\d+)/g,(_,x,y)=>String(Number(x)*11)+","+String(Number(y)))} fill="none" stroke={metric === "visitors" ? "#a89aff" : "#78e9ff"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/><circle cx="1100" cy={104-data.series[data.series.length-1]} r="5" fill={metric === "visitors" ? "#c7bdff" : "#a5f2ff"} stroke="#121521" strokeWidth="3"/></svg></div>
      <div className="live-chart-axis"><span>START</span><span>BUILDING MOMENTUM</span><span>NOW</span></div>
    </div>
    <div className="live-dashboard-insight"><span className="insight-spark"><Sparkles size={15}/></span><div><div className="text-xs font-semibold text-white">A useful signal is a question answered</div><p className="mt-1 text-xs leading-5 text-white/55">Look for changes over time, then connect them to one experiment. These numbers are illustrative—not live account data.</p></div><span className="insight-pulse"><Zap size={14}/></span></div>
  </div>;
}
