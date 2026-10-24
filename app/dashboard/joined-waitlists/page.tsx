import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Globe2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Joined waitlists",
  robots: { index: false, follow: false },
};

type Membership = {
  id: string;
  landing_page_id: string;
  created_at: string;
  verification_status: "legacy" | "pending" | "verified" | "flagged";
};

export default async function JoinedWaitlistsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=/dashboard/joined-waitlists");

  const { data: memberships, error: membershipsError } = await supabase
    .from("waitlist")
    .select("id,landing_page_id,created_at,verification_status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (memberships || []) as Membership[];
  const pageIds = [...new Set(rows.map((row) => row.landing_page_id))];
  const { data: pageData, error: pagesError } = pageIds.length
    ? await supabase.from("landing_pages").select("id,slug,title,headline,status").in("id", pageIds)
    : { data: [], error: null };
  const pages = pageData || [];
  const pageById = new Map(pages.map((page) => [page.id, page]));

  return (
    <main className="cinematic-dashboard min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-medium muted transition hover:text-violet-600">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[linear-gradient(125deg,rgba(124,92,255,.14),rgba(75,150,255,.06)_48%,rgba(255,255,255,.015))] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative">
            <div className="eyebrow text-violet-600">YOUR SAVED INTEREST</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">Waitlists you’ve joined</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 muted">Your joined lists stay connected to your SignalBoard account, so you can find them again whenever you return.</p>
          </div>
        </section>

        {(membershipsError || pagesError) && <div role="alert" className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">We couldn’t load all your joined waitlists. Refresh the page to try again.</div>}

        {rows.length === 0 ? (
          <section className="surface mt-6 flex flex-col items-center px-6 py-14 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-600"><Users size={22} /></span>
            <h2 className="mt-4 text-base font-semibold">Your list starts here</h2>
            <p className="mt-2 max-w-md text-sm leading-6 muted">When you join a published landing page while signed in, it’ll appear here for easy access later.</p>
            <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white">Explore SignalBoard <ArrowRight size={14} /></Link>
          </section>
        ) : (
          <section className="surface mt-6 overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[rgb(var(--border))] px-5 py-5 sm:px-6">
              <div><h2 className="font-semibold">Your memberships</h2><p className="mt-1 text-xs muted">Saved to {user.email || "your account"}</p></div>
              <span className="rounded-full border border-[rgb(var(--border))] px-3 py-1 text-xs muted">{rows.length} joined</span>
            </div>
            <div className="divide-y divide-[rgb(var(--border))]">
              {rows.map((membership) => {
                const page = pageById.get(membership.landing_page_id);
                if (!page) return null;
                const verified = membership.verification_status === "verified";
                return (
                  <article key={membership.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-600"><Globe2 size={18} /></span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">{page.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 muted">{page.headline}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] muted">
                        <span className={verified ? "inline-flex items-center gap-1 text-emerald-600" : "inline-flex items-center gap-1 text-amber-600"}>{verified ? <CheckCircle2 size={12} /> : null}{verified ? "Confirmed" : membership.verification_status === "pending" ? "Pending confirmation" : "Earlier signup"}</span>
                        <span>·</span><span>Joined {new Date(membership.created_at).toLocaleDateString()}</span>
                        {page.status !== "published" && <><span>·</span><span>{page.status === "archived" ? "Page archived" : "Page not published"}</span></>}
                      </div>
                    </div>
                    {page.status === "published" && <Link href={"/p/" + page.slug} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[rgb(var(--border))] px-3.5 py-2.5 text-xs font-semibold transition hover:border-violet-500/40 hover:text-violet-600">Open page <ExternalLink size={13} /></Link>}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
