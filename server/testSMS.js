#!/usr/bin/env node

/**
 * Twilio SMS Bot Test Script
 * Run with: node testSMS.js
 */

import fetch from 'node-fetch'

const API_BASE_URL = 'http://localhost:3001'

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

async function testSingleSMS() {
  console.log(`\n${colors.blue}Testing Single SMS...${colors.reset}`)

  try {
    const response = await fetch(`${API_BASE_URL}/api/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toNumber: '+919876543210', // Replace with test number
        message: 'Hello! This is a test message from BeejRakshak SMS Bot 🚀',
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`${colors.green}✓ Single SMS sent successfully${colors.reset}`)
      console.log(`  Message SID: ${data.messageSid}`)
      console.log(`  Status: ${data.status}`)
      return true
    } else {
      console.log(`${colors.red}✗ Failed to send SMS${colors.reset}`)
      console.log(`  Error: ${data.error}`)
      return false
    }
  } catch (error) {
    console.log(`${colors.red}✗ Connection error: ${error.message}${colors.reset}`)
    return false
  }
}

async function testBulkSMS() {
  console.log(`\n${colors.blue}Testing Bulk SMS...${colors.reset}`)

  try {
    const response = await fetch(`${API_BASE_URL}/api/send-bulk-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toNumbers: [
          '+919876543210', // Replace with test numbers
          '+911234567890',
          '+919999999999',
        ],
        message: 'Bulk SMS Test from BeejRakshak 🌾',
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`${colors.green}✓ Bulk SMS request completed${colors.reset}`)
      console.log(`  Total: ${data.total}`)
      console.log(`  Successful: ${data.successful}`)
      console.log(`  Failed: ${data.failed}`)
      return true
    } else {
      console.log(`${colors.red}✗ Failed to send bulk SMS${colors.reset}`)
      console.log(`  Error: ${data.error}`)
      return false
    }
  } catch (error) {
    console.log(`${colors.red}✗ Connection error: ${error.message}${colors.reset}`)
    return false
  }
}

async function testHealth() {
  console.log(`\n${colors.blue}Testing Server Health...${colors.reset}`)

  try {
    const response = await fetch(`${API_BASE_URL}/api/health`)
    const data = await response.json()

    if (response.ok && data.ok) {
      console.log(`${colors.green}✓ Server is running${colors.reset}`)
      console.log(`  Message: ${data.message}`)
      return true
    } else {
      console.log(`${colors.red}✗ Server is not responding correctly${colors.reset}`)
      return false
    }
  } catch (error) {
    console.log(
      `${colors.red}✗ Cannot connect to server at ${API_BASE_URL}${colors.reset}`
    )
    console.log(`  Make sure the server is running: npm run dev`)
    return false
  }
}

async function runAllTests() {
  console.log(`${colors.yellow}
╔════════════════════════════════════════╗
║   BeejRakshak SMS Bot Test Suite      ║
╚════════════════════════════════════════╝${colors.reset}`)

  const healthCheck = await testHealth()

  if (!healthCheck) {
    console.log(
      `\n${colors.red}Server is not running. Please start it first with: npm run dev${colors.reset}`
    )
    process.exit(1)
  }

  await testSingleSMS()
  await testBulkSMS()

  console.log(`\n${colors.yellow}
╔════════════════════════════════════════╗
║   Tests Completed                     ║
╚════════════════════════════════════════╝${colors.reset}\n`)
}

runAllTests()
