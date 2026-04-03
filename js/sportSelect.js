// Sport selection logic — Phase 3
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sport-card').forEach(card => {
        card.addEventListener('click', async () => {
            appState.sport = card.dataset.sport;
            await saveState();
            showScreen('screen-setup');
        });
    });
});
