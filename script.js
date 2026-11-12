document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. GESTION DU TERMINAL & FILTRE ANTI-CONTOURNEMENT
    // ----------------------------------------------------
    const STORAGE_KEY = "site_lazare_agent_name";
    const savedName = localStorage.getItem(STORAGE_KEY);

    // Dictionnaire Leet Speak (remplacement des faux caractères)
    const leetMap = {
        '0': 'o',
        '1': 'i', '!': 'i', '|': 'i', 'l': 'i',
        '2': 'z',
        '3': 'e', '€': 'e',
        '4': 'a', '@': 'a',
        '5': 's', '$': 's',
        '7': 't', '+': 't',
        '8': 'b',
        '9': 'g',
        'v': 'u' // ex: pvt@in -> putain
    };

    // Racines de mots strictement interdites (même cachées dans un mot)
    const bannedRadicals = [
        "caca", "pipi", "prout", "merd", "chier", "chiot",
        "salop", "pute", "putin", "putain", "connard", "connas",
        "encul", "niqu", "batard", "fdp", "ntm", "bite", "couill",
        "chatte", "clito", "bitch", "shit", "fuck", "dick",
        "asshole", "nigger", "hitler", "nazi"
    ];

    // Mots courts interdits uniquement lorsqu'ils sont isolés (évite les faux positifs comme "contact")
    const isolatedBanned = ["con", "cons", "cul", "culs", "pd"];

    // Fonction de nettoyage et de détection poussée
    function checkForbiddenName(rawInput) {
        // 1. Vérification des caractères autorisés : Lettres, Chiffres, tiret, espace, underscore, point
        // Bloque immédiatement les emojis et symboles non conformes
        const validCharsRegex = /^[a-zA-Z0-9\s\-_.']+$/;
        if (!validCharsRegex.test(rawInput)) {
            return { forbidden: true, reason: "Caractères non autorisés (symboles ou emojis interdits)." };
        }

        // 2. Normalisation de base (minuscules + retrait des accents)
        let cleaned = rawInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 3. Traduction des feintes phonétiques courantes (ex: F2P -> FDP)
        cleaned = cleaned.replace(/f[\s._-]*2[\s._-]*p/g, "fdp");
        cleaned = cleaned.replace(/fils[\s._-]*de[\s._-]*pute/g, "fdp");
        cleaned = cleaned.replace(/nique[\s._-]*ta[\s._-]*mere/g, "ntm");
        cleaned = cleaned.replace(/ph/g, "f");

        // 4. Décodage du Leet Speak (@ -> a, 1 -> i, 3 -> e...)
        let decoded = "";
        for (let char of cleaned) {
            decoded += leetMap[char] || char;
        }

        // 5. Création de deux variantes :
        // Variante A : Condensée sans espaces ni séparateurs (ex: "f.d.p" -> "fdp", "c a c a" -> "caca")
        const condensed = decoded.replace(/[^a-z0-9]/g, "");

        // Variante B : Réduction des lettres répétées (ex: "caaaaaca" -> "caca", "piiiipi" -> "pipi")
        const deduped = condensed.replace(/(.)\1+/g, "$1");

        // 6. Test sur les radicaux interdits
        for (let bad of bannedRadicals) {
            if (condensed.includes(bad) || deduped.includes(bad)) {
                return { forbidden: true, reason: "Identifiant non conforme aux directives de la Fondation." };
            }
        }

        // 7. Test sur les mots courts isolés
        const words = decoded.split(/[\s._-]+/);
        for (let word of words) {
            if (isolatedBanned.includes(word)) {
                return { forbidden: true, reason: "Identifiant non conforme aux directives de la Fondation." };
            }
        }

        return { forbidden: false };
    }

    // Affichage du nom dans l'en-tête
    function displayUserHeader(name) {
        const headerBrand = document.querySelector(".brand p");
        if (headerBrand) {
            headerBrand.innerHTML = `Opérateur connecté : <strong style="color:var(--ice-pale);">${name}</strong> • <a href="#" id="btn-logout" style="color:var(--alert-amber); text-decoration:underline; font-size:0.75rem; margin-left:8px;">[Déconnexion]</a>`;
            
            document.getElementById("btn-logout").addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Voulez-vous réinitialiser votre session et changer d'identifiant ?")) {
                    localStorage.removeItem(STORAGE_KEY);
                    location.reload();
                }
            });
        }
    }

    // Vérification de la session
    if (savedName) {
        displayUserHeader(savedName);
    } else {
        createTerminalWindow();
    }

    function createTerminalWindow() {
        const overlay = document.createElement("div");
        overlay.id = "terminal-overlay";
        overlay.innerHTML = `
            <div class="cmd-window">
                <div class="cmd-titlebar">
                    <div class="cmd-title">
                        <span class="cmd-icon">C:\\_</span> Invite de commandes - SCiPNET SecureBoot
                    </div>
                    <div class="cmd-controls">
                        <span>—</span>
                        <span>□</span>
                        <span class="cmd-close">✕</span>
                    </div>
                </div>
                <div class="cmd-body" id="cmd-body">
                    <p>Microsoft Windows [version 10.0.19045.3803]</p>
                    <p>(c) Fondation SCP Corporation. Tous droits réservés.</p>
                    <br>
                    <p>C:\\SCiPNET\\Site-Lazare> init_session.exe --auth-required</p>
                    <p style="color: #60a5fa;">[SYSTÈME CENTRAL - RESTREINT AU PERSONNEL]</p>
                    <p>Veuillez entrer votre nom opérationnel ou matricule :</p>
                    <br>
                    <div class="cmd-line">
                        <span class="cmd-prompt">C:\\SCiPNET\\Site-Lazare\\Auth&gt;</span>
                        <input type="text" id="cmd-input" autocomplete="off" spellcheck="false" autofocus />
                    </div>
                    <p id="cmd-error" class="cmd-error"></p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById("cmd-input");
        const error = document.getElementById("cmd-error");
        input.focus();

        document.querySelector(".cmd-window").addEventListener("click", () => {
            input.focus();
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = input.value.trim();

                // Validation : Longueur
                if (val.length < 3) {
                    error.textContent = "ERREUR : L'identifiant doit comporter au moins 3 caractères.";
                    return;
                }
                if (val.length > 20) {
                    error.textContent = "ERREUR : L'identifiant ne peut excéder 20 caractères.";
                    return;
                }

                // Validation via le filtre poussé
                const testResult = checkForbiddenName(val);
                if (testResult.forbidden) {
                    error.textContent = `ACCÈS REFUSÉ : ${testResult.reason}`;
                    input.value = "";
                    return;
                }

                // Si tout est valide
                error.style.color = "#4ade80";
                error.textContent = `Identifiant validé. Initialisation de la session pour l'Agent ${val}...`;
                input.disabled = true;

                localStorage.setItem(STORAGE_KEY, val);

                setTimeout(() => {
                    overlay.style.transition = "opacity 0.4s ease";
                    overlay.style.opacity = "0";
                    setTimeout(() => {
                        overlay.remove();
                        displayUserHeader(val);
                    }, 400);
                }, 1000);
            }
        });
    }

    // ----------------------------------------------------
    // 2. FONCTIONNALITÉS SCP RP (Censure & Horloge)
    // ----------------------------------------------------
    const redactedElements = document.querySelectorAll(".redacted");
    redactedElements.forEach(el => {
        el.title = "Cliquer pour déclassifier";
        el.addEventListener("click", () => {
            el.classList.toggle("revealed");
        });
    });

    const clockEl = document.getElementById("terminal-time");
    if (clockEl) {
        function updateClock() {
            const now = new Date();
            clockEl.textContent = now.toUTCString().replace("GMT", "UTC-Z");
        }
        setInterval(updateClock, 1000);
        updateClock();
    }
});
