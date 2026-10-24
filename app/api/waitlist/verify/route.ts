import { NextResponse, type NextRequest } from "next/server";
import { createWaitlistAdminClient } from "@/lib/supabase/admin";
import { setMembershipCookie, sha256 } from "@/lib/waitlist";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const slug = request.nextUrl.searchParams.get("slug") || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  if (!token || token.length > 128 || !slug || slug.length > 180) {
    return NextResponse.redirect(new URL("/?waitlist=invalid", siteUrl));
  }

  try {
    const supabase = createWaitlistAdminClient();
    const { data, error } = await supabase.rpc("verify_waitlist_email", { p_token_hash: sha256(token) });
    if (error || !data?.ok || data.slug !== slug) {
      const target = new URL("/p/" + encodeURIComponent(slug), siteUrl);
      target.searchParams.set("waitlist", "expired");
      return NextResponse.redirect(target);
    }

    const target = new URL("/p/" + encodeURIComponent(data.slug), siteUrl);
    target.searchParams.set("waitlist", "verified");
    const response = NextResponse.redirect(target);
    setMembershipCookie(response, data.slug, data.signup_id, data.page_id);
    return response;
  } catch (error) {
    console.error("Waitlist email verification failed.", error instanceof Error ? error.message : "unknown_error");
    const target = new URL("/p/" + encodeURIComponent(slug), siteUrl);
    target.searchParams.set("waitlist", "unavailable");
    return NextResponse.redirect(target);
  }
}
