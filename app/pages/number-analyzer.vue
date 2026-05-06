<script setup lang="ts">
import { parsePlain, findJsonArrayPaths, getByPath } from '~/utils/parse'

definePageMeta({ ssr: false })

const input = ref('')
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
        const tags = new Set<string>()
        const all = doc.getElementsByTagName('*')
        for (let i = 0; i < all.length; i++) tags.add(all[i]!.tagName)
        return { type: 'xml', doc, keyOptions: Array.from(tags) }
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

const numberItems = computed<number[]>(() => {
  const a = analysis.value
  let raw: string[] = []
  if (a.type === 'plain') raw = parsePlain(input.value)
  else if (a.type === 'json' && a.root) {
    const arr = getByPath(a.root, selJsonKey.value)
    if (Array.isArray(arr)) {
      raw = arr.map((v) => selJsonField.value && v && typeof v === 'object'
        ? String((v as Record<string, unknown>)[selJsonField.value])
        : String(v))
    }
  } else if (a.type === 'xml' && a.doc) {
    const nodes = Array.from(a.doc.getElementsByTagName(selXmlKey.value))
    raw = nodes.map((n) => {
      if (selXmlField.value) {
        const c = n.getElementsByTagName(selXmlField.value)[0]
        return c ? c.textContent || '' : ''
      }
      return n.textContent || ''
    })
  }
  return raw.map((v) => v.replace(/,/g, '').trim()).filter((v) => v !== '' && !isNaN(Number(v))).map(Number)
})

interface Stats { count: number; sum: number; avg: number; median: number; mode: string; min: number; max: number }

const stats = computed<Stats | null>(() => {
  const data = [...numberItems.value].sort((a, b) => a - b)
  if (!data.length) return null
  const sum = data.reduce((a, b) => a + b, 0)
  const min = data[0]!
  const max = data[data.length - 1]!
  const avg = sum / data.length
  const mid = Math.floor(data.length / 2)
  const median = data.length % 2 ? data[mid]! : (data[mid - 1]! + data[mid]!) / 2
  const counts = new Map<number, number>()
  let maxFreq = 0
  data.forEach((v) => {
    const c = (counts.get(v) || 0) + 1
    counts.set(v, c)
    if (c > maxFreq) maxFreq = c
  })
  const modes = Array.from(counts.entries()).filter(([, c]) => c === maxFreq).map(([v]) => v)
  const modeStr = (maxFreq === 1 && data.length > 1) ? '없음' : modes.join(', ')
  return { count: data.length, sum, avg, median, mode: modeStr, min, max }
})

function fmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

const jsonKeyOptions = computed(() =>
  (analysis.value.keyOptions || []).map((p) => ({ value: p, label: p || '(root)' }))
)
</script>

<template>
  <div>
    <PageHeader />

    <div class="split-2">
      <div class="col" style="gap: var(--pad-lg)">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">데이터 소스</h2>
            <BaseButton size="xs" variant="danger-ghost" icon="reset" @click="input = ''">비우기</BaseButton>
          </div>
          <div class="card-body">
            <textarea v-model="input" class="textarea" rows="14" placeholder="JSON, XML 또는 텍스트 숫자" />
          </div>
        </div>

        <div v-if="analysis.type === 'json' || analysis.type === 'xml'" class="card">
          <div class="card-header">
            <h2 class="card-title">추출 옵션</h2>
          </div>
          <div class="card-body col" style="gap: var(--pad-md)">
            <div v-if="analysis.type === 'json' && jsonKeyOptions.length > 0" class="col-tight">
              <span class="label">배열 키 (Path)</span>
              <ChipGroup v-model="selJsonKey" :options="jsonKeyOptions" />
            </div>
            <div v-if="jsonFieldOptions.length > 0" class="col-tight">
              <span class="label">숫자 필드</span>
              <ChipGroup v-model="selJsonField" :options="jsonFieldOptions" />
            </div>
            <div v-if="analysis.type === 'xml' && (analysis.keyOptions || []).length > 0" class="col-tight">
              <span class="label">태그</span>
              <ChipGroup v-model="selXmlKey" :options="analysis.keyOptions || []" />
            </div>
            <div v-if="xmlFieldOptions.length > 0" class="col-tight">
              <span class="label">숫자 필드</span>
              <ChipGroup v-model="selXmlField" :options="xmlFieldOptions" />
            </div>
          </div>
        </div>
      </div>

      <div class="col" style="gap: var(--pad-lg)">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--pad-md)">
          <div class="stat stat-accent">
            <span class="stat-label">합계</span>
            <span class="stat-value">{{ stats ? fmt(stats.sum) : '—' }}</span>
          </div>
          <div class="stat stat-accent">
            <span class="stat-label">평균</span>
            <span class="stat-value">{{ stats ? fmt(stats.avg) : '—' }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">개수</span>
            <span class="stat-value">{{ stats ? stats.count : '—' }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">중앙값</span>
            <span class="stat-value">{{ stats ? fmt(stats.median) : '—' }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">최빈값</span>
            <span class="stat-value" style="font-size: var(--fs-md)">{{ stats ? stats.mode : '—' }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">범위</span>
            <span class="stat-value" style="font-size: var(--fs-md)">{{ stats ? `${fmt(stats.min)} → ${fmt(stats.max)}` : '—' }}</span>
          </div>
        </div>

        <div v-if="numberItems.length > 0" class="card">
          <div class="card-header">
            <h2 class="card-title" style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em">
              추출 데이터 ({{ numberItems.length }}개)
            </h2>
          </div>
          <div
            class="card-body"
            style="max-height: 200px; overflow: auto; font-family: var(--font-mono); font-size: var(--fs-xs); line-height: 1.7; color: var(--text-muted)"
          >
            {{ numberItems.join(', ') }}
          </div>
        </div>

        <div v-if="input && !numberItems.length" class="card">
          <div class="card-body">
            <span class="hint hint-error">숫자 감지 실패 — 선택한 조건으로 추출된 유효한 숫자가 없습니다.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
