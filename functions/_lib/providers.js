// Discord, GitHub, Microsoft (OAuth 2.0 code flow) and Telegram (Login Widget) sign-in.
// Each provider turns a successful sign-in into the same small user object:
//   { id: "<provider>:<id>", name, email|null, picture, provider }
// The id (never the email) is the identity key.

import { USER_AGENT, hasSessionSecret, safeEqual, initialsAvatar } from "./session.js";

const enc = new TextEncoder();

async function readJson(res, label) {
    let data = null;
    try {
        data = await res.json();
    } catch {
        /* handled below */
    }
    if (!res.ok || !data) throw new Error(`${label} failed (${res.status})`);
    return data;
}

/* ---------------- Discord ---------------- */

const discord = {
    configured: (env) => !!(env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET),

    authorizeUrl(env, redirectUri, state) {
        const u = new URL("https://discord.com/oauth2/authorize");
        u.search = new URLSearchParams({
            client_id: env.DISCORD_CLIENT_ID,
            response_type: "code",
            redirect_uri: redirectUri,
            scope: "identify email",
            state,
        }).toString();
        return u.toString();
    },

    async fetchUser(env, code, redirectUri) {
        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": USER_AGENT,
            },
            body: new URLSearchParams({
                client_id: env.DISCORD_CLIENT_ID,
                client_secret: env.DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
            }),
        });
        const token = await readJson(tokenRes, "Discord token");
        if (!token.access_token) throw new Error("Discord returned no access token");

        const meRes = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${token.access_token}`, "User-Agent": USER_AGENT },
        });
        const me = await readJson(meRes, "Discord profile");

        const picture = me.avatar
            ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(me.id) >> 22n) % 6n)}.png`;

        return {
            id: `discord:${me.id}`,
            name: me.global_name || me.username,
            email: me.verified ? me.email || null : null,
            picture,
            provider: "discord",
        };
    },
};

/* ---------------- GitHub ---------------- */

const github = {
    configured: (env) => !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),

    authorizeUrl(env, redirectUri, state) {
        const u = new URL("https://github.com/login/oauth/authorize");
        u.search = new URLSearchParams({
            client_id: env.GITHUB_CLIENT_ID,
            redirect_uri: redirectUri,
            scope: "read:user user:email",
            state,
        }).toString();
        return u.toString();
    },

    async fetchUser(env, code, redirectUri) {
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "User-Agent": USER_AGENT,
            },
            body: JSON.stringify({
                client_id: env.GITHUB_CLIENT_ID,
                client_secret: env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: redirectUri,
            }),
        });
        const token = await readJson(tokenRes, "GitHub token");
        if (!token.access_token) throw new Error("GitHub returned no access token");

        const headers = {
            Authorization: `Bearer ${token.access_token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": USER_AGENT,
        };
        const me = await readJson(await fetch("https://api.github.com/user", { headers }), "GitHub profile");

        // The public profile email is often empty, so ask for the verified primary one.
        let email = null;
        try {
            const r = await fetch("https://api.github.com/user/emails", { headers });
            if (r.ok) {
                const list = await r.json();
                const best =
                    list.find((e) => e.primary && e.verified) || list.find((e) => e.verified);
                email = best ? best.email : null;
            }
        } catch {
            /* email is optional */
        }

        return {
            id: `github:${me.id}`,
            name: me.name || me.login,
            email,
            picture: me.avatar_url,
            provider: "github",
        };
    },
};

/* ---------------- Microsoft ---------------- */

const MS_SCOPE = "openid profile email User.Read";
const MS_BASE = "https://login.microsoftonline.com/common/oauth2/v2.0";

const microsoft = {
    configured: (env) => !!(env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET),

    authorizeUrl(env, redirectUri, state) {
        const u = new URL(`${MS_BASE}/authorize`);
        u.search = new URLSearchParams({
            client_id: env.MICROSOFT_CLIENT_ID,
            response_type: "code",
            redirect_uri: redirectUri,
            response_mode: "query",
            scope: MS_SCOPE,
            state,
            prompt: "select_account", // lets people on shared school computers pick the right account
        }).toString();
        return u.toString();
    },

    async fetchUser(env, code, redirectUri) {
        const tokenRes = await fetch(`${MS_BASE}/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: env.MICROSOFT_CLIENT_ID,
                client_secret: env.MICROSOFT_CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                scope: MS_SCOPE,
            }),
        });
        const token = await readJson(tokenRes, "Microsoft token");
        if (!token.access_token) throw new Error("Microsoft returned no access token");

        const me = await readJson(
            await fetch("https://graph.microsoft.com/v1.0/me", {
                headers: { Authorization: `Bearer ${token.access_token}` },
            }),
            "Microsoft profile"
        );

        const upn = me.userPrincipalName || "";
        const email = me.mail || (upn.includes("@") && !upn.includes("#EXT#") ? upn : null);
        const name = me.displayName || email || "Microsoft user";

        return {
            id: `microsoft:${me.id}`,
            name,
            email,
            picture: initialsAvatar(name, "0078d4"),
            provider: "microsoft",
        };
    },
};

/* ---------------- Telegram (Login Widget) ---------------- */

const telegram = {
    configured: (env) => !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_USERNAME),

    // Telegram redirects the browser to the callback with the user's data in the query string,
    // signed with a key derived from the bot token. We recompute the signature to verify it.
    async verify(env, params) {
        const hash = params.get("hash");
        if (!hash || !params.get("id")) return null;

        const pairs = [];
        for (const [k, v] of params) if (k !== "hash") pairs.push([k, v]);
        pairs.sort((a, b) => (a[0] < b[0] ? -1 : 1));
        const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join("\n");

        const secret = await crypto.subtle.digest("SHA-256", enc.encode(env.TELEGRAM_BOT_TOKEN));
        const key = await crypto.subtle.importKey(
            "raw",
            secret,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const sig = await crypto.subtle.sign("HMAC", key, enc.encode(dataCheckString));
        const expected = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
        if (!safeEqual(expected, hash.toLowerCase())) return null;

        // Reject old sign-in links (replay protection): valid for 24 hours.
        const age = Date.now() / 1000 - Number(params.get("auth_date"));
        if (!Number.isFinite(age) || age > 86400 || age < -60) return null;

        const first = params.get("first_name") || "";
        const last = params.get("last_name") || "";
        const username = params.get("username") || "";
        const name = [first, last].filter(Boolean).join(" ") || username || "Telegram user";

        return {
            id: `telegram:${params.get("id")}`,
            name,
            email: null, // Telegram never shares an email
            picture: params.get("photo_url") || initialsAvatar(name, "229ed9"),
            provider: "telegram",
        };
    },
};

export const PROVIDERS = { discord, github, microsoft, telegram };

// A provider is usable only when its keys AND the session secret are set.
export function providerReady(name, env) {
    const p = PROVIDERS[name];
    return !!p && hasSessionSecret(env) && p.configured(env);
}
