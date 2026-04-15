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

export async function verifyDocument(text) {
  // Truncate to ~12 k chars to stay within token budget
  const truncated = text.slice(0, 12000);

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
${truncated}`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 3000,
  });

  const raw = response.choices[0].message.content.trim();
  // Strip markdown code fences if the model wraps the JSON
  const json = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(json);
}
