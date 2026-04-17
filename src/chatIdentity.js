export function getVisitorId() {
  const key = 'sequoia_chat_visitor_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing

  const generated = `visitor-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(key, generated)
  return generated
}
