// ===== Global App State =====
let appState = {
    user: null,          // logged-in user email
    sport: null,         // 'soccer' or 'football'
    teamName: '',
    season: '',
    roster: [],          // array of { name, number, position, grade }
    games: [],           // array of game objects
    opponents: []        // array of opponent objects
};

// ===== Screen Navigation =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showNav() {
    document.getElementById('nav-bar').classList.add('visible');
}

function hideNav() {
    document.getElementById('nav-bar').classList.remove('visible');
}

// ===== Dashboard Tab Switching =====
function initDashboardTabs() {
    // Tab buttons inside the dashboard
    document.querySelectorAll('#dashboard-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Nav bar links also switch tabs
    document.querySelectorAll('#nav-bar .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            showScreen('screen-dashboard');
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('#dashboard-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update nav links
    document.querySelectorAll('#nav-bar .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.tab === tabName);
    });

    // Show correct panel
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById('tab-' + tabName).classList.add('active');
}

// ===== Logout =====
function initLogout() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        appState.user = null;
        hideNav();
        showScreen('screen-auth');
    });
}

// ===== Save / Load State (localStorage) =====
function saveState() {
    localStorage.setItem('statEdgeData', JSON.stringify(appState));
}

function loadState() {
    const saved = localStorage.getItem('statEdgeData');
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch (e) {
            localStorage.removeItem('statEdgeData');
        }
    }
}

// ===== Init on Page Load =====
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initDashboardTabs();
    initLogout();

    // If user was previously logged in, restore their session
    if (appState.user && appState.sport && appState.teamName) {
        showNav();
        document.getElementById('dashboard-team-name').textContent = appState.teamName;
        document.getElementById('dashboard-sport-badge').textContent = appState.sport;
        showScreen('screen-dashboard');
    } else {
        showScreen('screen-auth');
    }
});
