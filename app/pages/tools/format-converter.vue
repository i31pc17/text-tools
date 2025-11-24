<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { useRouter } from "vue-router";

const router = useRouter();

import JSON5 from 'json5'
import YAML from 'yaml'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'

definePageMeta({
  ssr: false
})

useHead({
  title: 'JSON / XML / YAML 포맷 변환기 - Text Tools',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

type Format = 'json' | 'xml' | 'yaml' | 'unknown'

const rawInput = ref('')
const inputFormat = ref<Format>('unknown')
const parseError = ref<string | null>(null)
const parseInfo = ref<string | null>(null)

// 출력 포맷 선택
const targetFormat = ref<'json' | 'xml' | 'yaml'>('json')

// 보기 모드 (예쁘게 / 짧게)
const viewMode = ref<'pretty' | 'compact'>('pretty')

// XML 파서/빌더 설정
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true,
})

const xmlBuilderPretty = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false,
})

const xmlBuilderCompact = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: false,
})

// 내부 공통 JS 객체
const parsedData = ref<any | null>(null)

function detectAndParse() {
  const text = rawInput.value
  inputFormat.value = 'unknown'
  parseError.value = null
  parseInfo.value = null
  parsedData.value = null

  const trimmed = text.trim()
  if (!trimmed) return

  // 1) JSON5 시도
  try {
    const obj = JSON5.parse(text)
    parsedData.value = obj
    inputFormat.value = 'json'
    parseInfo.value = '입력 포맷: JSON (JSON5 허용)'
    return
  } catch {}

  // 2) XML 시도
  try {
    const obj = xmlParser.parse(text)
    parsedData.value = obj
    inputFormat.value = 'xml'
    parseInfo.value = '입력 포맷: XML'
    return
  } catch {}

  // 3) YAML 시도
  try {
    const obj = YAML.parse(text)
    parsedData.value = obj
    inputFormat.value = 'yaml'
    parseInfo.value = '입력 포맷: YAML'
    return
  } catch {}

  // 전부 실패
  parseError.value = 'JSON(JSON5), XML, YAML 중 어떤 포맷으로도 파싱할 수 없습니다.'
}

watch(rawInput, detectAndParse, { immediate: true })

// ─── 포맷별 출력 문자열 ───

// JSON
const jsonPretty = computed(() =>
  parsedData.value != null ? JSON.stringify(parsedData.value, null, 2) : ''
)
const jsonCompact = computed(() =>
  parsedData.value != null ? JSON.stringify(parsedData.value) : ''
)

// YAML (라이브러리 기본 포맷, compact는 크게 다르게 만들기 어려워서 동일하게 사용)
const yamlPretty = computed(() =>
  parsedData.value != null ? YAML.stringify(parsedData.value) : ''
)
const yamlCompact = yamlPretty // YAML은 사실상 한 가지 포맷만

// XML
const xmlPretty = computed(() => {
  if (parsedData.value == null) return ''
  try {
    return xmlBuilderPretty.build(parsedData.value)
  } catch {
    return ''
  }
})

const xmlCompact = computed(() => {
  if (parsedData.value == null) return ''
  try {
    return xmlBuilderCompact.build(parsedData.value)
  } catch {
    return ''
  }
})

// 현재 선택된 포맷 + 보기 모드에 따른 최종 출력
const currentOutput = computed(() => {
  if (!parsedData.value) return ''

  const mode = viewMode.value
  const fmt = targetFormat.value

  if (fmt === 'json') {
    return mode === 'pretty' ? jsonPretty.value : jsonCompact.value
  }
  if (fmt === 'xml') {
    return mode === 'pretty' ? xmlPretty.value : xmlCompact.value
  }
  if (fmt === 'yaml') {
    return mode === 'pretty' ? yamlPretty.value : yamlCompact.value
  }
  return ''
})

const outputLength = computed(() => currentOutput.value.length)

async function copyOutput() {
  if (!currentOutput.value) return
  try {
    await navigator.clipboard.writeText(currentOutput.value)
    alert('복사되었습니다.')
  } catch {
    alert('클립보드 복사에 실패했습니다.')
  }
}

function formatLabel(fmt: Format) {
  if (fmt === 'json') return 'JSON (JSON5 허용)'
  if (fmt === 'xml') return 'XML'
  if (fmt === 'yaml') return 'YAML'
  return '알 수 없음'
}
</script>

<template>
  <!-- UContainer 안 쓰고 전체 폭 사용 -->
  <div class="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <div class="space-y-6">
      <!-- 헤더 -->
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <NuxtLink to="/" class="hover:underline">Text Tools</NuxtLink>
            <span>/</span>
            <span>JSON / XML / YAML 포맷 변환기</span>
          </div>
          <h1 class="text-2xl font-bold">JSON / XML / YAML 포맷 변환기</h1>
          <p class="text-sm text-gray-500">
            JSON(JSON5 허용), XML, YAML 을 서로 변환하고, 예쁘게 보기와 압축(짧게) 보기를 선택할 수 있습니다.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            variant="soft"
            color="info"
            icon="i-heroicons-arrow-uturn-left"
            @click="router.push('/')"
          >
            목록으로
          </UButton>
        </div>
      </div>

      <!-- 상태/옵션 -->
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between text-xs">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-gray-500">자동 감지 포맷:</span>
            <span
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium',
                inputFormat === 'json' && 'bg-emerald-50 border-emerald-200 text-emerald-700',
                inputFormat === 'xml' && 'bg-sky-50 border-sky-200 text-sky-700',
                inputFormat === 'yaml' && 'bg-amber-50 border-amber-200 text-amber-700',
                inputFormat === 'unknown' && 'bg-gray-50 border-gray-200 text-gray-500'
              ]"
            >
              {{ formatLabel(inputFormat) }}
            </span>
          </div>
          <div v-if="parseInfo" class="text-gray-500">
            {{ parseInfo }}
          </div>
          <div v-if="parseError" class="text-red-500">
            {{ parseError }}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <!-- 타겟 포맷 -->
          <div class="flex items-center gap-2">
            <span class="text-gray-500">출력 포맷:</span>
            <UButtonGroup size="xs">
              <UButton
                :variant="targetFormat === 'json' ? 'solid' : 'ghost'"
                :color="targetFormat === 'json' ? 'primary' : 'neutral'"
                @click="targetFormat = 'json'"
              >
                JSON
              </UButton>
              <UButton
                :variant="targetFormat === 'xml' ? 'solid' : 'ghost'"
                :color="targetFormat === 'xml' ? 'primary' : 'neutral'"
                @click="targetFormat = 'xml'"
              >
                XML
              </UButton>
              <UButton
                :variant="targetFormat === 'yaml' ? 'solid' : 'ghost'"
                :color="targetFormat === 'yaml' ? 'primary' : 'neutral'"
                @click="targetFormat = 'yaml'"
              >
                YAML
              </UButton>
            </UButtonGroup>
          </div>

          <!-- 보기 모드 -->
          <div class="flex items-center gap-2">
            <span class="text-gray-500">보기 모드:</span>
            <UButtonGroup size="xs">
              <UButton
                :variant="viewMode === 'pretty' ? 'solid' : 'ghost'"
                :color="viewMode === 'pretty' ? 'primary' : 'neutral'"
                @click="viewMode = 'pretty'"
              >
                예쁘게
              </UButton>
              <UButton
                :variant="viewMode === 'compact' ? 'solid' : 'ghost'"
                :color="viewMode === 'compact' ? 'primary' : 'neutral'"
                @click="viewMode = 'compact'"
              >
                짧게
              </UButton>
            </UButtonGroup>
          </div>
        </div>
      </div>

      <!-- 입력/출력 2열 -->
      <div class="grid gap-4 lg:gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
        <!-- 입력 -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-gray-800">
                  입력 (JSON5 / XML / YAML 자동 인식)
                </h2>
                <p class="text-[11px] text-gray-500">
                  원본 텍스트를 붙여넣으면 자동으로 포맷을 감지합니다.
                </p>
              </div>
              <UButton
                size="xs"
                variant="ghost"
                @click="rawInput = ''"
              >
                초기화
              </UButton>
            </div>
          </template>

          <UTextarea
            v-model="rawInput"
            :rows="24"
            class="font-mono text-xs w-full"
            placeholder='예) { // JSON5 허용&#10;  unquotedKey: "value",&#10;  list: [1, 2, 3]&#10;}&#10;&#10;또는 XML / YAML 텍스트를 넣어도 됩니다.'
          />

          <template #footer>
            <p class="text-[11px] text-gray-500">
              JSON5(주석, 작은따옴표, 따옴표 없는 키 등)도 입력으로 허용하지만, 출력은 항상 표준 JSON / XML / YAML 로 변환됩니다.
            </p>
          </template>
        </UCard>

        <!-- 출력 -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-gray-800">
                  변환 결과
                </h2>
                <p class="text-[11px] text-gray-500">
                  선택한 포맷과 보기 모드에 따른 결과입니다. (출력은 항상 표준 포맷)
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="text-[11px] text-gray-500">
                  길이: {{ outputLength }} 자
                </span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!currentOutput"
                  @click="copyOutput"
                >
                  결과 복사
                </UButton>
              </div>
            </div>
          </template>

          <UTextarea
            :model-value="currentOutput"
            :rows="24"
            class="font-mono text-xs w-full"
            placeholder="유효한 입력이 있으면 변환된 결과가 여기에 표시됩니다."
            readonly
          />
        </UCard>
      </div>
    </div>
  </div>
</template>
