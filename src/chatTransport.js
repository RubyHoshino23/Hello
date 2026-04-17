import { CHAT_API_BASE, CHAT_TRANSPORT } from './chatConfig.js'

function makeLocalKey(room) {
  return `sequoia_chat_room_${room}`
}

function readLocalRoom(room) {
  try {
    const raw = localStorage.getItem(makeLocalKey(room))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalRoom(room, messages) {
  localStorage.setItem(makeLocalKey(room), JSON.stringify(messages))
}

export async function loadHistory(room) {
  if (CHAT_TRANSPORT === 'local') {
    return readLocalRoom(room)
  }

  const response = await fetch(`${CHAT_API_BASE}/api/messages?room=${encodeURIComponent(room)}`)
  const data = await response.json()
  return Array.isArray(data.messages) ? data.messages : []
}

export function subscribeMessages(room, { onStatus, onMessage }) {
  if (CHAT_TRANSPORT === 'local') {
    onStatus('online')
    const channelName = `sequoia-chat-${room}`
    const channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(channelName)
      : null

    const onStorage = (event) => {
      if (event.key !== makeLocalKey(room)) return
      const list = readLocalRoom(room)
      const latest = list[list.length - 1]
      if (latest) onMessage(latest)
    }
    window.addEventListener('storage', onStorage)

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.type === 'message' && event.data.message) {
          onMessage(event.data.message)
        }
      }
    }

    return () => {
      window.removeEventListener('storage', onStorage)
      if (channel) channel.close()
    }
  }

  const stream = new EventSource(`${CHAT_API_BASE}/api/stream?room=${encodeURIComponent(room)}`)
  stream.onopen = () => onStatus('online')
  stream.onerror = () => onStatus('offline')
  stream.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'message' && data.message) {
        onMessage(data.message)
      }
    } catch {
      // Ignore malformed stream events.
    }
  }

  return () => stream.close()
}

export async function postMessage(payload) {
  if (CHAT_TRANSPORT === 'local') {
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...payload,
    }
    const roomMessages = readLocalRoom(payload.room)
    roomMessages.push(message)
    writeLocalRoom(payload.room, roomMessages)

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(`sequoia-chat-${payload.room}`)
      channel.postMessage({ type: 'message', message })
      channel.close()
    }
    return message
  }

  const response = await fetch(`${CHAT_API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error('Could not send message')
  }
  return null
}
