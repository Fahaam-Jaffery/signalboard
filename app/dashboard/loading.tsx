import { CircleDot, LoaderCircle } from "lucide-react";

function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-[rgb(var(--muted))] ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main aria-busy="true" aria-label="Loading your SignalBoard workspace" className="cinematic-dashboard min-h-screen">
      <div className="dashboard-top-banner border-b border-[rgb(var(--border))] px-5 py-4 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600"><CircleDot size={19} /></div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-48 max-w-full" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
          <Skeleton className="hidden h-10 w-40 sm:block" />
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="w-full space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-80 max-w-full" />
            <Skeleton className="h-4 w-[26rem] max-w-full" />
          </div>
          <Skeleton className="h-11 w-44" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="surface space-y-5 p-5"><div className="flex items-center justify-between"><Skeleton className="h-3 w-28" /><Skeleton className="h-9 w-9 rounded-xl" /></div><Skeleton className="h-9 w-16" /><Skeleton className="h-3 w-32" /></div>)}
        </div>
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
          <section className="surface space-y-5 p-5 sm:p-6">
            <div className="space-y-2"><Skeleton className="h-5 w-44" /><Skeleton className="h-3 w-60 max-w-full" /></div>
            {Array.from({ length: 3 }, (_, i) => <div key={i} className="flex items-start gap-3 rounded-xl border border-[rgb(var(--border))] p-3.5"><Skeleton className="h-9 w-9 shrink-0 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-full" /></div></div>)}
          </section>
          <section className="surface space-y-4 p-6"><Skeleton className="h-3 w-28" /><Skeleton className="h-6 w-56 max-w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /><Skeleton className="mt-5 h-10 w-36" /></section>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs muted"><LoaderCircle size={14} className="animate-spin text-violet-500" /> Preparing your workspace…</div>
      </div>
    </main>
  );
}
