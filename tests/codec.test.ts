import { describe, it, expect } from 'vitest'
import { b64Encode, b64Decode, b64UrlDecode, decodeJwt, parseDate } from '../app/utils/codec'

function b64url(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

describe('Base64 codec', () => {
  it('roundtrips ASCII', () => {
    expect(b64Decode(b64Encode('hello'))).toBe('hello')
  })

  it('roundtrips UTF-8 (Korean)', () => {
    const s = '안녕하세요 세계'
    expect(b64Decode(b64Encode(s))).toBe(s)
  })

  it('encodes empty string as empty', () => {
    expect(b64Encode('')).toBe('')
    expect(b64Decode('')).toBe('')
  })

  it('throws on invalid base64', () => {
    expect(() => b64Decode('not!valid@base64')).toThrow()
  })
})

describe('b64UrlDecode (JWT)', () => {
  it('decodes a typical JWT header', () => {
    // {"alg":"HS256","typ":"JWT"}
    expect(b64UrlDecode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')).toBe('{"alg":"HS256","typ":"JWT"}')
  })

  it('decodes URL-safe characters (- and _)', () => {
    // Encodes "subjects?" using base64url alphabet
    const encoded = btoa('subjects?').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    expect(b64UrlDecode(encoded)).toBe('subjects?')
  })

  it('throws on length-1 mod-4 input', () => {
    expect(() => b64UrlDecode('a')).toThrow()
  })
})

describe('decodeJwt', () => {
  it('returns all-null shape for empty input', () => {
    const r = decodeJwt('')
    expect(r).toEqual({ header: null, payload: null, formatErr: null, hErr: null, pErr: null })
  })

  it('treats whitespace-only input as empty', () => {
    expect(decodeJwt('   \n  ').formatErr).toBeNull()
  })

  it('reports format error when missing dot', () => {
    expect(decodeJwt('abcdef').formatErr).toMatch(/JWT 형식/)
  })

  it('reports format error for single segment', () => {
    expect(decodeJwt('eyJhbGciOiJIUzI1NiJ9').formatErr).toMatch(/JWT 형식/)
  })

  it('decodes a valid 2-part token (header.payload)', () => {
    const token = `${b64url('{"alg":"HS256","typ":"JWT"}')}.${b64url('{"sub":"1234","name":"Alice"}')}`
    const r = decodeJwt(token)
    expect(r.formatErr).toBeNull()
    expect(r.hErr).toBeNull()
    expect(r.pErr).toBeNull()
    expect(r.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(r.payload).toEqual({ sub: '1234', name: 'Alice' })
  })

  it('decodes a 3-part token and ignores the signature', () => {
    const token = `${b64url('{"alg":"none"}')}.${b64url('{"x":1}')}.signaturepart`
    const r = decodeJwt(token)
    expect(r.header).toEqual({ alg: 'none' })
    expect(r.payload).toEqual({ x: 1 })
  })

  it('strips wrapping double quotes from input', () => {
    const inner = `${b64url('{"alg":"HS256"}')}.${b64url('{"a":1}')}`
    const r = decodeJwt(`"${inner}"`)
    expect(r.payload).toEqual({ a: 1 })
  })

  it('strips wrapping single quotes from input', () => {
    const inner = `${b64url('{"alg":"HS256"}')}.${b64url('{"a":1}')}`
    const r = decodeJwt(`'${inner}'`)
    expect(r.payload).toEqual({ a: 1 })
  })

  it('flags HEADER error when header is unreadable but payload is fine', () => {
    const token = `~~~broken~~~.${b64url('{"sub":"ok"}')}`
    const r = decodeJwt(token)
    expect(r.hErr).toMatch(/HEADER/)
    expect(r.pErr).toBeNull()
    expect(r.payload).toEqual({ sub: 'ok' })
  })

  it('flags PAYLOAD error when payload is unreadable but header is fine', () => {
    const token = `${b64url('{"alg":"HS256"}')}.~~~broken~~~`
    const r = decodeJwt(token)
    expect(r.hErr).toBeNull()
    expect(r.pErr).toMatch(/PAYLOAD/)
    expect(r.header).toEqual({ alg: 'HS256' })
  })

  it('flags PAYLOAD error when payload decodes but is not JSON', () => {
    const token = `${b64url('{"alg":"HS256"}')}.${b64url('not json at all')}`
    const r = decodeJwt(token)
    expect(r.pErr).toMatch(/PAYLOAD/)
  })
})

describe('parseDate', () => {
  it('returns null for empty input', () => {
    expect(parseDate('')).toBeNull()
    expect(parseDate('   ')).toBeNull()
  })

  it('parses unix seconds', () => {
    const d = parseDate('1700000000')
    expect(d).toBeInstanceOf(Date)
    expect(d!.getTime()).toBe(1700000000 * 1000)
  })

  it('parses unix milliseconds', () => {
    const d = parseDate('1700000000000')
    expect(d).toBeInstanceOf(Date)
    expect(d!.getTime()).toBe(1700000000000)
  })

  it('parses ISO-style date strings', () => {
    const d = parseDate('2024-05-20 14:30:00')
    expect(d).toBeInstanceOf(Date)
    expect(isNaN(d!.getTime())).toBe(false)
  })

  it('returns null for unparseable input', () => {
    expect(parseDate('not a date')).toBeNull()
  })
})
