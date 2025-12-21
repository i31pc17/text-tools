<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import JSON5 from 'json5'
import YAML from 'yaml'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'

definePageMeta({
  ssr: false
})

// 타입 정의
type Format = 'json' | 'xml' | 'yaml' | 'unknown'

const rawInput = ref('')
const inputFormat = ref<Format>('unknown')
const parseError = ref<string | null>(null)
const parseInfo = ref<string | null>(null)

// 출력 옵션 상태
const targetFormat = ref<'json' | 'xml' | 'yaml'>('json')
const viewMode = ref<'pretty' | 'compact'>('pretty')

// 공통 파서 설정 (XML)
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true,
})

// 내부 변환용 데이터
const parsedData = ref<any | null>(null)

/**
 *
 * 포맷 감지 및 파싱 로직
 */
function detectAndParse() {
  const text = rawInput.value.trim()

  // 초기화
  inputFormat.value = 'unknown'
  parseError.value = null
  parseInfo.value = null
  parsedData.value = null

  if (!text) return

  // 1. JSON (JSON5 포함) 감지: { 나 [ 로 시작할 때 우선 시도
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      parsedData.value = JSON5.parse(text)
      inputFormat.value = 'json'
      return
    } catch (e) {}
  }

  // 2. XML 감지: < 로 시작할 때 우선 시도
  if (text.startsWith('<')) {
    try {
      const obj = xmlParser.parse(text)
      // XML 파서는 일반 텍스트도 객체로 만드는 경우가 있어 키 검사 수행
      if (Object.keys(obj).length > 0) {
        parsedData.value = obj
        inputFormat.value = 'xml'
        return
      }
    } catch (e) {}
  }

  // 3. YAML 감지 (JSON/XML이 아닌 경우의 보루)
  try {
    const obj = YAML.parse(text)
    // YAML은 단순 문자열도 성공으로 간주하므로 '객체' 형태인 경우만 인정
    if (obj !== null && typeof obj === 'object') {
      parsedData.value = obj
      inputFormat.value = 'yaml'
      return
    }
  } catch (e) {}

  // 모두 실패한 경우
  parseError.value = '포맷을 판별할 수 없거나 데이터가 올바르지 않습니다.'
}

// 입력값이 바뀔 때마다 감지 실행
watch(rawInput, detectAndParse, { immediate: true })

/**
 * 최종 출력 문자열 계산
 */
const currentOutput = computed(() => {
  if (parsedData.value == null) return ''

  const isPretty = viewMode.value === 'pretty'
  const fmt = targetFormat.value

  try {
    // JSON 출력
    if (fmt === 'json') {
      return isPretty
        ? JSON.stringify(parsedData.value, null, 2)
        : JSON.stringify(parsedData.value)
    }

    // YAML 출력
    if (fmt === 'yaml') {
      // YAML은 compact 모드가 큰 의미가 없으므로 정석대로 출력
      return YAML.stringify(parsedData.value, {
        indent: 2,
        blockQuote: 'literal'
      })
    }

    // XML 출력
    if (fmt === 'xml') {
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        format: isPretty,
        indentBy: '  '
      })
      return builder.build(parsedData.value)
    }
  } catch (e: any) {
    return `변환 중 오류 발생: ${e.message}`
  }
  return ''
})

const outputLength = computed(() => currentOutput.value.length)

// 결과 복사 기능
async function copyOutput() {
  if (!currentOutput.value) return
  try {
    await navigator.clipboard.writeText(currentOutput.value)
    alert('변환된 결과가 복사되었습니다.')
  } catch {
    alert('클립보드 복사에 실패했습니다.')
  }
}

// 라벨 표시용 유틸
function formatLabel(fmt: Format) {
  const labels: Record<Format, string> = {
    json: 'JSON',
    xml: 'XML',
    yaml: 'YAML',
    unknown: '알 수 없음'
  }
  return labels[fmt]
}
</script>

<template>
  <!-- UContainer 안 쓰고 전체 폭 사용 -->
  <div class="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <div class="space-y-6">
      <!-- 헤더 -->
      <PageHeader />

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
