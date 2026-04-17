const runtimeHost =
  typeof window !== 'undefined' && window.location?.hostname
    ? window.location.hostname
    : 'localhost'

const isGithubPages = runtimeHost.endsWith('github.io')

export const CHAT_API_BASE =
  import.meta.env.VITE_CHAT_API_BASE ?? (isGithubPages ? '' : `http://${runtimeHost}:8787`)
export const CHAT_ROOM = 'sequoia-website'
export const CHAT_TRANSPORT = CHAT_API_BASE ? 'remote' : 'local'
