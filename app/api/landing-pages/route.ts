import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { buildLandingPage, type LandingPageIdea, validateLandingPageConfig } from "@/lib/landing-page-generator";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to create a page." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = body.idea;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ error: "A valid idea is required." }, { status: 400 });
  }
  const idea = raw as Record<string, unknown>;
  if (typeof idea.title !== "string" || typeof idea.description !== "string") {
    return NextResponse.json({ error: "The idea needs a title and description." }, { status: 400 });
  }

  const safeIdea: LandingPageIdea = {
    title: idea.title.slice(0, 100),
    description: idea.description.slice(0, 500),
    targetAudience: typeof idea.targetAudience === "string" ? idea.targetAudience.slice(0, 250) : undefined,
    whyNow: typeof idea.whyNow === "string" ? idea.whyNow.slice(0, 400) : undefined,
    category: typeof idea.category === "string" ? idea.category.slice(0, 80) : undefined,
    monetization: typeof idea.monetization === "string" ? idea.monetization.slice(0, 200) : undefined,
  };

  // Deterministic generation: no external AI provider or API key is required.
  const generated = buildLandingPage(safeIdea);
  if (!validateLandingPageConfig(generated.content)) {
    return NextResponse.json({ error: "The page template could not be validated." }, { status: 500 });
  }

  const slug = slugify(safeIdea.title) + "-" + crypto.randomUUID().slice(0, 6);
  const { data, error } = await supabase.from("landing_pages").insert({
    user_id: user.id,
    slug,
    title: safeIdea.title,
    headline: generated.headline,
    content: generated.content,
    idea_data: safeIdea,
    status: "published",
  }).select("id,slug,title,headline,created_at").single();

  if (error) {
    // Keep the detailed database error in server logs; return a safe, useful hint to the UI.
    console.error("Landing page save failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const schemaRelated = error.code === "42P01" || error.code === "42703" || error.code === "PGRST204" || error.code === "PGRST205";
    return NextResponse.json({
      error: schemaRelated
        ? "The landing_pages table or one of its columns is missing. Run supabase/schema.sql in the connected Supabase project's SQL Editor."
        : "Supabase could not save this page.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      code: process.env.NODE_ENV === "development" ? error.code : undefined,
    }, { status: 500 });
  }

  return NextResponse.json({
    page: data,
    url: (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin) + "/p/" + slug,
    source: "template",
  });
}
