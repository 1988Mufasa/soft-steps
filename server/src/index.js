/**
 * Soft Steps secure payment API
 * --------------------------------
 * - Never accepts card numbers, CVV, bank account, or PAN
 * - Creates Stripe Checkout Sessions only (PCI SAQ A)
 * - Verifies webhook signatures
 * - Secrets stay in process env — never returned to clients
 * - Rate limits, body size caps, Origin allowlist, method lockdown
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv(resolve(__dirname, '../.env'))

const PORT = Number(process.env.PORT || 8787)
const BIND_HOST = process.env.BIND_HOST || '127.0.0.1'
const FRONTEND_ORIGINS = [
  process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5173',
  process.env.FRONTEND_ORIGIN_EXTRA || 'http://127.0.0.1:4173',
  process.env.FRONTEND_ORIGIN_PROD,
].filter(Boolean)

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || ''
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''
const SUCCESS_URL =
  process.env.SUCCESS_URL || `${FRONTEND_ORIGINS[0]}/parent/billing?checkout=success`
const CANCEL_URL =
  process.env.CANCEL_URL || `${FRONTEND_ORIGINS[0]}/parent/billing?checkout=cancel`

const MAX_JSON_BYTES = 8 * 1024
const MAX_WEBHOOK_BYTES = 256 * 1024

const stripe =
  STRIPE_SECRET && !STRIPE_SECRET.includes('replace_me')
    ? new Stripe(STRIPE_SECRET)
    : null

const BANNED_BODY_KEYS = [
  'card',
  'cardnumber',
  'number',
  'cvv',
  'cvc',
  'exp',
  'expiry',
  'pan',
  'account_number',
  'routing',
  'password',
  'ssn',
  'pin',
  'token',
  'secret',
]

const PLANS = {
  'supporter-once': {
    mode: 'payment',
    label: 'Soft Steps one-time support',
    amount: 900,
    priceEnv: 'STRIPE_PRICE_ONCE',
  },
  'supporter-month': {
    mode: 'subscription',
    label: 'Soft Steps monthly support',
    amount: 500,
    priceEnv: 'STRIPE_PRICE_MONTH',
  },
}

function loadEnv(path) {
  if (!existsSync(path)) return
  const text = readFileSync(path, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i < 0) continue
    const key = trimmed.slice(0, i).trim()
    const val = trimmed.slice(i + 1).trim()
    if (!(key in process.env)) process.env[key] = val
  }
}

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  )
}

function cors(req, res) {
  const origin = req.headers.origin
  if (origin && FRONTEND_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature')
    res.setHeader('Access-Control-Max-Age', '600')
  }
}

function sendJson(res, status, body) {
  setSecurityHeaders(res)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function rejectCardFields(obj) {
  if (!obj || typeof obj !== 'object') return null
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase()
    if (BANNED_BODY_KEYS.some((b) => lower.includes(b))) {
      return `Rejected field "${key}" — Soft Steps never accepts payment card or secret data.`
    }
  }
  return null
}

/** Browser checkout POSTs must send an allowlisted Origin (CSRF mitigation). */
function requireAllowedOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return false
  return FRONTEND_ORIGINS.includes(origin)
}

async function readRawLimited(req, maxBytes) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > maxBytes) {
      const err = new Error('payload_too_large')
      err.code = 'PAYLOAD_TOO_LARGE'
      throw err
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

async function readJson(req) {
  const raw = await readRawLimited(req, MAX_JSON_BYTES)
  if (!raw.length) return {}
  const text = raw.toString('utf8')
  if (text.length > MAX_JSON_BYTES) {
    const err = new Error('payload_too_large')
    err.code = 'PAYLOAD_TOO_LARGE'
    throw err
  }
  return JSON.parse(text)
}

const rateMap = new Map()

function clientIp(req) {
  // Bound to loopback by default — do not trust X-Forwarded-For unless behind a known proxy.
  const trustProxy = process.env.TRUST_PROXY === '1'
  if (trustProxy) {
    const xf = req.headers['x-forwarded-for']
    if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim()
  }
  return req.socket.remoteAddress || 'unknown'
}

function rateLimit(ip, key, limit, windowMs) {
  const now = Date.now()
  const mapKey = `${key}:${ip}`
  const row = rateMap.get(mapKey) || { count: 0, reset: now + windowMs }
  if (now > row.reset) {
    row.count = 0
    row.reset = now + windowMs
  }
  row.count += 1
  rateMap.set(mapKey, row)
  return { ok: row.count <= limit, retryAfterSec: Math.ceil((row.reset - now) / 1000) }
}

// Prevent unbounded growth of the in-memory limiter
setInterval(() => {
  const now = Date.now()
  for (const [k, row] of rateMap) {
    if (now > row.reset + 60_000) rateMap.delete(k)
  }
}, 60_000).unref?.()

async function createCheckoutSession(planId) {
  const plan = PLANS[planId]
  if (!plan) throw new Error('Unknown plan')

  if (!stripe) {
    return {
      mode: 'demo',
      url: `${FRONTEND_ORIGINS[0]}/parent/billing?checkout=demo`,
    }
  }

  const priceId = process.env[plan.priceEnv]
  /** @type {import('stripe').Stripe.Checkout.SessionCreateParams} */
  const params = {
    mode: plan.mode,
    success_url: SUCCESS_URL,
    cancel_url: CANCEL_URL,
    // Soft Steps never collects cards — Stripe Checkout hosts the form.
    payment_method_types: ['card'],
    line_items: priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: plan.amount,
              recurring: plan.mode === 'subscription' ? { interval: 'month' } : undefined,
              product_data: { name: plan.label },
            },
          },
        ],
    metadata: {
      soft_steps_plan: planId,
      soft_steps_note: 'no_card_data_on_soft_steps',
    },
  }

  const session = await stripe.checkout.sessions.create(params)
  if (!session.url) throw new Error('Stripe did not return a Checkout URL')
  // Only return the hosted URL — never session secrets or payment_intent details to the SPA.
  return { mode: 'stripe', url: session.url }
}

const server = createServer(async (req, res) => {
  cors(req, res)
  setSecurityHeaders(res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  // Method allowlist
  if (req.method !== 'GET' && req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const ip = clientIp(req)
  const url = new URL(req.url || '/', `http://${req.headers.host}`)

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      if (!rateLimit(ip, 'health', 60, 60_000).ok) {
        sendJson(res, 429, { error: 'Too many requests.' })
        return
      }
      sendJson(res, 200, {
        ok: true,
        stripeConfigured: Boolean(stripe),
        acceptsCardData: false,
      })
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/checkout/session') {
      const limited = rateLimit(ip, 'checkout', 8, 60_000)
      if (!limited.ok) {
        res.setHeader('Retry-After', String(limited.retryAfterSec))
        sendJson(res, 429, { error: 'Too many checkout requests. Try again shortly.' })
        return
      }
      if (!requireAllowedOrigin(req)) {
        sendJson(res, 403, { error: 'Forbidden origin.' })
        return
      }
      let body
      try {
        body = await readJson(req)
      } catch (err) {
        if (err && err.code === 'PAYLOAD_TOO_LARGE') {
          sendJson(res, 413, { error: 'Payload too large.' })
          return
        }
        sendJson(res, 400, { error: 'Invalid JSON.' })
        return
      }
      if (body && typeof body === 'object' && Object.keys(body).length > 2) {
        sendJson(res, 400, { error: 'Unexpected fields.' })
        return
      }
      const banned = rejectCardFields(body)
      if (banned) {
        sendJson(res, 400, { error: banned })
        return
      }
      const plan = body.plan
      if (typeof plan !== 'string' || !PLANS[plan]) {
        sendJson(res, 400, { error: 'Invalid plan.' })
        return
      }
      const session = await createCheckoutSession(plan)
      sendJson(res, 200, session)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/stripe/webhook') {
      const limited = rateLimit(ip, 'webhook', 120, 60_000)
      if (!limited.ok) {
        res.setHeader('Retry-After', String(limited.retryAfterSec))
        sendJson(res, 429, { error: 'Too many webhook requests.' })
        return
      }
      let raw
      try {
        raw = await readRawLimited(req, MAX_WEBHOOK_BYTES)
      } catch (err) {
        if (err && err.code === 'PAYLOAD_TOO_LARGE') {
          sendJson(res, 413, { error: 'Payload too large.' })
          return
        }
        throw err
      }
      if (!stripe || !WEBHOOK_SECRET || WEBHOOK_SECRET.includes('replace_me')) {
        sendJson(res, 503, { error: 'Webhook not configured.' })
        return
      }
      const sig = req.headers['stripe-signature']
      if (!sig || Array.isArray(sig)) {
        sendJson(res, 400, { error: 'Missing Stripe-Signature.' })
        return
      }
      let event
      try {
        event = stripe.webhooks.constructEvent(raw, sig, WEBHOOK_SECRET)
      } catch {
        sendJson(res, 400, { error: 'Invalid webhook signature.' })
        return
      }
      // Acknowledge only — never log full payment method details.
      if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
        const id = event.data?.object?.id
        console.info(`[stripe] ${event.type} id=${id || 'unknown'}`)
      }
      sendJson(res, 200, { received: true })
      return
    }

    sendJson(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error('[api]', err instanceof Error ? err.message : 'error')
    sendJson(res, 500, { error: 'Server error' })
  }
})

server.listen(PORT, BIND_HOST, () => {
  console.info(
    `Soft Steps secure API on http://${BIND_HOST}:${PORT} (stripe=${Boolean(stripe) ? 'live-keys' : 'demo'})`,
  )
})
