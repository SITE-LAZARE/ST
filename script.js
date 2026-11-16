document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. SESSION AGENT & FILTRE ANTI-TROLL
    // ----------------------------------------------------
    const STORAGE_KEY = "site_lazare_agent";
    const savedAgent = localStorage.getItem(STORAGE_KEY);

    const leetMap = {
        '0': 'o', '1': 'i', '!': 'i', '|': 'i', '2': 'z', '3': 'e',
        '4': 'a', '@': 'a', '5': 's', '$': 's', '7': 't', '+': 't',
        '8': 'b', '9': 'g', 'v': 'u'
    };

    const bannedRadicals = [
        "caca", "pipi", "prout", "merd", "chier", "chiot", "salop", "pute", 
        "putin", "putain", "connard", "connas", "encul", "niqu", "batard", 
        "fdp", "ntm", "bite", "couill", "chatte", "clito", "bitch", "shit", 
        "fuck", "dick", "asshole", "nigger", "hitler", "nazi"
    ];

    function checkFilter(input) {
        if (!/^[a-zA-Z0-9\s\-_.']+$/.test(input)) {
            return { blocked: true, msg: "Caractères non autorisés (emojis/symboles interdits)." };
        }
        let clean = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        clean = clean.replace(/f[\s._-]*2[\s._-]*p/g, "fdp")
                     .replace(/fils[\s._-]*de[\s._-]*pute/g, "fdp")
                     .replace(/nique[\s._-]*ta[\s._-]*mere/g, "ntm");

        let decoded = "";
        for (let char of clean) decoded += leetMap[char] || char;
        const condensed = decoded.replace(/[^a-z0-9]/g, "");
        const deduped = condensed.replace(/(.)\1+/g, "$1");

        for (let rad of bannedRadicals) {
            if (condensed.includes(rad) || deduped.includes(rad)) {
                return { blocked: true, msg: "Identifiant non conforme aux protocoles de la Fondation." };
            }
        }
        return { blocked: false };
    }

    function initHeader(name) {
        const target = document.getElementById("agent-display");
        if (target) {
            target.innerHTML = `Agent : <strong>${name}</strong> • <a href="#" id="logout-btn" style="color:var(--alert-amber);">[Changer]</a>`;
            document.getElementById("logout-btn").addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Réinitialiser votre identifiant opérationnel ?")) {
                    localStorage.removeItem(STORAGE_KEY);
                    location.reload();
                }
            });
        }
    }

    if (savedAgent) {
        initHeader(savedAgent);
    } else {
        createLoginTerminal();
    }

    function createLoginTerminal() {
        const overlay = document.createElement("div");
        overlay.id = "terminal-overlay";
        overlay.innerHTML = `
            <div class="terminal-box">
                <div class="term-header">
                    <span>SCiPNET GATEWAY // AUTHENTIFICATION</span>
                    <span>SITE-LZ</span>
                </div>
                <div class="term-body">
                    <p style="color:var(--accent-ice);">[SYSTÈME CENTRAL - BOUCLIER CANADIEN]</p>
                    <p style="color:var(--text-muted); font-size:0.85rem;">Connexion requise pour consulter les archives départementales.</p>
                    <br>
                    <p>Saisissez votre matricule ou désignation RP :</p>
                    <div class="term-input-row">
                        <span style="color:var(--accent-glow);">&gt;</span>
                        <input type="text" id="auth-input" autocomplete="off" spellcheck="false" autofocus />
                    </div>
                    <div id="auth-err" class="term-error"></div>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const input = document.getElementById("auth-input");
        const err = document.getElementById("auth-err");

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = input.value.trim();
                if (val.length < 3 || val.length > 20) {
                    err.textContent = "L'identifiant doit contenir entre 3 et 20 caractères.";
                    return;
                }
                const test = checkFilter(val);
                if (test.blocked) {
                    err.textContent = test.msg;
                    input.value = "";
                    return;
                }
                err.style.color = "#4ade80";
                err.textContent = `Authentification acceptée pour : ${val}...`;
                localStorage.setItem(STORAGE_KEY, val);
                setTimeout(() => {
                    overlay.remove();
                    initHeader(val);
                }, 700);
            }
        });
    }

    // ----------------------------------------------------
    // 2. DÉVERROUILLAGE O5 (Code : LAZARE — Insensible à la casse)
    // ----------------------------------------------------
    const o5Gate = document.getElementById("o5-gate");
    const o5Vault = document.getElementById("o5-vault");
    if (o5Gate && o5Vault) {
        const o5Input = document.getElementById("o5-code-input");
        const o5Err = document.getElementById("o5-err-msg");

        o5Input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const entered = o5Input.value.trim().toUpperCase();
                if (entered === "LAZARE") {
                    o5Err.style.color = "#4ade80";
                    o5Err.textContent = "ACCÈS NIVEAU 5 CONFIRMÉ // DÉCHIFFREMENT DU CONSEIL EN COURS...";
                    setTimeout(() => {
                        o5Gate.style.display = "none";
                        o5Vault.style.display = "block";
                    }, 800);
                } else {
                    o5Err.style.color = "var(--alert-red)";
                    o5Err.textContent = "CLÉ INCORRECTE // TENTATIVE SIGNALÉE À L'ISD.";
                    o5Input.value = "";
                }
            }
        });
    }

    // ----------------------------------------------------
    // 3. CENSURE CLICABLE & HORLOGE SCiPNET
    // ----------------------------------------------------
    document.querySelectorAll(".redacted").forEach(el => {
        el.title = "Cliquer pour déclassifier";
        el.addEventListener("click", () => el.classList.toggle("revealed"));
    });

    const clock = document.getElementById("live-clock");
    if (clock) {
        setInterval(() => {
            clock.textContent = new Date().toUTCString().replace("GMT", "UTC-Z");
        }, 1000);
    }
});
