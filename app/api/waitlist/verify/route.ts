import { NextResponse, type NextRequest } from "next/server";
import { createWaitlistAdminClient } from "@/lib/supabase/admin";
import { setMembershipCookie, sha256 } from "@/lib/waitlist";

export const runtime = "nodejs";

// GET is side-effect free because email security scanners often prefetch links.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const slug = request.nextUrl.searchParams.get("slug") || "";
  if (!token || token.length > 128 || !slug || slug.length > 180 || !/^[a-zA-Z0-9_-]+$/.test(token) || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return new NextResponse("This confirmation link is invalid.", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }

  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirm your email · SignalBoard</title><meta name="robots" content="noindex,nofollow"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090f;color:#f5f5f7;font-family:Inter,system-ui,sans-serif;padding:24px;box-sizing:border-box}.card{max-width:440px;width:100%;padding:32px;border:1px solid #ffffff20;border-radius:24px;background:#ffffff08;box-sizing:border-box}h1{font-size:28px;letter-spacing:-.04em;margin:0 0 12px}p{color:#b8b7c7;line-height:1.6;font-size:14px}button{margin-top:12px;border:0;border-radius:12px;background:#7657f6;color:white;font-weight:650;padding:13px 18px;font-size:14px;cursor:pointer;width:100%}</style></head><body><main class="card"><h1>Confirm your email</h1><p>Confirm that you own this inbox to finish joining the waitlist. This link can only be used once and expires after 30 minutes.</p><form method="post" action="/api/waitlist/verify"><input type="hidden" name="token" value="' + token + '"><input type="hidden" name="slug" value="' + slug + '"><button type="submit">Confirm email address</button></form></main></body></html>';
  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store, max-age=0", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" } });
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new NextResponse("Invalid confirmation request.", { status: 400 });
  }

  const token = String(form.get("token") || "");
  const slug = String(form.get("slug") || "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  if (!token || token.length > 128 || !slug || slug.length > 180 || !/^[a-zA-Z0-9_-]+$/.test(token) || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return new NextResponse("This confirmation link is invalid.", { status: 400 });
  }

  try {
    const supabase = createWaitlistAdminClient();
    const { data, error } = await supabase.rpc("verify_waitlist_email", { p_token_hash: sha256(token) });
    if (error || !data?.ok || !data.slug) {
      const target = new URL("/p/" + encodeURIComponent(slug), siteUrl);
      target.searchParams.set("waitlist", "expired");
      return NextResponse.redirect(target, 303);
    }

    const target = new URL("/p/" + encodeURIComponent(data.slug), siteUrl);
    target.searchParams.set("waitlist", "verified");
    const response = NextResponse.redirect(target, 303);
    setMembershipCookie(response, data.slug, data.signup_id, data.page_id);
    return response;
  } catch (error) {
    console.error("Waitlist email verification failed.", error instanceof Error ? error.message : "unknown_error");
    const target = new URL("/p/" + encodeURIComponent(slug), siteUrl);
    target.searchParams.set("waitlist", "unavailable");
    return NextResponse.redirect(target, 303);
  }
}
