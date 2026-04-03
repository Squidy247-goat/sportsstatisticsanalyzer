// Dashboard logic — Phase 5

function renderDashboardRoster() {
    const tbody = document.querySelector('#dashboard-roster-table tbody');
    const countEl = document.getElementById('roster-count');
    const roster = appState.roster || [];

    tbody.innerHTML = '';
    countEl.textContent = roster.length + ' player' + (roster.length !== 1 ? 's' : '');

    if (roster.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#484f58;padding:2rem;">No players on roster yet.</td></tr>';
        return;
    }

    roster.forEach((p, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeRoster(p.number) || '—'}</td>
            <td>${escapeRoster(p.name) || ''}</td>
            <td>${escapeRoster(p.position) || '—'}</td>
            <td>${escapeRoster(p.grade) || '—'}</td>
            <td class="roster-actions">
                <button class="roster-edit-btn" data-idx="${i}" title="Edit player">&#9998;</button>
                <button class="roster-delete-btn" data-idx="${i}" title="Remove player">&times;</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Edit buttons
    tbody.querySelectorAll('.roster-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editRosterPlayer(Number(btn.dataset.idx)));
    });

    // Delete buttons
    tbody.querySelectorAll('.roster-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            appState.roster.splice(Number(btn.dataset.idx), 1);
            await saveState();
            renderDashboardRoster();
        });
    });
}

function editRosterPlayer(idx) {
    const p = appState.roster[idx];
    const tbody = document.querySelector('#dashboard-roster-table tbody');
    const row = tbody.children[idx];

    row.innerHTML = `
        <td><input class="roster-edit-input" data-field="number" value="${escapeRoster(p.number)}" placeholder="#"></td>
        <td><input class="roster-edit-input" data-field="name" value="${escapeRoster(p.name)}" placeholder="Name"></td>
        <td><input class="roster-edit-input" data-field="position" value="${escapeRoster(p.position)}" placeholder="Pos"></td>
        <td><input class="roster-edit-input" data-field="grade" value="${escapeRoster(p.grade)}" placeholder="Grade"></td>
        <td class="roster-actions">
            <button class="roster-save-btn" title="Save">&#10003;</button>
            <button class="roster-cancel-btn" title="Cancel">&#10007;</button>
        </td>
    `;

    row.querySelector('.roster-save-btn').addEventListener('click', async () => {
        row.querySelectorAll('.roster-edit-input').forEach(input => {
            appState.roster[idx][input.dataset.field] = input.value.trim();
        });
        await saveState();
        renderDashboardRoster();
    });

    row.querySelector('.roster-cancel-btn').addEventListener('click', () => {
        renderDashboardRoster();
    });

    // Focus the name field
    row.querySelector('[data-field="name"]').focus();
}

function addRosterPlayer() {
    const tbody = document.querySelector('#dashboard-roster-table tbody');

    // Remove "no players" message if present
    if (appState.roster.length === 0) {
        tbody.innerHTML = '';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input class="roster-edit-input" data-field="number" placeholder="#"></td>
        <td><input class="roster-edit-input" data-field="name" placeholder="Name"></td>
        <td><input class="roster-edit-input" data-field="position" placeholder="Position"></td>
        <td><input class="roster-edit-input" data-field="grade" placeholder="Grade"></td>
        <td class="roster-actions">
            <button class="roster-save-btn" title="Save">&#10003;</button>
            <button class="roster-cancel-btn" title="Cancel">&#10007;</button>
        </td>
    `;
    tbody.appendChild(tr);

    tr.querySelector('.roster-save-btn').addEventListener('click', async () => {
        const player = {};
        tr.querySelectorAll('.roster-edit-input').forEach(input => {
            player[input.dataset.field] = input.value.trim();
        });
        if (!player.name) {
            tr.querySelector('[data-field="name"]').style.borderColor = '#f85149';
            return;
        }
        appState.roster.push(player);
        await saveState();
        renderDashboardRoster();
    });

    tr.querySelector('.roster-cancel-btn').addEventListener('click', () => {
        renderDashboardRoster();
    });

    tr.querySelector('[data-field="name"]').focus();
}

function escapeRoster(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Wire up Add Player button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-player-btn').addEventListener('click', addRosterPlayer);
});
