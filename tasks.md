# StatEdge — Task Breakdown

This file breaks down every component of the StatEdge app into manageable coding tasks.
Built with **HTML, CSS, and JavaScript** (no frameworks — just vanilla code).

Each task has a difficulty rating:
- **Easy** = Straightforward HTML/CSS, basic JS
- **Medium** = Some logic, event handling, data manipulation
- **Hard** = Complex algorithms, file parsing, data analysis

---

## Project Structure

```
sportsstatisticsanalyzer/
├── index.html              (Single-page app shell)
├── css/
│   └── styles.css          (All styles — dark theme + green accents)
├── js/
│   ├── app.js              (Page navigation / routing between screens)
│   ├── auth.js             (Sign In / Sign Up logic)
│   ├── sportSelect.js      (Sport selection screen)
│   ├── teamSetup.js        (Roster import + team config)
│   ├── dashboard.js        (Dashboard layout + tab switching)
│   ├── gameLog.js          (Game log CRUD + stat entry)
│   ├── seasonOverview.js   (Season stats + charts)
│   ├── shareLink.js        (Read-only link generator)
│   ├── mlInsights.js       (Pattern recognition + predictions)
│   ├── scouting.js         (Opponent scouting tracker)
│   └── tactics.js          (Tactical recommendation engine)
├── data/
│   └── sampleRoster.csv    (Sample CSV for testing imports)
└── tasks.md                (This file)
```

---

## Phase 1: Setup & Navigation Shell

### Task 1.1 — Create the HTML Shell (Easy)
**File:** `index.html`
**What to do:**
- Create a single HTML file with a `<div>` for each screen (auth, sport-select, team-setup, dashboard)
- Only one screen should be visible at a time (the rest get `display: none`)
- Add a `<nav>` bar at the top that shows after login (with links: Dashboard, Game Log, Season, Share, Insights, Scouting, Tactics)
- Include `<script>` tags for all your JS files at the bottom

**Key HTML ids to use:**
```
#screen-auth, #screen-sport, #screen-setup, #screen-dashboard
#nav-bar (hidden until logged in)
#dashboard-tabs (for switching between dashboard sections)
```

### Task 1.2 — Dark Theme Styling (Easy)
**File:** `css/styles.css`
**What to do:**
- Set background to dark (`#0d1117` or similar)
- Text color: white/light gray
- Accent color: green gradient (`linear-gradient(135deg, #1309cb, #9200e6)`)
- Style buttons with rounded corners, green gradient background, white text
- Style input fields with dark backgrounds and light borders
- Make the nav bar sticky at the top
- Add hover effects on buttons (slight glow or brightness change)

**CSS tips:**
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #0d1117; color: #e6edf3; }
```

### Task 1.3 — Page Navigation System (Easy)
**File:** `js/app.js`
**What to do:**
- Write a function `showScreen(screenId)` that hides all screens and shows the one with the matching id
- On page load, show `#screen-auth` by default
- When nav links are clicked, call `showScreen()` with the right id
- Store a global variable `appState` that tracks: logged-in user, selected sport, team name, roster, games

**Example:**
```js
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
```

---

## Phase 2: Authentication

### Task 2.1 — Auth Screen HTML (Easy)
**File:** `index.html` (inside `#screen-auth`)
**What to do:**
- Create a centered card with the StatEdge logo/title
- Add a toggle between "Sign In" and "Sign Up" (two buttons or tabs)
- Sign Up form: email, password, confirm password
- Sign In form: email, password
- Add a "Sign in with Google (simulated)" button
- Add a submit button for each form

### Task 2.2 — Auth Logic (Medium)
**File:** `js/auth.js`
**What to do:**
- Store users in `localStorage` as a JSON object (`{ email: password }`)
- **Sign Up:** Check if email already exists, check passwords match, save to localStorage
- **Sign In:** Check if email exists and password matches
- **Google Sign-In:** Simulate by auto-logging in with a fake Google account
- On successful login, show the nav bar and navigate to `#screen-sport`
- Show error messages (red text) for wrong password, existing user, etc.

**localStorage example:**
```js
// Save
localStorage.setItem('users', JSON.stringify(users));
// Load
let users = JSON.parse(localStorage.getItem('users')) || {};
```

---

## Phase 3: Sport Selection

### Task 3.1 — Sport Selection Screen (Easy)
**File:** `index.html` (inside `#screen-sport`) + `js/sportSelect.js`
**What to do:**
- Show two large clickable cards: **Soccer** and **Football**
- Each card should have an icon/emoji and the sport name
- When clicked, save the selected sport to `appState.sport` and navigate to `#screen-setup`

### Task 3.2 — Sport-Specific Data Definitions (Medium)
**File:** `js/sportSelect.js`
**What to do:**
- Define stat fields for each sport in a JS object:

```js
const SPORT_CONFIG = {
    soccer: {
        positions: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'],
        statFields: ['goals', 'assists', 'shots', 'passes', 'tackles', 'saves', 'minutes'],
        analysisCategories: ['attacking', 'defending', 'possession', 'set-pieces']
    },
    football: {
        positions: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
        statFields: ['passingYards', 'rushingYards', 'receivingYards', 'touchdowns', 'tackles', 'sacks', 'interceptions'],
        analysisCategories: ['offense', 'defense', 'special-teams', 'turnovers']
    }
};
```

---

## Phase 4: Team Setup & Roster Import

### Task 4.1 — Team Setup Screen (Easy)
**File:** `index.html` (inside `#screen-setup`) + `js/teamSetup.js`
**What to do:**
- Input field for **Team Name**
- Dropdown for **Season** (e.g., Fall 2025, Spring 2026)
- A drag-and-drop zone (or file input) labeled "Upload Roster (CSV or XLSX)"
- A "Continue to Dashboard" button (disabled until roster is loaded)

### Task 4.2 — CSV Roster Parser (Medium)
**File:** `js/teamSetup.js`
**What to do:**
- Use the `FileReader` API to read the uploaded CSV file
- Parse each row into a player object: `{ name, number, position, grade }`
- Display a preview table showing all imported players
- Let users remove players from the preview before confirming
- Save the roster to `appState.roster`

**CSV parsing example:**
```js
reader.onload = function(e) {
    const rows = e.target.result.split('\n');
    const headers = rows[0].split(',');
    const players = rows.slice(1).map(row => {
        const values = row.split(',');
        return { name: values[0], number: values[1], position: values[2], grade: values[3] };
    });
};
```

### Task 4.3 — Sample CSV File (Easy)
**File:** `data/sampleRoster.csv`
**What to do:**
- Create a sample CSV with 15-20 players for testing:
```
name,number,position,grade
Alex Johnson,10,ST,10
Maria Garcia,7,CM,11
...
```

---

## Phase 5: Dashboard Layout

### Task 5.1 — Dashboard Shell with Tabs (Easy)
**File:** `index.html` (inside `#screen-dashboard`) + `js/dashboard.js`
**What to do:**
- Show team name and sport at the top
- Create a tab bar with 6 tabs: Game Log | Season Overview | Share | ML Insights | Scouting | Tactics
- Each tab shows/hides its own content `<div>`
- Default to the Game Log tab
- Style the active tab with the green accent

---

## Phase 6: Game Log

### Task 6.1 — Game List View (Medium)
**File:** `js/gameLog.js`
**What to do:**
- Show an "Add Game" button at the top
- Display all games as cards in a list, each showing: date, opponent, score (W/L/D tag)
- Clicking a game card opens the detailed stat view for that game
- Store games in `appState.games` as an array

### Task 6.2 — Add Game Form (Medium)
**File:** `js/gameLog.js`
**What to do:**
- Modal/popup form with: date, opponent name, your score, opponent score
- Option to upload a stat sheet (CSV) or enter stats manually
- On save, add the game to `appState.games` and refresh the game list

### Task 6.3 — Per-Game Player Stat Table (Medium)
**File:** `js/gameLog.js`
**What to do:**
- When a game is clicked, show a full table with every player in the roster
- Columns = the sport-specific stat fields (from `SPORT_CONFIG`)
- Each cell is editable (click to type a number)
- Add a "Save Stats" button that stores the data in the game object
- Auto-calculate team totals at the bottom row

**Data structure:**
```js
game = {
    id: 1,
    date: '2025-09-15',
    opponent: 'Lincoln High',
    ourScore: 3,
    theirScore: 1,
    playerStats: {
        'Alex Johnson': { goals: 2, assists: 0, shots: 5, passes: 20, tackles: 1, saves: 0, minutes: 90 },
        // ... more players
    }
}
```

---

## Phase 7: Season Overview

### Task 7.1 — Season Summary Cards (Medium)
**File:** `js/seasonOverview.js`
**What to do:**
- Calculate and display these stats from all games:
  - **Record:** Wins - Losses - Draws
  - **Win Rate:** percentage
  - **Goals For / Against** (soccer) or **Points For / Against** (football)
  - **Clean Sheets** (games where opponent scored 0)
- Display each stat in a styled card with large numbers

### Task 7.2 — Recent Results & Trends (Hard)
**File:** `js/seasonOverview.js`
**What to do:**
- Show the last 5 game results as colored badges (green = W, red = L, gray = D)
- Draw a simple sparkline chart showing goals scored per game over time
  - Use `<canvas>` to draw a line graph (no libraries needed)
  - X-axis = game number, Y-axis = goals scored
- Show whether the team is trending up or down (compare last 3 games to overall average)

**Canvas sparkline example:**
```js
function drawSparkline(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const max = Math.max(...data);
    const step = canvas.width / (data.length - 1);
    ctx.beginPath();
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 2;
    data.forEach((val, i) => {
        const x = i * step;
        const y = canvas.height - (val / max) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
}
```

### Task 7.3 — Top Performers Table (Medium)
**File:** `js/seasonOverview.js`
**What to do:**
- Aggregate each player's stats across all games
- Sort by key stats (goals for soccer, touchdowns for football)
- Display a leaderboard table: Rank, Player Name, Key Stat, Games Played
- Highlight the top 3 with gold/silver/bronze accent colors

---

## Phase 8: Share Link

### Task 8.1 — Generate Shareable Link (Medium)
**File:** `js/shareLink.js`
**What to do:**
- Generate a unique link by encoding the team data into a URL hash or query parameter
- Use `btoa()` to base64-encode a JSON string of the team's season overview
- Display the link in a copyable text field with a "Copy" button
- When someone opens that link, the app loads in read-only mode showing only the Season Overview

**Example:**
```js
function generateShareLink() {
    const data = { team: appState.teamName, record: getRecord(), topPlayers: getTopPerformers() };
    const encoded = btoa(JSON.stringify(data));
    return window.location.origin + window.location.pathname + '?share=' + encoded;
}
```

### Task 8.2 — Read-Only View (Medium)
**File:** `js/shareLink.js`
**What to do:**
- On page load, check if the URL contains `?share=`
- If yes, decode the data and display a simplified read-only dashboard
- Hide the nav bar, edit buttons, and all input fields
- Show: team name, record, top performers, recent results

---

## Phase 9: ML Insights (Pattern Recognition)

### Task 9.1 — Partnership Detection (Hard)
**File:** `js/mlInsights.js`
**What to do:**
- Analyze games where specific pairs of players both had high stats
- For soccer: find pairs where both players scored or assisted in the same game
- For football: find QB-WR connections with high yardage in the same game
- Display partnerships as cards: "Player A + Player B — appeared in X games together, combined Y goals/yards"
- Add a **confidence score** (% of games where the partnership produced results)

**Logic outline:**
```js
function findPartnerships(games, roster) {
    const pairs = {};
    for (const game of games) {
        const performers = Object.entries(game.playerStats)
            .filter(([name, stats]) => stats.goals > 0 || stats.assists > 0);
        // Compare every pair of performers
        for (let i = 0; i < performers.length; i++) {
            for (let j = i + 1; j < performers.length; j++) {
                const key = [performers[i][0], performers[j][0]].sort().join(' + ');
                pairs[key] = (pairs[key] || 0) + 1;
            }
        }
    }
    return pairs;
}
```

### Task 9.2 — Build-Up Orchestrators (Hard)
**File:** `js/mlInsights.js`
**What to do:**
- Identify players who consistently have high pass counts in winning games
- Compare their passing stats in wins vs. losses
- Label players as "orchestrators" if their pass average is 20%+ higher in wins
- Display as: "Player X is a key build-up player — avg 45 passes in wins vs 30 in losses"

### Task 9.3 — Defensive Strength/Weakness Analysis (Hard)
**File:** `js/mlInsights.js`
**What to do:**
- Look at goals conceded per game and correlate with which defenders played
- Identify if clean sheets happen more when certain players are in the lineup
- Flag defensive weaknesses: "Team concedes 2.5 goals/game without Player Y"
- Display as a strengths (green) and weaknesses (red) list

### Task 9.4 — Win Probability Predictor (Hard)
**File:** `js/mlInsights.js`
**What to do:**
- Based on historical data, estimate win probability for an upcoming game
- Inputs: opponent strength (user rates 1-5), home/away, available players
- Use a simple weighted formula (not actual ML — we're simulating it):
```js
function predictWin(teamAvgGoals, opponentRating, isHome) {
    let base = (teamAvgGoals / 3) * 100;  // normalize
    base -= opponentRating * 8;            // harder opponent = lower chance
    base += isHome ? 10 : -5;             // home advantage
    const confidence = Math.min(95, Math.max(15, Math.round(base)));
    return { winProbability: confidence, confidence: games.length > 5 ? 'High' : 'Low' };
}
```
- Display with a circular progress bar showing the percentage

---

## Phase 10: Opponent Scouting

### Task 10.1 — Opponent Roster Tracker (Medium)
**File:** `js/scouting.js`
**What to do:**
- Let user add opponent teams with a name and player list
- For each opponent player, track: name, number, position
- Store in `appState.opponents`

### Task 10.2 — Opponent Stat Tracking (Medium)
**File:** `js/scouting.js`
**What to do:**
- When logging a game (Phase 6), also allow entering stats for opponent players
- Calculate per-game averages for each opponent player across multiple matchups
- Display a scouting table: Player, Position, Avg Goals, Avg Assists, Threat Level

### Task 10.3 — Threat Identification (Hard)
**File:** `js/scouting.js`
**What to do:**
- Auto-identify the opponent's **Top Threat** (highest goals/touchdowns) and **Playmaker** (highest assists/passing yards)
- Display prominent cards at the top: "Top Threat: #10 Marcus Lee — 2.3 goals/game"
- Color-code threat levels: red (high), yellow (medium), green (low)

---

## Phase 11: Tactical Recommendations

### Task 11.1 — Auto-Generated Game Plan (Hard)
**File:** `js/tactics.js`
**What to do:**
- Based on opponent scouting data, generate tactical recommendations:
  - **Man-marking assignments:** Match your best defender to their top threat
  - **Pressing triggers:** If opponent playmaker has high pass %, recommend high press
  - **Passing vulnerability:** If opponent has weak defenders, recommend attacking down that side

**Example logic:**
```js
function generateGamePlan(opponent, ourRoster) {
    const plan = [];
    const topThreat = findTopThreat(opponent);
    const bestDefender = findBestDefender(ourRoster);

    plan.push({
        type: 'Man-Mark',
        instruction: `Assign ${bestDefender.name} to mark ${topThreat.name} (#${topThreat.number})`,
        reason: `${topThreat.name} averages ${topThreat.avgGoals} goals/game`
    });

    // Add more rules...
    return plan;
}
```

### Task 11.2 — Tactics Display (Medium)
**File:** `js/tactics.js`
**What to do:**
- Show game plan as a list of instruction cards
- Each card shows: tactic type icon, instruction text, reasoning
- Add a "Select Opponent" dropdown to generate plans for different teams
- Add a "Print Game Plan" button that opens a printer-friendly version

---

## Phase 12: Data Persistence

### Task 12.1 — Save/Load All Data with localStorage (Medium)
**File:** `js/app.js`
**What to do:**
- On every data change (new game, roster edit, etc.), save `appState` to `localStorage`
- On page load, check `localStorage` for saved data and restore it
- Add a "Reset All Data" button in settings (with confirmation popup)

```js
function saveState() {
    localStorage.setItem('statEdgeData', JSON.stringify(appState));
}

function loadState() {
    const saved = localStorage.getItem('statEdgeData');
    if (saved) appState = JSON.parse(saved);
}
```

---

## Phase 13: Polish & Final Touches

### Task 13.1 — Responsive Design (Medium)
**File:** `css/styles.css`
**What to do:**
- Add media queries so the app works on phones and tablets
- Stack cards vertically on small screens
- Make tables horizontally scrollable on mobile
- Test at 375px (phone), 768px (tablet), and 1200px+ (desktop)

### Task 13.2 — Loading States & Empty States (Easy)
**What to do:**
- Show "No games yet — add your first game!" when game log is empty
- Show a loading spinner when parsing CSV files
- Show "Not enough data" messages in ML Insights when fewer than 3 games exist

### Task 13.3 — Error Handling (Easy)
**What to do:**
- Validate all form inputs (no empty fields, valid email format, scores must be numbers)
- Show user-friendly error messages in red below form fields
- Handle corrupted localStorage data gracefully (reset if JSON parse fails)

---

## Suggested Build Order

Work through the phases in order. Each phase builds on the previous one:

1. **Phase 1** — Get the skeleton working (navigation between screens)
2. **Phase 2** — Auth (so you can "log in")
3. **Phase 3** — Sport selection
4. **Phase 4** — Roster import (you need players before you can log stats)
5. **Phase 5** — Dashboard layout with tabs
6. **Phase 6** — Game Log (core feature — enter game data)
7. **Phase 12** — Data persistence (save your work before building more features)
8. **Phase 7** — Season Overview (needs game data to calculate)
9. **Phase 8** — Share Link
10. **Phase 9** — ML Insights (needs lots of game data)
11. **Phase 10** — Opponent Scouting
12. **Phase 11** — Tactical Recommendations (needs scouting data)
13. **Phase 13** — Polish everything

---

## Tips for Your Team

- **Split the work:** Each person can own 2-3 phases. Just agree on the `appState` structure so your code works together.
- **Test with sample data:** Use the sample CSV and manually add 5+ games before working on analytics features.
- **Use browser DevTools:** Press F12 to open the console — use `console.log()` to debug your JS.
- **Keep it simple first:** Get the basic version working before adding fancy animations or extra features.
- **Git commits:** Commit after finishing each task so you don't lose progress.
