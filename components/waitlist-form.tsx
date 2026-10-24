"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ArrowRight, CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MembershipStatus = "pending" | "verified" | null;
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void; "error-callback"?: () => void }) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function WaitlistForm({ slug, initialStatus = null }: { slug: string; initialStatus?: MembershipStatus }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [challengeRequired, setChallengeRequired] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const challengeRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; status?: MembershipStatus } | null>(
    initialStatus
      ? {
          success: true,
          status: initialStatus,
          message: initialStatus === "verified"
            ? "You're confirmed on this list. Thanks for your interest!"
            : "Your signup is waiting for email confirmation. Check your inbox for the confirmation link.",
        }
      : null,
  );

  useEffect(() => {
    if (!challengeRequired || !scriptReady || !window.turnstile || !challengeRef.current || widgetId.current) return;
    widgetId.current = window.turnstile.render(challengeRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
      callback: (token) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
    });
  }, [challengeRequired, scriptReady]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email, website, ...(turnstileToken ? { turnstileToken } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 428 && data.challengeRequired) {
          setChallengeRequired(true);
          setResult({ success: false, message: data.error || "Please complete the bot check to continue." });
          return;
        }
        throw new Error(data.error || "Could not join waitlist.");
      }
      setResult({ success: true, message: data.message, status: data.status || null });
      setEmail("");
      setChallengeRequired(false);
      setTurnstileToken("");
      widgetId.current = null;
    } catch (e) {
      setResult({ success: false, message: e instanceof Error ? e.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (result?.success) {
    return <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left"><div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} />{result.message}</div></div>;
  }

  return (
    <>
      {challengeRequired && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setScriptReady(true)} />}
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label htmlFor="waitlist-website">Leave this field empty</label><input id="waitlist-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
        <div className="relative min-w-0 flex-1">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9691a6]" />
          <Input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" aria-label="Email address" className="h-12 border-[#e3deee] bg-white py-3.5 pl-11 pr-4 text-sm focus-visible:border-violet-400 focus-visible:ring-violet-500/10" />
        </div>
        <Button type="submit" size="lg" disabled={loading || (challengeRequired && !turnstileToken)} className="h-12 rounded-xl px-5">{loading ? <LoaderCircle size={15} className="animate-spin" /> : <>Join waitlist <ArrowRight size={15} /></>}</Button>
        {result && !result.success && <p role="alert" className="text-left text-xs text-rose-600">{result.message}</p>}
        {challengeRequired && <div className="basis-full rounded-xl border border-[#e3deee] bg-white p-3"><p className="mb-2 text-xs text-[#777287]">A quick security check is needed for this request.</p><div ref={challengeRef} /></div>}
      </form>
    </>
  );
}
