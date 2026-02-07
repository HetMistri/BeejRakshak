import twilio from 'twilio'

let twilioClient = null
let initialized = false
let fromNumber = null

/**
 * Initialize Twilio client (called when credentials are available)
 */
export const initializeTwilio = () => {
  if (initialized) return

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  fromNumber = process.env.TWILIO_PHONE_NUMBER

  console.log('Twilio Service: Loading credentials...')
  console.log('TWILIO_ACCOUNT_SID:', accountSid ? 'SET' : 'NOT SET')
  console.log('TWILIO_AUTH_TOKEN:', authToken ? 'SET' : 'NOT SET')
  console.log('TWILIO_PHONE_NUMBER:', fromNumber || 'NOT SET')

  if (accountSid && authToken && fromNumber) {
    twilioClient = twilio(accountSid, authToken)
    console.log('✓ Twilio client initialized successfully')
    initialized = true
  } else {
    console.warn('✗ Twilio credentials not found in environment variables')
  }
}

/**
 * Send SMS using Twilio
 * @param {string} toNumber - Recipient phone number (with country code, e.g., +91XXXXXXXXXX)
 * @param {string} message - Message text to send
 * @returns {Promise<object>} - Twilio response with message SID
 */
export const sendSMS = async (toNumber, message) => {
  if (!twilioClient) {
    initializeTwilio()
    if (!twilioClient) {
      throw new Error('Twilio client not initialized. Please check your environment variables.')
    }
  }

  if (!toNumber || !message) {
    throw new Error('Both toNumber and message are required')
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    })

    console.log(`SMS sent successfully. Message SID: ${result.sid}`)
    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error sending SMS:', error.message)
    throw new Error(`Failed to send SMS: ${error.message}`)
  }
}

/**
 * Send bulk SMS to multiple recipients
 * @param {string[]} toNumbers - Array of recipient phone numbers
 * @param {string} message - Message text to send
 * @returns {Promise<object>} - Array of results for each message
 */
export const sendBulkSMS = async (toNumbers, message) => {
  if (!Array.isArray(toNumbers) || toNumbers.length === 0) {
    throw new Error('toNumbers must be a non-empty array')
  }

  if (!message) {
    throw new Error('Message is required')
  }

  const results = await Promise.allSettled(
    toNumbers.map((toNumber) => sendSMS(toNumber, message))
  )

  return {
    total: toNumbers.length,
    successful: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
    results: results.map((r, index) => ({
      phoneNumber: toNumbers[index],
      status: r.status,
      ...(r.status === 'fulfilled' && { data: r.value }),
      ...(r.status === 'rejected' && { error: r.reason.message }),
    })),
  }
}

export default { sendSMS, sendBulkSMS }
