// GET /api/auth/<discord|github|microsoft>/start
// Sends the browser to the provider's sign-in page with a random "state" value
// (also stored in a short-lived cookie) so the callback can prove the request is ours.

import { PROVIDERS, providerReady } from "../../../_lib/providers.js";
import { STATE_COOKIE, isHttps, makeCookie, randomHex, redirect, siteOrigin } from "../../../_lib/session.js";

export async function onRequestGet({ request, env, params }) {
    const name = params.provider;
    const provider = PROVIDERS[name];

    if (!provider || !provider.authorizeUrl || !providerReady(name, env)) {
        return redirect("/login.html?error=unconfigured");
    }

    const state = randomHex(16);
    const redirectUri = `${siteOrigin(request, env)}/api/auth/${name}/callback`;

    return redirect(provider.authorizeUrl(env, redirectUri, state), [
        makeCookie(STATE_COOKIE, `${name}.${state}`, {
            maxAge: 600,
            path: "/api/auth",
            secure: isHttps(request),
        }),
    ]);
}
