const runtimeHost =
  typeof window !== 'undefined' && window.location?.hostname
    ? window.location.hostname
    : 'localhost'

export const CHAT_API_BASE =
  import.meta.env.VITE_CHAT_API_BASE ?? `http://${runtimeHost}:8787`
export const CHAT_ROOM = 'sequoia-website'
