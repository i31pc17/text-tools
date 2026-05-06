import { describe, it, expect } from 'vitest'
import { safeParseJson } from '../app/utils/json'

describe('safeParseJson', () => {
  it('returns null/null for empty input', () => {
    expect(safeParseJson('')).toEqual({ data: null, error: null })
    expect(safeParseJson('   \n  ')).toEqual({ data: null, error: null })
  })

  it('parses a simple object', () => {
    expect(safeParseJson('{"a":1}')).toEqual({ data: { a: 1 }, error: null })
  })

  it('parses an array', () => {
    expect(safeParseJson('[1,2,3]')).toEqual({ data: [1, 2, 3], error: null })
  })

  it('parses nested structures', () => {
    expect(safeParseJson('{"u":[{"id":1}]}')).toEqual({ data: { u: [{ id: 1 }] }, error: null })
  })

  it('parses scalar literals (true / false / null / number / string)', () => {
    expect(safeParseJson('true').data).toBe(true)
    expect(safeParseJson('false').data).toBe(false)
    expect(safeParseJson('null').data).toBe(null)
    expect(safeParseJson('42').data).toBe(42)
    expect(safeParseJson('"hi"').data).toBe('hi')
  })

  it('reports error for trailing comma', () => {
    expect(safeParseJson('{"a":1,}').error).toMatch(/유효하지 않은 JSON/)
  })

  it('reports error for unquoted keys', () => {
    expect(safeParseJson('{a:1}').error).toMatch(/유효하지 않은 JSON/)
  })

  it('reports error for single-quoted strings', () => {
    expect(safeParseJson("{'a':1}").error).toMatch(/유효하지 않은 JSON/)
  })

  it('reports error for unterminated object', () => {
    expect(safeParseJson('{"a":1').error).toMatch(/유효하지 않은 JSON/)
  })

  it('reports error for plain text', () => {
    expect(safeParseJson('not json').error).toMatch(/유효하지 않은 JSON/)
  })

  it('returned data is null on error', () => {
    expect(safeParseJson('{broken').data).toBeNull()
  })
})
