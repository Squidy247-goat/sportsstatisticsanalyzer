// Sport selection logic — Phase 3
(function () {
    document.querySelectorAll('.sport-card').forEach(card => {
        card.addEventListener('click', () => {
            const sport = card.dataset.sport;
            appState.sport = sport;
            saveState();
            showScreen('screen-setup');
        });
    });
})();
