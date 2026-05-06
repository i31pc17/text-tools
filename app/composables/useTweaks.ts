type Theme = 'light' | 'dark'
type Density = 'compact' | 'default' | 'spacious'
type WidthMode = 'boxed' | 'full'

interface Tweaks {
  theme: Theme
  density: Density
  accent: string
}

const DEFAULTS: Tweaks = {
  theme: 'light',
  density: 'spacious',
  accent: '#3B82F6'
}

const STORAGE_KEY = 'tt-tweaks'
const WIDTH_STORAGE_KEY = 'tt-width'

export const ACCENT_PRESETS = ['#3B82F6', '#0A0A0A', '#16A34A', '#DC2626', '#F59E0B', '#7C3AED']

function applyTweaks(t: Tweaks) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.setAttribute('data-theme', t.theme)
  html.setAttribute('data-density', t.density)
  html.style.setProperty('--accent', t.accent)
  html.style.setProperty('--accent-hover', t.accent)
  html.style.setProperty('--accent-soft', t.accent + '14')
  html.style.setProperty('--accent-border', t.accent + '40')
}

function loadTweaks(): Tweaks {
  if (typeof localStorage === 'undefined') return { ...DEFAULTS }
  const t: Tweaks = { ...DEFAULTS }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Tweaks>
      if (parsed.theme === 'light' || parsed.theme === 'dark') t.theme = parsed.theme
      if (parsed.density === 'compact' || parsed.density === 'default' || parsed.density === 'spacious') t.density = parsed.density
      if (typeof parsed.accent === 'string') t.accent = parsed.accent
    }
  } catch {}
  return t
}

function loadWidthMode(): WidthMode {
  if (typeof localStorage === 'undefined') return 'boxed'
  try {
    const w = localStorage.getItem(WIDTH_STORAGE_KEY)
    if (w === 'boxed' || w === 'full') return w
  } catch {}
  return 'boxed'
}

function saveTweaks(t: Tweaks) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t))
  } catch {}
}

function saveWidthMode(w: WidthMode) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(WIDTH_STORAGE_KEY, w)
  } catch {}
}

export function hydrateTweaks() {
  if (typeof window === 'undefined') return
  const tweaks = useState<Tweaks>('tt-tweaks', () => ({ ...DEFAULTS }))
  const widthMode = useState<WidthMode>('tt-width', () => 'boxed')
  const hydrated = useState<boolean>('tt-hydrated', () => false)
  if (hydrated.value) return
  hydrated.value = true

  const loaded = loadTweaks()
  tweaks.value = loaded
  widthMode.value = loadWidthMode()
  applyTweaks(loaded)

  watch(tweaks, (next) => {
    applyTweaks(next)
    saveTweaks(next)
  }, { deep: true })
}

export function useTweaks() {
  const tweaks = useState<Tweaks>('tt-tweaks', () => ({ ...DEFAULTS }))
  const widthMode = useState<WidthMode>('tt-width', () => 'boxed')
  const tweaksOpen = useState<boolean>('tt-tweaks-open', () => false)

  function setTweak<K extends keyof Tweaks>(key: K, value: Tweaks[K]) {
    tweaks.value = { ...tweaks.value, [key]: value }
  }

  function toggleTheme() {
    setTweak('theme', tweaks.value.theme === 'dark' ? 'light' : 'dark')
  }

  function setWidthMode(mode: WidthMode) {
    widthMode.value = mode
    saveWidthMode(mode)
  }

  return {
    tweaks,
    setTweak,
    toggleTheme,
    widthMode,
    setWidthMode,
    tweaksOpen
  }
}
