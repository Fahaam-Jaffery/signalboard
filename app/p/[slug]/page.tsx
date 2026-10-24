import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowRight, Check, CircleDot, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { WaitlistForm } from "@/components/waitlist-form";
import { validateLandingPageConfig, type LandingPageConfig } from "@/lib/landing-page-generator";

type Props = { params: Promise<{ slug: string }> };

async function getPage(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("landing_pages")
    .select("id,slug,title,headline,content,status")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page not found" };
  const content = (page.content || {}) as Record<string, unknown>;
  return {
    title: String(page.title),
    description: String(content.subheadline || page.headline),
    openGraph: { title: String(page.title), description: String(content.subheadline || page.headline), type: "website" },
  };
}

const themes = {
  violet: { accent: "#7157e8", soft: "#f1edff", glow: "rgba(142, 116, 255, .22)", ink: "#211b35" },
  ocean: { accent: "#087e8b", soft: "#e6f7f8", glow: "rgba(34, 190, 199, .20)", ink: "#122c34" },
  ember: { accent: "#d65b35", soft: "#fff0e9", glow: "rgba(255, 142, 91, .22)", ink: "#38221d" },
};

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const emailConfirmed = Boolean(user?.email_confirmed_at);
  let membershipStatus: "legacy" | "pending" | "verified" | "flagged" | null = null;
  if (user) {
    const { data: membership } = await supabase
      .from("waitlist")
      .select("verification_status")
      .eq("landing_page_id", page.id)
      .eq("user_id", user.id)
      .maybeSingle();
    membershipStatus = membership?.verification_status || null;
  }

  const raw = (page.content || {}) as Record<string, unknown>;
  const generated = validateLandingPageConfig(raw) ? raw as LandingPageConfig : null;
  const theme = themes[generated?.theme || "violet"];
  const benefits = generated?.benefits || (Array.isArray(raw.benefits) ? raw.benefits as string[] : []);
  const audience = generated?.audience || String(raw.audience || "early adopters");
  const headline = generated?.headline || String(raw.headline || page.headline);
  const subheadline = generated?.subheadline || String(raw.subheadline || "");
  const problem = generated?.problem || String(raw.problem || "The current way takes more time and energy than it should.");
  const solution = generated?.solution || String(raw.solution || subheadline);
  const sections = generated?.sections || [];
  const challengeSection = sections.find((section) => section.type === "problem");
  const approachSection = sections.find((section) => section.type === "benefits");
  const howSection = sections.find((section) => section.type === "howItWorks");
  const benefitsTitle = String(raw.benefitsTitle || "A more focused way to move forward.");
  const sectionOrder = (Array.isArray(raw.sectionOrder) ? raw.sectionOrder : ["hero", "problem", "approach", "benefits", "howItWorks", "cta"]) as string[];
  const sectionPosition = (key: string) => Math.max(0, sectionOrder.indexOf(key)) + 1;
  const ctaTitle = String(raw.ctaTitle || sections.find((section) => section.type === "cta")?.title || "Help shape what comes next.");
  const ctaBody = String(raw.ctaBody || sections.find((section) => section.type === "cta")?.body || "Join the list and get updates when there’s something worth trying.");

  return (
    <main className="min-h-screen overflow-hidden bg-[#fcfbff]" style={{ color: theme.ink }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: theme.accent }}><CircleDot size={18}/></span>
          signalboard<span style={{ color: theme.accent }}>.</span>
        </Link>
        <a href="#join" className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5">Get early access <ArrowRight size={13} className="ml-1 inline"/></a>
      </nav>

      <section className="relative isolate mx-auto max-w-7xl px-6 pb-24 pt-14 sm:px-10 sm:pb-32 sm:pt-24">
        <div className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-[28rem] w-[min(90vw,48rem)] -translate-x-1/2 rounded-full blur-[100px]" style={{ background: theme.glow }}/>
        <div className={`mx-auto max-w-5xl ${generated?.layout === "editorial" ? "text-left" : "text-center"}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/75 px-4 py-2 text-[11px] font-semibold tracking-wide shadow-sm"><Sparkles size={14} style={{ color: theme.accent }}/>{generated?.sections[0]?.eyebrow || `MADE FOR ${audience.toUpperCase()}`}</div>
          <h1 className={`mx-auto mt-8 max-w-5xl font-semibold leading-[.98] tracking-[-.065em] ${generated?.layout === "bold" ? "text-6xl sm:text-8xl lg:text-[7rem]" : generated?.layout === "editorial" ? "text-4xl sm:text-6xl lg:text-[5rem]" : "text-5xl sm:text-7xl lg:text-[5.8rem]"}`}>{headline}</h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#777287] sm:text-xl">{subheadline}</p>
          <div id="join" className="mx-auto mt-9 max-w-md scroll-mt-8 rounded-3xl border border-black/[.07] bg-white/90 p-3 shadow-[0_24px_80px_rgba(35,25,65,.10)] sm:p-4">
            <WaitlistForm slug={slug} initialStatus={membershipStatus} isAuthenticated={Boolean(user)} emailConfirmed={emailConfirmed}/>
            <p className="mt-3 text-[10px] text-[#9691a6]">No spam. Just thoughtful updates when there’s something worth sharing.</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-[#777287]"><span className="inline-flex items-center gap-1.5"><Check size={14} style={{ color: theme.accent }}/> Free early access</span><span className="inline-flex items-center gap-1.5"><Check size={14} style={{ color: theme.accent }}/> Built around feedback</span><span className="inline-flex items-center gap-1.5"><Check size={14} style={{ color: theme.accent }}/> Leave whenever you want</span></div>
          <a href="#details" className="mt-12 inline-flex items-center gap-2 text-xs font-medium text-[#777287] transition hover:opacity-70">Explore the idea <ArrowDown size={14}/></a>
        </div>
      </section>

      <section id="details" className="mx-auto flex max-w-7xl flex-col px-6 pb-24 sm:px-10 sm:pb-32">
        <div className="contents">
          <article className="mt-5 rounded-[2rem] border border-black/[.07] bg-white p-7 sm:p-10" style={{ order: sectionPosition("problem") }}>
            <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#9691a6]">THE CHALLENGE</div>
            <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-[-.045em] sm:text-4xl">{challengeSection?.title || "The current way takes too much effort."}</h2>
            <p className="mt-5 text-sm leading-7 text-[#777287]">{problem}</p>
          </article>
          <article className="relative mt-5 overflow-hidden rounded-[2rem] p-7 sm:p-10" style={{ order: sectionPosition("approach"), background: theme.soft }}>
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: theme.glow }}/>
            <div className="relative text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: theme.accent }}>THE APPROACH</div>
            <h2 className="relative mt-5 max-w-md text-3xl font-semibold leading-tight tracking-[-.045em] sm:text-4xl">{approachSection?.title || "Less friction. More forward."}</h2>
            <p className="relative mt-5 text-sm leading-7 text-[#686277]">{solution}</p>
          </article>
        </div>

        <div className="mt-5 rounded-[2rem] border border-black/[.07] bg-white p-7 sm:p-10" style={{ order: sectionPosition("benefits") }}>
          <div className="text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: theme.accent }}>WHY IT MATTERS</div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{benefitsTitle}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {benefits.map((benefit, index) => <div key={benefit} className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-semibold" style={{ background: theme.soft, color: theme.accent }}>0{index + 1}</span><p className="pt-1 text-sm leading-6 text-[#777287]">{benefit}</p></div>)}
          </div>
        </div>

        {howSection && <div className="mt-5 rounded-[2rem] border border-black/[.07] bg-white p-7 sm:p-10" style={{ order: sectionPosition("howItWorks") }}>
          <div className="text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: theme.accent }}>HOW IT STARTS</div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{howSection.title || "Small first step. Real feedback."}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">{(howSection.items || []).map((item, index) => <div key={item} className="rounded-2xl p-5" style={{ background: theme.soft }}><div className="text-xs font-semibold" style={{ color: theme.accent }}>STEP 0{index + 1}</div><p className="mt-3 text-sm leading-6">{item}</p></div>)}</div>
        </div>}

        <div className="mt-5 flex flex-col items-start justify-between gap-6 rounded-[2rem] p-7 sm:flex-row sm:items-center sm:p-10" style={{ order: sectionPosition("cta"), background: theme.ink, color: "#fff" }}>
          <div><div className="text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: theme.accent }}>BE PART OF THE FIRST WAVE</div><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{ctaTitle}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">{ctaBody}</p></div>
          <a href="#join" className="shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: theme.accent }}>Join the waitlist <ArrowRight size={15} className="ml-2 inline"/></a>
        </div>
      </section>

      <footer className="border-t border-black/[.07] px-6 py-8 text-center text-xs text-[#9691a6]">An early concept page powered by <Link href="/" className="font-semibold" style={{ color: theme.accent }}>SignalBoard</Link>.</footer>
    </main>
  );
}
