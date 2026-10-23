// Shared helpers for EAS30 sign-in: signed session cookies, cookies, redirects.
// Runs on Cloudflare Pages Functions (Workers runtime), so only built-in Web APIs are used.

const enc = new TextEncoder();
const dec = new TextDecoder();

export const SESSION_COOKIE = "eas_session";
export const STATE_COOKIE = "eas_oauth_state";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const USER_AGENT = "EAS30-login (+https://eas30.site)";
export const DEFAULT_GOOGLE_CLIENT_ID =
    "695398839217-ql189kgqbelkpb1taavqdgoers63uuh0.apps.googleusercontent.com";

/* ---------- base64url ---------- */

function toB64url(bytes) {
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(str) {
    const b64 = str
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(str.length / 4) * 4, "=");
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

/* ---------- signed session ---------- */

export function hasSessionSecret(env) {
    return typeof env.SESSION_SECRET === "string" && env.SESSION_SECRET.length >= 32;
}

function hmacKey(env, usages) {
    if (!hasSessionSecret(env)) {
        throw new Error("SESSION_SECRET is missing or shorter than 32 characters");
    }
    return crypto.subtle.importKey(
        "raw",
        enc.encode(env.SESSION_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        usages
    );
}

// Keeps only the fields we use, with sane sizes (cookies are limited to ~4 KB).
export function cleanUser(u) {
    const str = (v, max) =>
        typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
    const picture = str(u.picture, 400);
    return {
        id: str(u.id, 80),
        name: str(u.name, 80) || "User",
        email: str(u.email, 120),
        picture: picture && picture.startsWith("https://") ? picture : null,
        provider: str(u.provider, 20),
    };
}

export async function signSession(env, user, maxAge = SESSION_MAX_AGE) {
    const payload = { ...cleanUser(user), exp: Math.floor(Date.now() / 1000) + maxAge };
    const body = toB64url(enc.encode(JSON.stringify(payload)));
    const key = await hmacKey(env, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
    return `${body}.${toB64url(new Uint8Array(sig))}`;
}

export async function verifySession(env, token) {
    try {
        const [body, sig] = String(token || "").split(".");
        if (!body || !sig) return null;
        const key = await hmacKey(env, ["verify"]);
        const ok = await crypto.subtle.verify("HMAC", key, fromB64url(sig), enc.encode(body));
        if (!ok) return null;
        const payload = JSON.parse(dec.decode(fromB64url(body)));
        if (!payload.exp || payload.exp < Date.now() / 1000) return null;
        return payload;
    } catch {
        return null;
    }
}

export async function getSessionUser(request, env) {
    return verifySession(env, getCookie(request, SESSION_COOKIE));
}

export function publicUser(session) {
    const { id, name, email, picture, provider } = session;
    return { id, name, email, picture, provider };
}

/* ---------- cookies ---------- */

export function getCookie(request, name) {
    const header = request.headers.get("Cookie") || "";
    for (const part of header.split(";")) {
        const i = part.indexOf("=");
        if (i === -1) continue;
        if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
    }
    return null;
}

// Safari refuses "Secure" cookies on plain http://localhost, so Secure is only dropped for
// local http development. On the live https site it is always set.
export function isHttps(request) {
    return new URL(request.url).protocol === "https:";
}

export function makeCookie(name, value, { maxAge, path = "/", secure = true }) {
    return `${name}=${value}; Path=${path}; Max-Age=${maxAge}; HttpOnly${secure ? "; Secure" : ""}; SameSite=Lax`;
}

export function clearCookie(name, path = "/", secure = true) {
    return `${name}=; Path=${path}; Max-Age=0; HttpOnly${secure ? "; Secure" : ""}; SameSite=Lax`;
}

/* ---------- responses ---------- */

export function redirect(location, cookies = []) {
    const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
    for (const c of cookies) headers.append("Set-Cookie", c);
    return new Response(null, { status: 302, headers });
}

export function json(data, status = 200, cookies = []) {
    const headers = new Headers({
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
    });
    for (const c of cookies) headers.append("Set-Cookie", c);
    return new Response(JSON.stringify(data), { status, headers });
}

/* ---------- misc ---------- */

export function randomHex(bytes = 16) {
    const arr = crypto.getRandomValues(new Uint8Array(bytes));
    return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Constant-time string comparison.
export function safeEqual(a, b) {
    if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

export function siteOrigin(request, env) {
    return (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

export function initialsAvatar(name, background) {
    return (
        "https://ui-avatars.com/api/?background=" +
        background +
        "&color=fff&name=" +
        encodeURIComponent(name || "?")
    );
}

export function escapeHtml(s) {
    return String(s ?? "").replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
}
