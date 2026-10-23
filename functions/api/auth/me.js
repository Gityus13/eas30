// GET /api/auth/me  ->  { user } for a valid session cookie, otherwise 401.
// login.html calls this right after a provider redirects back.

import { getSessionUser, json, publicUser } from "../../_lib/session.js";

export async function onRequestGet({ request, env }) {
    const session = await getSessionUser(request, env);
    if (!session) return json({ user: null }, 401);
    return json({ user: publicUser(session) });
}
