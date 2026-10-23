// GET /api/auth/<discord|github|microsoft|telegram>/callback
// Verifies the sign-in, then sets a signed, HttpOnly session cookie and sends the
// browser back to login.html, which loads the user via /api/auth/me.

import { PROVIDERS, providerReady } from "../../../_lib/providers.js";
import {
    SESSION_COOKIE,
    SESSION_MAX_AGE,
    STATE_COOKIE,
    clearCookie,
    getCookie,
    isHttps,
    makeCookie,
    redirect,
    safeEqual,
    signSession,
    siteOrigin,
} from "../../../_lib/session.js";

export async function onRequestGet({ request, env, params }) {
    const name = params.provider;
    const provider = PROVIDERS[name];
    const url = new URL(request.url);

    const secure = isHttps(request);
    const fail = (code) =>
        redirect(`/login.html?error=${code}`, [clearCookie(STATE_COOKIE, "/api/auth", secure)]);

    if (!provider || !providerReady(name, env)) return fail("unconfigured");

    let user;
    try {
        if (name === "telegram") {
            user = await provider.verify(env, url.searchParams);
            if (!user) return fail("telegram");
        } else {
            // The user pressed "Cancel" / "Deny" on the provider's page.
            if (url.searchParams.get("error")) return fail("cancelled");

            const code = url.searchParams.get("code");
            const state = url.searchParams.get("state");
            const saved = getCookie(request, STATE_COOKIE);
            if (!code || !state || !safeEqual(saved || "", `${name}.${state}`)) return fail("state");

            const redirectUri = `${siteOrigin(request, env)}/api/auth/${name}/callback`;
            user = await provider.fetchUser(env, code, redirectUri);
        }
    } catch (err) {
        console.error(`${name} sign-in error:`, err);
        return fail("exchange");
    }

    const token = await signSession(env, user);
    return redirect("/login.html?auth=ok", [
        makeCookie(SESSION_COOKIE, token, { maxAge: SESSION_MAX_AGE, secure }),
        clearCookie(STATE_COOKIE, "/api/auth", secure),
    ]);
}
