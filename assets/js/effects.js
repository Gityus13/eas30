const hero = document.getElementById("hero");

const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const cursorLight = document.querySelector(".cursor-light");

const supportsFinePointer =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;


/* ==========================================
   CURSOR ENGINE
========================================== */

if (supportsFinePointer) {

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let ringX = mouseX;
    let ringY = mouseY;

    let lightX = mouseX;
    let lightY = mouseY;


    document.addEventListener("mousemove", (event) => {

        mouseX = event.clientX;
        mouseY = event.clientY;

        cursorDot.style.transform =
            `translate3d(${mouseX}px, ${mouseY}px, 0)
             translate(-50%, -50%)`;

    });


    function animateCursor() {

        /*
         * Ring intentionally follows slightly slower
         * than the real cursor.
         */

        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;

        lightX += (mouseX - lightX) * 0.055;
        lightY += (mouseY - lightY) * 0.055;


        cursorRing.style.transform =
            `translate3d(${ringX}px, ${ringY}px, 0)
             translate(-50%, -50%)`;


        cursorLight.style.transform =
            `translate3d(${lightX}px, ${lightY}px, 0)
             translate(-50%, -50%)`;


        requestAnimationFrame(animateCursor);

    }

    animateCursor();


    /* ==========================================
       INTERACTIVE CURSOR STATES
    ========================================== */

    const interactiveElements =
        document.querySelectorAll(
            "a, button, .time-card, .logo"
        );


    interactiveElements.forEach((element) => {

        element.addEventListener("mouseenter", () => {

            cursorRing.classList.add("active");

        });


        element.addEventListener("mouseleave", () => {

            cursorRing.classList.remove("active");

        });

    });


    /* Different cursor around headline */

    const headline = document.querySelector("h1");

    headline.addEventListener("mouseenter", () => {

        cursorRing.classList.add("text-mode");

    });


    headline.addEventListener("mouseleave", () => {

        cursorRing.classList.remove("text-mode");

    });

}


/* ==========================================
   HERO LIGHT FOLLOWS CURSOR
========================================== */

hero.addEventListener("mousemove", (event) => {

    if (!supportsFinePointer) return;

    const rect = hero.getBoundingClientRect();

    const x =
        ((event.clientX - rect.left) / rect.width) * 100;

    const y =
        ((event.clientY - rect.top) / rect.height) * 100;


    hero.style.setProperty(
        "--mouse-x",
        `${x}%`
    );

    hero.style.setProperty(
        "--mouse-y",
        `${y}%`
    );

});


/* ==========================================
   ULTRA-SUBTLE HERO DEPTH
========================================== */

hero.addEventListener("mousemove", (event) => {

    if (!supportsFinePointer) return;

    const rect = hero.getBoundingClientRect();


    const x =
        event.clientX -
        rect.left -
        rect.width / 2;


    const y =
        event.clientY -
        rect.top -
        rect.height / 2;


    const rotateX =
        (y / rect.height) * -1.2;


    const rotateY =
        (x / rect.width) * 1.2;


    hero.style.transform =
        `
        perspective(1400px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        `;
});


hero.addEventListener("mouseleave", () => {

    hero.style.transform =
        `
        perspective(1400px)
        rotateX(0deg)
        rotateY(0deg)
        `;
});


/* ==========================================
   MAGNETIC LINKS
========================================== */

const magneticElements =
    document.querySelectorAll(".magnetic");


magneticElements.forEach((element) => {

    element.addEventListener("mousemove", (event) => {

        if (!supportsFinePointer) return;


        const rect =
            element.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left -
            rect.width / 2;


        const y =
            event.clientY -
            rect.top -
            rect.height / 2;


        element.style.transform =
            `translate(
                ${x * 0.18}px,
                ${y * 0.18}px
            )`;

    });


    element.addEventListener("mouseleave", () => {

        element.style.transform =
            "translate(0px, 0px)";

    });

});


/* ==========================================
   COUNTDOWN MICRO DEPTH
========================================== */

document
    .querySelectorAll(".time-card")
    .forEach((card) => {

        card.addEventListener("mousemove", (event) => {

            if (!supportsFinePointer) return;


            const rect =
                card.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left -
                rect.width / 2;


            const y =
                event.clientY -
                rect.top -
                rect.height / 2;


            card.style.transform =
                `
                perspective(500px)
                rotateX(${y * -0.025}deg)
                rotateY(${x * 0.025}deg)
                translateY(-2px)
                `;

        });


        card.addEventListener("mouseleave", () => {

            card.style.transform =
                `
                perspective(500px)
                rotateX(0deg)
                rotateY(0deg)
                translateY(0px)
                `;

        });

    });


/* ==========================================
   COUNTDOWN NUMBER TRANSITIONS
========================================== */

const countdownNumbers =
    document.querySelectorAll(
        ".day, .hour, .minutes, .seconds"
    );


countdownNumbers.forEach((element) => {

    let previousValue =
        element.textContent;


    const observer =
        new MutationObserver(() => {

            const currentValue =
                element.textContent;


            if (currentValue === previousValue) {
                return;
            }


            element.classList.add(
                "number-changing"
            );


            setTimeout(() => {

                element.classList.remove(
                    "number-changing"
                );

            }, 220);


            previousValue =
                currentValue;

        });


    observer.observe(
        element,
        {
            childList: true,
            characterData: true,
            subtree: true
        }
    );

});

/* ==========================================
   CURSOR REACTIVE LETTER SYSTEM
========================================== */

function splitIntoLetters(element) {

    /*
     * If it contains .react-word elements,
     * process each word separately.
     */

    const words =
        element.querySelectorAll(".react-word");


    if (words.length > 0) {

        words.forEach((word) => {

            const text =
                word.textContent;


            word.textContent = "";


            [...text].forEach((character) => {

                const span =
                    document.createElement("span");


                span.className =
                    "react-letter";


                span.textContent =
                    character;


                word.appendChild(span);

            });

        });

        return;
    }


    /*
     * Normal text like eyebrow/subtitle
     */

    const text =
        element.textContent;


    element.textContent = "";


    [...text].forEach((character) => {

        if (character === " ") {

            const space =
                document.createElement("span");


            space.innerHTML =
                "&nbsp;";


            space.className =
                "react-letter";


            element.appendChild(space);

            return;
        }


        const span =
            document.createElement("span");


        span.className =
            "react-letter";


        span.textContent =
            character;


        element.appendChild(span);

    });

}


/* Elements we want reactive */

const reactiveTextElements =
    document.querySelectorAll(
        ".cursor-react-text, " +
        ".cursor-react-small, " +
        ".cursor-react-subtitle"
    );


reactiveTextElements.forEach(
    splitIntoLetters
);


/* ==========================================
   DISTANCE-BASED LETTER MOTION
========================================== */

if (supportsFinePointer) {

    const letters =
        document.querySelectorAll(
            ".react-letter"
        );


    document.addEventListener(
        "mousemove",
        (event) => {

            letters.forEach((letter) => {

                const rect =
                    letter.getBoundingClientRect();


                const centerX =
                    rect.left +
                    rect.width / 2;


                const centerY =
                    rect.top +
                    rect.height / 2;


                const deltaX =
                    event.clientX -
                    centerX;


                const deltaY =
                    event.clientY -
                    centerY;


                const distance =
                    Math.sqrt(
                        deltaX * deltaX +
                        deltaY * deltaY
                    );


                /*
                 * Radius in which letters react.
                 */

                const radius = 115;


                if (distance < radius) {

                    const strength =
                        1 -
                        distance / radius;


                    /*
                     * Main vertical lift
                     */

                    const lift =
                        strength * -11;


                    /*
                     * Tiny sideways movement
                     * toward cursor.
                     */

                    const horizontal =
                        (deltaX / radius) *
                        strength *
                        2;


                    /*
                     * Very subtle scale.
                     */

                    const scale =
                        1 +
                        strength * 0.055;


                    letter.style.transform =
                        `
                        translate3d(
                            ${horizontal}px,
                            ${lift}px,
                            0
                        )
                        scale(${scale})
                        `;


                    /*
                     * Nearby letters become
                     * slightly brighter/sharper.
                     */

                    letter.style.opacity =
                        0.88 +
                        strength * 0.12;


                    letter.style.filter =
                        `
                        brightness(
                            ${1 + strength * 0.18}
                        )
                        `;

                } else {

                    letter.style.transform =
                        "translate3d(0, 0, 0) scale(1)";


                    letter.style.opacity =
                        "1";


                    letter.style.filter =
                        "brightness(1)";

                }

            });

        }
    );

}

/* ==========================================
   GOLD METALLIC CURSOR REFLECTION
========================================== */

const goldWord =
    document.querySelector(".gold-word");


if (goldWord && supportsFinePointer) {

    goldWord.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                goldWord.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            const percentage =
                (x / rect.width) * 100;


            goldWord.style.setProperty(
                "--shine-x",
                `${percentage}%`
            );

        }
    );


    goldWord.addEventListener(
        "mouseleave",
        () => {

            goldWord.style.setProperty(
                "--shine-x",
                "50%"
            );

        }
    );

}
