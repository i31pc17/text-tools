import { describe, it, expect } from 'vitest'
import { parsePlain, findJsonArrayPaths, getByPath } from '../app/utils/parse'

describe('parsePlain', () => {
  it('returns empty array for blank input', () => {
    expect(parsePlain('')).toEqual([])
    expect(parsePlain('   \n  ')).toEqual([])
  })

  it('splits a single comma-separated line', () => {
    expect(parsePlain('a, b, c')).toEqual(['a', 'b', 'c'])
  })

  it('splits multi-line newline-separated text', () => {
    expect(parsePlain('apple\nbanana\ncherry')).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles mixed newline + comma rows', () => {
    expect(parsePlain('a, b\nc, d')).toEqual(['a', 'b', 'c', 'd'])
  })

  it('strips outer single quotes', () => {
    expect(parsePlain("'hello', 'world'")).toEqual(['hello', 'world'])
  })

  it('strips outer double quotes', () => {
    expect(parsePlain('"hello", "world"')).toEqual(['hello', 'world'])
  })

  it('preserves commas inside quotes', () => {
    expect(parsePlain('"a, b", c')).toEqual(['a, b', 'c'])
  })

  it('strips surrounding brackets', () => {
    expect(parsePlain('[a, b, c]')).toEqual(['a', 'b', 'c'])
    expect(parsePlain('(x, y)')).toEqual(['x', 'y'])
  })

  it('tokenizes whitespace-separated input as fallback', () => {
    expect(parsePlain('alpha beta gamma')).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('drops empty entries from blank lines', () => {
    expect(parsePlain('a\n\nb\n')).toEqual(['a', 'b'])
  })
})

describe('findJsonArrayPaths', () => {
  it('returns empty path for top-level array', () => {
    expect(findJsonArrayPaths([1, 2, 3])).toEqual([''])
  })

  it('finds nested array paths', () => {
    const tree = { users: [1, 2], meta: { tags: ['a', 'b'] } }
    expect(findJsonArrayPaths(tree)).toEqual(['users', 'meta.tags'])
  })

  it('returns empty list when no arrays exist', () => {
    expect(findJsonArrayPaths({ a: 1, b: { c: 'x' } })).toEqual([])
  })

  it('walks into arrays of objects', () => {
    const tree = { rows: [{ items: [1] }] }
    expect(findJsonArrayPaths(tree)).toEqual(['rows'])
  })
})

describe('getByPath', () => {
  it('returns root when path is empty', () => {
    const root = { a: 1 }
    expect(getByPath(root, '')).toBe(root)
  })

  it('resolves single-level keys', () => {
    expect(getByPath({ a: 42 }, 'a')).toBe(42)
  })

  it('resolves nested paths', () => {
    expect(getByPath({ a: { b: { c: 'deep' } } }, 'a.b.c')).toBe('deep')
  })

  it('returns undefined for missing paths', () => {
    expect(getByPath({ a: 1 }, 'a.missing')).toBeUndefined()
    expect(getByPath({}, 'x')).toBeUndefined()
  })
})
