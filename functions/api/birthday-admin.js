// Admin API for the birthday feature. Every request needs the header  X-Admin-Key: <ADMIN_KEY>.
//
//   GET     /api/birthday-admin             -> list active birthdays (also used to check the key)
//   POST    /api/birthday-admin             -> add / update one  { name, age?, message?, duration? }
//   DELETE  /api/birthday-admin?id=...      -> remove one
//   DELETE  /api/birthday-admin?all=1       -> turn everything off

import { json, randomHex } from "../_lib/session.js";
import {
    MAX_ENTRIES,
    hasStore,
    loadAll,
    saveAll,
    isActive,
    expiryFor,
    cleanText,
    cleanAge,
    requireAdmin,
} from "../_lib/birthdays.js";

const NO_STORE_MSG =
    "The KV namespace is not connected. Add a KV binding named BIRTHDAYS to this Pages project (see BIRTHDAY_SETUP.md).";

async function guard(request, env) {
    const denied = await requireAdmin(request, env);
    if (denied) return denied;
    if (!hasStore(env)) return json({ error: NO_STORE_MSG }, 503);
    return null;
}

export async function onRequestGet({ request, env }) {
    const denied = await guard(request, env);
    if (denied) return denied;
    const now = Date.now();
    const birthdays = (await loadAll(env)).filter((e) => isActive(e, now));
    return json({ birthdays, now });
}

export async function onRequestPost({ request, env }) {
    const denied = await guard(request, env);
    if (denied) return denied;

    let body;
    try {
        const text = await request.text();
        if (text.length > 4000) return json({ error: "Request too large." }, 413);
        body = JSON.parse(text);
    } catch {
        return json({ error: "Invalid JSON." }, 400);
    }

    const name = cleanText(body.name, 40);
    if (!name) return json({ error: "Please enter a name." }, 400);

    const now = Date.now();
    const entry = {
        id: randomHex(6),
        name,
        age: cleanAge(body.age),
        message: cleanText(body.message, 140),
        expires: expiryFor(body.duration, now),
        created: now,
    };

    // Drop expired ones, and replace an existing entry for the same name instead of duplicating it.
    const list = (await loadAll(env)).filter(
        (e) => isActive(e, now) && e.name.toLowerCase() !== name.toLowerCase()
    );
    if (list.length >= MAX_ENTRIES) {
        return json({ error: `At most ${MAX_ENTRIES} birthdays at once. Remove one first.` }, 400);
    }
    list.push(entry);
    await saveAll(env, list);
    return json({ ok: true, birthdays: list, now }, 201);
}

export async function onRequestDelete({ request, env }) {
    const denied = await guard(request, env);
    if (denied) return denied;

    const url = new URL(request.url);
    const now = Date.now();
    let list = (await loadAll(env)).filter((e) => isActive(e, now));

    if (url.searchParams.get("all") === "1") {
        list = [];
    } else {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id." }, 400);
        list = list.filter((e) => e.id !== id);
    }
    await saveAll(env, list);
    return json({ ok: true, birthdays: list, now });
}
