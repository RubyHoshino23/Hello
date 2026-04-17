import { useEffect, useMemo, useRef, useState } from 'react'
import { CHAT_API_BASE, CHAT_ROOM } from './chatConfig.js'
import { getVisitorId } from './chatIdentity.js'

const AUTO_WAIT_ID = 'auto-wait-msg'
const AUTO_WAIT_FOLLOWUP_ID = 'auto-wait-followup-msg'
const AUTO_WAIT_TEXT =
  'Thank you for contacting Sequoia Law Group. Please wait while we connect you with an available team member.'
const AUTO_WAIT_FOLLOWUP_TEXT =
  'During busy periods, responses may take a few minutes. Your message is important to us and we will reply shortly.'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('connecting')
  const [isSending, setIsSending] = useState(false)
  const listRef = useRef(null)
  const followupTimerRef = useRef(null)

  const visitorId = useMemo(() => getVisitorId(), [])

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
    if (!isOpen) {
      if (followupTimerRef.current) {
        clearTimeout(followupTimerRef.current)
        followupTimerRef.current = null
      }
      return
    }
    setMessages((prev) => {
      if (prev.some((message) => message.id === AUTO_WAIT_ID)) return prev
      return [
        ...prev,
        {
          id: AUTO_WAIT_ID,
          sender: 'system-assistant',
          senderLabel: 'Sequoia Assistant',
          role: 'system',
          text: AUTO_WAIT_TEXT,
        },
      ]
    })

    followupTimerRef.current = setTimeout(() => {
      setMessages((prev) => {
        if (prev.some((message) => message.id === AUTO_WAIT_FOLLOWUP_ID)) return prev
        if (prev.some((message) => message.role === 'agent' && message.sender !== 'system-assistant')) {
          return prev
        }
        return [
          ...prev,
          {
            id: AUTO_WAIT_FOLLOWUP_ID,
            sender: 'system-assistant',
            senderLabel: 'Sequoia Assistant',
            role: 'system',
            text: AUTO_WAIT_FOLLOWUP_TEXT,
          },
        ]
      })
    }, 4500)
    return () => {
      if (followupTimerRef.current) {
        clearTimeout(followupTimerRef.current)
        followupTimerRef.current = null
      }
    }
  }, [isOpen])

  const hasAgentReply = useMemo(
    () => messages.some((m) => m.role === 'agent' && m.sender !== 'system-assistant'),
    [messages],
  )

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isOpen])

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
          sender: visitorId,
          senderLabel: 'You',
          role: 'visitor',
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

  function openAgentWindow() {
    window.open('/?agent=1', 'sequoia-agent-console', 'width=520,height=760')
  }

  function usePrompt(text) {
    setInput(text)
    setIsOpen(true)
  }

  return (
    <div className="chat-widget">
      {isOpen ? (
        <section className="chat-panel" aria-live="polite">
          <header className="chat-header">
            <div>
              <p className="chat-title">Live Chat</p>
              <p className={`chat-status chat-${status}`}>
                {status === 'online'
                  ? 'Connected'
                  : 'Connecting to our support desk...'}
              </p>
              <div className="chat-tools">
                <button
                  className="chat-tool-btn"
                  onClick={() => usePrompt('I need help with a contract review.')}
                >
                  Contract Help
                </button>
                <button
                  className="chat-tool-btn"
                  onClick={() => usePrompt('I need a consultation for a business dispute.')}
                >
                  Business Dispute
                </button>
              </div>
            </div>
            <button
              className="chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="chat-messages" ref={listRef}>
            {messages.length === 0 ? (
              <p className="chat-empty">
                Type below to tell us how we can help.
              </p>
            ) : (
              messages.map((message) => {
                const isVisitor = message.sender === visitorId
                return (
                  <article
                    key={message.id}
                    className={`chat-bubble ${isVisitor ? 'is-me' : 'is-agent'}`}
                  >
                    <p className="chat-bubble-label">
                      {isVisitor ? 'You' : message.senderLabel || 'Team'}
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
              placeholder="Type your message..."
              className="chat-input"
            />
            <button className="chat-send" type="submit" disabled={isSending}>
              Send
            </button>
          </form>
          <button className="chat-test-link" onClick={openAgentWindow}>
            Open Agent Test Window
          </button>
        </section>
      ) : null}

      <button className="chat-fab" onClick={() => setIsOpen((prev) => !prev)}>
        Live Chat
      </button>
    </div>
  )
}
