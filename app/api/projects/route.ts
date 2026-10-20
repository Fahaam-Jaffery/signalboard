import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const starterWorkspace = {
 problem: "", hypothesis: "If we solve this problem with a focused, easy-to-use product, the target audience will be willing to try it.",
 valueProposition: "", validationTests: ["Interview 5 people in the target audience", "Create a landing page and measure sign-up intent"],
 competitors: "", features: [
  { name: "Core job to be done", description: "The smallest feature that solves the main problem.", priority: "Must-have" },
  { name: "Onboarding", description: "Help a new user reach their first useful outcome.", priority: "Must-have" },
  { name: "Feedback loop", description: "Learn what works and what needs improvement.", priority: "Later" }
 ], userFlow: ["Discover the product", "Understand the value", "Complete the core action", "See a useful result"],
 prototype: { activeScreen: "Home", sampleInput: "", completed: false }
};

export async function GET() {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error: "Sign in to view your projects." }, { status: 401 });
 const { data, error } = await supabase.from("product_projects").select("id,name,description,audience,category,stage,created_at,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(100);
 if (error) { console.error("Project list failed:", error.message); return NextResponse.json({ error: "Could not load projects. Check that the product_projects schema is installed." }, { status: 500 }); }
 return NextResponse.json({ projects: data || [] });
}

export async function POST(request: Request) {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error: "Sign in to create a project." }, { status: 401 });
 let body: Record<string, unknown>;
 try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
 const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
 const description = typeof body.description === "string" ? body.description.trim().slice(0, 2000) : "";
 const audience = typeof body.audience === "string" ? body.audience.trim().slice(0, 500) : "";
 const category = typeof body.category === "string" ? body.category.trim().slice(0, 100) || "Web app" : "Web app";
 if (!name || description.length < 8) return NextResponse.json({ error: "Add a product name and a description of at least 8 characters." }, { status: 400 });
 const workspace = { ...starterWorkspace, problem: (audience || "Your target users") + " need a better way to " + description.replace(/[.!?]+$/, "").toLowerCase() + "." };
 const { data, error } = await supabase.from("product_projects").insert({ user_id: user.id, name, description, audience, category, stage: "discovery", workspace }).select("id,name,description,audience,category,stage,workspace,created_at,updated_at").single();
 if (error) { console.error("Project create failed:", { code: error.code, message: error.message }); const schema = ["42P01","42703","PGRST204","PGRST205"].includes(error.code || ""); return NextResponse.json({ error: schema ? "The product_projects table is missing. Apply supabase/migrations/20261020220000_product_projects.sql." : "Could not create your project." }, { status: 500 }); }
 return NextResponse.json({ project: data }, { status: 201 });
}
