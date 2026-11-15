# Birthday mode: setup (10 minutes, free)

When it's someone's birthday you open **`/admin.html`**, type their name, press one button, and for
**every visitor**:

- their card on the main page turns into a birthday card (gold glow, 👑, ribbon, age badge)
- the whole main page turns into a party (purple background, confetti, balloons)
- a "Happy Birthday, NAME! 🎉" banner shows on the main page and on Games, Hosts, School, Info and Sponsor
- it turns itself off at midnight (Baku time), or when you press Remove

## Why a setup is needed

Every visitor has to see the same thing, so the birthday must be stored on a server. The site already
has a `functions/` folder, which only runs on **Cloudflare Pages** (not GitHub Pages). Check
`AUTH_SETUP.md` → "0. Hosting requirement" first: open `https://eas30.site/api/birthday` and you
should see `{"birthdays":[]}`. If you see a 404 page the functions aren't running yet. Nothing breaks
in that case, birthday mode just never turns on.

## Steps

1. **Create a KV store.** Cloudflare dashboard → *Storage & Databases* → *KV* → *Create* → name it
   `eas30-birthdays`.
2. **Connect it to the site.** *Workers & Pages* → your project → *Settings* → *Bindings* → *Add* →
   *KV namespace*. Variable name must be exactly **`BIRTHDAYS`**, namespace: `eas30-birthdays`.
   (Older dashboards: Settings → Functions → KV namespace bindings.)
3. **Choose an admin key.** Same Settings page → *Variables and Secrets* → add a **Secret** called
   **`ADMIN_KEY`**. Use something long and private, for example the output of
   `openssl rand -hex 16`. This is the password for the admin page. (Minimum 10 characters.)
4. **Redeploy** (push a commit, or Deployments → Retry). Bindings and variables only apply to new deployments.
5. Open `https://eas30.site/admin.html`, enter the key, done.

## Using it

1. Type the name **the way it is on the card** (the box suggests the names from the main page).
   If you type "Emil Aliyev" it still finds the card called "Emil".
2. Optional: age they are turning, and a short message.
3. Choose how long it stays on (default: until midnight tonight, Baku time).
4. **Start birthday mode.** People who already have the site open see it within about a minute.
5. **Preview (only me)** shows how it will look on your own screen without publishing anything.

Two birthdays on the same day are fine (up to 10 at once). Adding the same name again updates it.
The banner has an × so visitors can close it, and the theme steps aside while someone has a secret
mode (`matrix`, `disco`, …) switched on.

## Test on your own computer

```bash
npx wrangler pages dev . --port 8788 --kv BIRTHDAYS --binding ADMIN_KEY=any-long-test-key-123
```
Then open `http://localhost:8788/admin.html`. Preview without any server:
`http://localhost:3000/?birthday_preview=Emil&age=14`.

## Files

| File | What it does |
|---|---|
| `admin.html` | The admin page |
| `assets/js/birthday.js` | Runs on the public pages: banner, confetti, theme, birthday card |
| `functions/api/birthday.js` | Public read-only list of birthdays that are active right now |
| `functions/api/birthday-admin.js` | Add / list / remove. Needs the `X-Admin-Key` header |
| `functions/_lib/birthdays.js` | Shared helpers (storage, expiry, key check) |

## Good to know

- Only the **admin key** can change anything. Visitors can only read the list. Anything typed into the
  admin page is shown as plain text, never as HTML.
- The admin key is kept only in that browser tab (cleared when you close it). Press **Lock** to forget it sooner.
- If the key ever leaks, change `ADMIN_KEY` in Cloudflare and redeploy.
- Free-tier limits (100,000 reads/day, 1,000 writes/day) are far above what a class site needs.
