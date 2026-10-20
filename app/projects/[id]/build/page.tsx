"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, Download, Eye, LoaderCircle, Plus, Save, Sparkles, Trash2 } from "lucide-react";

type Kind = "heading" | "text" | "button" | "input" | "stat" | "task-list";
type AppComponent = { id: string; type: Kind; label: string; content: string; action?: string };
type AppScreen = { id: string; title: string; subtitle: string; components: AppComponent[] };
type AppBuilder = { version: 1; appName: string; theme: "violet" | "ocean" | "ember"; screens: AppScreen[] };
type Project = { id: string; name: string; description: string; audience: string; category: string; stage: string; workspace: Record<string, unknown> };

const uid = () => Math.random().toString(36).slice(2, 9);
const kinds: { id: Kind; label: string }[] = [
  { id: "heading", label: "Heading" }, { id: "text", label: "Text" }, { id: "button", label: "Action button" },
  { id: "input", label: "Text input" }, { id: "stat", label: "Stat card" }, { id: "task-list", label: "Interactive checklist" },
];
function starter(project: Project): AppBuilder {
  const name = project.name || "Your product";
  const description = project.description || "A focused workspace to help you get things done.";
  const audience = project.audience || "your team";
  const category = project.category || "Web app";
  return {
    version: 1, appName: name, theme: "violet",
    screens: [
      { id: uid(), title: "Home", subtitle: "A clear starting point for your product.", components: [
        { id: uid(), type: "heading", label: "Welcome heading", content: name },
        { id: uid(), type: "text", label: "Intro copy", content: description },
        { id: uid(), type: "input", label: "Quick input", content: "What would you like to work on?" },
        { id: uid(), type: "button", label: "Primary action", content: "Get started", action: "increment" },
      ]},
      { id: uid(), title: "Dashboard", subtitle: "A useful overview at a glance.", components: [
        { id: uid(), type: "heading", label: "Dashboard heading", content: "Your progress, in one place" },
        { id: uid(), type: "stat", label: "Progress stat", content: "0" },
        { id: uid(), type: "text", label: "Audience note", content: "Designed for " + audience + " · " + category },
        { id: uid(), type: "task-list", label: "Starter checklist", content: "Set up your workspace\nComplete your first task\nShare with your team" },
      ]},
      { id: uid(), title: "Settings", subtitle: "Make this prototype yours.", components: [
        { id: uid(), type: "heading", label: "Settings heading", content: "Make it yours" },
        { id: uid(), type: "input", label: "Workspace name", content: name },
        { id: uid(), type: "button", label: "Save settings action", content: "Save preferences", action: "submit" },
      ]},
    ],
  };
}
const esc = (s: string) => { const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }; return s.replace(/[&<>"]/g, (c) => entities[c] || c); };
const themeClass: Record<AppBuilder["theme"], string> = {
  violet: "from-violet-600 to-indigo-600", ocean: "from-cyan-600 to-blue-700", ember: "from-orange-500 to-rose-600",
};

function exportHtml(app: AppBuilder) {
  const pages = app.screens.map((screen, i) => `<section class="screen ${i === 0 ? "active" : ""}" data-screen="${esc(screen.id)}"><div class="eyebrow">${esc(screen.title)}</div><h1>${esc(screen.title)}</h1><p class="muted">${esc(screen.subtitle)}</p><div class="components">${screen.components.map((c) => {
    if (c.type === "heading") return `<h2>${esc(c.content)}</h2>`;
    if (c.type === "text") return `<p>${esc(c.content)}</p>`;
    if (c.type === "button") return `<button data-action="${esc(c.action || "increment")}">${esc(c.content)}</button>`;
    if (c.type === "input") return `<label>${esc(c.label)}<input placeholder="${esc(c.content)}" /></label>`;
    if (c.type === "stat") return `<div class="stat"><small>${esc(c.label)}</small><strong data-count>${esc(c.content)}</strong></div>`;
    return `<div class="tasks"><h3>${esc(c.label)}</h3>${c.content.split("\n").filter(Boolean).map((task) => `<label class="task"><input type="checkbox"> ${esc(task)}</label>`).join("")}</div>`;
  }).join("")}</div></section>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(app.appName)}</title><style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:#171725;background:#f6f7fb}*{box-sizing:border-box}body{margin:0}.shell{max-width:980px;margin:auto;padding:28px 20px 70px}.bar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}.brand{font-weight:800;font-size:18px}.nav{display:flex;gap:8px;flex-wrap:wrap}.nav button{background:white;color:#444;border:1px solid #e3e4ed}.hero{margin:30px 0 22px;padding:32px;border-radius:24px;background:linear-gradient(135deg,#6d28d9,#4338ca);color:white}.hero h1{font-size:clamp(28px,5vw,44px);letter-spacing:-.05em;margin:10px 0}.hero p{opacity:.85}.screen{display:none}.screen.active{display:block}.eyebrow,small{font-size:11px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;color:#777}.components{display:grid;gap:14px;margin-top:20px}.components>*{background:white;border:1px solid #e7e8f0;border-radius:16px;padding:20px}.components h2{font-size:24px;letter-spacing:-.04em;margin:0}.components p{line-height:1.7;margin:0}.muted{color:#74758a;line-height:1.6}button{border:0;border-radius:11px;padding:12px 16px;background:#6d28d9;color:white;font-weight:700;cursor:pointer}input:not([type=checkbox]){display:block;width:100%;margin-top:8px;border:1px solid #dedfea;border-radius:10px;padding:12px;font:inherit}.stat strong{display:block;font-size:36px;margin-top:8px}.tasks{display:grid;gap:12px}.tasks h3{margin:0}.task{display:flex;gap:10px;align-items:center;padding:8px 0}.task input{width:17px;height:17px}.status{font-size:13px;color:#6d28d9;min-height:20px;margin-top:14px}@media(min-width:700px){.components{grid-template-columns:repeat(2,minmax(0,1fr))}.components>*:first-child:nth-last-child(1){grid-column:1/-1}}
</style></head><body><main class="shell"><header class="bar"><div class="brand">${esc(app.appName)}</div><nav class="nav">${app.screens.map((s,i)=>`<button data-go="${esc(s.id)}" style="${i===0?"background:#6d28d9;color:white":""}">${esc(s.title)}</button>`).join("")}</nav></header><div class="hero"><div class="eyebrow" style="color:#ede9fe">INTERACTIVE PROTOTYPE</div><h1>${esc(app.appName)}</h1><p>Explore the core experience. This exported prototype runs locally in your browser.</p></div>${pages}<div class="status" id="status" role="status"></div></main><script>
let count=0;document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.dataset.screen===b.dataset.go));document.querySelectorAll("[data-go]").forEach(x=>{x.style.background=x===b?"#6d28d9":"white";x.style.color=x===b?"white":"#444"})}));document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.action==="increment"){count++;document.querySelectorAll("[data-count]").forEach(x=>x.textContent=String(count));document.getElementById("status").textContent="Action completed — progress updated."}else{document.getElementById("status").textContent="Saved! Your preferences were updated in this prototype."}}));document.querySelectorAll('input:not([type="checkbox"])').forEach(i=>i.addEventListener("change",()=>{document.getElementById("status").textContent="Input captured: "+i.value}));document.querySelectorAll('input[type="checkbox"]').forEach(i=>i.addEventListener("change",()=>{document.getElementById("status").textContent=i.checked?"Task marked complete.":"Task reopened."}));
</script></body></html>`;
}

export default function BuildPrototypePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [app, setApp] = useState<AppBuilder | null>(null);
  const [activeScreen, setActiveScreen] = useState("");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [formDone, setFormDone] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/projects/" + id);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load this product.");
      const p = data.project as Project;
      setProject(p);
      const saved = p.workspace?.appBuilder as AppBuilder | undefined;
      const next = saved?.version === 1 && Array.isArray(saved.screens) ? saved : starter(p);
      setApp(next);
      setActiveScreen(next.screens[0]?.id || "");
      setSelected(next.screens[0]?.components[0]?.id || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this product.");
    } finally { setBusy(false); }
  }, [id]);
  useEffect(() => { if (id) void load(); }, [id, load]);

  const current = useMemo(() => app?.screens.find((s) => s.id === activeScreen), [app, activeScreen]);
  const picked = current?.components.find((c) => c.id === selected);
  function changeApp(fn: (old: AppBuilder) => AppBuilder) { setApp((old) => old ? fn(old) : old); setNotice(""); }
  function editComponent(idToEdit: string, changes: Partial<AppComponent>) {
    changeApp((old) => ({ ...old, screens: old.screens.map((s) => s.id !== activeScreen ? s : ({ ...s, components: s.components.map((c) => c.id === idToEdit ? { ...c, ...changes } : c) })) }));
  }
  function addScreen() {
    const screen: AppScreen = { id: uid(), title: "New screen", subtitle: "Describe what happens here.", components: [{ id: uid(), type: "heading", label: "Screen heading", content: "Your new screen" }, { id: uid(), type: "text", label: "Supporting text", content: "Edit this content in the component panel." }, { id: uid(), type: "button", label: "Primary action", content: "Continue", action: "increment" }] };
    changeApp((old) => ({ ...old, screens: [...old.screens, screen] }));
    setActiveScreen(screen.id); setSelected(screen.components[0].id);
  }
  function addComponent(type: Kind) {
    if (!current) return;
    const defaults: Record<Kind, Omit<AppComponent, "id">> = {
      heading: { type, label: "Heading", content: "A clear, useful headline" },
      text: { type, label: "Text block", content: "Explain the value in a sentence or two." },
      button: { type, label: "Action button", content: "Try it now", action: "increment" },
      input: { type, label: "Text input", content: "Type something here…" },
      stat: { type, label: "Progress stat", content: "0" },
      "task-list": { type, label: "Checklist", content: "First task\nSecond task\nThird task" },
    };
    const c = { id: uid(), ...defaults[type] };
    changeApp((old) => ({ ...old, screens: old.screens.map((s) => s.id === activeScreen ? { ...s, components: [...s.components, c] } : s) }));
    setSelected(c.id);
  }
  async function save() {
    if (!project || !app) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/projects/" + project.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspace: { ...project.workspace, appBuilder: app }, stage: "prototype" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save prototype.");
      setProject(data.project); setNotice("Prototype saved to your workspace.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save prototype."); }
    finally { setSaving(false); }
  }
  function download() {
    if (!app) return;
    const blob = new Blob([exportHtml(app)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = (app.appName || "signalboard-prototype").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".html";
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  }

  if (busy) return <main className="min-h-screen grid place-items-center"><div className="flex items-center gap-2 text-sm muted"><LoaderCircle size={18} className="animate-spin" /> Preparing your app builder…</div></main>;
  if (!project || !app) return <main className="min-h-screen p-8"><p className="text-sm text-rose-600">{error || "Product not found."}</p><Link href="/projects" className="mt-4 inline-block text-sm text-violet-600">Back to projects</Link></main>;

  return <main className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
    <header className="sticky top-0 z-30 border-b border-[rgb(var(--border))] bg-[rgb(var(--background))]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-7">
      <Link href={"/projects/" + project.id} className="inline-flex items-center gap-2 text-xs font-semibold muted"><ArrowLeft size={15}/> Workspace</Link>
      <div className="min-w-0 text-center"><div className="truncate text-sm font-semibold">{app.appName}</div><div className="text-[10px] muted">APP BUILDER · LIVE PROTOTYPE</div></div>
      <div className="flex shrink-0 items-center gap-2"><button onClick={download} className="inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] px-3 py-2.5 text-xs font-semibold"><Download size={14}/><span className="hidden sm:inline">Export HTML</span></button><button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{saving ? <LoaderCircle size={14} className="animate-spin"/> : <Save size={14}/>} Save</button></div>
    </div></header>
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><div className="eyebrow text-violet-600">SIGNALBOARD / PROTOTYPE STUDIO</div><h1 className="mt-2 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">Make it work. Then make it yours.</h1><p className="mt-2 max-w-2xl text-sm leading-6 muted">A starter app is generated from your product brief. Edit screens and components, try real interactions, then export a standalone HTML prototype—no AI key required.</p></div><div className="flex items-center gap-2 text-xs muted"><Sparkles size={15} className="text-violet-600"/> Autoset starter · editable · exportable</div></div>
      {error && <div role="alert" className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-600">{error}</div>}
      {notice && <div role="status" className="mb-4 inline-flex items-center gap-2 text-xs text-emerald-600"><Check size={14}/>{notice}</div>}
      <div className="grid items-start gap-5 xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <aside className="surface p-4">
          <div className="flex items-center justify-between"><h2 className="text-xs font-bold tracking-wide">SCREENS</h2><button onClick={addScreen} aria-label="Add screen" title="Add screen" className="rounded-lg p-2 text-violet-600 hover:bg-violet-500/10"><Plus size={16}/></button></div>
          <div className="mt-3 space-y-2">{app.screens.map((s, i) => <div key={s.id} className="flex gap-1"><button onClick={() => { setActiveScreen(s.id); setSelected(s.components[0]?.id || ""); }} className={"min-w-0 flex-1 rounded-xl border p-3 text-left " + (s.id === activeScreen ? "border-violet-500 bg-violet-500/[.07]" : "border-[rgb(var(--border))]")}><span className="block text-xs font-semibold">{i + 1}. {s.title}</span><span className="mt-1 block truncate text-[10px] muted">{s.components.length} components</span></button>{app.screens.length > 1 && <button aria-label={"Delete " + s.title} title="Delete screen" onClick={() => { const next = app.screens.filter(x => x.id !== s.id); changeApp(old => ({ ...old, screens: next })); if (s.id === activeScreen) { setActiveScreen(next[0].id); setSelected(next[0].components[0]?.id || ""); } }} className="rounded-lg px-2 text-rose-500"><Trash2 size={14}/></button>}</div>)}</div>
          <div className="mt-5 border-t border-[rgb(var(--border))] pt-4"><label className="text-xs font-semibold">App name</label><input value={app.appName} maxLength={100} onChange={e => changeApp(old => ({ ...old, appName: e.target.value }))} className="mt-2 w-full rounded-lg border border-[rgb(var(--border))] bg-transparent px-3 py-2.5 text-xs"/><label className="mt-4 block text-xs font-semibold">Accent theme</label><div className="mt-2 grid grid-cols-3 gap-2">{(["violet","ocean","ember"] as const).map(t => <button key={t} onClick={() => changeApp(old => ({ ...old, theme: t }))} className={"rounded-lg border px-1 py-2 text-[10px] capitalize " + (app.theme === t ? "border-violet-500 bg-violet-500/10" : "border-[rgb(var(--border))]")}>{t}</button>)}</div></div>
        </aside>
        <section className="min-w-0 space-y-4">
          <div className="surface flex flex-wrap items-center justify-between gap-3 p-4"><div><div className="text-sm font-semibold">Live preview</div><div className="mt-1 text-[10px] muted">Click controls in the preview to test behavior.</div></div><div className="inline-flex items-center gap-1.5 text-[10px] muted"><Eye size={14}/> Interactive mode</div></div>
          <div className="overflow-hidden rounded-[24px] border border-[rgb(var(--border))] bg-[#f6f7fb] text-[#19192a] shadow-sm">
            <div className={"bg-gradient-to-br " + themeClass[app.theme] + " px-6 py-7 text-white sm:px-9 sm:py-10"}><div className="text-[10px] font-bold uppercase tracking-[.18em] text-white/70">{app.appName}</div><div className="mt-2 text-3xl font-semibold tracking-[-.05em]">{current?.title}</div><p className="mt-2 max-w-xl text-sm leading-6 text-white/80">{current?.subtitle}</p></div>
            <nav className="flex flex-wrap gap-2 border-b border-[#e5e7ef] bg-white px-4 py-3">{app.screens.map(s => <button key={s.id} onClick={() => { setActiveScreen(s.id); setSelected(s.components[0]?.id || ""); }} className={"rounded-lg px-3 py-2 text-xs font-semibold " + (s.id === activeScreen ? "bg-[#19192a] text-white" : "bg-[#f1f1f7] text-[#55556a]")}>{s.title}</button>)}</nav>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">{current?.components.map(c => <div key={c.id} onClick={() => setSelected(c.id)} className={"min-w-0 rounded-2xl border bg-white p-4 text-left " + (selected === c.id ? "border-violet-500 ring-2 ring-violet-500/15" : "border-[#e5e7ef]")}>
              {c.type === "heading" && <h2 className="text-xl font-semibold tracking-[-.04em]">{c.content}</h2>}
              {c.type === "text" && <p className="text-sm leading-6 text-[#67687b]">{c.content}</p>}
              {c.type === "button" && <><div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-[#9293a3]">{c.label}</div><button onClick={e => { e.stopPropagation(); if (c.action === "submit") setFormDone(old => ({ ...old, [c.id]: true })); else setCounts(old => ({ ...old, [c.id]: (old[c.id] || 0) + 1 })); }} className={"rounded-xl bg-gradient-to-r " + themeClass[app.theme] + " px-4 py-3 text-xs font-semibold text-white"}>{c.content}</button>{c.action === "increment" && <span className="ml-3 text-xs text-[#68697a]">Clicked {counts[c.id] || 0} times</span>}{formDone[c.id] && <p className="mt-2 text-xs text-emerald-600">Saved successfully.</p>}</>}
              {c.type === "input" && <label className="block text-xs font-semibold text-[#4b4c5e]">{c.label}<input value={inputs[c.id] ?? ""} onChange={e => setInputs(old => ({ ...old, [c.id]: e.target.value }))} placeholder={c.content} className="mt-2 w-full rounded-xl border border-[#dedfea] bg-white px-3 py-3 text-sm font-normal text-[#19192a] outline-none focus:border-violet-500"/></label>}
              {c.type === "stat" && <><div className="text-xs text-[#77788a]">{c.label}</div><div className="mt-2 text-4xl font-semibold tracking-[-.05em]">{(Number(c.content) || 0) + (counts[c.id] || 0)}</div><button onClick={e => { e.stopPropagation(); setCounts(old => ({ ...old, [c.id]: (old[c.id] || 0) + 1 })); }} className="mt-3 rounded-lg bg-[#f0eaff] px-3 py-2 text-xs font-semibold text-violet-700">Increment stat</button></>}
              {c.type === "task-list" && <><div className="text-sm font-semibold">{c.label}</div><div className="mt-3 space-y-3">{c.content.split("\n").filter(Boolean).map((task, i) => { const key = c.id + "-" + i; return <label key={key} className="flex items-center gap-2 text-xs text-[#515266]"><input type="checkbox" checked={!!checked[key]} onChange={e => setChecked(old => ({ ...old, [key]: e.target.checked }))} className="h-4 w-4 accent-violet-600"/><span className={checked[key] ? "line-through opacity-50" : ""}>{task}</span></label>; })}</div></>}
            </div>)}</div>
            <div className="border-t border-[#e5e7ef] bg-white px-5 py-3 text-xs text-[#74758a]" role="status">{Object.values(checked).filter(Boolean).length} tasks completed · {Object.values(counts).reduce((a,b) => a+b, 0)} actions performed</div>
          </div>
          <div className="surface flex flex-wrap items-center justify-between gap-3 p-4"><div><div className="text-xs font-semibold">Ready to take it with you?</div><div className="mt-1 text-[10px] muted">Export creates a standalone HTML file with working navigation, inputs, buttons and checklists.</div></div><button onClick={download} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-xs font-semibold text-white"><Download size={14}/> Export app</button></div>
        </section>
        <aside className="surface p-4 sm:p-5">
          <div className="flex items-center justify-between"><div><div className="text-xs font-bold tracking-wide">COMPONENT EDITOR</div><div className="mt-1 text-[10px] muted">Select a component to edit it.</div></div><ChevronDown size={15} className="muted"/></div>
          <label className="mt-5 block text-xs font-semibold">Add component</label><div className="mt-2 grid grid-cols-2 gap-2">{kinds.map(k => <button key={k.id} onClick={() => addComponent(k.id)} className="rounded-lg border border-[rgb(var(--border))] px-2 py-2.5 text-[10px] font-medium hover:border-violet-500">{k.label}</button>)}</div>
          <div className="mt-5 border-t border-[rgb(var(--border))] pt-5"><div className="text-xs font-semibold">Components on {current?.title}</div><div className="mt-2 space-y-1">{current?.components.map(c => <div key={c.id} className="flex items-center gap-1"><button onClick={() => setSelected(c.id)} className={"min-w-0 flex-1 truncate rounded-lg px-2.5 py-2 text-left text-xs " + (selected === c.id ? "bg-violet-500/10 font-semibold text-violet-600" : "hover:bg-[rgb(var(--border))]/30")}>{c.label}</button><button aria-label={"Delete " + c.label} onClick={() => { changeApp(old => ({ ...old, screens: old.screens.map(s => s.id === activeScreen ? { ...s, components: s.components.filter(x => x.id !== c.id) } : s) })); if (selected === c.id) setSelected(""); }} className="rounded-md p-2 text-rose-500"><Trash2 size={13}/></button></div>)}</div></div>
          {picked && <div className="mt-5 border-t border-[rgb(var(--border))] pt-5"><div className="text-xs font-semibold">Edit selected component</div><label className="mt-3 block text-[10px] font-semibold muted">Component label</label><input value={picked.label} onChange={e => editComponent(picked.id, { label: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[rgb(var(--border))] bg-transparent px-3 py-2.5 text-xs"/><label className="mt-3 block text-[10px] font-semibold muted">{picked.type === "task-list" ? "Checklist items (one per line)" : picked.type === "input" ? "Placeholder text" : "Visible content"}</label><textarea rows={4} value={picked.content} onChange={e => editComponent(picked.id, { content: e.target.value })} className="mt-1.5 w-full resize-y rounded-lg border border-[rgb(var(--border))] bg-transparent px-3 py-2.5 text-xs leading-5"/>{picked.type === "button" && <><label className="mt-3 block text-[10px] font-semibold muted">Interaction</label><select value={picked.action || "increment"} onChange={e => editComponent(picked.id, { action: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[rgb(var(--border))] bg-transparent px-3 py-2.5 text-xs"><option value="increment">Increment counter</option><option value="submit">Show saved confirmation</option></select></>}</div>}
          <div className="mt-5 rounded-xl bg-violet-500/[.07] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-violet-600"><Sparkles size={14}/> Prototype, not production</div><p className="mt-2 text-[10px] leading-5 muted">This builder creates a functional front-end concept. Authentication, persistent app data, payments and production deployment still need to be connected before launch.</p></div>
        </aside>
      </div>
    </div>
  </main>;
}
