import { useEffect, useMemo, useRef, useState } from 'react'
import { AGENT_ACCESS_KEY, CHAT_ROOM } from './chatConfig.js'
import {
  loadHistory as loadChatHistory,
  postMessage,
  subscribeMessages,
} from './chatTransport.js'

const AGENT_ID = 'agent-sequoia'
const AGENT_AUTH_SESSION_KEY = 'sequoia_agent_console_authorized'
const AUTO_WAIT_FLAG_KEY = 'sequoia_auto_wait_enabled'

export default function AgentConsole() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [accessInput, setAccessInput] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (!AGENT_ACCESS_KEY) return true
    return sessionStorage.getItem(AGENT_AUTH_SESSION_KEY) === '1'
  })
  const [activeClient, setActiveClient] = useState('all')
  const [autoWaitEnabled, setAutoWaitEnabled] = useState(() => {
    const saved = localStorage.getItem(AUTO_WAIT_FLAG_KEY)
    if (saved === null) return true
    return saved !== 'false'
  })
  const [status, setStatus] = useState('connecting')
  const [isSending, setIsSending] = useState(false)
  const listRef = useRef(null)

  const agentLabel = useMemo(() => 'Sequoia Team', [])
  const clientThreads = useMemo(() => {
    const order = []
    const bySender = new Map()
    for (const message of messages) {
      const isClient =
        message.role !== 'agent' &&
        message.sender !== AGENT_ID &&
        message.sender !== 'system-assistant'
      if (!isClient) continue

      if (!bySender.has(message.sender)) {
        order.push(message.sender)
        bySender.set(message.sender, {
          sender: message.sender,
          senderLabel: message.senderLabel || 'Visitor',
          label: `Client ${order.length}`,
          latestAt: message.createdAt ?? message.timestamp ?? '',
        })
      } else {
        const existing = bySender.get(message.sender)
        existing.latestAt = message.createdAt ?? message.timestamp ?? existing.latestAt
      }
    }
    return order.map((sender) => bySender.get(sender))
  }, [messages])

  const visibleMessages = useMemo(() => {
    if (activeClient === 'all') return messages
    return messages.filter((message) => {
      const isAgent = message.role === 'agent' || message.sender === AGENT_ID
      if (message.sender === 'system-assistant') return true
      if (isAgent) return message.targetClient === activeClient
      return message.sender === activeClient
    })
  }, [messages, activeClient])

  useEffect(() => {
    if (!isAuthorized) return () => {}
    let cancelled = false

    async function loadHistory() {
      try {
        const data = await loadChatHistory(CHAT_ROOM)
        if (!cancelled) {
          setMessages(data)
        }
      } catch (_err) {
        if (!cancelled) setStatus('offline')
      }
    }

    loadHistory()

    const unsubscribe = subscribeMessages(CHAT_ROOM, {
      onStatus: setStatus,
      onMessage: (message) => {
        setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]))
      },
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [isAuthorized])

  useEffect(() => {
    localStorage.setItem(AUTO_WAIT_FLAG_KEY, autoWaitEnabled ? 'true' : 'false')
  }, [autoWaitEnabled])

  useEffect(() => {
    if (activeClient === 'all') return
    if (!clientThreads.some((item) => item.sender === activeClient)) {
      setActiveClient('all')
    }
  }, [activeClient, clientThreads])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [visibleMessages])

  async function sendMessage(event) {
    event.preventDefault()
    const text = input.trim()
    if (!text || isSending) return

    setIsSending(true)
    try {
      const targetClient =
        activeClient !== 'all'
          ? activeClient
          : clientThreads.length > 0
            ? clientThreads[0].sender
            : null

      if (!targetClient) {
        return
      }

      const created = await postMessage({
        room: CHAT_ROOM,
        sender: AGENT_ID,
        senderLabel: agentLabel,
        role: 'agent',
        targetClient,
        text,
      })
      if (created) {
        setMessages((prev) => [...prev, created])
      }
      setInput('')
    } finally {
      setIsSending(false)
    }
  }

  function unlockConsole(event) {
    event.preventDefault()
    if (!AGENT_ACCESS_KEY || accessInput === AGENT_ACCESS_KEY) {
      setIsAuthorized(true)
      sessionStorage.setItem(AGENT_AUTH_SESSION_KEY, '1')
      setAccessInput('')
      return
    }
    setAccessInput('')
  }

  if (!isAuthorized) {
    return (
      <main className="agent-page">
        <section className="agent-auth-panel">
          <p className="agent-title">Agent Console Access</p>
          <p className="agent-wait-copy">Enter your private access key to open the console.</p>
          <form className="agent-auth-form" onSubmit={unlockConsole}>
            <input
              type="password"
              value={accessInput}
              onChange={(event) => setAccessInput(event.target.value)}
              placeholder="Access key"
              className="chat-input"
            />
            <button className="chat-send" type="submit">Unlock</button>
          </form>
        </section>
      </main>
    )
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
            <div className="agent-controls">
              <button
                className={`agent-control-btn ${autoWaitEnabled ? 'is-active' : ''}`}
                onClick={() => setAutoWaitEnabled((prev) => !prev)}
              >
                Auto Wait: {autoWaitEnabled ? 'On' : 'Off'}
              </button>
            </div>
            <p className="agent-wait-copy">
              Visitors see an automatic wait message until someone from the team replies.
              Reply below when you are ready to take the conversation.
            </p>
          </div>
        </header>

        <div className="agent-client-tabs">
          <button
            className={`agent-client-tab ${activeClient === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveClient('all')}
          >
            All Clients
          </button>
          {clientThreads.map((client) => (
            <button
              key={client.sender}
              className={`agent-client-tab ${activeClient === client.sender ? 'is-active' : ''}`}
              onClick={() => setActiveClient(client.sender)}
            >
              {client.label}
            </button>
          ))}
        </div>

        <div className="agent-messages" ref={listRef}>
          <p className="agent-auto-msg">
            <strong>System:</strong> New visitor messages and contact inquiries appear in this thread.
            Typical first response should be sent within a few minutes during business hours.
          </p>
          {visibleMessages.length === 0 ? (
            <p className="chat-empty">Waiting for a visitor message…</p>
          ) : (
            visibleMessages.map((message) => {
              const isAgent =
                message.role === 'agent' ||
                message.sender === AGENT_ID ||
                message.senderLabel === agentLabel ||
                String(message.sender ?? '').startsWith('agent')
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
            placeholder={
              activeClient === 'all'
                ? 'Select a client tab to reply...'
                : `Reply to ${clientThreads.find((item) => item.sender === activeClient)?.label ?? 'Client'}...`
            }
            className="chat-input"
          />
          <button className="chat-send" type="submit" disabled={isSending || activeClient === 'all'}>
            Reply
          </button>
        </form>
      </section>
    </main>
  )
}
