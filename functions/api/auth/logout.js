// POST /api/auth/logout  ->  clears the session cookie.

import { SESSION_COOKIE, clearCookie, isHttps, json } from "../../_lib/session.js";

export async function onRequestPost({ request }) {
    return json({ success: true }, 200, [clearCookie(SESSION_COOKIE, "/", isHttps(request))]);
}
