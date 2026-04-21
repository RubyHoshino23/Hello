/**
 * Draft / handoff toggles (Vite env). Defaults keep current behavior.
 *
 * Live Chat: set VITE_ENABLE_LIVE_CHAT=false in .env.production (or .env.local)
 * before build to ship a static site without the widget — no code removal required.
 *
 * Agent console (?agent=1): set VITE_ENABLE_AGENT_CONSOLE=false to disable the
 * internal agent UI entirely (e.g. before giving the repo away).
 *
 * GitHub Pages: deploy is optional. To drop it later, remove the "predeploy",
 * "deploy", and "deploy:gh-pages" scripts and the gh-pages devDependency from
 * package.json; `npm run build` and hosting `dist/` still work.
 */
export const siteFeatures = {
  liveChat: import.meta.env.VITE_ENABLE_LIVE_CHAT !== 'false',
  agentConsole: import.meta.env.VITE_ENABLE_AGENT_CONSOLE !== 'false',
}
