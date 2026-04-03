// ===== Supabase Client =====
const supabaseClient = window.supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
// Use supabaseClient everywhere to avoid conflict with the CDN's global 'supabase'

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
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        appState = {
            user: null, sport: null, teamName: '', season: '',
            roster: [], games: [], opponents: []
        };
        hideNav();
        showScreen('screen-auth');
    });
}

// ===== Save / Load State (Supabase) =====
async function saveState() {
    // Always keep localStorage as a fast cache
    localStorage.setItem('statEdgeData', JSON.stringify(appState));

    // Sync to Supabase if logged in
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        await supabaseClient.from('user_profiles').upsert({
            id: user.id,
            email: user.email,
            sport: appState.sport,
            team_name: appState.teamName,
            season: appState.season,
            roster: appState.roster,
            games: appState.games,
            opponents: appState.opponents,
            updated_at: new Date().toISOString()
        });
    }
}

async function loadState() {
    // Try loading from Supabase first
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        const { data } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            appState.user = data.email;
            appState.sport = data.sport;
            appState.teamName = data.team_name || '';
            appState.season = data.season || '';
            appState.roster = data.roster || [];
            appState.games = data.games || [];
            appState.opponents = data.opponents || [];
            localStorage.setItem('statEdgeData', JSON.stringify(appState));
            return;
        }
    }

    // Fall back to localStorage cache
    const saved = localStorage.getItem('statEdgeData');
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch (e) {
            localStorage.removeItem('statEdgeData');
        }
    }
}

// ===== Handle session and route user to correct screen =====
async function routeUser() {
    await loadState();

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        appState.user = session.user.email;
        if (appState.sport && appState.teamName) {
            showNav();
            document.getElementById('dashboard-team-name').textContent = appState.teamName;
            document.getElementById('dashboard-sport-badge').textContent = appState.sport;
            showScreen('screen-dashboard');
        } else {
            showNav();
            showScreen('screen-sport');
        }
    } else {
        showScreen('screen-auth');
    }
}

// ===== Init on Page Load =====
document.addEventListener('DOMContentLoaded', async () => {
    initDashboardTabs();
    initLogout();

    // Listen for auth state changes (handles OAuth redirect, sign in, sign out)
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            appState.user = session.user.email;
            await loadState();
            appState.user = session.user.email;
            showNav();

            if (appState.sport && appState.teamName) {
                document.getElementById('dashboard-team-name').textContent = appState.teamName;
                document.getElementById('dashboard-sport-badge').textContent = appState.sport;
                showScreen('screen-dashboard');
            } else {
                showScreen('screen-sport');
            }
        } else if (event === 'SIGNED_OUT') {
            appState = {
                user: null, sport: null, teamName: '', season: '',
                roster: [], games: [], opponents: []
            };
            hideNav();
            showScreen('screen-auth');
        }
    });

    // Initial route on page load
    await routeUser();
});
