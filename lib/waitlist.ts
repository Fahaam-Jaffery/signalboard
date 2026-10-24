import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createWaitlistAdminClient } from "@/lib/supabase/admin";

const COOKIE_PREFIX = "sb_waitlist_";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 180;

function secret() {
  const value = process.env.WAITLIST_COOKIE_SECRET;
  if (!value || value.length < 32) throw new Error("WAITLIST_COOKIE_SECRET must contain at least 32 characters.");
  return value;
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function keyedHash(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function newVerificationToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: sha256(token) };
}

function cookieName(slug: string) {
  return COOKIE_PREFIX + slug.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
}

export function createMembershipCookieValue(signupId: string, pageId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + COOKIE_TTL_SECONDS;
  const payload = Buffer.from([signupId, pageId, String(expiresAt)].join(".")).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return { value: payload + "." + signature, maxAge: COOKIE_TTL_SECONDS };
}

export function setMembershipCookie(response: import("next/server").NextResponse, slug: string, signupId: string, pageId: string) {
  const session = createMembershipCookieValue(signupId, pageId);
  response.cookies.set(cookieName(slug), session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
}

async function readMembershipCookie(slug: string, expectedPageId: string) {
  const store = await cookies();
  const value = store.get(cookieName(slug))?.value;
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [payload, suppliedSignature] = parts;
  const expectedSignature = createHmac("sha256", secret()).update(payload).digest("base64url");
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  let fields: string[];
  try {
    fields = Buffer.from(payload, "base64url").toString("utf8").split(".");
  } catch {
    return null;
  }
  if (fields.length !== 3 || fields[1] !== expectedPageId) return null;
  const [signupId, pageId, expiryText] = fields;
  if (!/^[0-9a-f-]{36}$/i.test(signupId) || !/^[0-9a-f-]{36}$/i.test(pageId)) return null;
  const expiry = Number(expiryText);
  if (!Number.isFinite(expiry) || expiry <= Math.floor(Date.now() / 1000)) return null;
  return { signupId, pageId };
}

export async function getWaitlistMembership(slug: string, pageId: string): Promise<"pending" | "verified" | null> {
  try {
    const session = await readMembershipCookie(slug, pageId);
    if (!session) return null;
    const supabase = createWaitlistAdminClient();
    const { data, error } = await supabase.rpc("get_waitlist_membership_status", {
      p_signup_id: session.signupId,
      p_page_id: session.pageId,
    });
    if (error || (data !== "pending" && data !== "verified")) return null;
    return data;
  } catch {
    return null;
  }
}
