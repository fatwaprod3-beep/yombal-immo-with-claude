import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { users } from "../db/schema";
import { passwordDigest, sameValue } from "../lib/admin-crypto";
import { getSetting } from "../lib/app-settings";

// Connexion propre à Yombal : e-mail + mot de passe, session signée en cookie.
export type AppUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
  status?: string;
};

export const sessionCookie = "yombal_session";
export const sessionSeconds = 30 * 24 * 60 * 60;
const SIGN_IN_PATH = "/connexion";
const SIGN_OUT_PATH = "/api/auth/logout";
const encoder = new TextEncoder();

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET manquant ou trop court (32 caractères minimum).");
  return secret;
}
const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
async function sign(value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(authSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export async function createSessionToken(userId: string, at = Date.now()) {
  const expires = at + sessionSeconds * 1000;
  const value = userId + "." + expires;
  return value + "." + (await sign(value));
}

async function verifySessionToken(token: string, at = Date.now()) {
  const match = /^([a-f0-9-]{36})\.(\d{13})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return null;
  const expires = Number(match[2]);
  if (expires <= at) return null;
  const expected = await sign(match[1] + "." + match[2]);
  return sameValue(expected, match[3]) ? { userId: match[1], issuedAt: expires - sessionSeconds * 1000 } : null;
}

export function sessionCookieHeader(token: string) {
  return `${sessionCookie}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${sessionSeconds}`;
}
export function clearSessionCookieHeader() {
  return `${sessionCookie}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function hashPassword(password: string) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  return { salt, hash: await passwordDigest(password, salt) };
}
export async function checkPassword(password: string, salt: string, hash: string) {
  return sameValue(await passwordDigest(password, salt), hash);
}

export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const token = (await cookies()).get(sessionCookie)?.value;
    if (!token) return null;
    const session = await verifySessionToken(token);
    if (!session) return null;
    const row = (await getDb().select().from(users).where(eq(users.id, session.userId)).limit(1))[0];
    if (!row || row.status === "suspended") return null;
    // Sessions révoquées par l'administration (compte précis ou tous les comptes).
    const globalAfter = Number((await getSetting("sessions_after")) || 0);
    if (session.issuedAt < Math.max(Number(row.sessionsAfter || 0), globalAfter)) return null;
    const now = Date.now();
    if (!row.lastSeenAt || now - Date.parse(row.lastSeenAt) > 10 * 60 * 1000) {
      await getDb().update(users).set({ lastSeenAt: new Date(now).toISOString() }).where(eq(users.id, row.id)).catch(() => {});
    }
    return { userId: row.id, email: row.email, fullName: row.name || null, displayName: row.name || row.email, status: row.status };
  } catch {
    return null;
  }
}

export async function requireUser(returnTo: string): Promise<AppUser> {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(signInPath(returnTo));
}

export function signInPath(returnTo: string): string {
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}
export function signOutPath(returnTo = "/"): string {
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (url.pathname === SIGN_IN_PATH || url.pathname.startsWith("/api/auth")) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}

// Jetons à usage précis (ouverture dans Chrome, réinitialisation du mot de passe) : signés avec AUTH_SECRET,
// liés à un objet (« bind ») et à une durée courte. Un jeton de réinitialisation est lié à l'empreinte
// du mot de passe actuel : il ne marche plus dès que le mot de passe a changé.
export async function createPurposeToken(purpose: string, userId: string, ttlMs: number, bind = "") {
  const expires = Date.now() + ttlMs;
  return userId + "." + expires + "." + (await sign(purpose + "|" + userId + "|" + expires + "|" + bind));
}
export async function verifyPurposeToken(purpose: string, token: string, bind: (userId: string) => Promise<string | null> = async () => "") {
  const match = /^([a-f0-9-]{36})\.(\d{13})\.([a-f0-9]{64})$/.exec(token);
  if (!match || Number(match[2]) <= Date.now()) return null;
  const bound = await bind(match[1]);
  if (bound === null) return null;
  const expected = await sign(purpose + "|" + match[1] + "|" + match[2] + "|" + bound);
  return sameValue(expected, match[3]) ? { userId: match[1], signature: match[3] } : null;
}
