document.addEventListener("DOMContentLoaded", () => {
    // Révélation des données censurées au clic
    const redactedElements = document.querySelectorAll(".redacted");
    redactedElements.forEach(el => {
        el.title = "Cliquer pour déclassifier temporairement";
        el.addEventListener("click", () => {
            el.classList.toggle("revealed");
        });
    });

    // Horloge temps réel SCiPNET
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
