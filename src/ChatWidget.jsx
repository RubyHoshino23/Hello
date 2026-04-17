import { useEffect, useMemo, useRef, useState } from 'react'
import { CHAT_ROOM } from './chatConfig.js'
import { getVisitorId } from './chatIdentity.js'
import {
  loadHistory as loadChatHistory,
  postMessage,
  subscribeMessages,
} from './chatTransport.js'

const AUTO_WAIT_ID = 'auto-wait-msg'
const AUTO_WAIT_FOLLOWUP_ID = 'auto-wait-followup-msg'
const AUTO_WAIT_TEXT =
  'Thank you for contacting Sequoia Law Group. Please wait while we connect you with a team member.'
const AUTO_WAIT_FOLLOWUP_TEXT =
  'We are currently assisting other clients. Please stay in this chat and we will respond as soon as possible.'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('connecting')
  const [isSending, setIsSending] = useState(false)
  const [autoWaitEnabled, setAutoWaitEnabled] = useState(true)
  const listRef = useRef(null)
  const followupTimerRef = useRef(null)

  const visitorId = useMemo(() => getVisitorId(), [])

  useEffect(() => {
    let cancelled = false

    async function hydrateHistory() {
      try {
        const data = await loadChatHistory(CHAT_ROOM)
        if (!cancelled) {
          setMessages(data)
        }
      } catch (_err) {
        if (!cancelled) setStatus('offline')
      }
    }

    hydrateHistory()

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
  }, [])

  useEffect(() => {
    if (!isOpen) {
      if (followupTimerRef.current) {
        clearTimeout(followupTimerRef.current)
        followupTimerRef.current = null
      }
      return
    }
    if (!autoWaitEnabled) {
      setMessages((prev) =>
        prev.filter(
          (message) => message.id !== AUTO_WAIT_ID && message.id !== AUTO_WAIT_FOLLOWUP_ID,
        ),
      )
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
  }, [isOpen, autoWaitEnabled])

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
      const created = await postMessage({
        room: CHAT_ROOM,
        sender: visitorId,
        senderLabel: 'You',
        role: 'visitor',
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
                <button
                  className={`chat-tool-btn ${autoWaitEnabled ? 'is-active' : ''}`}
                  onClick={() => setAutoWaitEnabled((prev) => !prev)}
                >
                  Auto Wait: {autoWaitEnabled ? 'On' : 'Off'}
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
