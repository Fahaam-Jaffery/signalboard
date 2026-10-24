import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/dashboard";
import { Blocks, ArrowRight, Activity, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/login?notice=configure-supabase");
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=/dashboard");

  // Keep the visible list bounded, but calculate workspace totals independently
  // so the overview never silently undercounts pages or waitlist signups.
  const [profileResult, pagesResult, pagesCountResult, publishedCountResult, waitlistCountResult] = await Promise.all([
    supabase.from("profiles").select("full_name,goals,skills,interests").eq("id", user.id).maybeSingle(),
    supabase.from("landing_pages").select("id,slug,title,headline,created_at,status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("landing_pages").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("landing_pages").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "published"),
    // The waitlist SELECT policy restricts this count to signups for the current user's pages.
    supabase.from("waitlist").select("id", { count: "exact", head: true }),
  ]);

  const rawPages = pagesResult.data || [];
  const counts = new Map<string, number>();
  if (rawPages.length) {
    const { data } = await supabase.from("waitlist").select("landing_page_id").in("landing_page_id", rawPages.map(page => page.id));
    data?.forEach(row => counts.set(row.landing_page_id, (counts.get(row.landing_page_id) || 0) + 1));
  }

  const pages = rawPages.map(page => ({ ...page, waitlist_count: counts.get(page.id) || 0 }));
  return (
    <>
      <div className="dashboard-top-banner border-b border-[rgb(var(--border))] px-5 py-4 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600"><Blocks size={19} /></span>
            <div>
              <div className="text-sm font-semibold">Ready to build something real?</div>
              <p className="mt-1 text-xs muted">Go beyond ideas. Plan, prototype, and prepare to launch your product.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/validation" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[rgb(var(--border))] px-4 py-2.5 text-xs font-semibold transition hover:border-violet-500/40 hover:text-violet-600">
              <Activity size={14} /> Validation results
            </Link>
            <Link href="/dashboard/joined-waitlists" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[rgb(var(--border))] px-4 py-2.5 text-xs font-semibold transition hover:border-violet-500/40 hover:text-violet-600">
              <Users size={14} /> Joined waitlists
            </Link>
            <Link href="/projects" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white">
              Open product studio <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      <Dashboard
        email={user.email || "builder@signalboard.app"}
        initialProfile={profileResult.data || {}}
        initialPages={pages}
        totalPages={pagesCountResult.count || 0}
        publishedPages={publishedCountResult.count || 0}
        totalWaitlist={waitlistCountResult.count || 0}
      />
    </>
  );
}
