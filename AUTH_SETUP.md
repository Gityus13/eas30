# EAS30 sign-in setup (Discord, GitHub, Microsoft, Telegram)

Everything below is free. Each provider only shows up on the login page **after** you add its keys,
so you can set them up one at a time.

## 0. Hosting requirement

The sign-in code lives in `functions/`, and that folder only runs on **Cloudflare Pages** (it is
ignored by GitHub Pages). Your README says the site is on GitHub Pages. Check which one serves
`eas30.site`:

- Open `https://eas30.site/api/auth/providers` after deploying. If you see JSON, you're on Cloudflare
  Pages and are good. If you see a 404 page, the functions aren't running.
- If it's still GitHub Pages: Cloudflare dashboard → Workers & Pages → Create → Pages → connect the
  GitHub repo (no build command, output directory `/`) → add `eas30.site` as the custom domain.
  Until then the page falls back to the old Google + guest login, so nothing breaks.

## 1. Session secret (required)

Make a long random string and save it as `SESSION_SECRET` (see step 3):

```
openssl rand -hex 32
```

Keep it private. If it ever leaks, change it. Everyone is signed out, which is fine.

## 2. Create the apps

Use these exact redirect URLs (https, no trailing slash):

| Provider  | Redirect / callback URL                          |
|-----------|--------------------------------------------------|
| Discord   | `https://eas30.site/api/auth/discord/callback`   |
| GitHub    | `https://eas30.site/api/auth/github/callback`    |
| Microsoft | `https://eas30.site/api/auth/microsoft/callback` |

**Discord**: discord.com/developers/applications → New Application → OAuth2 → add the redirect URL →
copy the **Client ID** → Reset Secret → copy the **Client Secret**.

**GitHub**: github.com/settings/developers → OAuth Apps → New OAuth App. Homepage URL
`https://eas30.site`, Authorization callback URL as above → Register → Generate a new client secret.

**Microsoft**: entra.microsoft.com → App registrations → New registration.
- Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
- Redirect URI: platform **Web**, URL as above
- Then Certificates & secrets → New client secret → copy the **Value** (not the Secret ID)
- Application (client) ID is on the Overview page
- Microsoft secrets expire after 24 months at most. Put a reminder in your calendar to make a new
  one and update `MICROSOFT_CLIENT_SECRET`.

**Telegram**: open @BotFather → `/newbot` → pick a name and a username ending in `bot` → copy the
token. Then send `/setdomain` → choose your bot → enter `eas30.site`. Without this step the widget
says "Bot domain invalid".

## 3. Add the variables in Cloudflare

Workers & Pages → your project → Settings → Variables and Secrets → add these to **Production**
(use type *Secret* for the secrets), then redeploy (push a commit, or Deployments → Retry).

| Variable                 | Value                                     |
|--------------------------|-------------------------------------------|
| `SESSION_SECRET`         | from step 1                               |
| `DISCORD_CLIENT_ID`      | Discord Client ID                         |
| `DISCORD_CLIENT_SECRET`  | Discord Client Secret                     |
| `GITHUB_CLIENT_ID`       | GitHub Client ID                          |
| `GITHUB_CLIENT_SECRET`   | GitHub Client Secret                      |
| `MICROSOFT_CLIENT_ID`    | Microsoft Application (client) ID         |
| `MICROSOFT_CLIENT_SECRET`| Microsoft secret **Value**                |
| `TELEGRAM_BOT_TOKEN`     | token from BotFather                      |
| `TELEGRAM_BOT_USERNAME`  | bot username, with or without the `@`     |
| `RESEND_API_KEY`         | already set (welcome emails)              |

Optional: `SITE_URL` (only if your live address isn't `https://eas30.site`) and `GOOGLE_CLIENT_ID`
(defaults to the one already in `login.html`).

## 4. Test

1. Open `https://eas30.site/api/auth/providers`. Each provider you configured should say `true`.
2. Open `/login.html` and sign in with each one. You should land on the home page with your name and
   picture in the top-right.
3. Log out and sign in again. The welcome email is sent once per account per browser.

## Testing on your own computer (localhost)

A plain static server (`python -m http.server`, `npx serve`, VS Code Live Server) can't run the
`functions/` folder, so you'll only see **Google + guest**. To test everything locally:

1. Copy `.dev.vars.example` to `.dev.vars` and fill in `SESSION_SECRET` plus the providers you want.
   Never commit `.dev.vars` (the included `.gitignore` blocks it).
2. In the site folder run: `npx wrangler pages dev . --port 8788`
3. Open `http://localhost:8788/login.html`.
4. In each provider's app settings, add the local redirect URL
   `http://localhost:8788/api/auth/<discord|github|microsoft>/callback`.
   GitHub allows only one callback URL per OAuth app, so make a second "EAS30 dev" OAuth app for local use.
5. For Google to work on that port, add `http://localhost:8788` under Authorized JavaScript origins
   in your Google Cloud OAuth client.
6. Telegram's widget refuses to run on localhost. Test it on the real site.

Make sure `logo.png` and the other site files are in the same folder as `login.html`.

## Troubleshooting

- **Button missing**: its keys aren't set, or you haven't redeployed since adding them.
- **"redirect_uri mismatch" from the provider**: the URL in the app settings must match exactly
  (https, same domain, no trailing slash).
- **"That sign-in link expired"**: the browser blocked cookies, or you started sign-in in one browser
  and finished in another (in-app browsers like Instagram's sometimes do this).
- **Telegram "Bot domain invalid"**: run `/setdomain` in @BotFather.
- **Only Google shows on localhost**: you're on a plain static server. Use `npx wrangler pages dev .`
  (see the localhost section). The login page shows a small "Dev note" on localhost to tell you this.
- **Broken logo**: `logo.png` isn't in the same folder as `login.html`. Use the full-site zip.

## Good to know

- Accounts are identified by `provider:id` (for example `discord:1234`), never by email. Telegram
  accounts have no email, so they get no welcome email.
- There is no user database. The session is a signed cookie, and the site still keeps the name and
  picture in `localStorage` for the page header, same as before.
- Free-tier limits that matter: Resend allows 100 emails/day, which only affects welcome emails.
  Sign-ins themselves have no cap.
- `/api/login-email` now only emails the verified address of the signed-in user. The old version
  would email any address a visitor sent it.
- The login page no longer calls the old `eas30-email-api.farid-kurba.workers.dev` worker, so you can
  delete it.

## What changed

New: `.gitignore`, `.dev.vars.example`, `functions/_lib/session.js`, `functions/_lib/providers.js`, `functions/api/auth/providers.js`,
`me.js`, `logout.js`, `google.js`, `[provider]/start.js`, `[provider]/callback.js`.
Replaced: `functions/api/login-email.js`, `login.html` (hides the logo if it fails to load, Google
button is always in English, shows dev notes on localhost).
Edited: `index.html` (account dropdown shows the right provider name; logout also clears the cookie).
