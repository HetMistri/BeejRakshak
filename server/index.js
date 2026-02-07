import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { sendSMS, sendBulkSMS, initializeTwilio } from './services/twilioService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
console.log('Loading .env from:', envPath)
dotenv.config({ path: envPath })

// Initialize Twilio after dotenv is loaded
initializeTwilio()

// Make Twilio services globally accessible
global.sendSMS = sendSMS
global.sendBulkSMS = sendBulkSMS

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }))
app.use(express.json())

app.get('/api/health', (_, res) => {
  res.json({ ok: true, message: 'BeejRakshak API' })
})

// SMS sending endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { toNumber, message } = req.body

    if (!toNumber || !message) {
      return res.status(400).json({
        error: 'Missing required fields: toNumber and message',
      })
    }

    const result = await global.sendSMS(toNumber, message)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Bulk SMS endpoint
app.post('/api/send-bulk-sms', async (req, res) => {
  try {
    const { toNumbers, message } = req.body

    if (!Array.isArray(toNumbers) || toNumbers.length === 0 || !message) {
      return res.status(400).json({
        error: 'Missing required fields: toNumbers (array) and message',
      })
    }

    const result = await global.sendBulkSMS(toNumbers, message)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying ${port + 1}...`)
      server.close()
      startServer(port + 1)
    } else {
      throw err
    }
  })
}
startServer(PORT)
