import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// Load environment variables
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
config({ path: envPath })
console.log('Environment variables loaded from .env file.')

// Import the main app after loading .env
import app from './index.js'

const PORT = process.env.PORT || 3001

// Ensure uploads directory exists
const UPLOADS_PATH = process.env.UPLOADS_PATH || path.resolve(__dirname, 'uploads')
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true })
  console.log(`Created uploads directory at: ${UPLOADS_PATH}`)
}

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Verifact backend running on port ${PORT}`)
})

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err)
  // Attempt to capture error with Sentry if DSN is configured
  if (process.env.SENTRY_BACKEND_DSN) {
    try {
      import('@sentry/node').then(({ captureException }) => {
        captureException(err)
      }).catch(e => console.error('Failed to import Sentry:', e))
    } catch (e) {
      console.error('Failed to capture error with Sentry:', e)
    }
  }
  if (err.syscall !== 'listen') {
    process.exit(1)
  }
})
