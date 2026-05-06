function hasCommaOutsideQuotes(line: string): boolean {
  let s = false, d = false
  for (const c of line) {
    if (c === "'" && !d) s = !s
    else if (c === '"' && !s) d = !d
    else if (c === ',' && !s && !d) return true
  }
  return false
}

function csvSplit(line: string): string[] {
  const items: string[] = []
  let cur = ''
  let s = false, d = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!
    if (c === "'" && !d) { s = !s; cur += c }
    else if (c === '"' && !s) { d = !d; cur += c }
    else if (c === ',' && !s && !d) { items.push(cur.trim()); cur = '' }
    else cur += c
  }
  if (cur.trim()) items.push(cur.trim())
  return items
}

function stripOuterQuotes(s: string): string {
  const t = s.trim()
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1)
  return t
}

export function parsePlain(text: string): string[] {
  const raw = text.trim()
  if (!raw) return []
  let cleaned = raw
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) cleaned = cleaned.slice(1, -1).trim()
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) cleaned = cleaned.slice(1, -1).trim()
  const lines = cleaned.split(/\r?\n/)
  if (lines.length > 1) {
    const r: string[] = []
    for (const lr of lines) {
      const l = lr.trim()
      if (!l) continue
      if (hasCommaOutsideQuotes(l)) {
        csvSplit(l).forEach((p) => { const v = stripOuterQuotes(p); if (v) r.push(v) })
      } else {
        const v = stripOuterQuotes(l)
        if (v) r.push(v)
      }
    }
    return r
  }
  if (hasCommaOutsideQuotes(cleaned)) return csvSplit(cleaned).map(stripOuterQuotes).filter((v) => v.length > 0)
  const tokens: string[] = []
  const re = /'([^']*)'|"([^"]*)"|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(cleaned)) !== null) {
    const v = (m[1] ?? m[2] ?? m[3] ?? '').trim()
    if (v) tokens.push(v)
  }
  return tokens
}

export function findJsonArrayPaths(root: unknown): string[] {
  const r: string[] = []
  function visit(n: unknown, p: string) {
    if (Array.isArray(n)) r.push(p)
    if (n && typeof n === 'object' && !Array.isArray(n)) {
      for (const k of Object.keys(n as Record<string, unknown>)) {
        visit((n as Record<string, unknown>)[k], p ? `${p}.${k}` : k)
      }
    }
  }
  visit(root, '')
  return r
}

export function getByPath(root: unknown, path: string): unknown {
  if (!path) return root
  let cur: unknown = root
  for (const p of path.split('.')) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}
