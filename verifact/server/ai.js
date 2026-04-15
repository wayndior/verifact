import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, URL } from 'url'
import { createRequire } from 'module'
import { execSync } from 'child_process'
import mammoth from 'mammoth'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Lazy-init so OPENAI_API_KEY is loaded from .env before first use
let _openai = null
const getOpenAI = () => {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

// ── Text Extraction ───────────────────────────────────────────────────────────

export async function extractText(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase()

  // Plain text
  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8')
  }

  // PDF
  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath)
    const data = await pdfParse(buffer)
    return data.text
  }

  // DOCX / DOC
  if (ext === '.docx' || ext === '.doc') {
    const buffer = fs.readFileSync(filePath)
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  // PPTX — extract text from XML inside the zip
  if (ext === '.pptx' || ext === '.ppt') {
    return extractPptxText(filePath)
  }

  throw new Error(`Unsupported file type: ${ext}`)
}

function extractPptxText(filePath) {
  try {
    // Use unzip to extract slide XML, then strip tags
    const tmpDir = `/tmp/pptx_${Date.now()}`
    execSync(`mkdir -p ${tmpDir} && unzip -o "${filePath}" "ppt/slides/*.xml" -d ${tmpDir}`, { stdio: 'pipe' })
    const slidesDir = path.join(tmpDir, 'ppt', 'slides')
    if (!fs.existsSync(slidesDir)) return ''
    const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.xml'))
    let text = ''
    for (const file of files) {
      const xml = fs.readFileSync(path.join(slidesDir, file), 'utf-8')
      // Extract text between <a:t> tags
      const matches = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || []
      text += matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ') + '\n'
    }
    execSync(`rm -rf ${tmpDir}`, { stdio: 'pipe' })
    return text.trim()
  } catch (e) {
    console.error('PPTX extraction error:', e.message)
    return ''
  }
}

// ── AI Verification ───────────────────────────────────────────────────────────

export async function verifyDocument(text) {
  // Truncate to ~12k chars to stay within token limits
  const truncated = text.slice(0, 12000)

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
${truncated}`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 3000,
  })

  const raw = response.choices[0].message.content.trim()
  
  // Strip markdown code blocks if present
  const json = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '')
  
  return JSON.parse(json)
}
