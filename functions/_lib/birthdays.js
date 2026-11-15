// Shared helpers for the birthday feature (Cloudflare Pages Functions).
//
// Birthdays live in ONE Workers KV key ("birthdays") as a JSON array, so every visitor
// sees the same thing. KV binding name: BIRTHDAYS   (see BIRTHDAY_SETUP.md)
// Admin password:                       ADMIN_KEY   (Cloudflare secret)

import { json, safeEqual } from "./session.js";

export const KV_KEY = "birthdays";
export const MAX_ENTRIES = 10;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const BAKU_OFFSET = 4 * HOUR; // Azerbaijan is UTC+4 all year (no daylight saving)

export function hasStore(env) {
    return !!(env.BIRTHDAYS && typeof env.BIRTHDAYS.get === "function");
}

export async function loadAll(env) {
    if (!hasStore(env)) return [];
    try {
        const raw = await env.BIRTHDAYS.get(KV_KEY, "json");
        return Array.isArray(raw) ? raw : [];
    } catch {
        return [];
    }
}

export async function saveAll(env, list) {
    await env.BIRTHDAYS.put(KV_KEY, JSON.stringify(list));
}

export function isActive(entry, now = Date.now()) {
    return entry.expires == null || entry.expires > now;
}

// Midnight tonight, Baku time, as a UTC timestamp.
export function endOfTodayBaku(now = Date.now()) {
    const local = now + BAKU_OFFSET;
    return (Math.floor(local / DAY) + 1) * DAY - BAKU_OFFSET;
}

// "today" (default) | "24h" | "forever"  ->  expiry timestamp (ms) or null for "until removed"
export function expiryFor(duration, now = Date.now()) {
    if (duration === "forever") return null;
    if (duration === "24h") return now + DAY;
    return endOfTodayBaku(now);
}

export function cleanText(value, max) {
    if (typeof value !== "string") return "";
    return value
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
}

export function cleanAge(value) {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= 120 ? n : null;
}

async function sha256Hex(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Returns null when the request carries the right admin key, otherwise a ready-made error response.
export async function requireAdmin(request, env) {
    const key = env.ADMIN_KEY;
    if (typeof key !== "string" || key.length < 10) {
        return json(
            { error: "ADMIN_KEY is not set on the server (or is shorter than 10 characters). See BIRTHDAY_SETUP.md." },
            503
        );
    }
    const sent = request.headers.get("X-Admin-Key") || "";
    // Compare hashes so neither the content nor the length of the real key leaks through timing.
    const ok = safeEqual(await sha256Hex(sent), await sha256Hex(key));
    if (!ok) {
        await new Promise((resolve) => setTimeout(resolve, 600)); // slows down guessing
        return json({ error: "Wrong admin key." }, 401);
    }
    return null;
}
