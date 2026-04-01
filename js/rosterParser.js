/**
 * Roster Screenshot Import — Browser Module
 *
 * Parses a roster screenshot into structured player data using Groq's vision API.
 * Adapted from the transferable Expo/RN module for vanilla browser use.
 */

const GROQ_VISION_MODELS = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.2-11b-vision-preview',
];

function getRosterSystemPrompt(sport) {
    const sportName = sport || 'sports';
    const positionHints = {
        soccer: 'Use position abbreviations when possible (GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST).',
        football: 'Use position abbreviations when possible (QB, RB, WR, TE, OL, DL, LB, CB, S, K, P).',
    };
    const posLine = positionHints[sport] || 'Keep position text concise.';

    return `You extract ${sportName} roster tables from screenshots.
Return ONLY valid JSON with this exact shape:
{"players":[{"name":"string","number":"string|null","position":"string|null","grade":"string|null"}]}

Rules:
- Extract all visible player rows.
- Keep jersey number as plain digits string when present (example: "12"), else null.
- ${posLine}
- Keep grade/class text concise ("Freshman", "Sophomore", "Junior", "Senior", or original class text if unclear).
- If a row has no player name, skip it.
- Never include markdown or extra text.`;
}

function parseJsonFromModelOutput(content) {
    if (!content || typeof content !== 'string') return null;
    let raw = content.trim();
    const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlock) raw = codeBlock[1].trim();
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function sanitizePlayers(payload) {
    const list = Array.isArray(payload?.players) ? payload.players : [];
    const cleaned = list
        .map((p) => ({
            name: String(p?.name ?? '').trim(),
            number:
                p?.number == null || String(p.number).trim() === ''
                    ? ''
                    : String(p.number).replace(/[^\d]/g, '').trim(),
            position: p?.position == null ? '' : String(p.position).trim(),
            grade: p?.grade == null ? '' : String(p.grade).trim(),
        }))
        .filter((p) => p.name.length > 0);

    const seen = new Set();
    const deduped = [];
    for (const player of cleaned) {
        const key = `${player.name.toLowerCase()}::${player.number}`;
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(player);
    }
    return deduped;
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (typeof result !== 'string') {
                reject(new Error('Failed to convert screenshot to base64.'));
                return;
            }
            resolve(result); // full data URL
        };
        reader.onerror = () => reject(new Error('Failed to read screenshot data.'));
        reader.readAsDataURL(file);
    });
}

/**
 * Parse a roster screenshot into structured player rows.
 *
 * @param {File}    imageFile  - The image File object from an <input type="file">.
 * @param {string}  apiKey     - Groq API key.
 * @param {string}  sport      - 'soccer' or 'football' (for position hints).
 * @returns {Promise<{ players: Array<{name:string, number:string, position:string, grade:string}>, error: Error|null }>}
 */
async function parseRosterFromScreenshot(imageFile, apiKey, sport) {
    try {
        if (!apiKey) return { players: [], error: new Error('Missing Groq API key') };
        if (!imageFile) return { players: [], error: new Error('No screenshot selected') };

        const dataUrl = await readFileAsBase64(imageFile);
        const systemPrompt = getRosterSystemPrompt(sport);
        let lastError = null;

        for (const model of GROQ_VISION_MODELS) {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    temperature: 0.1,
                    max_tokens: 1000,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Extract the roster table from this screenshot and return players JSON only.' },
                                { type: 'image_url', image_url: { url: dataUrl } },
                            ],
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                lastError = new Error(`Groq vision API error (${model}): ${response.status} ${errText}`);
                continue;
            }

            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content?.trim();
            const parsed = parseJsonFromModelOutput(content);
            if (!parsed) {
                lastError = new Error(`Could not parse roster output (${model})`);
                continue;
            }

            return { players: sanitizePlayers(parsed), error: null };
        }

        return { players: [], error: lastError ?? new Error('Could not parse roster screenshot.') };
    } catch (error) {
        return { players: [], error: error instanceof Error ? error : new Error(String(error)) };
    }
}
