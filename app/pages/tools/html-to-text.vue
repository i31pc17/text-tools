<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  ssr: false
})

useHead({
  title: 'HTML 텍스트 추출기 - Text Tools',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

const htmlInput = ref('')
const excludeClassesInput = ref('') // 공백 구분 수동 제외 클래스
const parseError = ref<string | null>(null)

// 스타일 기반 제외 옵션
const excludeDisplayNone = ref(false)
const excludeVisibilityHidden = ref(false)

// 상단에서 선택하는 자동 제외 클래스들
const autoExcludedClasses = ref<string[]>([])

// 수동 입력 클래스 배열
const manualExcludedClasses = computed(() =>
  excludeClassesInput.value
    .split(/\s+/)
    .map(c => c.trim())
    .filter(Boolean)
)

// 최종 제외 클래스 세트 (수동 + 자동)
const excludeClassSet = computed(() => {
  return new Set<string>([
    ...manualExcludedClasses.value,
    ...autoExcludedClasses.value
  ])
})

type ParseResult = {
  text: string
  classCounts: Record<string, number>
}

function parseHtml(
  html: string,
  excludeClasses: Set<string>,
  useDisplayNone: boolean,
  useVisibilityHidden: boolean
): ParseResult {
  parseError.value = null

  const result: ParseResult = {
    text: '',
    classCounts: {}
  }

  const trimmed = html.trim()
  if (!trimmed) {
    return result
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // script/style 같은 건 바로 제거
    doc.querySelectorAll('script, style, noscript, template').forEach(el =>
      el.remove()
    )

    const allElements = Array.from(doc.body.querySelectorAll<HTMLElement>('*'))

    for (const el of allElements) {
      // 클래스 카운트 수집
      for (const cls of el.classList) {
        if (!cls) continue
        result.classCounts[cls] = (result.classCounts[cls] || 0) + 1
      }

      // style 속성 검사
      const styleAttr = (el.getAttribute('style') || '').toLowerCase()
      const hasDisplayNone = /display\s*:\s*none/.test(styleAttr)
      const hasVisibilityHidden = /visibility\s*:\s*hidden/.test(styleAttr)

      const shouldExcludeByStyle =
        (useDisplayNone && hasDisplayNone) ||
        (useVisibilityHidden && hasVisibilityHidden)

      // 제외 클래스 포함 여부
      const hasExcludedClass = Array.from(el.classList).some(cls =>
        excludeClasses.has(cls)
      )

      if (shouldExcludeByStyle || hasExcludedClass) {
        el.remove()
      }
    }

    // 최종 텍스트 추출 (브라우저 렌더링에 가까운 innerText 사용)
    const rawText = doc.body.innerText || ''
    const normalized = rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')

    result.text = normalized
    return result
  } catch (e) {
    parseError.value = 'HTML 파싱 중 오류가 발생했습니다.'
    return result
  }
}

const parseResult = computed(() =>
  parseHtml(
    htmlInput.value,
    excludeClassSet.value,
    excludeDisplayNone.value,
    excludeVisibilityHidden.value
  )
)

const extractedText = computed(() => parseResult.value.text)
const classCounts = computed(() => parseResult.value.classCounts)

// 상위 10개 자주 나온 클래스
const topClasses = computed(() => {
  const entries = Object.entries(classCounts.value)
  entries.sort((a, b) => b[1] - a[1])
  return entries.slice(0, 10)
})

const textLength = computed(() => extractedText.value.length)
const lineCount = computed(() =>
  extractedText.value ? extractedText.value.split('\n').length : 0
)

function toggleAutoClass(cls: string) {
  if (autoExcludedClasses.value.includes(cls)) {
    autoExcludedClasses.value = autoExcludedClasses.value.filter(c => c !== cls)
  } else {
    autoExcludedClasses.value = [...autoExcludedClasses.value, cls]
  }
}

function isAutoExcluded(cls: string) {
  return autoExcludedClasses.value.includes(cls)
}

async function copyText() {
  if (!extractedText.value) return
  try {
    await navigator.clipboard.writeText(extractedText.value)
    alert('복사되었습니다.')
  } catch {
    alert('클립보드 복사에 실패했습니다.')
  }
}
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <div class="space-y-6">
      <!-- 헤더 -->
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <NuxtLink to="/" class="hover:underline">Text Tools</NuxtLink>
          <span>/</span>
          <span>HTML 텍스트 추출기</span>
        </div>
        <h1 class="text-2xl font-semibold">
          HTML 텍스트 추출기
        </h1>
        <p class="text-sm text-gray-500">
          HTML에서 태그를 제거하고 실제 화면에 보이는 텍스트만 추출합니다.
          선택한 클래스, <code>display:none</code>, <code>visibility:hidden</code> 옵션에 따라
          특정 영역을 제외할 수 있습니다.
        </p>
      </div>

      <!-- 입력/출력 2열 -->
      <div class="grid gap-4 lg:gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
        <!-- 왼쪽: 입력 -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-sm font-semibold text-gray-800">
                    HTML 입력
                  </h2>
                  <p class="text-[11px] text-gray-500">
                    화면에 붙여넣은 HTML 소스에서 텍스트를 추출합니다.
                  </p>
                </div>
                <UButton
                  size="xs"
                  variant="ghost"
                  @click="htmlInput = ''"
                >
                  초기화
                </UButton>
              </div>

              <!-- 스타일 제외 옵션 -->
              <div class="flex flex-wrap items-center gap-4 text-[11px] text-gray-600">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="excludeDisplayNone" />
                  <span>
                    <code>display: none</code> 영역 텍스트 제외
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="excludeVisibilityHidden" />
                  <span>
                    <code>visibility: hidden</code> 영역 텍스트 제외
                  </span>
                </div>
              </div>
            </div>
          </template>

          <div class="space-y-3">
            <UTextarea
              v-model="htmlInput"
              :rows="20"
              class="font-mono text-xs w-full"
              placeholder="HTML 소스를 붙여넣으세요."
            />

            <div class="space-y-1">
              <label class="text-xs font-medium text-gray-700">
                제외할 class 이름들 (공백 구분)
              </label>
              <UInput
                v-model="excludeClassesInput"
                class="text-xs"
                placeholder="예: ads banner hidden-text"
              />
              <p class="text-[11px] text-gray-500">
                여기에 입력한 클래스명을 가진 태그(하위 포함)의 텍스트는 추출되지 않습니다.
              </p>
            </div>
          </div>

          <template #footer>
            <p
              v-if="parseError"
              class="text-[11px] text-red-500"
            >
              {{ parseError }}
            </p>
            <p
              v-else
              class="text-[11px] text-gray-500"
            >
              체크한 옵션에 따라
              <code>display:none</code>,
              <code>visibility:hidden</code>,
              지정 클래스가 포함된 태그는 파싱 단계에서 제거됩니다.
            </p>
          </template>
        </UCard>

        <!-- 오른쪽: 결과 -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-sm font-semibold text-gray-800">
                    추출된 텍스트
                  </h2>
                  <p class="text-[11px] text-gray-500">
                    실제 HTML 렌더링과 유사한 수준으로 줄바꿈을 넣어서 출력합니다.
                  </p>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span class="text-[11px] text-gray-500">
                    줄 수: {{ lineCount }} • 길이: {{ textLength }} 자
                  </span>
                  <UButton
                    size="xs"
                    variant="soft"
                    icon="i-heroicons-clipboard"
                    :disabled="!extractedText"
                    @click="copyText"
                  >
                    결과 복사
                  </UButton>
                </div>
              </div>

              <!-- 상위 클래스들 체크 버튼 -->
              <div v-if="topClasses.length" class="space-y-1">
                <p class="text-[11px] text-gray-500">
                  자주 등장하는 클래스 (최대 10개) —
                  클릭해서 해당 클래스 영역의 텍스트를 제외할 수 있습니다.
                </p>
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="[cls, count] in topClasses"
                    :key="cls"
                    size="xs"
                    :variant="isAutoExcluded(cls) ? 'solid' : 'soft'"
                    :color="isAutoExcluded(cls) ? 'primary' : 'neutral'"
                    class="text-[11px]"
                    @click="toggleAutoClass(cls)"
                  >
                    <span class="font-mono">{{ cls }}</span>
                    <span class="text-[10px] text-gray-500 ml-1">
                      ({{ count }})
                    </span>
                  </UButton>
                </div>
              </div>
            </div>
          </template>

          <div
            class="h-full min-h-[320px] rounded border border-gray-200 bg-slate-50/80 font-mono text-[11px] overflow-auto p-3 whitespace-pre-wrap"
          >
            <template v-if="extractedText">
              {{ extractedText }}
            </template>
            <span
              v-else
              class="text-[11px] text-gray-400"
            >
              HTML을 입력하면 여기에서 추출된 텍스트를 확인할 수 있습니다.
            </span>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
