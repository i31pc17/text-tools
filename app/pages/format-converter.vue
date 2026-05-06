<script setup lang="ts">
import JSON5 from 'json5'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import * as YAML from 'yaml'

definePageMeta({ ssr: false })

const raw = ref('')
const target = ref<'json' | 'xml' | 'yaml'>('json')
const pretty = ref<'pretty' | 'compact'>('pretty')

interface Detect { data: unknown; fmt: 'json' | 'xml' | 'yaml' | 'unknown'; error: string | null }

const detected = computed<Detect>(() => {
  const t = raw.value.trim()
  if (!t) return { data: null, fmt: 'unknown', error: null }
  if (t.startsWith('{') || t.startsWith('[')) {
    try { return { data: JSON5.parse(t), fmt: 'json', error: null } } catch {}
  }
  if (t.startsWith('<')) {
    try {
      const p = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: true, parseAttributeValue: true })
      const o = p.parse(t)
      if (Object.keys(o).length > 0) return { data: o, fmt: 'xml', error: null }
    } catch {}
  }
  try {
    const o = YAML.parse(t)
    if (o !== null && typeof o === 'object') return { data: o, fmt: 'yaml', error: null }
  } catch {}
  return { data: null, fmt: 'unknown', error: '포맷을 판별할 수 없거나 데이터가 올바르지 않습니다.' }
})

const output = computed(() => {
  const data = detected.value.data
  if (data == null) return ''
  const isPretty = pretty.value === 'pretty'
  try {
    if (target.value === 'json') return isPretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
    if (target.value === 'yaml') return YAML.stringify(data, { indent: 2 })
    if (target.value === 'xml') {
      const b = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: isPretty, indentBy: '  ' })
      return b.build(data) as string
    }
  } catch (e) {
    return `변환 오류: ${(e as Error).message}`
  }
  return ''
})

const fmtLabel = computed(() => ({
  json: 'JSON', xml: 'XML', yaml: 'YAML', unknown: '알 수 없음'
}[detected.value.fmt]))
</script>

<template>
  <div>
    <PageHeader />

    <div class="col" style="gap: var(--pad-lg)">
      <div class="card">
        <div class="card-body row-between">
          <div class="row" style="gap: var(--pad-md)">
            <span class="label">자동 감지</span>
            <span class="format-pill" :data-fmt="detected.fmt">{{ fmtLabel }}</span>
            <span v-if="detected.error" class="hint hint-error">{{ detected.error }}</span>
          </div>
          <div class="row" style="gap: var(--pad-lg)">
            <div class="row" style="gap: 8px">
              <span class="label">출력 포맷</span>
              <SegGroup
                v-model="target"
                :options="[{ value: 'json', label: 'JSON' }, { value: 'xml', label: 'XML' }, { value: 'yaml', label: 'YAML' }]"
              />
            </div>
            <div class="row" style="gap: 8px">
              <span class="label">보기 모드</span>
              <SegGroup
                v-model="pretty"
                :options="[{ value: 'pretty', label: '예쁘게' }, { value: 'compact', label: '짧게' }]"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="split-2-balanced">
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">입력</h2>
              <p class="card-sub">JSON5 / XML / YAML 자동 인식</p>
            </div>
            <BaseButton size="xs" variant="danger-ghost" icon="reset" @click="raw = ''">초기화</BaseButton>
          </div>
          <div class="card-body">
            <textarea
              v-model="raw"
              class="textarea"
              rows="20"
              :placeholder="`{ unquotedKey: &quot;value&quot;, list: [1,2,3] }\n또는 XML / YAML`"
            />
          </div>
          <div class="card-footer">
            <span class="hint">JSON5(주석, 작은따옴표 등)도 입력 허용 → 표준 포맷으로 변환</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">변환 결과</h2>
              <p class="card-sub">선택한 포맷·모드로 변환된 결과</p>
            </div>
            <div class="col-tight" style="align-items: flex-end">
              <span class="hint">{{ output.length }}자</span>
              <CopyButton :text="output" label="결과 복사" />
            </div>
          </div>
          <div class="card-body">
            <textarea :value="output" class="textarea" rows="20" readonly placeholder="유효한 입력이 있으면 결과가 표시됩니다." />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
