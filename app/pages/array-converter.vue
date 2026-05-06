<script setup lang="ts">
import { parsePlain, findJsonArrayPaths, getByPath } from '~/utils/parse'

definePageMeta({ ssr: false })

const input = ref('')
const quoteStyle = ref<'none' | 'single' | 'double'>('none')
const separator = ref<'space' | 'comma' | 'newline'>('space')
const surround = ref<'none' | 'square' | 'paren'>('none')
const uniqueOnly = ref<'on' | 'off'>('off')

const selJsonKey = ref('')
const selJsonField = ref('')
const selXmlKey = ref('')
const selXmlField = ref('')

interface Analysis {
  type: 'empty' | 'json' | 'xml' | 'plain'
  root?: unknown
  doc?: Document
  keyOptions?: string[]
}

const analysis = computed<Analysis>(() => {
  const t = input.value.trim()
  if (!t) return { type: 'empty' }
  try {
    const parsed = JSON.parse(t)
    const paths = findJsonArrayPaths(parsed)
    const keyOptions = paths.length ? paths : (Array.isArray(parsed) ? [''] : [])
    return { type: 'json', root: parsed, keyOptions }
  } catch {}
  if (t.startsWith('<') && typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(t, 'text/xml')
      if (!doc.getElementsByTagName('parsererror').length) {
        const counts = new Map<string, number>()
        const all = doc.getElementsByTagName('*')
        for (let i = 0; i < all.length; i++) {
          const tag = all[i]!.tagName
          counts.set(tag, (counts.get(tag) || 0) + 1)
        }
        return { type: 'xml', doc, keyOptions: Array.from(counts.keys()) }
      }
    } catch {}
  }
  return { type: 'plain' }
})

watch(analysis, (a) => {
  if (a.type === 'json') {
    const ko = a.keyOptions || []
    if (!ko.includes(selJsonKey.value)) selJsonKey.value = ko[0] || ''
  } else if (a.type === 'xml') {
    const ko = a.keyOptions || []
    if (!ko.includes(selXmlKey.value)) selXmlKey.value = ko[0] || ''
  }
})

const jsonFieldOptions = computed<string[]>(() => {
  const a = analysis.value
  if (a.type !== 'json') return []
  const arr = getByPath(a.root, selJsonKey.value)
  if (!Array.isArray(arr) || !arr.length) return []
  if (!arr.some((v) => v && typeof v === 'object' && !Array.isArray(v))) return []
  const set = new Set<string>()
  arr.forEach((v) => { if (v && typeof v === 'object' && !Array.isArray(v)) Object.keys(v as Record<string, unknown>).forEach((k) => set.add(k)) })
  return Array.from(set)
})

const xmlFieldOptions = computed<string[]>(() => {
  const a = analysis.value
  if (a.type !== 'xml' || !a.doc || !selXmlKey.value) return []
  const nodes = Array.from(a.doc.getElementsByTagName(selXmlKey.value))
  if (!nodes.length) return []
  if (!nodes.some((n) => n.children.length > 0)) return []
  const set = new Set<string>()
  nodes.forEach((n) => Array.from(n.children).forEach((c) => set.add(c.tagName)))
  return Array.from(set)
})

watch(jsonFieldOptions, (opts) => {
  if (opts.length && !opts.includes(selJsonField.value)) selJsonField.value = opts[0] || ''
  else if (!opts.length) selJsonField.value = ''
})
watch(xmlFieldOptions, (opts) => {
  if (opts.length && !opts.includes(selXmlField.value)) selXmlField.value = opts[0] || ''
  else if (!opts.length) selXmlField.value = ''
})

const baseItems = computed<string[]>(() => {
  const a = analysis.value
  if (a.type === 'plain' || a.type === 'empty') return parsePlain(input.value)
  if (a.type === 'json' && a.root != null) {
    const arr = getByPath(a.root, selJsonKey.value)
    if (!Array.isArray(arr) || !arr.length) return []
    const first = arr[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      if (!selJsonField.value) return []
      return arr.map((r) => r && (r as Record<string, unknown>)[selJsonField.value] != null ? String((r as Record<string, unknown>)[selJsonField.value]) : '').filter((v) => v !== '')
    }
    return arr.map((v) => String(v))
  }
  if (a.type === 'xml' && a.doc) {
    if (!selXmlKey.value) return []
    const nodes = Array.from(a.doc.getElementsByTagName(selXmlKey.value))
    if (!nodes.length) return []
    if (xmlFieldOptions.value.length && selXmlField.value) {
      return nodes.map((n) => {
        const c = n.getElementsByTagName(selXmlField.value)[0]
        return c ? (c.textContent || '').trim() : ''
      }).filter((v) => v.length > 0)
    }
    return nodes.map((n) => (n.textContent || '').trim()).filter((v) => v.length > 0)
  }
  return []
})

const finalItems = computed<string[]>(() => {
  if (uniqueOnly.value !== 'on') return baseItems.value
  const seen = new Set<string>()
  const r: string[] = []
  for (const it of baseItems.value) { if (!seen.has(it)) { seen.add(it); r.push(it) } }
  return r
})

const formatted = computed(() => {
  if (!finalItems.value.length) return ''
  const wrapped = finalItems.value.map((it) => {
    if (quoteStyle.value === 'single') return `'${it.replace(/'/g, "\\'")}'`
    if (quoteStyle.value === 'double') return `"${it.replace(/"/g, '\\"')}"`
    return it
  })
  let sep = ' '
  if (separator.value === 'comma') sep = ', '
  if (separator.value === 'newline') sep = '\n'
  let body = wrapped.join(sep)
  if (surround.value === 'square') body = `[${body}]`
  else if (surround.value === 'paren') body = `(${body})`
  return body
})

const typeLabel = computed(() => ({
  json: 'JSON', xml: 'XML', plain: 'Plain', empty: '없음'
} as Record<string, string>)[analysis.value.type])

const jsonKeyOptions = computed(() =>
  (analysis.value.keyOptions || []).map((p) => ({ value: p, label: p || '(root)' }))
)

const QUOTE_OPTS = [
  { value: 'none' as const, label: '없음' },
  { value: 'single' as const, label: "'" },
  { value: 'double' as const, label: '"' }
]
const SEP_OPTS = [
  { value: 'space' as const, label: '공백' },
  { value: 'comma' as const, label: ',' },
  { value: 'newline' as const, label: '↵' }
]
const SURROUND_OPTS = [
  { value: 'none' as const, label: '없음' },
  { value: 'square' as const, label: '[ ]' },
  { value: 'paren' as const, label: '( )' }
]
const UNIQUE_OPTS = [
  { value: 'off' as const, label: '중복허용' },
  { value: 'on' as const, label: '중복제거' }
]
</script>

<template>
  <div>
    <PageHeader />

    <div class="split-2">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">입력</h2>
          <BaseButton size="xs" variant="danger-ghost" icon="reset" @click="input = ''">초기화</BaseButton>
        </div>
        <div class="card-body">
          <textarea
            v-model="input"
            class="textarea"
            rows="22"
            placeholder="JSON, XML, 또는 줄바꿈/콤마 구분 텍스트를 붙여넣으세요."
          />
        </div>
        <div class="card-footer">
          <span class="hint">길이 {{ input.length }}자</span>
          <span class="format-pill" :data-fmt="analysis.type">{{ typeLabel }}</span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">변환 결과</h2>
          <div class="row">
            <span class="hint">아이템 {{ finalItems.length }}개</span>
            <CopyButton :text="formatted" />
          </div>
        </div>
        <div class="card-body col" style="gap: var(--pad-md)">
          <div v-if="analysis.type === 'json' && jsonKeyOptions.length > 0" class="col-tight">
            <span class="label">JSON 배열 키</span>
            <ChipGroup v-model="selJsonKey" :options="jsonKeyOptions" />
          </div>
          <div v-if="jsonFieldOptions.length > 0" class="col-tight">
            <span class="label">JSON 필드</span>
            <ChipGroup v-model="selJsonField" :options="jsonFieldOptions" />
          </div>
          <div v-if="analysis.type === 'xml' && (analysis.keyOptions || []).length > 0" class="col-tight">
            <span class="label">XML 배열 태그</span>
            <ChipGroup v-model="selXmlKey" :options="analysis.keyOptions || []" />
          </div>
          <div v-if="xmlFieldOptions.length > 0" class="col-tight">
            <span class="label">XML 필드</span>
            <ChipGroup v-model="selXmlField" :options="xmlFieldOptions" />
          </div>

          <div class="row" style="gap: var(--pad-lg); flex-wrap: wrap">
            <div class="col-tight">
              <span class="label">문자 감싸기</span>
              <SegGroup v-model="quoteStyle" :options="QUOTE_OPTS" />
            </div>
            <div class="col-tight">
              <span class="label">구분자</span>
              <SegGroup v-model="separator" :options="SEP_OPTS" />
            </div>
            <div class="col-tight">
              <span class="label">양끝 감싸기</span>
              <SegGroup v-model="surround" :options="SURROUND_OPTS" />
            </div>
            <div class="col-tight">
              <span class="label">기타</span>
              <SegGroup v-model="uniqueOnly" :options="UNIQUE_OPTS" />
            </div>
          </div>

          <textarea :value="formatted" class="textarea" rows="14" readonly placeholder="변환 결과가 여기에 표시됩니다." />
        </div>
      </div>
    </div>
  </div>
</template>
