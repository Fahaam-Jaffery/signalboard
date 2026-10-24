import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowLeft, ArrowRight, ExternalLink, FlaskConical, Users, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Validation results",
  robots: { index: false, follow: false },
};

type PageRow = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  created_at: string;
};

type SignupRow = {
  id: string;
  landing_page_id: string;
  created_at: string;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shortDay(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

export default async function ValidationResultsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/login?notice=configure-supabase");
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login?next=/dashboard/validation");

  const { data: pageData, error: pagesError } = await supabase
    .from("landing_pages")
    .select("id,slug,title,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const pages = (pageData || []) as PageRow[];
  let signups: SignupRow[] = [];
  let signupError = false;

  if (pages.length) {
    const { data, error } = await supabase
      .from("waitlist")
      .select("id,landing_page_id,created_at")
      .in("landing_page_id", pages.map((page) => page.id))
      .order("created_at", { ascending: false });
    signups = (data || []) as SignupRow[];
    signupError = Boolean(error);
  }

  const counts = new Map<string, number>();
  const latest = new Map<string, string>();
  for (const signup of signups) {
    counts.set(signup.landing_page_id, (counts.get(signup.landing_page_id) || 0) + 1);
    if (!latest.has(signup.landing_page_id)) latest.set(signup.landing_page_id, signup.created_at);
  }

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (13 - index));
    const key = dateKey(date);
    return { key, date, count: signups.filter((signup) => dateKey(new Date(signup.created_at)) === key).length };
  });
  const last7Start = new Date(today);
  last7Start.setUTCDate(today.getUTCDate() - 6);
  const last7 = signups.filter((signup) => new Date(signup.created_at) >= last7Start).length;
  const publishedCount = pages.filter((page) => page.status === "published").length;
  const peak = Math.max(1, ...days.map((day) => day.count));
  const leadingPage = pages.reduce<PageRow | null>((best, page) => {
    if (!best || (counts.get(page.id) || 0) > (counts.get(best.id) || 0)) return page;
    return best;
  }, null);
  const hasAnySignups = signups.length > 0;

  return (
    <main className="cinematic-dashboard min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-medium muted transition hover:text-violet-600">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[linear-gradient(125deg,rgba(124,92,255,.14),rgba(75,150,255,.06)_48%,rgba(255,255,255,.015))] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="eyebrow text-violet-600">REAL SIGNALS · NO GUESSED METRICS</div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">Validation results</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 muted">
                See which experiments have earned a response. These results use actual waitlist submissions—not estimated traffic or invented conversion rates.
              </p>
            </div>
            <Link href="/studio" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500">
              Create an experiment <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {pagesError && <div role="alert" className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">We couldn’t load your experiments. Please refresh and try again.</div>}
        {signupError && <div role="alert" className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">Experiment details loaded, but signup results couldn’t be loaded. Please refresh to retry.</div>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="surface p-5">
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-medium muted">Waitlist signups</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600"><Users size={18} /></span></div>
            <div className="mt-5 text-3xl font-semibold tracking-tight">{signups.length}</div>
            <p className="mt-1 text-[10px] muted">Recorded across your experiments</p>
          </article>
          <article className="surface p-5">
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-medium muted">Last 7 days</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-600"><TrendingUp size={18} /></span></div>
            <div className="mt-5 text-3xl font-semibold tracking-tight">{last7}</div>
            <p className="mt-1 text-[10px] muted">New signups in the last week</p>
          </article>
          <article className="surface p-5">
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-medium muted">Published experiments</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600"><FlaskConical size={18} /></span></div>
            <div className="mt-5 text-3xl font-semibold tracking-tight">{publishedCount}</div>
            <p className="mt-1 text-[10px] muted">Live pages people can respond to</p>
          </article>
          <article className="surface p-5">
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-medium muted">Leading experiment</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-fuchsia-500/10 text-fuchsia-600"><Activity size={18} /></span></div>
            <div className="mt-5 truncate text-xl font-semibold tracking-tight">{hasAnySignups && leadingPage ? leadingPage.title : "Not yet established"}</div>
            <p className="mt-1 text-[10px] muted">{hasAnySignups && leadingPage ? (counts.get(leadingPage.id) || 0) + " signup" + ((counts.get(leadingPage.id) || 0) === 1 ? "" : "s") + " recorded" : "Needs at least one signup to compare"}</p>
          </article>
        </section>

        <section className="mt-6 grid items-start gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <article className="surface overflow-hidden">
            <div className="border-b border-[rgb(var(--border))] px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Signup activity</h2><p className="mt-1 text-xs muted">Daily waitlist submissions · last 14 days</p></div><span className="rounded-full border border-[rgb(var(--border))] px-2.5 py-1 text-[10px] muted">Actual data</span></div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex h-44 items-end gap-1.5 sm:gap-2" role="img" aria-label={"Daily waitlist signups for the last 14 days. Total: " + days.reduce((sum, day) => sum + day.count, 0)}>
                {days.map((day) => (
                  <div key={day.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2" title={shortDay(day.date) + ": " + day.count + " signups"}>
                    <span className="text-[9px] font-medium tabular-nums muted">{day.count || ""}</span>
                    <div className="flex h-[78%] w-full items-end overflow-hidden rounded-t-md bg-violet-500/[.07]">
                      <div className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-indigo-400 transition-all" style={{ height: day.count ? Math.max(7, (day.count / peak) * 100) + "%" : "3px" }} />
                    </div>
                    <span className="text-[9px] muted">{day.date.getUTCDate()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--border))] pt-4 text-[10px] muted"><span>{shortDay(days[0].date)}</span><span>{shortDay(days[days.length - 1].date)}</span></div>
              {!hasAnySignups && <p className="mt-4 rounded-xl bg-violet-500/[.06] p-3 text-xs leading-5 muted">No waitlist signups have been recorded yet. Share a published experiment with the people it is designed for; this chart will update as real signups arrive.</p>}
            </div>
          </article>

          <article className="surface overflow-hidden">
            <div className="border-b border-[rgb(var(--border))] px-5 py-5 sm:px-6"><h2 className="font-semibold">What the evidence says</h2><p className="mt-1 text-xs muted">A careful read of the signals available today.</p></div>
            <div className="space-y-3 p-5 sm:p-6">
              <div className="rounded-xl bg-violet-500/[.06] p-4"><div className="text-xs font-semibold">What we can measure</div><p className="mt-1.5 text-xs leading-5 muted">Waitlist signups and when they happened. A signup is a useful expression of interest, but it is not proof of willingness to pay or product-market fit.</p></div>
              <div className="rounded-xl bg-cyan-500/[.055] p-4"><div className="text-xs font-semibold">What is not measured yet</div><p className="mt-1.5 text-xs leading-5 muted">Unique visitors, page views, traffic sources, and conversion rate are not currently recorded, so this page does not estimate them.</p></div>
              <div className="rounded-xl bg-emerald-500/[.055] p-4"><div className="text-xs font-semibold">A useful next step</div><p className="mt-1.5 text-xs leading-5 muted">{hasAnySignups ? "Talk to a few people who signed up and learn what motivated them before committing to a larger build." : "Share one live page with a small, relevant audience and observe whether anyone chooses to join the list."}</p></div>
            </div>
          </article>
        </section>

        <section className="surface mt-6 overflow-hidden">
          <div className="flex flex-col justify-between gap-2 border-b border-[rgb(var(--border))] px-5 py-5 sm:flex-row sm:items-center sm:px-6"><div><h2 className="font-semibold">Your experiments</h2><p className="mt-1 text-xs muted">Compare real signups without assigning arbitrary validation scores.</p></div><span className="text-xs muted">{pages.length} total</span></div>
          {pages.length === 0 ? (
            <div className="px-6 py-12 text-center"><FlaskConical size={22} className="mx-auto text-violet-600" /><h3 className="mt-3 text-sm font-semibold">No experiments yet</h3><p className="mt-2 text-xs muted">Create a landing page to start collecting genuine interest.</p><Link href="/studio" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white">Create a page <ArrowRight size={14} /></Link></div>
          ) : (
            <div className="divide-y divide-[rgb(var(--border))]">
              {pages.map((page) => (
                <div key={page.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{page.title}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] muted"><span className={page.status === "published" ? "text-emerald-600" : page.status === "draft" ? "text-amber-600" : ""}>{page.status}</span><span>·</span><span>Created {new Date(page.created_at).toLocaleDateString()}</span>{latest.has(page.id) && <><span>·</span><span>Latest signup {new Date(latest.get(page.id)!).toLocaleDateString()}</span></>}</div></div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><div className="text-lg font-semibold tabular-nums">{counts.get(page.id) || 0}</div><div className="text-[10px] muted">signups</div></div>{page.status === "published" && <Link href={"/p/" + page.slug} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-xs font-medium transition hover:border-violet-500/40 hover:text-violet-600">View live page <ExternalLink size={12} /></Link>}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-5 text-[10px] leading-5 muted">Data is scoped to your account using Supabase row-level security. Counts reflect stored waitlist records; no visitor or conversion data is inferred.</p>
      </div>
    </main>
  );
}
