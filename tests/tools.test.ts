import { describe, it, expect } from 'vitest'
import { textTools, findToolByPage } from '../app/utils/tools'

describe('textTools registry', () => {
  it('contains exactly 10 tools', () => {
    expect(textTools).toHaveLength(10)
  })

  it('has unique page slugs', () => {
    const slugs = textTools.map((t) => t.page)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('has unique 2-digit codes 01..10', () => {
    const codes = textTools.map((t) => t.code)
    expect(codes).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'])
  })

  it('every tool has name, description, and tag', () => {
    for (const t of textTools) {
      expect(t.name).toBeTruthy()
      expect(t.description).toBeTruthy()
      expect(t.tag).toBeTruthy()
    }
  })
})

describe('findToolByPage', () => {
  it('returns the matching tool by page slug', () => {
    expect(findToolByPage('json-viewer')?.code).toBe('01')
    expect(findToolByPage('time-converter')?.code).toBe('10')
  })

  it('returns undefined for unknown slug', () => {
    expect(findToolByPage('nope')).toBeUndefined()
  })

  it('returns undefined for nullish input', () => {
    expect(findToolByPage(undefined)).toBeUndefined()
    expect(findToolByPage(null)).toBeUndefined()
    expect(findToolByPage('')).toBeUndefined()
  })
})
