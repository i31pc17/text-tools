export interface ParsedJson {
  data: unknown
  error: string | null
}

export function safeParseJson(input: string): ParsedJson {
  const t = input.trim()
  if (!t) return { data: null, error: null }
  try {
    return { data: JSON.parse(t), error: null }
  } catch {
    return { data: null, error: '유효하지 않은 JSON 입니다.' }
  }
}
