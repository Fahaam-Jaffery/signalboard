import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
type Params = { params: Promise<{ id: string }> };
const stages = ["discovery","blueprint","prototype","launch"];

export async function GET(_request: Request, { params }: Params) {
 const { id } = await params; const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error: "Sign in to open this project." }, { status: 401 });
 const { data, error } = await supabase.from("product_projects").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
 if (error) return NextResponse.json({ error: "Could not load this project." }, { status: 500 });
 if (!data) return NextResponse.json({ error: "Project not found." }, { status: 404 });
 return NextResponse.json({ project: data });
}

export async function PATCH(request: Request, { params }: Params) {
 const { id } = await params; const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error: "Sign in to save this project." }, { status: 401 });
 let body: Record<string, unknown>;
 try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
 const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
 if (typeof body.name === "string") updates.name = body.name.trim().slice(0, 100);
 if (typeof body.description === "string") updates.description = body.description.trim().slice(0, 2000);
 if (typeof body.audience === "string") updates.audience = body.audience.trim().slice(0, 500);
 if (typeof body.category === "string") updates.category = body.category.trim().slice(0, 100) || "Web app";
 if (typeof body.stage === "string" && stages.includes(body.stage)) updates.stage = body.stage;
 if (body.workspace && typeof body.workspace === "object" && !Array.isArray(body.workspace)) {
  if (JSON.stringify(body.workspace).length > 40000) return NextResponse.json({ error: "This workspace is too large to save." }, { status: 413 });
  updates.workspace = body.workspace;
 }
 if (updates.name === "" || updates.description === "") return NextResponse.json({ error: "Name and description cannot be empty." }, { status: 400 });
 const { data, error } = await supabase.from("product_projects").update(updates).eq("id", id).eq("user_id", user.id).select("id,name,description,audience,category,stage,workspace,created_at,updated_at").maybeSingle();
 if (error) { console.error("Project save failed:", { code: error.code, message: error.message }); return NextResponse.json({ error: "Could not save your changes." }, { status: 500 }); }
 if (!data) return NextResponse.json({ error: "Project not found." }, { status: 404 });
 return NextResponse.json({ project: data });
}
