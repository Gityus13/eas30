// GET /api/auth/providers  ->  which sign-in buttons login.html should show.
// A provider shows up only after its keys are set, so you can add them one at a time.

import { providerReady } from "../../_lib/providers.js";
import { hasSessionSecret, json } from "../../_lib/session.js";

export async function onRequestGet({ env }) {
    const telegramOn = providerReady("telegram", env);
    return json({
        sessions: hasSessionSecret(env),
        discord: providerReady("discord", env),
        github: providerReady("github", env),
        microsoft: providerReady("microsoft", env),
        telegram: telegramOn ? String(env.TELEGRAM_BOT_USERNAME).replace(/^@/, "") : null,
    });
}
