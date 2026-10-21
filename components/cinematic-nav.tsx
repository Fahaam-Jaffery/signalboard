"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BarChart3, BookOpen, CircleDot, Command, Compass, Layers3, Menu, Search, Sparkles, Users, WandSparkles, X } from "lucide-react";

const destinations = [
  { label: "How it works", href: "#workflow", description: "The three-step SignalBoard loop", icon: Compass, group: "Explore" },
  { label: "Idea Lab", href: "#idea-lab", description: "Find a direction worth testing", icon: Sparkles, group: "Explore" },
  { label: "Live Signals", href: "#live-signals", description: "Read the sample insight dashboard", icon: BarChart3, group: "Explore" },
  { label: "Idea Canvas", href: "#idea-canvas", description: "Shape an idea around your goal", icon: WandSparkles, group: "Create" },
  { label: "Validation preview", href: "#validation-preview", description: "See a focused experiment in action", icon: Layers3, group: "Create" },
  { label: "Why SignalBoard", href: "#principles", description: "The principles behind the product", icon: BookOpen, group: "About" },
  { label: "Log in", href: "/login", description: "Return to your workspace", icon: Users, group: "Account" },
  { label: "Create account", href: "/signup", description: "Start exploring for free", icon: ArrowUpRight, group: "Account" },
];

export function CinematicNav() {
  const pathname = usePathname();
  const [active, setActive] = useState("workflow");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter(item => !q || (item.label + " " + item.description + " " + item.group).toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (pathname !== "/") return;
    const nodes = destinations.map(item => item.href.startsWith("#") ? document.querySelector(item.href) : null).filter(Boolean) as Element[];
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-22% 0px -62% 0px", threshold: [0, .15, .35, .6] });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(value => !value);
        setMenuOpen(false);
        setMobileOpen(false);
      } else if (event.key === "Escape") {
        setCommandOpen(false); setMenuOpen(false); setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (commandOpen) {
      setQuery("");
      window.setTimeout(() => document.getElementById("signalboard-command-search")?.focus(), 30);
    }
  }, [commandOpen]);

  const closeAll = () => { setMenuOpen(false); setMobileOpen(false); setCommandOpen(false); };
  const navLink = (item: typeof destinations[number]) => (
    <Link key={item.href} href={item.href} onClick={closeAll} className={"mega-menu-item " + (active === item.href.slice(1) ? "is-current" : "")}>
      <span className="mega-menu-icon"><item.icon size={16}/></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-white">{item.label}</span><span className="mt-1 block text-xs leading-5 text-white/55">{item.description}</span></span>
      <ArrowUpRight size={14} className="mega-menu-arrow"/>
    </Link>
  );

  return <>
    <nav className="cinematic-nav mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8" onMouseLeave={() => setMenuOpen(false)}>
      <Link href="/" onClick={closeAll} className="brand-lockup flex items-center gap-3 font-semibold tracking-tight">
        <span className="brand-mark grid h-9 w-9 place-items-center rounded-xl"><CircleDot size={19}/></span>
        <span className="text-[15px]">signalboard<span className="brand-period">.</span></span>
      </Link>
      <div className="hidden items-center gap-1 text-sm md:flex">
        <button type="button" onMouseEnter={() => setMenuOpen(true)} onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} className={"nav-link nav-menu-trigger " + (menuOpen ? "is-open" : "")}>Explore <span className="nav-trigger-chevron">⌄</span></button>
        <a className={"nav-link nav-direct-link " + (active === "workflow" ? "is-current" : "")} href="#workflow">How it works</a>
        <a className={"nav-link nav-direct-link " + (active === "principles" ? "is-current" : "")} href="#principles">Why SignalBoard</a>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" onClick={() => setCommandOpen(true)} className="nav-search-button hidden sm:inline-flex" aria-label="Open quick search"><Search size={14}/><span>Quick search</span><kbd><Command size={10}/> K</kbd></button>
        <Link href="/login" className="nav-login rounded-full px-3 py-2.5 text-sm text-white/70 transition hover:text-white sm:px-4">Log in</Link>
        <Link href="/signup" className="cinematic-button cinematic-button-primary inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold sm:px-5">Start exploring <ArrowUpRight size={15}/></Link>
        <button type="button" onClick={() => setMobileOpen(value => !value)} aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} className="nav-mobile-trigger md:hidden">{mobileOpen ? <X size={18}/> : <Menu size={18}/>}</button>
      </div>
      {menuOpen && <div className="nav-mega-menu hidden md:block" onMouseEnter={() => setMenuOpen(true)}>
        <div className="mega-menu-head"><span className="section-label"><span/> SIGNALBOARD MAP</span><span className="mega-menu-status"><i/> All systems curious</span></div>
        <div className="mega-menu-grid">
          <div><div className="mega-menu-group-label">EXPLORE</div>{destinations.filter(x => x.group === "Explore").map(navLink)}</div>
          <div><div className="mega-menu-group-label">MAKE SOMETHING</div>{destinations.filter(x => x.group === "Create").map(navLink)}<div className="mega-menu-feature"><div className="mega-feature-orb"/><Sparkles size={17}/><div className="mt-3 text-sm font-semibold text-white">Small experiments. Clearer answers.</div><p className="mt-1 text-xs leading-5 text-white/55">Move from curiosity to evidence without overbuilding.</p></div></div>
          <div><div className="mega-menu-group-label">YOUR SPACE</div>{destinations.filter(x => x.group === "About" || x.group === "Account").map(navLink)}<button type="button" onClick={() => {setCommandOpen(true);setMenuOpen(false)}} className="mega-menu-shortcut"><Command size={13}/> Open quick search <kbd>⌘ K</kbd></button></div>
        </div>
      </div>}
    </nav>
    {mobileOpen && <div className="nav-mobile-sheet md:hidden">
      <div className="mobile-sheet-top"><span className="section-label"><span/> NAVIGATION</span><button type="button" onClick={() => setCommandOpen(true)} className="nav-mobile-search"><Search size={14}/> Search destinations</button></div>
      <div className="mobile-sheet-links">{destinations.map(item => {const Icon=item.icon;return <Link key={item.href} href={item.href} onClick={closeAll}><Icon size={17}/><span>{item.label}</span><ArrowUpRight size={14} className="ml-auto opacity-50"/></Link>})}</div>
      <div className="mobile-sheet-foot">Explore. Publish. Learn. <span>SignalBoard / 01</span></div>
    </div>}
    {commandOpen && <div className="command-backdrop" onMouseDown={event => {if(event.target === event.currentTarget) setCommandOpen(false)}}>
      <div className="command-dialog" role="dialog" aria-modal="true" aria-label="Quick search">
        <div className="command-input-row"><Search size={18}/><input id="signalboard-command-search" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {if(event.key === "Enter" && filtered[0]) {event.preventDefault(); window.location.href = filtered[0].href;}}} placeholder="Where would you like to go?" autoComplete="off"/><kbd>ESC</kbd><button type="button" onClick={() => setCommandOpen(false)} aria-label="Close search"><X size={16}/></button></div>
        <div className="command-results-label">{query ? "MATCHING DESTINATIONS" : "QUICK DESTINATIONS"}</div>
        <div className="command-results">{filtered.length ? filtered.map(item => {const Icon=item.icon;return <Link key={item.href} href={item.href} onClick={closeAll} className="command-result"><span className="command-result-icon"><Icon size={16}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-white">{item.label}</span><span className="mt-0.5 block text-xs text-white/50">{item.description}</span></span><span className="command-result-group">{item.group}</span><ArrowUpRight size={14} className="text-white/40"/></Link>}) : <div className="command-empty"><Search size={20}/><span>No destination found for “{query}”</span><small>Try “idea”, “signals”, “account” or “workflow”.</small></div>}</div>
        <div className="command-footer"><span><kbd>↵</kbd> Select a destination</span><span><kbd>ESC</kbd> Close</span><span className="command-footer-brand"><CircleDot size={12}/> SIGNALBOARD</span></div>
      </div>
    </div>}
  </>;
}
