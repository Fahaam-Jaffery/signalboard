import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RequestBody = { slug?: unknown };

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug || slug.length > 180 || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return NextResponse.json({ error: "This page could not be found." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to join this waitlist." }, { status: 401 });
  }
  if (!user.email || !user.email_confirmed_at) {
    return NextResponse.json({ error: "Confirm your SignalBoard account email before joining a waitlist." }, { status: 403 });
  }

  const { data: page, error: pageError } = await supabase
    .from("landing_pages")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (pageError || !page) {
    return NextResponse.json({ error: "This page could not be found." }, { status: 404 });
  }

  const { error } = await supabase.from("waitlist").insert({
    landing_page_id: page.id,
    user_id: user.id,
    email: user.email.trim().toLowerCase(),
    verification_status: "verified",
    verified_at: new Date().toISOString(),
  });

  if (error?.code === "23505") {
    // Older waitlist rows were keyed by email before memberships were tied to accounts.
    // If this confirmed account matches such a row, claim it rather than leaving it invisible
    // to the member and excluded from verified validation metrics.
    await supabase
      .from("waitlist")
      .update({
        user_id: user.id,
        verification_status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("landing_page_id", page.id)
      .eq("email", user.email.trim().toLowerCase())
      .is("user_id", null);

    return NextResponse.json({
      success: true,
      alreadyJoined: true,
      message: "You're already on this waitlist. Your spot is saved to your SignalBoard account.",
    });
  }
  if (error) {
    console.error("Authenticated waitlist insert failed.", error.code);
    return NextResponse.json({ error: "Could not join the waitlist. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    alreadyJoined: false,
    message: "You're on the waitlist! Your spot is saved to your SignalBoard account.",
  });
}
