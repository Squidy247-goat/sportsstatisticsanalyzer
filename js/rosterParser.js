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

const MAX_IMAGE_DIMENSION = 1024; // resize large screenshots to save bandwidth
const FETCH_TIMEOUT_MS = 30000;   // 30s timeout per model attempt

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

/**
 * Resize an image file to keep dimensions under MAX_IMAGE_DIMENSION
 * and return a compressed JPEG data URL.
 */
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;
            // Scale down if needed
            if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
                const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for compression.'));
        };
        img.src = url;
    });
}

/**
 * fetch with a timeout
 */
function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
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
        if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
            return { players: [], error: new Error('Groq API key not configured. Update js/config.js') };
        }
        if (!imageFile) return { players: [], error: new Error('No screenshot selected') };

        const dataUrl = await compressImage(imageFile);
        const systemPrompt = getRosterSystemPrompt(sport);
        let lastError = null;

        for (const model of GROQ_VISION_MODELS) {
            try {
                const response = await fetchWithTimeout(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
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
                    },
                    FETCH_TIMEOUT_MS
                );

                if (!response.ok) {
                    const errText = await response.text();
                    console.error(`Groq API error (${model}):`, response.status, errText);
                    lastError = new Error(`API error (${response.status}). Try a different image.`);
                    continue;
                }

                const data = await response.json();
                const content = data?.choices?.[0]?.message?.content?.trim();
                const parsed = parseJsonFromModelOutput(content);
                if (!parsed) {
                    lastError = new Error(`Could not parse roster from response (${model})`);
                    continue;
                }

                return { players: sanitizePlayers(parsed), error: null };
            } catch (err) {
                if (err.name === 'AbortError') {
                    lastError = new Error('Request timed out. Try a smaller or clearer image.');
                } else {
                    lastError = err;
                }
                console.error(`Model ${model} failed:`, err);
                continue;
            }
        }

        return { players: [], error: lastError ?? new Error('Could not parse roster screenshot.') };
    } catch (error) {
        console.error('parseRosterFromScreenshot error:', error);
        return { players: [], error: error instanceof Error ? error : new Error(String(error)) };
    }
}
