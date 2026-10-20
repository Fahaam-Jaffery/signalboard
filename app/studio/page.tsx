"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Eye, LoaderCircle, Sparkles, WandSparkles } from "lucide-react";

type Theme = "violet" | "ocean" | "ember";
type Layout = "editorial" | "minimal" | "bold";

const themes: Record<Theme, { label: string; accent: string; soft: string; ink: string; description: string }> = {
  violet: { label: "Violet studio", accent: "#7157e8", soft: "#f1edff", ink: "#211b35", description: "Polished, modern, product-led" },
  ocean: { label: "Ocean clarity", accent: "#087e8b", soft: "#e6f7f8", ink: "#122c34", description: "Calm, clear, trust-building" },
  ember: { label: "Ember energy", accent: "#d65b35", soft: "#fff0e9", ink: "#38221d", description: "Warm, bold, community-led" },
};

export default function StudioPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [title, setTitle] = useState(search.get("title") || "");
  const [description, setDescription] = useState(search.get("description") || "");
  const [audience, setAudience] = useState(search.get("audience") || "");
  const [category, setCategory] = useState(search.get("category") || "Micro-SaaS");
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [benefitsText, setBenefitsText] = useState("Save time on repetitive work\nKeep the important work in one place\nMake progress with less friction");
  const [theme, setTheme] = useState<Theme>("violet");
  const [layout, setLayout] = useState<Layout>("minimal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState("");

  const copy = useMemo(() => {
    const product = title.trim() || "Your product";
    const audienceText = audience.trim() || "people who need a simpler way to get things done";
    const desc = description.trim() || "A focused solution for a problem that deserves less friction.";
    return {
      headline: headline.trim() || `A better way to use ${product}.`,
      subheadline: subheadline.trim() || desc,
      problem: problem.trim() || `${audienceText} are often left juggling disconnected tools and repetitive work. It should be simpler.`,
      solution: solution.trim() || desc,
      audience: audienceText,
      benefits: benefitsText.split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 6),
    };
  }, [title, description, audience, headline, subheadline, problem, solution, benefitsText]);

  async function publishPage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setPublished("");
    try {
      const response = await fetch("/api/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: {
            title: title.trim(),
            description: description.trim(),
            targetAudience: audience.trim(),
            category: category.trim() || "Micro-SaaS",
          },
          customization: { ...copy, theme, layout },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not publish the landing page.");
      setPublished(data.url || `/p/${data.page.slug}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not publish the landing page.");
    } finally {
      setBusy(false);
    }
  }

  const selectedTheme = themes[theme];

  return (
    <main className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <header className="sticky top-0 z-20 border-b border-[rgb(var(--border))] bg-[rgb(var(--background))]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium muted hover:text-violet-600"><ArrowLeft size={16}/> Back to dashboard</Link>
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-600 text-white"><WandSparkles size={16}/></span> Page studio</div>
          <span className="hidden items-center gap-1.5 text-xs muted sm:inline-flex"><Eye size={14}/> Live preview</span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10">
        <div className="max-w-3xl">
          <div className="eyebrow text-violet-600">FROM IDEA TO EXPERIMENT</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">Make it yours before it goes live.</h1>
          <p className="mt-4 text-sm leading-6 muted sm:text-base">Describe what you’re building, choose a visual direction, edit the message, and preview the page as you go. No AI API key required.</p>
        </div>

        {published && <div role="status" className="mt-7 flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><Check size={16}/> Your page is published</div><p className="mt-1 break-all text-xs muted">{published}</p></div><a href={published} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-xs font-semibold text-white">Open published page ↗</a></div>}
        {error && <div role="alert" className="mt-7 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">{error}</div>}

        <div className="mt-8 grid items-start gap-7 xl:grid-cols-[.9fr_1.1fr]">
          <form onSubmit={publishPage} className="space-y-6">
            <section className="surface space-y-5 p-5 sm:p-6">
              <div><div className="text-xs font-semibold text-violet-600">01 / THE IDEA</div><h2 className="mt-2 text-lg font-semibold">What are you making?</h2></div>
              <div><label htmlFor="title" className="text-sm font-medium">Product or project name</label><input id="title" required maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. QuietHours" className="mt-2 w-full rounded-xl border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm outline-none focus:border-violet-500"/></div>
              <div><label htmlFor="description" className="text-sm font-medium">Describe the product</label><textarea id="description" required maxLength={500} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does it help people do, and why is it useful?" className="mt-2 w-full resize-y rounded-xl border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm leading-6 outline-none focus:border-violet-500"/></div>
              <div><label htmlFor="audience" className="text-sm font-medium">Who is it for?</label><input id="audience" maxLength={250} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. independent creators and freelancers" className="mt-2 w-full rounded-xl border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm outline-none focus:border-violet-500"/></div>
              <div><label htmlFor="category" className="text-sm font-medium">Category</label><input id="category" maxLength={80} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Productivity, creator tools, research…" className="mt-2 w-full rounded-xl border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm outline-none focus:border-violet-500"/></div>
            </section>

            <section className="surface space-y-5 p-5 sm:p-6">
              <div><div className="text-xs font-semibold text-violet-600">02 / THE LOOK</div><h2 className="mt-2 text-lg font-semibold">Choose a design direction</h2><p className="mt-1 text-xs muted">Switch styles anytime. The preview updates instantly.</p></div>
              <div className="grid gap-3 sm:grid-cols-3">{(Object.keys(themes) as Theme[]).map((key) => <button key={key} type="button" onClick={() => setTheme(key)} className={`rounded-2xl border p-3 text-left transition ${theme === key ? "border-violet-500 ring-2 ring-violet-500/15" : "border-[rgb(var(--border))]"}`}><span className="mb-3 block h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${themes[key].accent}, ${themes[key].soft})` }}/><span className="block text-xs font-semibold">{themes[key].label}</span><span className="mt-1 block text-[10px] leading-4 muted">{themes[key].description}</span></button>)}</div>
              <div><div className="mb-2 text-sm font-medium">Layout mood</div><div className="grid grid-cols-3 gap-2">{([{key:"minimal",label:"Minimal"},{key:"editorial",label:"Editorial"},{key:"bold",label:"Bold"}] as {key:Layout;label:string}[]).map((item)=><button key={item.key} type="button" onClick={()=>setLayout(item.key)} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${layout===item.key?"border-violet-500 bg-violet-500/10 text-violet-600":"border-[rgb(var(--border))]"}`}>{item.label}</button>)}</div></div>
            </section>

            <section className="surface space-y-5 p-5 sm:p-6">
              <div><div className="text-xs font-semibold text-violet-600">03 / THE MESSAGE</div><h2 className="mt-2 text-lg font-semibold">Edit the words</h2><p className="mt-1 text-xs muted">Leave a field blank to use a sensible starting point.</p></div>
              <div><label htmlFor="headline" className="text-sm font-medium">Main headline</label><input id="headline" maxLength={180} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={`A better way to use ${title || "your product"}.`} className="mt-2 w-full rounded-xl border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm outline-none focus:border-violet-500"/></div>
              <div><label htmlFor="subheadline" className="text-sm font-medium">Supporting message</label><textarea id="subheadline" maxLength={500} rows={2} value={subheadline} onChange={(e) => setSubheadline(e.target.value)} placeholder={description || "Explain the promise in one or two sentences."} className="mt-2 w-full rounded-xl border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm leading-6 outline-none focus:border-violet-500"/></div>
              <div><label htmlFor="problem" className="text-sm font-medium">Problem you solve</label><textarea id="problem" maxLength={500} rows={2} value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Describe the friction your audience faces." className="mt-2 w-full rounded-xl border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm leading-6 outline-none focus:border-violet-500"/></div>
              <div><label htmlFor="solution" className="text-sm font-medium">Your approach</label><textarea id="solution" maxLength={500} rows={2} value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="How does your product make it easier?" className="mt-2 w-full rounded-xl border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm leading-6 outline-none focus:border-violet-500"/></div>
              <div><label htmlFor="benefits" className="text-sm font-medium">Key benefits <span className="font-normal muted">(one per line, up to 6)</span></label><textarea id="benefits" rows={4} value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} className="mt-2 w-full resize-y rounded-xl border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm leading-6 outline-none focus:border-violet-500"/></div>
            </section>

            <button type="submit" disabled={busy || !title.trim() || !description.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin"/> : <Sparkles size={17}/>} {busy ? "Publishing your page…" : "Publish landing page"}</button>
            <p className="text-center text-xs muted">Your page only goes live when you click publish.</p>
          </form>

          <aside className="xl:sticky xl:top-24">
            <div className="mb-3 flex items-center justify-between"><div><div className="text-xs font-semibold text-violet-600">LIVE CANVAS</div><h2 className="mt-1 text-lg font-semibold">Your landing page preview</h2></div><span className="rounded-full border border-[rgb(var(--border))] px-3 py-1.5 text-[10px] muted">Updates as you edit</span></div>
            <div className="overflow-hidden rounded-[26px] border border-black/10 bg-white shadow-2xl" style={{ color: selectedTheme.ink }}>
              <div className="flex items-center justify-between border-b border-black/[.06] px-5 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{background:selectedTheme.accent}}>S</span>{title.trim() || "Your product"}<span style={{color:selectedTheme.accent}}>.</span></div><span className="rounded-full border border-black/10 px-3 py-1.5 text-[10px] font-semibold">Get early access ↗</span></div>
              <section className="relative px-5 pb-10 pt-12 text-center sm:px-10 sm:pb-14 sm:pt-16" style={{background:`radial-gradient(circle at 50% 0%, ${selectedTheme.soft}, #fff 70%)`}}>
                <span className="inline-flex rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-widest" style={{color:selectedTheme.accent}}>{category.trim() || "INTRODUCING"}</span>
                <h3 className={`mx-auto mt-5 max-w-2xl font-semibold tracking-[-.055em] ${layout==="bold"?"text-4xl sm:text-6xl":layout==="editorial"?"text-3xl sm:text-5xl":"text-3xl sm:text-5xl"}`}>{copy.headline}</h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7" style={{color:"#777287"}}>{copy.subheadline}</p>
                <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-black/[.07] bg-white p-3 text-left shadow-lg shadow-black/5"><div className="flex gap-2"><div className="flex-1 rounded-xl border border-black/10 px-3 py-3 text-xs text-[#999]">you@example.com</div><span className="rounded-xl px-4 py-3 text-xs font-semibold text-white" style={{background:selectedTheme.accent}}>Join list</span></div><p className="mt-2 text-center text-[9px]" style={{color:"#999"}}>Get thoughtful updates. No spam.</p></div>
              </section>
              <section className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-6"><div className="rounded-2xl border border-black/[.07] p-5"><div className="text-[9px] font-semibold uppercase tracking-widest" style={{color:selectedTheme.accent}}>THE CHALLENGE</div><h4 className="mt-3 text-lg font-semibold leading-tight">The current way takes too much effort.</h4><p className="mt-3 text-xs leading-6 text-[#777287]">{copy.problem}</p></div><div className="rounded-2xl p-5" style={{background:selectedTheme.soft}}><div className="text-[9px] font-semibold uppercase tracking-widest" style={{color:selectedTheme.accent}}>THE APPROACH</div><h4 className="mt-3 text-lg font-semibold leading-tight">Less friction. More forward.</h4><p className="mt-3 text-xs leading-6 text-[#686277]">{copy.solution}</p></div></section>
              <section className="px-4 pb-6 sm:px-6"><div className="rounded-2xl border border-black/[.07] p-5"><div className="text-[9px] font-semibold uppercase tracking-widest" style={{color:selectedTheme.accent}}>WHY IT MATTERS</div><div className="mt-4 grid gap-3 sm:grid-cols-3">{copy.benefits.length ? copy.benefits.map((benefit,index)=><div key={index} className="rounded-xl p-3 text-xs leading-5" style={{background:selectedTheme.soft}}><span className="mb-2 block text-[10px] font-semibold" style={{color:selectedTheme.accent}}>0{index+1}</span>{benefit}</div>) : <p className="text-xs text-[#999]">Add benefits to preview them here.</p>}</div></div></section>
              <div className="mx-4 mb-5 rounded-2xl px-5 py-6 text-white sm:mx-6" style={{background:selectedTheme.ink}}><div className="text-[9px] font-semibold uppercase tracking-widest" style={{color:selectedTheme.accent}}>BE PART OF THE FIRST WAVE</div><h4 className="mt-3 text-xl font-semibold">{title.trim() ? `Help shape ${title}.` : "Help shape what comes next."}</h4><p className="mt-2 text-xs leading-5 text-white/70">Join the list and get updates when there’s something worth trying.</p></div>
              <div className="border-t border-black/[.06] px-5 py-4 text-center text-[9px] text-[#999]">An early concept page powered by SignalBoard.</div>
            </div>
            <p className="mt-3 text-xs leading-5 muted">This is a responsive preview of the public page. The published version includes the real waitlist form and shareable URL.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
