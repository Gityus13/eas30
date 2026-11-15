/* =========================================================
   EAS30 BIRTHDAY MODE (live, same for every visitor)

   - Asks /api/birthday who has a birthday right now.
   - If somebody does: confetti + balloons + a banner, and that
     student's card turns into a birthday card.
   - On pages loaded with  data-theme="full"  (index.html) the whole
     page background also turns into a party.
   - If nobody has a birthday, or the API isn't there (plain static
     server), it does NOTHING, so it is safe on every page.
   - Birthdays are added / removed in  /admin.html

   Preview without publishing:  /?birthday_preview=Emil&age=14
   ========================================================= */
(function () {
    'use strict';
    if (window.__easBirthday) return;

    var script = document.currentScript;
    var FULL_THEME = !!(script && script.getAttribute('data-theme') === 'full');

    var API = '/api/birthday';
    var POLL_MS = 60 * 1000;
    var CLOSED_KEY = 'eas_bday_closed';
    var SECRET_MODES = ['disco', 'glitch', 'matrix', 'barbie', 'gta', 'halloween', 'christmas', 'birthday'];
    // The theme steps aside while a visitor has one of the secret modes on.
    var NOT_SECRET = SECRET_MODES.map(function (m) { return ':not(.' + m + '-mode)'; }).join('');
    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* ---------- helpers ---------- */
    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;   // textContent only: names are never parsed as HTML
        return n;
    }
    function norm(s) {
        return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    }
    function joinNames(names) {
        if (names.length <= 1) return names[0] || '';
        return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
    }
    function cleanList(data) {
        if (!data || !Array.isArray(data.birthdays)) return null;
        var out = [];
        data.birthdays.forEach(function (b) {
            if (!b || typeof b.name !== 'string' || !b.name.trim()) return;
            var age = parseInt(b.age, 10);
            out.push({
                id: String(b.id || b.name).slice(0, 40),
                name: b.name.trim().slice(0, 60),
                age: age >= 1 && age <= 120 ? age : null,
                message: typeof b.message === 'string' ? b.message.trim().slice(0, 140) : ''
            });
        });
        return out.slice(0, 10);
    }

    /* ---------- styles ---------- */
    var css = '';
    if (FULL_THEME) {
        css +=
            'html body.birthday-live' + NOT_SECRET + '{' +
                'background:radial-gradient(circle at 18% 22%,#ec4899 0,transparent 32%),' +
                'radial-gradient(circle at 82% 62%,#7c3aed 0,transparent 36%),' +
                'linear-gradient(135deg,#311047,#7c2d7a) !important;' +
                'background-size:150% 150% !important;' +
                'animation:bdayBg 14s ease-in-out infinite alternate !important;}' +
            '@keyframes bdayBg{from{background-position:0% 0%}to{background-position:100% 100%}}' +
            'body.birthday-live .name-card{box-shadow:0 10px 30px rgba(0,0,0,.35),0 0 0 2px rgba(250,204,21,.45)}';
    }
    css +=
        /* banner */
        '.bday-banner{position:fixed;left:50%;bottom:18px;translate:-50% 0;z-index:10040;display:flex;align-items:center;' +
            'gap:10px;width:max-content;max-width:calc(100vw - 32px);padding:10px 10px 10px 18px;border-radius:999px;color:#fff;' +
            "font:700 15px/1.3 'Space Grotesk',system-ui,sans-serif;" +
            'background:linear-gradient(135deg,rgba(236,72,153,.94),rgba(124,58,237,.94));' +
            'border:1px solid rgba(255,255,255,.4);box-shadow:0 10px 30px rgba(0,0,0,.35),0 0 0 4px rgba(250,204,21,.28);' +
            'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);cursor:pointer;animation:bdayPop .6s cubic-bezier(.2,1.4,.4,1) both}' +
        '.bday-banner .bday-emoji{font-size:22px;line-height:1}' +
        '.bday-banner .bday-text{display:block;text-align:left}' +
        '.bday-banner small{display:block;font-weight:500;font-size:12.5px;opacity:.92;margin-top:2px}' +
        '.bday-banner .bday-x{flex:none;width:28px;height:28px;border:0;border-radius:50%;background:rgba(255,255,255,.22);' +
            'color:#fff;font-size:18px;line-height:1;cursor:pointer}' +
        '.bday-banner .bday-x:hover{background:rgba(255,255,255,.38)}' +
        '@keyframes bdayPop{from{scale:.6;opacity:0}to{scale:1;opacity:1}}' +
        /* confetti + balloons */
        '.bday-confetti{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9990}' +
        '.bday-balloon{position:fixed;bottom:-80px;font-size:38px;pointer-events:none;z-index:9985;opacity:.95;' +
            'animation:bdayRise linear infinite;will-change:translate}' +
        '@keyframes bdayRise{0%{translate:0 0}50%{translate:18px -55vh}100%{translate:-12px -120vh}}' +
        /* the birthday card (no transform / pseudo-elements: the site's tilt effect and ::after already use them) */
        '.name-card.bday-card{background:linear-gradient(135deg,#ec4899,#f97316 55%,#facc15) !important;' +
            'animation:bdayGlow 2.4s ease-in-out infinite}' +
        '@keyframes bdayGlow{0%,100%{box-shadow:0 0 0 3px #fde047,0 0 22px 4px rgba(250,204,21,.55)}' +
            '50%{box-shadow:0 0 0 3px #fff,0 0 42px 12px rgba(236,72,153,.7)}}' +
        '.name-card.bday-card .name-title{background:none !important;-webkit-text-fill-color:#fff !important;color:#fff !important;' +
            'text-shadow:0 2px 8px rgba(0,0,0,.35)}' +
        '.name-card .bday-ribbon{position:absolute !important;left:0;right:0;top:0;padding:6px 8px;text-align:center;' +
            'font-size:13px;font-weight:800;letter-spacing:.03em;color:#4a044e;background:rgba(255,255,255,.9);transform:none !important}' +
        '.name-card .bday-crown{position:absolute !important;left:0;right:0;top:38px;text-align:center;font-size:30px;line-height:1;' +
            'transform:none !important;animation:bdayBob 2s ease-in-out infinite}' +
        '@keyframes bdayBob{0%,100%{translate:0 0;rotate:-6deg}50%{translate:0 -5px;rotate:6deg}}' +
        '.name-card .bday-age{position:absolute !important;right:12px;top:44px;width:44px;height:44px;border-radius:50%;' +
            'display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#4a044e;' +
            'background:#fde047;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);transform:none !important}' +
        '.name-card.bday-card{padding-top:3.6rem}' +
        '@media (prefers-reduced-motion:reduce){.bday-card,.bday-crown,.bday-balloon,.bday-banner{animation:none !important}}';

    var styleEl = null;
    function ensureStyle() {
        if (styleEl) return;
        styleEl = document.createElement('style');
        styleEl.id = 'bday-style';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    /* ---------- confetti (small canvas, no libraries) ---------- */
    var conf = null;
    var COLORS = ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#6366f1', '#d946ef', '#ffffff'];

    function startConfetti() {
        if (reduceMotion || conf) return;
        var canvas = el('canvas', 'bday-confetti');
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        if (!ctx) { canvas.remove(); return; }

        var state = { canvas: canvas, ctx: ctx, parts: [], raf: 0, last: 0, w: 0, h: 0, dpr: 1 };
        conf = state;

        function resize() {
            state.dpr = Math.min(window.devicePixelRatio || 1, 2);
            state.w = window.innerWidth;
            state.h = window.innerHeight;
            canvas.width = Math.round(state.w * state.dpr);
            canvas.height = Math.round(state.h * state.dpr);
        }
        state.onResize = resize;
        resize();
        window.addEventListener('resize', resize);

        function piece(fromTop, burst) {
            return {
                x: Math.random() * state.w,
                y: fromTop ? -20 - Math.random() * state.h * 0.4 : Math.random() * state.h,
                w: 6 + Math.random() * 6,
                h: 9 + Math.random() * 8,
                color: COLORS[(Math.random() * COLORS.length) | 0],
                vy: 70 + Math.random() * 110,
                sway: 18 + Math.random() * 34,
                phase: Math.random() * Math.PI * 2,
                speedPhase: 1 + Math.random() * 1.6,
                rot: Math.random() * Math.PI * 2,
                vr: (Math.random() - 0.5) * 6,
                burst: !!burst
            };
        }
        var base = state.w < 600 ? 45 : 80;
        for (var i = 0; i < base; i++) state.parts.push(piece(false, false));
        for (var j = 0; j < base; j++) state.parts.push(piece(true, true));   // opening burst, falls once then disappears

        function frame(t) {
            state.raf = requestAnimationFrame(frame);
            var dt = state.last ? Math.min(0.05, (t - state.last) / 1000) : 0.016;
            state.last = t;
            var c = state.ctx;
            c.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
            c.clearRect(0, 0, state.w, state.h);
            for (var k = state.parts.length - 1; k >= 0; k--) {
                var p = state.parts[k];
                p.phase += p.speedPhase * dt;
                p.y += p.vy * dt;
                p.x += Math.sin(p.phase) * p.sway * dt;
                p.rot += p.vr * dt;
                if (p.y > state.h + 20) {
                    if (p.burst) { state.parts.splice(k, 1); continue; }
                    p.y = -20; p.x = Math.random() * state.w;
                }
                c.save();
                c.translate(p.x, p.y);
                c.rotate(p.rot);
                c.fillStyle = p.color;
                c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                c.restore();
            }
        }
        state.raf = requestAnimationFrame(frame);
    }

    function stopConfetti() {
        if (!conf) return;
        cancelAnimationFrame(conf.raf);
        window.removeEventListener('resize', conf.onResize);
        conf.canvas.remove();
        conf = null;
    }

    /* ---------- balloons ---------- */
    var balloons = [];
    function startBalloons() {
        if (reduceMotion || balloons.length) return;
        var faces = window.innerWidth < 600 ? ['🎈', '🎈', '🎈'] : ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈'];
        var gap = 100 / faces.length;
        faces.forEach(function (f, i) {
            var b = el('div', 'bday-balloon', f);
            b.setAttribute('aria-hidden', 'true');
            b.style.left = (gap * i + gap / 2 - 3 + Math.random() * 4) + 'vw';
            b.style.animationDuration = (11 + Math.random() * 6) + 's';
            b.style.animationDelay = (-Math.random() * 12) + 's';
            b.style.filter = 'hue-rotate(' + ((i * 55) % 360) + 'deg)';
            document.body.appendChild(b);
            balloons.push(b);
        });
    }
    function stopBalloons() {
        balloons.forEach(function (b) { b.remove(); });
        balloons = [];
    }

    /* ---------- the student's card ---------- */
    var decorated = [];   // [{ card, added: [elements] }]
    var cardWatcher = null;

    function findEntry(byName, cardName) {
        var n = norm(cardName);
        if (!n) return null;
        if (byName[n]) return byName[n];
        // "Emil Aliyev" typed in the admin panel still matches the card that just says "Emil"
        for (var key in byName) {
            if (key.split(' ')[0] === n) return byName[key];
        }
        return null;
    }

    function decorateCards(list) {
        var cards = document.querySelectorAll('.name-card');
        if (!cards.length) return false;
        var byName = {};
        list.forEach(function (e) { byName[norm(e.name)] = e; });

        cards.forEach(function (card) {
            var h = card.querySelector('.name-title');
            if (!h || card.classList.contains('bday-card')) return;
            var entry = findEntry(byName, h.textContent);
            if (!entry) return;
            var added = [];
            card.classList.add('bday-card');
            var ribbon = el('div', 'bday-ribbon');
            ribbon.appendChild(el('span', '', '🎂'));
            ribbon.appendChild(document.createTextNode(' '));
            ribbon.appendChild(el('span', '', 'Happy Birthday!'));   // plain text node: i18n.js can translate it
            added.push(ribbon, el('div', 'bday-crown', '👑'));
            if (entry.age) added.push(el('div', 'bday-age', String(entry.age)));
            added.forEach(function (n) { card.appendChild(n); });
            decorated.push({ card: card, added: added });
        });
        return true;
    }

    function undecorateCards() {
        if (cardWatcher) { cardWatcher.disconnect(); cardWatcher = null; }
        decorated.forEach(function (d) {
            d.card.classList.remove('bday-card');
            d.added.forEach(function (n) { n.remove(); });
        });
        decorated = [];
    }

    function whenCardsReady(list) {
        if (decorateCards(list)) return;
        // The cards are created by index.html's own script; wait for them if they aren't there yet.
        cardWatcher = new MutationObserver(function () {
            if (decorateCards(list)) { cardWatcher.disconnect(); cardWatcher = null; }
        });
        cardWatcher.observe(document.body, { childList: true, subtree: true });
        setTimeout(function () { if (cardWatcher) { cardWatcher.disconnect(); cardWatcher = null; } }, 15000);
    }

    /* ---------- banner ---------- */
    var banner = null;

    function showBanner(list, sig) {
        try { if (sessionStorage.getItem(CLOSED_KEY) === sig) return; } catch (e) { /* storage blocked: just show it */ }
        var b = el('div', 'bday-banner');
        b.setAttribute('role', 'status');
        b.appendChild(el('span', 'bday-emoji', '🎂'));

        var text = el('span', 'bday-text');
        text.appendChild(el('span', '', 'Happy Birthday,'));
        text.appendChild(document.createTextNode(' '));
        text.appendChild(el('b', '', joinNames(list.map(function (e) { return e.name; }))));
        text.appendChild(document.createTextNode('! 🎉'));
        var msgs = list.map(function (e) { return e.message; }).filter(Boolean);
        if (msgs.length) text.appendChild(el('small', '', msgs.join(' · ')));
        b.appendChild(text);

        var x = el('button', 'bday-x', '×');
        x.type = 'button';
        x.setAttribute('aria-label', 'Close');
        x.addEventListener('click', function (ev) {
            ev.stopPropagation();
            try { sessionStorage.setItem(CLOSED_KEY, sig); } catch (e) { /* ignore */ }
            b.remove();
            banner = null;
        });
        b.appendChild(x);

        // clicking the banner scrolls to the birthday card (if this page has one)
        b.addEventListener('click', function () {
            var d = decorated[0];
            if (d && d.card.scrollIntoView) d.card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        });

        document.body.appendChild(b);
        banner = b;
    }

    /* ---------- on / off ---------- */
    var lastSig = null;

    function teardown() {
        document.body.classList.remove('birthday-live');
        if (banner) { banner.remove(); banner = null; }
        stopConfetti();
        stopBalloons();
        undecorateCards();
    }

    function setup(list, sig) {
        ensureStyle();
        if (FULL_THEME) document.body.classList.add('birthday-live');
        startConfetti();
        startBalloons();
        showBanner(list, sig);
        whenCardsReady(list);
    }

    function render(list) {
        var sig = JSON.stringify(list.map(function (e) { return [e.id, e.name, e.age, e.message]; }));
        if (sig === lastSig) return;
        lastSig = sig;
        teardown();
        if (list.length) setup(list, sig);
    }

    /* ---------- loading ---------- */
    function refresh() {
        if (document.hidden) return;
        fetch(API, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                var list = cleanList(data);
                if (list) render(list);      // on any error we keep whatever is showing
            })
            .catch(function () { /* offline or no API: do nothing */ });
    }

    function start() {
        var params = new URLSearchParams(window.location.search);
        var preview = params.get('birthday_preview');
        if (preview) {
            // Local preview only (nothing is saved, nobody else sees it).
            render(cleanList({ birthdays: [{ id: 'preview', name: preview, age: params.get('age'), message: params.get('message') || '' }] }) || []);
            return;
        }
        refresh();
        setInterval(refresh, POLL_MS);
        document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
    }

    window.__easBirthday = { refresh: refresh };

    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
})();
