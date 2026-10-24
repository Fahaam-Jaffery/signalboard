"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

type MembershipStatus = "legacy" | "pending" | "verified" | "flagged" | null;

export function WaitlistForm({
  slug,
  initialStatus = null,
  isAuthenticated = false,
  emailConfirmed = false,
}: {
  slug: string;
  initialStatus?: MembershipStatus;
  isAuthenticated?: boolean;
  emailConfirmed?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(
    initialStatus
      ? {
          success: true,
          message: initialStatus === "verified"
            ? "You're already on this waitlist. Your spot is saved to your SignalBoard account."
            : "We found an earlier signup for this page. If you used this email before, your original interest is preserved.",
        }
      : null,
  );

  async function submit() {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not join waitlist.");
      setResult({ success: true, message: data.message });
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (result?.success) {
    return <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left"><div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} />{result.message}</div></div>;
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent("/p/" + slug);
    return <div className="rounded-2xl border border-[#e3deee] bg-white p-5 text-center">
      <LockKeyhole size={19} className="mx-auto text-violet-600" />
      <p className="mt-3 text-sm font-semibold text-[#211b35]">Sign in to save your spot</p>
      <p className="mt-1 text-xs leading-5 text-[#777287]">Your SignalBoard account keeps your subscription saved, even after you refresh or return later.</p>
      <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
        <Button asChild size="lg" className="h-11 rounded-xl"><Link href={"/login?next=" + next}>Sign in <ArrowRight size={15} /></Link></Button>
        <Button asChild variant="outline" size="lg" className="h-11 rounded-xl"><Link href={"/signup?next=" + next}>Create account</Link></Button>
      </div>
    </div>;
  }

  if (!emailConfirmed) {
    return <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left"><p className="text-sm font-semibold text-amber-900">Confirm your SignalBoard email first</p><p className="mt-1 text-xs leading-5 text-amber-800">Open the confirmation email from Supabase, then return here and refresh to join this waitlist.</p></div>;
  }

  return <div className="space-y-3">
    <Button type="button" size="lg" disabled={loading} onClick={submit} className="h-12 w-full rounded-xl">
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : <>Join waitlist <ArrowRight size={15} /></>}
    </Button>
    {result && !result.success && <p role="alert" className="text-left text-xs text-rose-600">{result.message}</p>}
  </div>;
}
