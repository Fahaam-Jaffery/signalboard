import { NextResponse } from "next/server";
import { createWaitlistAdminClient } from "@/lib/supabase/admin";
import { keyedHash, newVerificationToken, setMembershipCookie } from "@/lib/waitlist";

export const runtime = "nodejs";

type RequestBody = { slug?: unknown; email?: unknown; website?: unknown };

function validEmail(email: string) {
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const [local, domain] = email.split("@");
  return Boolean(local && local.length <= 64 && domain && !domain.startsWith(".") && !domain.endsWith(".") && !domain.includes(".."));
}

function siteOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot submissions receive a neutral response but are never persisted.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ success: true, message: "If the address can receive mail, a confirmation link will arrive shortly." });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!slug || slug.length > 180 || !validEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const supabase = createWaitlistAdminClient();
    const { token, tokenHash } = newVerificationToken();
    const clientIp =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const { data, error } = await supabase.rpc("begin_waitlist_verification", {
      p_slug: slug,
      p_email: email,
      p_token_hash: tokenHash,
      p_ip_key_hash: keyedHash("ip:" + clientIp),
      p_email_key_hash: keyedHash("email:" + email),
    });

    if (error || !data) {
      console.error("Waitlist request failed at the database boundary.", error?.code || "empty_result");
      return NextResponse.json({ error: "We couldn't process that request. Please try again shortly." }, { status: 500 });
    }
    if (!data.ok && data.reason === "not_found") {
      return NextResponse.json({ error: "This page could not be found." }, { status: 404 });
    }
    if (!data.ok && data.reason === "rate_limited") {
      return NextResponse.json({ error: "Too many attempts. Please wait a little before trying again." }, { status: 429 });
    }
    if (!data.ok) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (data.status === "verified") {
      const response = NextResponse.json({ success: true, status: "verified", message: "You're already confirmed on this list. Thanks for your interest!" });
      setMembershipCookie(response, slug, data.signup_id, data.page_id);
      return response;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.WAITLIST_EMAIL_FROM;
    if (!apiKey || !from) {
      console.error("Waitlist email delivery is not configured (RESEND_API_KEY / WAITLIST_EMAIL_FROM).");
      return NextResponse.json({ error: "Email confirmation is temporarily unavailable. Please try again later." }, { status: 503 });
    }

    const verifyUrl = new URL("/api/waitlist/verify", siteOrigin(request));
    verifyUrl.searchParams.set("token", token);
    verifyUrl.searchParams.set("slug", slug);

    const mailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Confirm your SignalBoard waitlist signup",
        text: "Confirm your email address to finish joining this waitlist. This link expires in 30 minutes.\n\n" + verifyUrl.toString() + "\n\nIf you did not request this, you can ignore this email.",
        html: '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#181522"><h2>Confirm your email</h2><p>One quick step to finish joining this waitlist.</p><p><a href="' + verifyUrl.toString() + '" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#7157e8;color:#fff;text-decoration:none;font-weight:600">Confirm email address</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p></div>',
      }),
      cache: "no-store",
    });

    if (!mailResponse.ok) {
      console.error("Waitlist confirmation email provider rejected a request.", mailResponse.status);
      return NextResponse.json({ error: "We couldn't send the confirmation email just now. Please try again later." }, { status: 502 });
    }

    const response = NextResponse.json({
      success: true,
      status: "pending",
      message: "Check your inbox for a confirmation link. Your signup counts after you confirm your email.",
    });
    setMembershipCookie(response, slug, data.signup_id, data.page_id);
    return response;
  } catch (error) {
    console.error("Waitlist request could not be completed.", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Email confirmation is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
