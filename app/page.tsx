import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, CircleDot, Compass, Layers3, ShieldCheck, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import { LandingDemo } from "@/components/landing-demo";

const pillars = [
  { n: "01", icon: Compass, title: "Find a sharper idea", desc: "Start with your skills, interests, and constraints—not another generic list of startup ideas.", tag: "Discover" },
  { n: "02", icon: Layers3, title: "Make the idea tangible", desc: "Shape a clear promise into a polished landing page people can actually respond to.", tag: "Validate" },
  { n: "03", icon: TrendingUp, title: "Follow the evidence", desc: "Collect waitlist interest and use real signals to decide what deserves your time.", tag: "Learn" },
];

export default function Home() {
  return <main className="cinematic-home overflow-hidden">
    <nav className="cinematic-nav mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
      <Link href="/" className="brand-lockup flex items-center gap-3 font-semibold tracking-tight">
        <span className="brand-mark grid h-9 w-9 place-items-center rounded-xl"><CircleDot size={19}/></span>
        <span className="text-[15px]">signalboard<span className="brand-period">.</span></span>
      </Link>
      <div className="hidden items-center gap-8 text-sm text-white/55 md:flex">
        <a className="nav-link" href="#workflow">How it works</a>
        <a className="nav-link" href="#principles">Why SignalBoard</a>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login" className="rounded-full px-4 py-2.5 text-sm text-white/70 transition hover:text-white">Log in</Link>
        <Link href="/signup" className="cinematic-button cinematic-button-primary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5">Start exploring <ArrowUpRight size={15}/></Link>
      </div>
    </nav>

    <section className="cinematic-hero relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-14 lg:grid-cols-[.94fr_1.06fr] lg:px-10 lg:pb-32 lg:pt-20">
      <div className="hero-orb hero-orb-one pointer-events-none absolute -left-56 top-0 h-[520px] w-[520px] rounded-full"/>
      <div className="hero-orb hero-orb-two pointer-events-none absolute right-[22%] top-12 h-[360px] w-[360px] rounded-full"/>
      <div className="hero-copy relative z-10">
        <div className="hero-kicker mb-7 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[.16em]"><span className="status-pip"/><Sparkles size={13}/> A clearer path from idea to evidence</div>
        <h1 className="hero-heading max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-.065em] sm:text-6xl lg:text-[76px]">Make your next<br/>move <span className="luminous-type">mean something.</span></h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">Discover a promising product idea, turn it into a page, and learn whether people care—before you spend weeks building in the dark.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="cinematic-button cinematic-button-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold">Find your signal <ArrowRight size={16}/></Link>
          <a href="#workflow" className="cinematic-button cinematic-button-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold">Explore the workflow <ArrowDownRight size={15}/></a>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-white/45">
          <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-white/70"/> Built for small, smart experiments</span><span className="hidden h-1 w-1 rounded-full bg-white/25 sm:block"/><span>Clarity over guesswork</span>
        </div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-[650px] lg:ml-auto">
        <div className="demo-halo absolute -inset-8 rounded-[40px]"/>
        <LandingDemo/>
        <div className="floating-note floating-note-top hidden sm:flex"><span className="floating-note-icon"><Target size={15}/></span><span><b>Signal over noise</b><small>Focus on what matters</small></span></div>
        <div className="floating-note floating-note-bottom hidden sm:flex"><span className="floating-note-icon success"><Check size={15}/></span><span><b>Tested in the real world</b><small>Learn before you scale</small></span></div>
      </div>
    </section>

    <section id="principles" className="principles-band border-y border-white/[.08]">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-3 lg:px-10">
        {pillars.map((item) => <article key={item.n} className="principle-item group flex items-start gap-4 rounded-2xl p-3">
          <div className="principle-icon grid h-11 w-11 shrink-0 place-items-center rounded-xl"><item.icon size={18}/></div>
          <div><div className="mb-1 text-[10px] font-semibold uppercase tracking-[.17em] text-white/35">{item.tag}</div><h2 className="text-sm font-semibold text-white/90">{item.title}</h2><p className="mt-1.5 max-w-xs text-xs leading-5 text-white/45">{item.desc}</p></div>
        </article>)}
      </div>
    </section>

    <section id="workflow" className="workflow-section mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <div className="section-label"><span/> THE SIGNAL LOOP</div>
      <div className="mt-5 grid gap-8 md:grid-cols-[.9fr_1.1fr] md:items-end">
        <h2 className="section-heading max-w-2xl text-3xl font-semibold tracking-[-.055em] sm:text-5xl">Less theatre.<br/><span className="text-white/40">More useful proof.</span></h2>
        <p className="max-w-xl text-sm leading-7 text-white/50 md:justify-self-end md:text-base">You don’t need a forty-page business plan to begin. You need a focused hypothesis, a simple way to explain it, and a feedback loop that keeps you honest.</p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {n:"01",title:"Discover",desc:"Map what you know to problems worth exploring. Get tailored starting points with a reason behind each one.",icon:Compass,detail:"Start with your context"},
          {n:"02",title:"Publish",desc:"Turn the strongest direction into a clear, polished landing page with a real call to action.",icon:Layers3,detail:"Make the idea tangible"},
          {n:"03",title:"Learn",desc:"Collect interest, review the signal, and decide what to improve before committing to a full build.",icon:TrendingUp,detail:"Let evidence guide you"},
        ].map((item)=><article key={item.n} className="workflow-card group relative overflow-hidden rounded-2xl p-6 sm:p-7">
          <div className="workflow-card-glow"/>
          <div className="relative flex items-center justify-between"><span className="workflow-number">{item.n}</span><item.icon className="workflow-icon" size={19}/></div>
          <h3 className="relative mt-10 text-xl font-semibold tracking-tight text-white">{item.title}</h3><p className="relative mt-3 min-h-[72px] text-sm leading-6 text-white/48">{item.desc}</p>
          <div className="relative mt-7 flex items-center gap-2 border-t border-white/[.08] pt-4 text-xs font-medium text-white/65">{item.detail}<ArrowUpRight size={14} className="workflow-arrow ml-auto"/></div>
        </article>)}
      </div>
    </section>

    <section className="px-6 pb-24 lg:px-10">
      <div className="final-cta relative mx-auto max-w-7xl overflow-hidden rounded-[28px] px-7 py-12 sm:px-12 sm:py-16">
        <div className="cta-grid absolute inset-0"/>
        <div className="cta-glow absolute -right-20 -top-44 h-[400px] w-[400px] rounded-full"/>
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl"><div className="section-label"><span/> YOUR NEXT MOVE</div><h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-.05em] text-white sm:text-5xl">You bring the curiosity.<br/><span className="text-white/45">We’ll help find the signal.</span></h2><p className="mt-4 max-w-lg text-sm leading-6 text-white/50">Start with what you know. Test what you imagine. Build what people need.</p></div>
          <Link href="/signup" className="cinematic-button cinematic-button-light inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold">Get started for free <ArrowRight size={16}/></Link>
        </div>
      </div>
    </section>
    <footer className="cinematic-footer mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/[.08] px-6 py-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between lg:px-10"><Link href="/" className="flex items-center gap-2 font-semibold text-white/75"><CircleDot size={16}/> signalboard<span className="brand-period">.</span></Link><span>Build with curiosity. Validate with evidence.</span><div className="flex gap-5"><Link href="/login">Log in</Link><Link href="/signup">Create account</Link></div></footer>
  </main>;
}