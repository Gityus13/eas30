// POST /api/auth/google   body: { credential }
// Verifies the Google ID token server-side (instead of trusting the browser),
// then sets the same signed session cookie as the other providers.

import {
    DEFAULT_GOOGLE_CLIENT_ID,
    SESSION_COOKIE,
    SESSION_MAX_AGE,
    cleanUser,
    hasSessionSecret,
    isHttps,
    json,
    makeCookie,
    signSession,
} from "../../_lib/session.js";

export async function onRequestPost({ request, env }) {
    let credential;
    try {
        ({ credential } = await request.json());
    } catch {
        return json({ error: "bad_request" }, 400);
    }
    if (!credential || typeof credential !== "string") return json({ error: "bad_request" }, 400);
    if (!hasSessionSecret(env)) return json({ error: "server_not_configured" }, 500);

    const clientId = env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

    // Google checks the signature and expiry for us.
    const res = await fetch(
        "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(credential)
    );
    if (!res.ok) return json({ error: "invalid_token" }, 401);

    const t = await res.json();
    const issuerOk = t.iss === "accounts.google.com" || t.iss === "https://accounts.google.com";
    if (t.aud !== clientId || !issuerOk || Number(t.exp) * 1000 < Date.now() || !t.sub) {
        return json({ error: "invalid_token" }, 401);
    }

    const user = {
        id: `google:${t.sub}`,
        name: t.name || t.email,
        email: String(t.email_verified) === "true" ? t.email : null,
        picture: t.picture,
        provider: "google",
    };

    const token = await signSession(env, user);
    return json({ user: cleanUser(user) }, 200, [
        makeCookie(SESSION_COOKIE, token, { maxAge: SESSION_MAX_AGE, secure: isHttps(request) }),
    ]);
}
