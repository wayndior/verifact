// ai.js — document text extraction + OpenAI verification
//
// Key change from VPS version:
//   extractText() now accepts a Buffer instead of a file path.
//   PPTX extraction uses the `unzipper` npm package instead of the system
//   `unzip` binary (which is unavailable on Vercel).

import OpenAI from 'openai';
import mammoth from 'mammoth';
import unzipper from 'unzipper';
import { createRequire } from 'module';

// pdf-parse is CommonJS — use createRequire to import it in an ESM project
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Lazy-init so OPENAI_API_KEY is resolved from .env before first use
let _openai = null;
const getOpenAI = () => {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
};

// ── Text extraction ───────────────────────────────────────────────────────────

/**
 * @param {Buffer} fileBuffer  — raw file bytes (from multer memoryStorage)
 * @param {string} mimeType    — MIME type of the uploaded file
 * @returns {Promise<string>}  — extracted plain text
 */
export async function extractText(fileBuffer, mimeType) {
  if (mimeType === 'text/plain') {
    return fileBuffer.toString('utf-8').trim();
  }

  if (mimeType === 'application/pdf') {
    const data = await pdfParse(fileBuffer);
    return data.text.trim();
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value.trim();
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimeType === 'application/vnd.ms-powerpoint'
  ) {
    return extractPptxText(fileBuffer);
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

/**
 * Extract text from a PPTX buffer using unzipper (no system binaries needed).
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractPptxText(buffer) {
  const directory = await unzipper.Open.buffer(buffer);

  const slideFiles = directory.files
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f.path))
    .sort((a, b) => a.path.localeCompare(b.path));

  const texts = await Promise.all(
    slideFiles.map(async (slideFile) => {
      const content = await slideFile.buffer();
      const xml = content.toString('utf-8');
      return [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/gs)]
        .map((m) => m[1])
        .join(' ');
    })
  );

  return texts.join('\n').trim();
}

// ── AI verification ───────────────────────────────────────────────────────────

/**
 * Default character cap. Callers can pass a larger cap via `maxChars` (e.g.
 * educator plans get more headroom). Keep this conservative — the larger
 * the prompt, the more the model stalls or hits 429s on cold starts.
 */
const DEFAULT_MAX_CHARS = 12000;

/**
 * Retry classification: only retry network blips / rate limits / 5xx. Never
 * retry 4xx errors other than 429 — those are deterministic failures that
 * will never resolve by asking again.
 */
function isRetryableAIError(err) {
  if (!err) return false;
  const status = err.status ?? err.response?.status;
  if (status === 429) return true;
  if (status && status >= 500 && status < 600) return true;
  // openai-node wraps network errors as APIConnectionError / APIConnectionTimeoutError
  const name = err.constructor?.name ?? '';
  if (/Connection|Timeout/i.test(name)) return true;
  // Fall through: anything without a status is almost certainly a transport error
  if (!status) return true;
  return false;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Call the OpenAI chat API with exponential backoff.
 * Attempts: 3  (so up to 2 retries after the first call).
 * Backoff:  800ms → 2s → 4s (with 20% jitter).
 */
async function callOpenAIWithRetry(params, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await getOpenAI().chat.completions.create(params);
    } catch (err) {
      lastErr = err;
      if (i === attempts - 1 || !isRetryableAIError(err)) throw err;
      const backoffMs = Math.round((800 * Math.pow(2, i)) * (0.8 + Math.random() * 0.4));
      // eslint-disable-next-line no-console
      console.warn(`[ai] retry ${i + 1}/${attempts - 1} after ${backoffMs}ms —`, err.message);
      await sleep(backoffMs);
    }
  }
  throw lastErr;
}

/**
 * Verify a document. Returns an object with the parsed AI analysis AND
 * metadata describing whether the input had to be truncated so the frontend
 * can warn the user. Never throws on "no result" — it returns a structured
 * error wrapped in a thrown Error for the route handler to catch and map.
 *
 * @param {string} text      — extracted document text
 * @param {object} [options]
 * @param {number} [options.maxChars=DEFAULT_MAX_CHARS] — character cap
 * @returns {Promise<{ result: object, truncated: boolean, originalLength: number, usedLength: number }>}
 */
export async function verifyDocument(text, { maxChars = DEFAULT_MAX_CHARS } = {}) {
  const originalLength = text.length;
  const truncated = originalLength > maxChars;
  const inputText = truncated ? text.slice(0, maxChars) : text;

  const prompt = `You are an academic fact-checking and plagiarism detection AI.

Analyze the following document text and return a JSON object with this exact structure:

{
  "claims": [
    {
      "text": "The exact claim from the document",
      "status": "verified" | "unverified" | "contradicted",
      "confidence": 0.0-1.0,
      "explanation": "Brief explanation of verification status",
      "source": "Source name or URL if applicable, otherwise null"
    }
  ],
  "plagiarism": {
    "score": 0.0-1.0,
    "flaggedPassages": [
      {
        "text": "The flagged passage",
        "reason": "Why it was flagged"
      }
    ]
  },
  "summary": {
    "verifiedCount": 0,
    "unverifiedCount": 0,
    "contradictedCount": 0,
    "overallScore": 0-100,
    "verdict": "pass" | "fail" | "review",
    "recommendation": "A 1-2 sentence recommendation for the author"
  }
}

Rules:
- Only extract factual, verifiable claims (not opinions or general statements)
- Extract between 3 and 15 of the most important claims
- overallScore is 0-100: 80+ = pass, 50-79 = review, below 50 = fail
- plagiarism.score is 0.0 (fully original) to 1.0 (fully plagiarised)
- Be thorough but concise in explanations
- Return ONLY valid JSON, no markdown, no extra text

Document text:
${inputText}`;

  const response = await callOpenAIWithRetry({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 3000,
    // JSON mode — forces the model to return valid JSON, which eliminates
    // the fragile markdown-fence stripping and most parse failures.
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('AI returned an empty response. Please try again.');
  }
  // Strip markdown code fences if the model wraps the JSON (defensive — JSON
  // mode should prevent this, but older models occasionally slip up).
  const json = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error(
      'AI returned invalid analysis (could not parse JSON). Try again with a shorter document or different file.'
    );
  }

  // Light sanity check: the route relies on .summary.overallScore existing.
  if (!parsed?.summary || typeof parsed.summary.overallScore !== 'number') {
    throw new Error('AI returned an incomplete analysis. Please try again.');
  }

  return {
    result: parsed,
    truncated,
    originalLength,
    usedLength: inputText.length,
  };
}
