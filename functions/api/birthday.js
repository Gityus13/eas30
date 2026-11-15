// GET /api/birthday  ->  { birthdays: [{ id, name, age, message }] }   (PUBLIC, read-only)
// Every page calls this. It only ever returns birthdays that are active right now.
// If the KV store isn't connected yet it simply returns an empty list, so the site never breaks.

import { json } from "../_lib/session.js";
import { loadAll, isActive } from "../_lib/birthdays.js";

export async function onRequestGet({ env }) {
    const now = Date.now();
    const birthdays = (await loadAll(env))
        .filter((e) => isActive(e, now))
        .map((e) => ({
            id: e.id,
            name: e.name,
            age: e.age ?? null,
            message: e.message || "",
        }));

    const res = json({ birthdays });
    res.headers.set("Cache-Control", "public, max-age=15");
    return res;
}
