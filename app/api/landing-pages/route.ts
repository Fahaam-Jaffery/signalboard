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
  const rawCustomization = body.customization;
  const customization = rawCustomization && typeof rawCustomization === "object" && !Array.isArray(rawCustomization)
    ? rawCustomization as Record<string, unknown>
    : {};
  const textValue = (key: string, fallback: string, max: number) =>
    typeof customization[key] === "string" && (customization[key] as string).trim()
      ? (customization[key] as string).trim().slice(0, max)
      : fallback;
  const requestedTheme = customization.theme;
  const requestedLayout = customization.layout;
  const content = {
    ...generated.content,
    theme: (["violet", "ocean", "ember"].includes(String(requestedTheme)) ? requestedTheme : generated.content.theme) as "violet" | "ocean" | "ember",
    layout: (["editorial", "minimal", "bold"].includes(String(requestedLayout)) ? requestedLayout : generated.content.layout) as "editorial" | "minimal" | "bold",
    headline: textValue("headline", generated.content.headline, 180),
    subheadline: textValue("subheadline", generated.content.subheadline, 500),
    audience: textValue("audience", generated.content.audience, 250),
    problem: textValue("problem", generated.content.problem, 500),
    solution: textValue("solution", generated.content.solution, 500),
    benefitsTitle: textValue("benefitsTitle", "A more focused way to move forward.", 180),
    ctaTitle: textValue("ctaTitle", "Help shape what comes next.", 180),
    ctaBody: textValue("ctaBody", "Join the list and get updates when there’s something worth trying.", 500),
    sectionOrder: Array.isArray(customization.sectionOrder) ? customization.sectionOrder.filter((item): item is string => typeof item === "string" && ["hero","problem","approach","benefits","howItWorks","cta"].includes(item)).slice(0,6) : ["hero","problem","approach","benefits","howItWorks","cta"],
    howTitle: textValue("howTitle", "Small first step. Real feedback.", 180),
    howSteps: Array.isArray(customization.howSteps) ? customization.howSteps.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 180)).filter(Boolean).slice(0, 6) : (generated.content.sections.find((section) => section.type === "howItWorks")?.items || []),
    benefits: Array.isArray(customization.benefits)
      ? customization.benefits.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 160)).filter(Boolean).slice(0, 6)
      : generated.content.benefits,
    sections: generated.content.sections.map((section) => {
      if (section.type === "hero") return { ...section, title: textValue("headline", generated.content.headline, 180), body: textValue("subheadline", generated.content.subheadline, 500) };
      if (section.type === "problem") return { ...section, title: textValue("challengeTitle", section.title, 180), body: textValue("problem", generated.content.problem, 500) };
      if (section.type === "benefits") return { ...section, title: textValue("approachTitle", section.title, 180), body: textValue("solution", generated.content.solution, 500), items: Array.isArray(customization.benefits) ? customization.benefits.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 160)).filter(Boolean).slice(0, 6) : section.items };
      if (section.type === "howItWorks") return { ...section, title: textValue("howTitle", section.title, 180), items: Array.isArray(customization.howSteps) ? customization.howSteps.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 180)).filter(Boolean).slice(0, 6) : section.items };
      if (section.type === "cta") return { ...section, title: textValue("ctaTitle", "Help shape what comes next.", 180), body: textValue("ctaBody", "Join the list and get updates when there’s something worth trying.", 500) };
      return section;
    }),
  };
  if (!validateLandingPageConfig(content)) {
    return NextResponse.json({ error: "The page template could not be validated." }, { status: 500 });
  }

  const requestedPageId = typeof body.pageId === "string" ? body.pageId : null;
  let data: { id: string; slug: string; title: string; headline: string; created_at: string } | null = null;
  let error: { code?: string; message: string; details?: string; hint?: string } | null = null;
  if (requestedPageId) {
    const result = await supabase.from("landing_pages").update({
      title: safeIdea.title, headline: content.headline, content, idea_data: safeIdea, status: "published",
    }).eq("id", requestedPageId).eq("user_id", user.id).select("id,slug,title,headline,created_at").maybeSingle();
    data = result.data;
    error = result.error;
    if (!error && !data) return NextResponse.json({ error: "This landing page could not be found in your workspace." }, { status: 404 });
  } else {
    const slug = slugify(safeIdea.title) + "-" + crypto.randomUUID().slice(0, 6);
    const result = await supabase.from("landing_pages").insert({
      user_id: user.id, slug, title: safeIdea.title, headline: content.headline, content, idea_data: safeIdea, status: "published",
    }).select("id,slug,title,headline,created_at").single();
    data = result.data;
    error = result.error;
  }

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
