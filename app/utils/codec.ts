const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: false })

export function b64Encode(s: string): string {
  if (!s) return ''
  const bytes = encoder.encode(s)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin)
}

export function b64Decode(s: string): string {
  if (!s) return ''
  const bin = atob(s)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return decoder.decode(bytes)
}

export function b64UrlDecode(part: string): string {
  let b = part.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b.length % 4
  if (pad === 2) b += '=='
  else if (pad === 3) b += '='
  else if (pad === 1) throw new Error('Invalid base64url length')
  const bin = atob(b)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

export interface DecodedJwt {
  header: unknown
  payload: unknown
  formatErr: string | null
  hErr: string | null
  pErr: string | null
}

export function decodeJwt(input: string): DecodedJwt {
  let raw = input.trim()
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1)
  }
  if (!raw) return { header: null, payload: null, formatErr: null, hErr: null, pErr: null }
  const parts = raw.split('.')
  if (parts.length < 2) {
    return { header: null, payload: null, formatErr: 'JWT 형식이 아닙니다. (header.payload[.signature])', hErr: null, pErr: null }
  }
  let header: unknown = null
  let payload: unknown = null
  let hErr: string | null = null
  let pErr: string | null = null
  try { header = JSON.parse(b64UrlDecode(parts[0]!)) } catch { hErr = 'HEADER 디코딩/파싱 실패' }
  try { payload = JSON.parse(b64UrlDecode(parts[1]!)) } catch { pErr = 'PAYLOAD 디코딩/파싱 실패' }
  return { header, payload, formatErr: null, hErr, pErr }
}

export function parseDate(val: string): Date | null {
  const t = val.trim()
  if (!t) return null
  if (/^\d+$/.test(t)) {
    const n = parseInt(t, 10)
    return new Date(n < 10000000000 ? n * 1000 : n)
  }
  let s = t.replace(/\s+/g, 'T')
  if (!/[Z+-]/.test(s)) {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s)) s += '+09:00'
  }
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}
