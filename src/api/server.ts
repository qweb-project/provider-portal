import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import * as jwt from 'hono/jwt'
import { Porto, ServerActions } from 'porto'
import { ServerClient } from 'porto/viem'
import { hashMessage } from 'viem'
import { generateSiweNonce, parseSiweMessage } from 'viem/siwe'
import { promises as dns } from 'dns'

type Env = {
  JWT_SECRET?: string
}

const app = new Hono<{ Bindings: Env }>().basePath('/api')
const porto = Porto.create()

// Use environment variable or fallback for development
const getJwtSecret = (env?: Env) => env?.JWT_SECRET || process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

app.get('/siwe/nonce', (c) => c.text(generateSiweNonce()))

app.post('/siwe', async (c) => { 
  const { message, signature } = await c.req.json() 
  const { address, chainId } = parseSiweMessage(message) 

  // Verify the signature. 
  const client = ServerClient.fromPorto(porto, { chainId }) 
  const valid = ServerActions.verifySignature(client, { 
    address: address!, 
    digest: hashMessage(message), 
    signature, 
  }) 

  // If the signature is invalid, we cannot authenticate the user. 
  if (!valid) return c.json({ error: 'Invalid signature' }, 401) 

  // Issue a JWT for the user in a HTTP-only cookie. 
  const token = await jwt.sign({ sub: address }, getJwtSecret(c.env)) 
  setCookie(c, 'auth', token, { 
    httpOnly: true, 
    secure: true, 
  }) 

  // If the signature is valid, we can authenticate the user. 
  return c.json({ message: 'Authenticated', address }) 
})

app.post('/siwe/logout', async (c) => {
  setCookie(c, 'auth', '', {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
  })
  return c.json({ message: 'Logged out' })
})

app.get('/me', async (c) => {
  const cookie = c.req.header('cookie')
  const authCookie = cookie?.split(';').find(c => c.trim().startsWith('auth='))
  
  if (!authCookie) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  const token = authCookie.split('=')[1]
  
  try {
    const decoded = await jwt.verify(token, getJwtSecret(c.env))
    return c.json({ address: decoded.sub, authenticated: true })
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

// DNS TXT verification endpoint
app.get('/verify-domain', async (c) => {
  const url = new URL(c.req.url)
  const domain = url.searchParams.get('domain')?.trim().toLowerCase()
  const expectedToken = url.searchParams.get('token')?.trim()

  if (!domain || !expectedToken) {
    return c.json({ verified: false, error: 'Missing domain or token' }, 400)
  }

  try {
    const txtRecords = await dns.resolveTxt(domain)
    const flat = txtRecords.flat().map((r) => r.toString())
    const verified = flat.some((record) => record.includes(expectedToken) || record === expectedToken)
    return c.json({ verified, records: process.env.NODE_ENV === 'development' ? flat : undefined })
  } catch (error: any) {
    return c.json({ verified: false, error: 'DNS lookup failed', details: process.env.NODE_ENV === 'development' ? String(error?.message || error) : undefined }, 200)
  }
})
export default app 