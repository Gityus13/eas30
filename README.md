# 🎓 EAS30 — Class 8A Website

<div align="center">

![EAS30 Logo](https://i.ibb.co/wFY6Tn2y/7-F.png)

**A premium class profile & hobbies website for Class 8A of EAS (Baku)**

[![Live Site](https://img.shields.io/badge/🌐%20Live%20Site-eas30.site-6c63ff?style=for-the-badge)](https://eas30.site)
[![Instagram](https://img.shields.io/badge/Instagram-@eashobies.site-E1306C?style=for-the-badge&logo=instagram)](https://www.instagram.com/eashobies.site/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/Gityus13/Hobies)
</div>

---

## 📌 Overview

EAS30 is the official class website for **Class 8A** of the English-Azerbaijani School (EAS), Baku. It showcases each student's hobbies and personality, provides access to school resources, and delivers a uniquely interactive web experience complete with secret visual modes, AI chat, games, and more.

> "At this website, people can see your hobby and know you better."

---

## ✨ Features

### 🎨 Visual Design (v2 — Redesigned)
| Feature | Details |
|---|---|
| **3D Tilt Cards** | Mouse-tracking perspective transform on every member card |
| **Particle Canvas** | Floating ambient particle system in the background |
| **Scroll Reveal Animations** | IntersectionObserver-powered staggered entrance effects |
| **Parallax Orbs** | Atmospheric gradient blobs that float on the hero |
| **Cinematic Loader** | Counting progress bar with smooth fade-out |
| **Dark / Light Mode** | Persisted via localStorage, toggle in top-right |
| **Animated News Ticker** | Scrolling gradient banner at the top |
| **Glassmorphism UI** | Consistent `backdrop-filter` glass cards throughout |

### 🎭 Secret Modes
Type a code into the input bar at the top of the page to activate a mode:

| Code | Mode | Effect |
|---|---|---|
| `disco` | 🪩 Disco Mode | Flashing lights, bouncing cards, color-cycling animations |
| `matrix` | 💻 Matrix Mode | Falling green characters canvas, terminal messages |
| `gta` | 🔫 GTA Mode | Click to shoot, floating pickups, radar HUD, health bar |
| `barbie` | 💖 Barbie Mode | Pink theme, glitter cursor trail, sparkle effects |
| `glitch` | 👾 Glitch Mode | CRT scan-lines, random error popups, screen-tear |
| `halloween` | 🎃 Halloween Mode | Dark spooky gradient theme |
| `christmas` | 🎄 Christmas Mode | Green/red festive gradient theme |
| `birthday` | 🎂 Birthday Mode | Confetti rain + birthday banner for a named student |

### 🗂️ Pages

| File | Description |
|---|---|
| `index.html` | **Main page** — hero, members grid, links hub |
| `login.html` | Google OAuth + Guest login |
| `hosts.html` | Gallery of the three website hosts |
| `games.html` | Games hub |
| `flappybird.html` | Fully playable Flappy Bird (Canvas 2D) |
| `circle.html` | "Draw a Perfect Circle" accuracy game |
| `school.html` | Embedded school videos |
| `modes.html` | Visual guide to all interactive modes |
| `info.html` | Submit info / contact form |
| `sponsor.html` | Sponsors page |
| `mac.html` | Instructions for adding to macOS Dock |
| `countdown.html` | 14-day song-change countdown (transparent, embeddable) |
| `thanks.html` | Premium animated "Thank You" page after form submit |
| `404.html` | Custom 404 error page |
| `NewYear.html` | New Year celebration page |

### 🔐 Authentication
- **Google Sign-In** via Google Identity Services (`popup` mode)
- **Guest login** — random Guest ID, no account needed
- User avatar + name displayed in the fixed top-right area
- Logout from the dropdown menu
- Session stored in `localStorage` under key `eas_hobbies_user`

### 🎂 Birthday System (Admin)
Admins can trigger a birthday celebration for any student by writing to `localStorage`:

```javascript
localStorage.setItem('eas_public_birthday', JSON.stringify({
  active: true,
  name: 'Yusif',
  age: 14,             // optional
  message: 'Have a great day!'  // optional
}));
```

This triggers:
- A banner at the top of every page
- Confetti rain
- The named student's card gets a 👑 crown and special glow

To deactivate: `localStorage.removeItem('eas_public_birthday')`

### 🤖 AI Chat
An embedded [Pickaxe](https://pickaxe.co) AI assistant is embedded in the main page.

### 📊 Analytics
Google Analytics 4 is integrated across all pages via tag `G-JXV858VBM0`.

---

## 🏗️ Tech Stack

| Technology | Usage |
|---|---|
| **HTML5 / CSS3** | All pages — pure HTML, no build step required |
| **Vanilla JavaScript** | All interactivity, mode logic, auth |
| **Canvas API** | Flappy Bird, Circle game, Particle background, Matrix rain |
| **CSS Custom Properties** | Design token system (`--accent`, `--surface`, etc.) |
| **IntersectionObserver** | Scroll-reveal animations |
| **Google Fonts** | Syne (display) + DM Sans (body) |
| **Font Awesome 6** | Icons throughout |
| **GSAP (thanks.html)** | Luxe animation on the thank-you page |
| **AOS** | Scroll animations on secondary pages |
| **Anime.js** | Mode-specific particle animations |
| **QRCode.js** | QR code generation in the share popup |
| **Google Identity Services** | Google OAuth popup login |

---

## 📁 Project Structure

```
eas30.site/
│
├── index.html          # Main landing page (redesigned v2)
├── login.html          # Google / Guest authentication
├── hosts.html          # Hosts gallery
├── games.html          # Games hub
├── flappybird.html     # Flappy Bird game
├── circle.html         # Perfect circle game
├── school.html         # School videos
├── modes.html          # Modes showcase
├── info.html           # Info / contact form
├── sponsor.html        # Sponsors
├── mac.html            # macOS dock instructions
├── countdown.html      # 14-day countdown embed
├── thanks.html         # Thank-you animation page
├── NewYear.html        # New Year page
├── 404.html            # Custom 404
│
├── sitemap.xml         # XML sitemap for SEO
├── robots.txt          # Search engine crawl rules
├── CNAME               # GitHub Pages custom domain config
└── LICENSE             # MIT License
```

---

## 🚀 Deployment

The site is deployed via **GitHub Pages** with a custom domain configured in the `CNAME` file.

### To deploy your own fork:
1. Fork this repository
2. Go to **Settings → Pages** → set source to `main` branch, `/ (root)`
3. Update the `CNAME` file with your custom domain (or delete it to use `*.github.io`)
4. Replace the Google Analytics tag ID (`G-JXV858VBM0`) with your own
5. Replace the Google Client ID in `login.html` with your own OAuth credential

### Local development:
```bash
# Any static file server works, e.g.:
npx serve .
# or
python -m http.server 3000
```

---

## 🎮 Games

### Flappy Bird (`flappybird.html`)
- Canvas 2D game — click or press `SPACE` to flap
- Tracks high score and attempt count per session
- Web Audio API for sound effects (flap, score, hit)

### Draw a Perfect Circle (`circle.html`)
- Freehand drawing on canvas
- Scores 0–100 based on radius variance + closure
- Tracks best score and attempt count

---

## 👑 Team

| Role | Person |
|---|---|
| Website Creator & Host | **Yusif Gurbanzade** (YUSAI) |
| Co-Host & Developer | **Farhad Ahmadov** (Farhadik) |
| Co-Host | **Kenan Mikayilzade** (Kenanchik) |
| Logo Design | **Rufiz A.** |

---

## 📞 Contact

Something incorrect, a lie, or you want to add something?

- **Phone:** +994 50 549 99 33
- **Find:** Yusif.G — Class 8A
- **Instagram:** [@eashobies.site](https://www.instagram.com/eashobies.site/)
- **Admin Panel:** [admin.eas30.site](https://admin.eas30.site)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by Class 8A — EAS Baku · 2026–2027

⭐ Star this repo if you like it!

</div>
