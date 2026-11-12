document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. AUTHENTIFICATION INITIALE (Terminal SCiPNET)
    // ----------------------------------------------------
    const STORAGE_KEY = "site_lazare_agent_name";
    const savedName = localStorage.getItem(STORAGE_KEY);

    const leetMap = {
        '0': 'o', '1': 'i', '!': 'i', '|': 'i', 'l': 'i', '2': 'z',
        '3': 'e', '€': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's',
        '7': 't', '+': 't', '8': 'b', '9': 'g', 'v': 'u'
    };

    const bannedRadicals = [
        "caca", "pipi", "prout", "merd", "chier", "chiot", "salop", "pute", 
        "putin", "putain", "connard", "connas", "encul", "niqu", "batard", 
        "fdp", "ntm", "bite", "couill", "chatte", "clito", "bitch", "shit", 
        "fuck", "dick", "asshole", "nigger", "hitler", "nazi"
    ];
    const isolatedBanned = ["con", "cons", "cul", "culs", "pd"];

    function checkForbiddenName(rawInput) {
        if (!/^[a-zA-Z0-9\s\-_.']+$/.test(rawInput)) {
            return { forbidden: true, reason: "Caractères spéciaux ou emojis non autorisés." };
        }
        let cleaned = rawInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        cleaned = cleaned.replace(/f[\s._-]*2[\s._-]*p/g, "fdp")
                         .replace(/fils[\s._-]*de[\s._-]*pute/g, "fdp")
                         .replace(/nique[\s._-]*ta[\s._-]*mere/g, "ntm")
                         .replace(/ph/g, "f");

        let decoded = "";
        for (let char of cleaned) decoded += leetMap[char] || char;

        const condensed = decoded.replace(/[^a-z0-9]/g, "");
        const deduped = condensed.replace(/(.)\1+/g, "$1");

        for (let bad of bannedRadicals) {
            if (condensed.includes(bad) || deduped.includes(bad)) {
                return { forbidden: true, reason: "Identifiant non conforme aux protocoles." };
            }
        }
        for (let word of decoded.split(/[\s._-]+/)) {
            if (isolatedBanned.includes(word)) {
                return { forbidden: true, reason: "Identifiant non conforme aux protocoles." };
            }
        }
        return { forbidden: false };
    }

    function displayUserHeader(name) {
        const headerBrand = document.querySelector(".brand p");
        if (headerBrand) {
            headerBrand.innerHTML = `Opérateur : <strong style="color:var(--ice-pale);">${name}</strong> • <a href="#" id="btn-logout" style="color:var(--alert-amber); font-size:0.75rem; margin-left:8px;">[Déconnexion]</a>`;
            document.getElementById("btn-logout").addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Réinitialiser votre session ?")) {
                    localStorage.removeItem(STORAGE_KEY);
                    location.reload();
                }
            });
        }
    }

    if (savedName) {
        displayUserHeader(savedName);
    } else {
        createMainTerminal();
    }

    function createMainTerminal() {
        const overlay = document.createElement("div");
        overlay.id = "terminal-overlay";
        overlay.innerHTML = `
            <div class="scip-terminal">
                <div class="scip-header">
                    <div class="scip-status"><span class="scip-dot"></span> SCiPNET MAINFRAME // GATEWAY</div>
                    <div class="scip-tag">SITE-LAZARE</div>
                </div>
                <div class="scip-screen">
                    <p class="scip-dim">[SYSTÈME] Nœud de communication Site Lazare : CONNECTÉ</p>
                    <p class="scip-warning">AVERTISSEMENT : Connexion enregistrée sous protocole de sécurité.</p>
                    <br><p>Veuillez saisir votre désignation ou matricule :</p>
                    <div class="scip-input-row">
                        <span class="scip-prompt">[SCiPNET://AUTH] &gt;</span>
                        <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" autofocus />
                    </div>
                    <div id="terminal-error" class="scip-error"></div>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const input = document.getElementById("terminal-input");
        const error = document.getElementById("terminal-error");

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = input.value.trim();
                if (val.length < 3 || val.length > 20) {
                    error.textContent = "ERREUR : La désignation doit comporter entre 3 et 20 caractères.";
                    return;
                }
                const test = checkForbiddenName(val);
                if (test.forbidden) {
                    error.textContent = `ACCÈS REFUSÉ : ${test.reason}`;
                    input.value = "";
                    return;
                }
                error.style.color = "#4ade80";
                error.textContent = `Accès autorisé pour : ${val}...`;
                localStorage.setItem(STORAGE_KEY, val);
                setTimeout(() => {
                    overlay.style.opacity = "0";
                    setTimeout(() => { overlay.remove(); displayUserHeader(val); }, 400);
                }, 800);
            }
        });
    }

    // ----------------------------------------------------
    // 2. VERROUILLAGE DU SECTEUR-00 (CODE : Lazar)
    // ----------------------------------------------------
    const s00Gate = document.getElementById("secteur00-gate");
    const s00Content = document.getElementById("secteur00-content");
    if (s00Gate && s00Content) {
        const s00Input = document.getElementById("s00-password");
        const s00Error = document.getElementById("s00-error");

        s00Input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                if (s00Input.value.trim() === "Lazar") {
                    s00Error.style.color = "#4ade80";
                    s00Error.textContent = "ACCÈS AUTORISÉ // DÉCHIFFREMENT EN COURS...";
                    setTimeout(() => {
                        s00Gate.style.display = "none";
                        s00Content.style.display = "block";
                    }, 800);
                } else {
                    s00Error.style.color = "var(--alert-red)";
                    s00Error.textContent = "CODE D'ACCÈS INVALIDE // TENTATIVE ENREGISTRÉE.";
                    s00Input.value = "";
                }
            }
        });
    }

    // ----------------------------------------------------
    // 3. TERMINAL CONSEIL O5 (EFFECTIFS)
    // ----------------------------------------------------
    window.openO5Terminal = function() {
        const overlay = document.createElement("div");
        overlay.id = "o5-overlay";
        overlay.innerHTML = `
            <div class="scip-terminal" style="border-color: var(--alert-red);">
                <div class="scip-header" style="background:#1a0507; border-color:var(--alert-red);">
                    <div class="scip-status" style="color:var(--alert-red);"><span class="scip-dot" style="background:var(--alert-red); box-shadow:0 0 8px var(--alert-red);"></span> CONSEIL O5 // TERMINAL RESTREINT</div>
                    <div class="scip-tag" style="border-color:var(--alert-red); color:var(--alert-red);">NIVEAU 5 EXCLUSIF</div>
                </div>
                <div class="scip-screen">
                    <p style="color:var(--alert-red); font-weight:bold;">ATTENTION : CE TERMINAL EST PLACÉ SOUS PROTOCOLE DE SUPRÉMATIE O5.</p>
                    <p class="scip-dim">L'accès requiert une clé cryptographique quantique synchrone.</p>
                    <br>
                    <div class="scip-input-row" style="border-left-color: var(--alert-red);">
                        <span class="scip-prompt" style="color:var(--alert-red);">[O5-SECURENET] &gt;</span>
                        <input type="password" id="o5-input" placeholder="Clé quantique..." autocomplete="off" spellcheck="false" autofocus />
                    </div>
                    <div id="o5-msg" class="scip-error" style="color:var(--alert-amber);">En attente de configuration par le Haut Commandement.</div>
                    <button class="btn-action" style="margin-top:15px; background:#222; border:1px solid #444;" onclick="this.closest('#o5-overlay').remove()">Fermer la passerelle</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        const input = document.getElementById("o5-input");
        input.focus();
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                document.getElementById("o5-msg").textContent = "ACCÈS REFUSÉ : Aucun identifiant O5 n'est enregistré sur ce sous-réseau.";
                document.getElementById("o5-msg").style.color = "var(--alert-red)";
                input.value = "";
            }
        });
    };

    // ----------------------------------------------------
    // 4. PROTOCOLES CLASSIQUES RP (Censure & Horloge)
    // ----------------------------------------------------
    document.querySelectorAll(".redacted").forEach(el => {
        el.title = "Cliquer pour déclassifier";
        el.addEventListener("click", () => el.classList.toggle("revealed"));
    });

    const clockEl = document.getElementById("terminal-time");
    if (clockEl) {
        setInterval(() => {
            clockEl.textContent = new Date().toUTCString().replace("GMT", "UTC-Z");
        }, 1000);
    }
});
