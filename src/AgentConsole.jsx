import { useEffect, useMemo, useRef, useState } from 'react'
import { CHAT_API_BASE, CHAT_ROOM } from './chatConfig.js'

const AGENT_ID = 'agent-sequoia'

export default function AgentConsole() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('connecting')
  const [isSending, setIsSending] = useState(false)
  const listRef = useRef(null)

  const agentLabel = useMemo(() => 'Sequoia Team', [])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function loadHistory() {
      try {
        const response = await fetch(
          `${CHAT_API_BASE}/api/messages?room=${encodeURIComponent(CHAT_ROOM)}`,
          { signal: controller.signal },
        )
        const data = await response.json()
        if (!cancelled) {
          setMessages(Array.isArray(data.messages) ? data.messages : [])
        }
      } catch (_err) {
        if (!cancelled) setStatus('offline')
      }
    }

    loadHistory()

    const stream = new EventSource(
      `${CHAT_API_BASE}/api/stream?room=${encodeURIComponent(CHAT_ROOM)}`,
    )
    stream.onopen = () => setStatus('online')
    stream.onerror = () => setStatus('offline')
    stream.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'message' && data.message) {
          setMessages((prev) => [...prev, data.message])
        }
      } catch (_err) {
        // Ignore malformed stream events.
      }
    }

    return () => {
      cancelled = true
      controller.abort()
      stream.close()
    }
  }, [])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(event) {
    event.preventDefault()
    const text = input.trim()
    if (!text || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`${CHAT_API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: CHAT_ROOM,
          sender: AGENT_ID,
          senderLabel: agentLabel,
          role: 'agent',
          text,
        }),
      })

      if (response.ok) {
        setInput('')
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="agent-page">
      <section className="agent-panel">
        <header className="agent-header">
          <div>
            <p className="agent-title">Agent Console</p>
            <p className={`chat-status chat-${status}`}>
              {status === 'online' ? 'Connected — monitoring visitor chat' : 'Connecting...'}
            </p>
            <p className="agent-wait-copy">
              Visitors see an automatic wait message until someone from the team replies.
              Reply below when you are ready to take the conversation.
            </p>
          </div>
        </header>

        <div className="agent-messages" ref={listRef}>
          <p className="agent-auto-msg">
            <strong>System:</strong> New visitor messages and contact inquiries appear in this thread.
            Typical first response should be sent within a few minutes during business hours.
          </p>
          {messages.length === 0 ? (
            <p className="chat-empty">Waiting for a visitor message…</p>
          ) : (
            messages.map((message) => {
              const isAgent = message.role === 'agent' || message.sender === AGENT_ID
              return (
                <article
                  key={message.id}
                  className={`chat-bubble ${isAgent ? 'is-me' : 'is-agent'}`}
                >
                  <p className="chat-bubble-label">
                    {isAgent ? agentLabel : message.senderLabel || 'Visitor'}
                  </p>
                  <p>{message.text}</p>
                </article>
              )
            })
          )}
        </div>

        <form className="chat-form" onSubmit={sendMessage}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Reply as Sequoia Team..."
            className="chat-input"
          />
          <button className="chat-send" type="submit" disabled={isSending}>
            Reply
          </button>
        </form>
      </section>
    </main>
  )
}
