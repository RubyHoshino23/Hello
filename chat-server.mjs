import http from 'node:http'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.PORT) || 8787
const rooms = new Map()
const streams = new Map()

function getRoomMessages(room) {
  if (!rooms.has(room)) rooms.set(room, [])
  return rooms.get(room)
}

function getRoomStreams(room) {
  if (!streams.has(room)) streams.set(room, new Set())
  return streams.get(room)
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res)
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

function broadcast(room, payload) {
  const clients = getRoomStreams(room)
  const event = `data: ${JSON.stringify(payload)}\n\n`
  for (const client of clients) {
    client.write(event)
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res)
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { ok: true })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/messages') {
    const room = url.searchParams.get('room') ?? 'default'
    const messages = getRoomMessages(room)
    sendJson(res, 200, { messages })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/stream') {
    const room = url.searchParams.get('room') ?? 'default'
    const clients = getRoomStreams(room)

    setCorsHeaders(res)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    res.write('retry: 1500\n\n')
    clients.add(res)

    req.on('close', () => {
      clients.delete(res)
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/messages') {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const room = parsed.room ?? 'default'
        const text = String(parsed.text ?? '').trim()
        if (!text) {
          sendJson(res, 400, { error: 'Message text is required.' })
          return
        }

        const message = {
          id: randomUUID(),
          room,
          text,
          sender: parsed.sender ?? 'visitor',
          senderLabel: parsed.senderLabel ?? 'Visitor',
          role: parsed.role ?? 'visitor',
          targetClient: parsed.targetClient ?? null,
          createdAt: new Date().toISOString(),
        }

        const messages = getRoomMessages(room)
        messages.push(message)
        if (messages.length > 200) messages.shift()

        broadcast(room, { type: 'message', message })
        sendJson(res, 201, { ok: true, message })
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON body.' })
      }
    })
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`)
})
