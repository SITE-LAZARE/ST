document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. GESTION DU TERMINAL SCiPNET & FILTRE ANTI-TROLL
    // ----------------------------------------------------
    const STORAGE_KEY = "site_lazare_agent_name";
    const savedName = localStorage.getItem(STORAGE_KEY);

    // Dictionnaire Leet Speak (décodage des caractères rusés)
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
        'v': 'u'
    };

    // Mots et racines formellement interdits
    const bannedRadicals = [
        "caca", "pipi", "prout", "merd", "chier", "chiot",
        "salop", "pute", "putin", "putain", "connard", "connas",
        "encul", "niqu", "batard", "fdp", "ntm", "bite", "couill",
        "chatte", "clito", "bitch", "shit", "fuck", "dick",
        "asshole", "nigger", "hitler", "nazi"
    ];

    // Mots courts interdits lorsqu'ils sont isolés
    const isolatedBanned = ["con", "cons", "cul", "culs", "pd"];

    // Algorithme de filtrage multicouche
    function checkForbiddenName(rawInput) {
        // Bloque immédiatement les symboles étranges et emojis
        const validCharsRegex = /^[a-zA-Z0-9\s\-_.']+$/;
        if (!validCharsRegex.test(rawInput)) {
            return { forbidden: true, reason: "Symboles, caractères spéciaux ou emojis non autorisés." };
        }

        // Nettoyage de base (minuscules sans accents)
        let cleaned = rawInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Remplacement phonétique (ex: F2P -> FDP)
        cleaned = cleaned.replace(/f[\s._-]*2[\s._-]*p/g, "fdp");
        cleaned = cleaned.replace(/fils[\s._-]*de[\s._-]*pute/g, "fdp");
        cleaned = cleaned.replace(/nique[\s._-]*ta[\s._-]*mere/g, "ntm");
        cleaned = cleaned.replace(/ph/g, "f");

        // Décodage du Leet Speak
        let decoded = "";
        for (let char of cleaned) {
            decoded += leetMap[char] || char;
        }

        // Condensation sans espaces ni séparateurs
        const condensed = decoded.replace(/[^a-z0-9]/g, "");

        // Réduction des répétitions multiples (ex: caaaaaca -> caca)
        const deduped = condensed.replace(/(.)\1+/g, "$1");

        // Analyse des racines
        for (let bad of bannedRadicals) {
            if (condensed.includes(bad) || deduped.includes(bad)) {
                return { forbidden: true, reason: "Identifiant non conforme aux protocoles de sécurité." };
            }
        }

        // Analyse des termes isolés
        const words = decoded.split(/[\s._-]+/);
        for (let word of words) {
            if (isolatedBanned.includes(word)) {
                return { forbidden: true, reason: "Identifiant non conforme aux protocoles de sécurité." };
            }
        }

        return { forbidden: false };
    }

    // Affichage de l'identité dans l'en-tête
    function displayUserHeader(name) {
        const headerBrand = document.querySelector(".brand p");
        if (headerBrand) {
            headerBrand.innerHTML = `Opérateur connecté : <strong style="color:var(--ice-pale);">${name}</strong> • <a href="#" id="btn-logout" style="color:var(--alert-amber); text-decoration:underline; font-size:0.75rem; margin-left:8px;">[Déconnexion]</a>`;
            
            document.getElementById("btn-logout").addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Voulez-vous clôturer cette session et changer de matricule ?")) {
                    localStorage.removeItem(STORAGE_KEY);
                    location.reload();
                }
            });
        }
    }

    // Gestion de la persistance
    if (savedName) {
        displayUserHeader(savedName);
    } else {
        createTerminalWindow();
    }

    function createTerminalWindow() {
        const overlay = document.createElement("div");
        overlay.id = "terminal-overlay";
        overlay.innerHTML = `
            <div class="scip-terminal">
                <div class="scip-header">
                    <div class="scip-status">
                        <span class="scip-dot"></span>
                        <span>SCiPNET MAINFRAME // GATEWAY-01</span>
                    </div>
                    <div class="scip-tag">SITE-LAZARE // SÉCURISÉ</div>
                </div>
                <div class="scip-screen">
                    <div class="scip-log">
                        <p class="scip-dim">[SYSTÈME] Initialisation de la passerelle quantique v4.81...</p>
                        <p class="scip-dim">[SYSTÈME] Nœud de communication Site Lazare : CONNECTÉ</p>
                        <p class="scip-dim">[SYSTÈME] Intégrité du confinement Secteur-00 : SCELLÉ (ORDRE O5)</p>
                        <p class="scip-warning">AVERTISSEMENT : Toute tentative de connexion frauduleuse sera interceptée par la RRT.</p>
                        <br>
                        <p style="color:#d8e6fb;">Veuillez saisir votre désignation opérationnelle ou matricule :</p>
                    </div>
                    
                    <div class="scip-input-row">
                        <span class="scip-prompt">[SCiPNET://LAZARE-AUTH] &gt;</span>
                        <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" autofocus />
                    </div>

                    <div id="terminal-error" class="scip-error"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById("terminal-input");
        const error = document.getElementById("terminal-error");
        input.focus();

        document.querySelector(".scip-terminal").addEventListener("click", () => {
            input.focus();
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = input.value.trim();

                // Validation Longueur
                if (val.length < 3) {
                    error.textContent = "ERREUR : La désignation doit comporter au moins 3 caractères.";
                    return;
                }
                if (val.length > 20) {
                    error.textContent = "ERREUR : La désignation ne peut excéder 20 caractères.";
                    return;
                }

                // Validation Filtre
                const check = checkForbiddenName(val);
                if (check.forbidden) {
                    error.textContent = `ACCÈS REJETÉ : ${check.reason}`;
                    input.value = "";
                    return;
                }

                // Succès
                error.style.color = "#4ade80";
                error.textContent = `Accréditation validée. Ouverture des terminaux pour : ${val}...`;
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
    // 2. SCRIPTS GLOBAUX RP
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
