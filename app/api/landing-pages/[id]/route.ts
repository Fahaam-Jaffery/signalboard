import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to edit this page." }, { status: 401 });
  const { data, error } = await supabase.from("landing_pages")
    .select("id,slug,title,headline,content,idea_data,created_at")
    .eq("id", id).eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Could not load this landing page." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Landing page not found." }, { status: 404 });
  return NextResponse.json({ page: data });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to delete this page." }, { status: 401 });
  const { data: page, error: lookupError } = await supabase.from("landing_pages")
    .select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (lookupError) return NextResponse.json({ error: "Could not verify page ownership." }, { status: 500 });
  if (!page) return NextResponse.json({ error: "Landing page not found." }, { status: 404 });
  let { error } = await supabase.from("landing_pages").delete().eq("id", id).eq("user_id", user.id);
  if (error?.code === "23503") {
    // Only remove signups when a foreign-key constraint proves they prevent page deletion.
    const { error: waitlistError } = await supabase.from("waitlist").delete().eq("landing_page_id", id);
    if (waitlistError) return NextResponse.json({ error: "Could not remove the page's waitlist records. The page was not deleted." }, { status: 500 });
    const retry = await supabase.from("landing_pages").delete().eq("id", id).eq("user_id", user.id);
    error = retry.error;
  }
  if (error) return NextResponse.json({ error: "Could not delete this landing page." }, { status: 500 });
  return NextResponse.json({ success: true });
}
