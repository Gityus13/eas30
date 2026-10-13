/* =========================================================
   EAS30 LANGUAGES
   - English is ALWAYS the language when the page opens
     (the choice is never saved on purpose).
   - Order: English, Azərbaycanca, Русский, then extras.
   - Works by translating the page's existing English text,
     so no changes to the HTML are needed.
   ========================================================= */
(function () {
    'use strict';

    /* ---------- languages (order = order in the menu) ---------- */
    const LANGS = [
        { code: 'en', name: 'English' },
        { code: 'az', name: 'Azərbaycanca' },
        { code: 'ru', name: 'Русский' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' },
        { code: 'es', name: 'Español' }
    ];

    // Every array below is in THIS order:
    const ORDER = ['az', 'ru', 'tr', 'de', 'fr', 'es'];

    /* ---------- dictionary: English text -> [az, ru, tr, de, fr, es] ---------- */
    const T = {
        /* ticker + header */
        "EAS30 · Class 8A · 2030 →": ["EAS30 · 8A sinfi · 2030 →", "EAS30 · 8А класс · 2030 →", "EAS30 · 8A Sınıfı · 2030 →", "EAS30 · Klasse 8A · 2030 →", "EAS30 · Classe 8A · 2030 →", "EAS30 · Clase 8A · 2030 →"],
        "Class 8A · European Azerbaijan School": ["8A sinfi · Avropa Azərbaycan Məktəbi", "8А класс · Европейская Азербайджанская Школа", "8A Sınıfı · Avrupa Azerbaycan Okulu", "Klasse 8A · Europäische Aserbaidschanische Schule", "Classe 8A · École européenne d'Azerbaïdjan", "Clase 8A · Escuela Europea de Azerbaiyán"],
        "Every hobby, every face, one page — Class 8A on the road to 2030.": ["Hər hobbi, hər üz, bir səhifə — 8A sinfi 2030-a gedən yolda.", "Каждое увлечение, каждое лицо, одна страница — 8А класс на пути к 2030.", "Her hobi, her yüz, tek sayfa — 8A Sınıfı 2030 yolunda.", "Jedes Hobby, jedes Gesicht, eine Seite — Klasse 8A auf dem Weg ins Jahr 2030.", "Chaque passion, chaque visage, une seule page — la classe 8A sur la route de 2030.", "Cada afición, cada rostro, una sola página: la clase 8A rumbo a 2030."],

        /* account */
        "Sign in": ["Daxil ol", "Войти", "Giriş yap", "Anmelden", "Se connecter", "Iniciar sesión"],
        "Log out": ["Çıxış", "Выйти", "Çıkış yap", "Abmelden", "Se déconnecter", "Cerrar sesión"],
        "Guest account": ["Qonaq hesabı", "Гостевой аккаунт", "Misafir hesabı", "Gastkonto", "Compte invité", "Cuenta de invitado"],

        /* countdown */
        "CLASS OF 2030": ["2030 MƏZUNLARI", "ВЫПУСК 2030", "2030 MEZUNLARI", "JAHRGANG 2030", "PROMOTION 2030", "PROMOCIÓN 2030"],
        "Countdown to 2030": ["2030-a geri sayım", "Обратный отсчёт до 2030", "2030'a geri sayım", "Countdown bis 2030", "Compte à rebours jusqu'à 2030", "Cuenta atrás hasta 2030"],
        "DAYS": ["GÜN", "ДНЕЙ", "GÜN", "TAGE", "JOURS", "DÍAS"],
        "HOURS": ["SAAT", "ЧАСОВ", "SAAT", "STD", "HEURES", "HORAS"],
        "MIN": ["DƏQ", "МИН", "DK", "MIN", "MIN", "MIN"],
        "SEC": ["SAN", "СЕК", "SN", "SEK", "SEC", "SEG"],
        "Every second is part of the story.": ["Hər saniyə hekayənin bir hissəsidir.", "Каждая секунда — часть нашей истории.", "Her saniye hikâyenin bir parçasıdır.", "Jede Sekunde ist Teil der Geschichte.", "Chaque seconde fait partie de l'histoire.", "Cada segundo es parte de la historia."],
        "Journey to 2030": ["2030-a gedən yol", "Путь к 2030", "2030'a yolculuk", "Reise bis 2030", "Le voyage vers 2030", "El camino hacia 2030"],

        /* buttons */
        "Your Managebac": ["Sənin Managebac-ın", "Твой Managebac", "Senin Managebac'in", "Dein Managebac", "Ton Managebac", "Tu Managebac"],
        "Our School EAS": ["Məktəbimiz EAS", "Наша школа EAS", "Okulumuz EAS", "Unsere Schule EAS", "Notre école EAS", "Nuestra escuela EAS"],
        "Add to Dock": ["Dock-a əlavə et", "Добавить в Dock", "Dock'a ekle", "Zum Dock hinzufügen", "Ajouter au Dock", "Añadir al Dock"],
        "Our Instagram": ["Instagram səhifəmiz", "Наш Instagram", "Instagram'ımız", "Unser Instagram", "Notre Instagram", "Nuestro Instagram"],
        "Admin Panel (for host only )": ["Admin Paneli (yalnız host üçün)", "Панель администратора (только для хоста)", "Yönetici Paneli (sadece host için)", "Admin-Panel (nur für den Host)", "Panneau d'administration (réservé à l'hôte)", "Panel de administración (solo para el anfitrión)"],
        "Fun Games": ["Əyləncəli oyunlar", "Весёлые игры", "Eğlenceli oyunlar", "Spaßspiele", "Jeux amusants", "Juegos divertidos"],
        "Info": ["Məlumat", "Информация", "Bilgi", "Info", "Infos", "Información"],
        "Explore Modes": ["Modlara bax", "Открыть режимы", "Modları keşfet", "Modi entdecken", "Découvrir les modes", "Explorar modos"],
        "View The OG Website (EasHobbies)": ["Orijinal saytı gör (EasHobbies)", "Оригинальный сайт (EasHobbies)", "Orijinal siteyi gör (EasHobbies)", "Die Original-Website ansehen (EasHobbies)", "Voir le site d'origine (EasHobbies)", "Ver el sitio original (EasHobbies)"],
        "Flappy Bird Game": ["Flappy Bird oyunu", "Игра Flappy Bird", "Flappy Bird oyunu", "Flappy-Bird-Spiel", "Jeu Flappy Bird", "Juego Flappy Bird"],
        "Perfect Circle Game": ["Mükəmməl dairə oyunu", "Игра «Идеальный круг»", "Mükemmel daire oyunu", "Perfect-Circle-Spiel", "Jeu du cercle parfait", "Juego del círculo perfecto"],
        "Our Sponsors": ["Sponsorlarımız", "Наши спонсоры", "Sponsorlarımız", "Unsere Sponsoren", "Nos sponsors", "Nuestros patrocinadores"],
        "Hosts": ["Hostlar", "Хосты", "Hostlar", "Hosts", "Hôtes", "Anfitriones"],
        "Share": ["Paylaş", "Поделиться", "Paylaş", "Teilen", "Partager", "Compartir"],
        "QR Code": ["QR kod", "QR-код", "QR kod", "QR-Code", "Code QR", "Código QR"],

        /* footer */
        "2026 EAS30. If you find incorrect information or would like to suggest a change, please contact us. Made by YUSAI and Kenanchik. Logo by Safia.B & Aliya.H.": [
            "2026 EAS30. Yanlış məlumat tapsanız və ya dəyişiklik təklif etmək istəsəniz, bizimlə əlaqə saxlayın. YUSAI və Kenanchik tərəfindən hazırlanıb. Loqo: Safia.B & Aliya.H.",
            "2026 EAS30. Если вы нашли неверную информацию или хотите предложить изменение, свяжитесь с нами. Сделано YUSAI и Kenanchik. Логотип: Safia.B и Aliya.H.",
            "2026 EAS30. Yanlış bilgi bulursanız veya bir değişiklik önermek isterseniz lütfen bizimle iletişime geçin. YUSAI ve Kenanchik tarafından yapıldı. Logo: Safia.B & Aliya.H.",
            "2026 EAS30. Wenn du falsche Informationen findest oder eine Änderung vorschlagen möchtest, kontaktiere uns bitte. Erstellt von YUSAI und Kenanchik. Logo von Safia.B & Aliya.H.",
            "2026 EAS30. Si vous trouvez une information incorrecte ou souhaitez proposer une modification, contactez-nous. Créé par YUSAI et Kenanchik. Logo par Safia.B & Aliya.H.",
            "2026 EAS30. Si encuentras información incorrecta o quieres sugerir un cambio, contáctanos. Hecho por YUSAI y Kenanchik. Logo de Safia.B y Aliya.H."
        ],

        /* name cards (hobbies) */
        "DJ • Website Host": ["DJ • Saytın hostu", "Диджей • Хост сайта", "DJ • Site hostu", "DJ • Website-Host", "DJ • Hôte du site", "DJ • Anfitrión del sitio"],
        "Basketball Player • Website Host": ["Basketbolçu • Saytın hostu", "Баскетболист • Хост сайта", "Basketbolcu • Site hostu", "Basketballspieler • Website-Host", "Basketteur • Hôte du site", "Jugador de baloncesto • Anfitrión del sitio"],
        "Playing Games": ["Oyun oynamaq", "Игры", "Oyun oynamak", "Spiele spielen", "Jouer aux jeux", "Juegos"],
        "Violin": ["Skripka", "Скрипка", "Keman", "Geige", "Violon", "Violín"],
        "Tennis": ["Tennis", "Теннис", "Tenis", "Tennis", "Tennis", "Tenis"],
        "Playing Video Games": ["Video oyunları oynamaq", "Видеоигры", "Video oyunları oynamak", "Videospiele spielen", "Jouer aux jeux vidéo", "Videojuegos"],
        "Archery": ["Oxatma", "Стрельба из лука", "Okçuluk", "Bogenschießen", "Tir à l'arc", "Tiro con arco"],
        "Hanging Out With Friends": ["Dostlarla vaxt keçirmək", "Проводит время с друзьями", "Arkadaşlarla vakit geçirmek", "Zeit mit Freunden verbringen", "Sortir avec des amis", "Salir con amigos"],
        "Ski": ["Xizək", "Лыжи", "Kayak", "Skifahren", "Ski", "Esquí"],
        "Playing Drums & Guitar": ["Nağara və gitara çalmaq", "Игра на барабанах и гитаре", "Davul ve gitar çalmak", "Schlagzeug & Gitarre spielen", "Batterie et guitare", "Tocar batería y guitarra"],
        "Piano CO - Host": ["Piano • Köməkçi host", "Фортепиано • Со-хост", "Piyano • Yardımcı host", "Klavier • Co-Host", "Piano • Co-hôte", "Piano • Coanfitrión"],
        "Creating Skins for Games": ["Oyunlar üçün skinlər yaratmaq", "Создаёт скины для игр", "Oyunlar için skin tasarlamak", "Erstellt Skins für Spiele", "Crée des skins pour les jeux", "Crear skins para juegos"],
        "Handball": ["Həndbol", "Гандбол", "Hentbol", "Handball", "Handball", "Balonmano"],
        "Volleyball CO - Host": ["Voleybol • Köməkçi host", "Волейбол • Со-хост", "Voleybol • Yardımcı host", "Volleyball • Co-Host", "Volley-ball • Co-hôte", "Voleibol • Coanfitrión"],
        "Badminton": ["Badminton", "Бадминтон", "Badminton", "Badminton", "Badminton", "Bádminton"],
        "Chess": ["Şahmat", "Шахматы", "Satranç", "Schach", "Échecs", "Ajedrez"],
        "Interested In Cars": ["Avtomobillərə maraq", "Интересуется машинами", "Arabalarla ilgileniyor", "Interessiert sich für Autos", "Passionné de voitures", "Interesado en los coches"],
        "Padel": ["Padel", "Падел", "Padel", "Padel", "Padel", "Pádel"],
        "Bicycle": ["Velosiped", "Велосипед", "Bisiklet", "Fahrrad", "Vélo", "Bicicleta"],
        "Drawing": ["Rəsm", "Рисование", "Resim yapmak", "Zeichnen", "Dessin", "Dibujo"],
        "Reading & Dancing": ["Kitab oxumaq və rəqs", "Чтение и танцы", "Kitap okumak ve dans", "Lesen & Tanzen", "Lecture et danse", "Lectura y baile"],
        "Swimming": ["Üzgüçülük", "Плавание", "Yüzme", "Schwimmen", "Natation", "Natación"],

        /* popups + alerts */
        "Share EAS30": ["EAS30-u paylaş", "Поделиться EAS30", "EAS30'u paylaş", "EAS30 teilen", "Partager EAS30", "Compartir EAS30"],
        "Copy Link": ["Linki kopyala", "Копировать ссылку", "Bağlantıyı kopyala", "Link kopieren", "Copier le lien", "Copiar enlace"],
        "Scan QR Code": ["QR kodu skan et", "Сканировать QR-код", "QR kodu tara", "QR-Code scannen", "Scanner le code QR", "Escanear código QR"],
        "Scan to visit EAS30": ["EAS30-a daxil olmaq üçün skan et", "Сканируйте, чтобы открыть EAS30", "EAS30'u ziyaret etmek için tara", "Scannen, um EAS30 zu besuchen", "Scannez pour visiter EAS30", "Escanea para visitar EAS30"],
        "Link copied to clipboard!": ["Link kopyalandı!", "Ссылка скопирована!", "Bağlantı kopyalandı!", "Link in die Zwischenablage kopiert!", "Lien copié dans le presse-papiers !", "¡Enlace copiado al portapapeles!"],
        "Please click the website first to allow audio playback": ["Səsi işə salmaq üçün əvvəlcə səhifəyə klikləyin", "Сначала нажмите на страницу, чтобы разрешить воспроизведение звука", "Sesi çalmak için önce sayfaya tıklayın", "Bitte klicke zuerst auf die Seite, um die Audiowiedergabe zu erlauben", "Cliquez d'abord sur la page pour autoriser la lecture audio", "Haz clic primero en la página para permitir la reproducción de audio"]
    };

    // Secret-code input: the codes stay English (you type them), only the lead word changes
    const PLACEHOLDER_LEAD = { az: 'Yaz:', ru: 'Введи:', tr: 'Yaz:', de: 'Tippe:', fr: 'Tape :', es: 'Escribe:' };

    /* ---------- helpers ---------- */
    const norm = s => s.replace(/\s+/g, ' ').trim();
    const DICT = {};
    Object.keys(T).forEach(k => { DICT[norm(k)] = T[k]; });

    let current = 'en';                 // ALWAYS start in English
    const records = new WeakMap();      // text node -> { orig, shown }

    function idx() { return ORDER.indexOf(current); }

    function translateNode(node) {
        let rec = records.get(node);

        // the page changed this text itself -> forget our old record
        if (rec && node.nodeValue !== rec.shown && node.nodeValue !== rec.orig) rec = null;

        const orig = rec ? rec.orig : node.nodeValue;
        const entry = DICT[norm(orig)];
        if (!entry) return;

        let value;
        if (current === 'en') {
            value = orig;
        } else {
            const lead = orig.match(/^\s*/)[0];
            const trail = orig.match(/\s*$/)[0];
            value = lead + entry[idx()] + trail;
        }

        records.set(node, { orig: orig, shown: value });
        if (node.nodeValue !== value) node.nodeValue = value;
    }

    function walk(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(n) {
                const p = n.parentNode;
                if (!p) return NodeFilter.FILTER_REJECT;
                const tag = p.nodeName;
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
                if (p.closest && p.closest('#eas-lang')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(translateNode);
    }

    /* ---------- placeholder of the secret code box ---------- */
    let placeholderEN = null;
    function updatePlaceholder() {
        const input = document.getElementById('secretCodeInput');
        if (!input) return;
        if (placeholderEN === null) placeholderEN = input.getAttribute('placeholder') || '';
        if (current === 'en') {
            input.setAttribute('placeholder', placeholderEN);
        } else {
            input.setAttribute('placeholder', PLACEHOLDER_LEAD[current] + ' ' + placeholderEN.replace(/^Type\s*/i, ''));
        }
    }

    /* ---------- translate alert() popups too ---------- */
    const nativeAlert = window.alert.bind(window);
    window.alert = function (msg) {
        if (current !== 'en' && typeof msg === 'string') {
            const entry = DICT[norm(msg)];
            if (entry) msg = entry[idx()];
        }
        return nativeAlert(msg);
    };

    /* ---------- switcher UI ---------- */
    const css = document.createElement('style');
    css.textContent = `
        #eas-lang {
            position: fixed;
            top: 40px;
            left: 20px;
            z-index: 10002;
            font-family: inherit;
        }
        #eas-lang-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            height: 50px;
            padding: 0 16px;
            border-radius: 25px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: #fff;
            font: inherit;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 1px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transition: background 0.3s ease, transform 0.3s ease;
        }
        #eas-lang-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
        #eas-lang-btn i { font-size: 16px; }
        #eas-lang-btn .eas-chev { font-size: 10px; transition: transform 0.25s ease; }
        #eas-lang.open #eas-lang-btn .eas-chev { transform: rotate(180deg); }
        #eas-lang-menu {
            display: none;
            position: absolute;
            top: 58px;
            left: 0;
            min-width: 190px;
            margin: 0;
            padding: 8px;
            list-style: none;
            background: rgba(15, 23, 42, 0.94);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 18px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.35);
        }
        #eas-lang.open #eas-lang-menu { display: block; }
        #eas-lang-menu li {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
            text-align: left;
        }
        #eas-lang-menu li:hover { background: rgba(255,255,255,0.1); }
        #eas-lang-menu li.active { background: rgba(255,255,255,0.16); font-weight: 700; }
        #eas-lang-menu li b {
            display: inline-block;
            width: 26px;
            font-size: 12px;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.6);
        }
        #eas-lang-menu li.active::after { content: "✓"; margin-left: auto; color: #22d3ee; }
        @media (max-width: 380px) {
            #eas-lang { left: 10px; }
            #eas-lang-btn { height: 40px; padding: 0 12px; }
        }
    `;
    document.head.appendChild(css);

    const box = document.createElement('div');
    box.id = 'eas-lang';
    box.innerHTML = `
        <button id="eas-lang-btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Language">
            <i class="fas fa-globe"></i>
            <span id="eas-lang-code">EN</span>
            <i class="fas fa-chevron-down eas-chev"></i>
        </button>
        <ul id="eas-lang-menu" role="listbox">
            ${LANGS.map(l => `<li role="option" data-lang="${l.code}"><b>${l.code.toUpperCase()}</b>${l.name}</li>`).join('')}
        </ul>
    `;
    document.body.appendChild(box);

    const btn = box.querySelector('#eas-lang-btn');
    const codeLabel = box.querySelector('#eas-lang-code');
    const items = box.querySelectorAll('#eas-lang-menu li');

    function setMenu(open) {
        box.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', e => {
        e.stopPropagation();
        setMenu(!box.classList.contains('open'));
    });
    document.addEventListener('click', () => setMenu(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    items.forEach(li => {
        li.addEventListener('click', e => {
            e.stopPropagation();
            setLang(li.dataset.lang);
            setMenu(false);
        });
    });

    /* ---------- switching ---------- */
    function setLang(code) {
        if (!LANGS.some(l => l.code === code)) return;
        current = code;                              // NOT saved anywhere -> English again on next visit

        document.documentElement.lang = code;
        codeLabel.textContent = code.toUpperCase();
        items.forEach(li => li.classList.toggle('active', li.dataset.lang === code));

        walk(document.body);
        updatePlaceholder();
        tellIframes();

        document.dispatchEvent(new CustomEvent('eas-lang-change', { detail: { lang: code } }));
    }

    // Lets countdown.html (iframe) follow the language if it listens for it:
    //   window.addEventListener('message', e => { if (e.data && e.data.type === 'eas-lang') { ... e.data.lang ... } });
    function tellIframes() {
        document.querySelectorAll('iframe').forEach(f => {
            try { f.contentWindow.postMessage({ type: 'eas-lang', lang: current }, '*'); } catch (e) { /* ignore */ }
        });
    }
    document.querySelectorAll('iframe').forEach(f => f.addEventListener('load', tellIframes));

    /* ---------- translate content that appears later (popups, dropdown, etc.) ---------- */
    let queued = false;
    new MutationObserver(() => {
        if (current === 'en' || queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            walk(document.body);
        });
    }).observe(document.body, { childList: true, subtree: true });

    // public helpers if you ever want them
    window.EASLang = { set: setLang, get: () => current, languages: LANGS };

    // start state
    items[0].classList.add('active');
})();
