// Team setup & roster import logic — Phase 4

// Team setup & roster import logic — Phase 4
(function () {
    const teamNameInput = document.getElementById('team-name');
    const seasonSelect = document.getElementById('season-select');
    const uploadZone = document.getElementById('upload-zone');
    const screenshotFileInput = document.getElementById('screenshot-file');
    const csvFileInput = document.getElementById('roster-file');
    const csvLink = document.getElementById('csv-upload-link');
    const screenshotStatus = document.getElementById('screenshot-status');
    const rosterPreview = document.getElementById('roster-preview');
    const rosterTbody = document.querySelector('#roster-table tbody');
    const continueBtn = document.getElementById('continue-dashboard-btn');

    let pendingRoster = [];

    // ===== Screenshot Upload (primary) =====
    uploadZone.addEventListener('click', () => screenshotFileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#9200e6';
        uploadZone.style.background = 'rgba(146, 0, 230, 0.05)';
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = '';
        uploadZone.style.background = '';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '';
        uploadZone.style.background = '';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processScreenshot(file);
        }
    });

    screenshotFileInput.addEventListener('change', () => {
        if (screenshotFileInput.files[0]) {
            processScreenshot(screenshotFileInput.files[0]);
        }
    });

    async function processScreenshot(file) {
        screenshotStatus.textContent = 'Analyzing roster screenshot...';
        screenshotStatus.className = 'screenshot-status loading';

        const { players, error } = await parseRosterFromScreenshot(file, ENV.GROQ_API_KEY, appState.sport);

        if (error) {
            screenshotStatus.textContent = error.message;
            screenshotStatus.className = 'screenshot-status error';
            return;
        }

        if (players.length === 0) {
            screenshotStatus.textContent = 'No players found. Try a clearer screenshot.';
            screenshotStatus.className = 'screenshot-status error';
            return;
        }

        screenshotStatus.textContent = `Found ${players.length} player${players.length !== 1 ? 's' : ''}!`;
        screenshotStatus.className = 'screenshot-status success';
        loadRosterPreview(players);
    }

    // ===== CSV Upload (secondary) =====
    csvLink.addEventListener('click', (e) => {
        e.preventDefault();
        csvFileInput.click();
    });

    csvFileInput.addEventListener('change', () => {
        if (csvFileInput.files[0]) parseCSV(csvFileInput.files[0]);
    });

    function parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const lines = e.target.result.split('\n').filter(l => l.trim());
            const players = [];
            const start = /^name/i.test(lines[0]) ? 1 : 0;
            for (let i = start; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                if (!cols[0]) continue;
                players.push({
                    name: cols[0] || '',
                    number: (cols[1] || '').replace(/[^\d]/g, ''),
                    position: cols[2] || '',
                    grade: cols[3] || '',
                });
            }
            loadRosterPreview(players);
        };
        reader.readAsText(file);
    }

    // ===== Roster Preview =====
    function loadRosterPreview(players) {
        pendingRoster = players;
        renderRosterTable();
        rosterPreview.classList.remove('hidden');
        validateForm();
    }

    function renderRosterTable() {
        rosterTbody.innerHTML = '';
        pendingRoster.forEach((p, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(p.name)}</td>
                <td>${escapeHtml(p.number)}</td>
                <td>${escapeHtml(p.position)}</td>
                <td>${escapeHtml(p.grade)}</td>
                <td><button class="remove-btn" data-idx="${i}">&times;</button></td>
            `;
            rosterTbody.appendChild(tr);
        });

        rosterTbody.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                pendingRoster.splice(Number(btn.dataset.idx), 1);
                renderRosterTable();
                if (pendingRoster.length === 0) rosterPreview.classList.add('hidden');
                validateForm();
            });
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ===== Form Validation =====
    teamNameInput.addEventListener('input', validateForm);
    seasonSelect.addEventListener('change', validateForm);

    function validateForm() {
        const valid = teamNameInput.value.trim() &&
            seasonSelect.value &&
            pendingRoster.length > 0;
        continueBtn.disabled = !valid;
    }

    // ===== Continue to Dashboard =====
    continueBtn.addEventListener('click', () => {
        appState.teamName = teamNameInput.value.trim();
        appState.season = seasonSelect.value;
        appState.roster = pendingRoster;
        saveState();

        document.getElementById('dashboard-team-name').textContent = appState.teamName;
        document.getElementById('dashboard-sport-badge').textContent = appState.sport;

        showNav();
        showScreen('screen-dashboard');
    });
})();
