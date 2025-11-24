<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue'

import { useRouter } from "vue-router";

const router = useRouter();

definePageMeta({
  ssr: false
})

useHead({
  title: 'JSON 뷰어 - Text Tools',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

const input = ref('')
const parseError = ref<string | null>(null)

// 옵션
const beautify = ref(true)
const showTypes = ref(false)
const showIndexes = ref(false)

// JSON 파싱
const parsedValue = computed<any | null>(() => {
  parseError.value = null
  const trimmed = input.value.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    parseError.value = '유효하지 않은 JSON 입니다.'
    return null
  }
})

// Beautify 용 순수 JSON 문자열
const formattedJson = computed(() => {
  if (!parsedValue.value) return ''
  try {
    return beautify.value
      ? JSON.stringify(parsedValue.value, null, 2)
      : JSON.stringify(parsedValue.value)
  } catch {
    return ''
  }
})

const outputLength = computed(() => formattedJson.value.length)

// ───────────── 뷰어 공통 유틸 ─────────────
function typeNameOf(v: any): string {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}

// ───────────── JSON 트리 노드 컴포넌트 ─────────────
const JsonNode = defineComponent({
  name: 'JsonNode',
  props: {
    value: { type: null, required: true },
    depth: { type: Number, default: 0 },
    labelKey: { type: String, default: undefined },
    index: { type: Number, default: undefined },
    showTypes: { type: Boolean, default: false },
    showIndexes: { type: Boolean, default: false },
    isLast: { type: Boolean, default: false }
  },
  setup(props) {
    const collapsed = ref(false)

    const toggle = () => {
      // 객체/배열일 때만 토글
      const v = props.value
      const isArray = Array.isArray(v)
      const isObject = v !== null && typeof v === 'object' && !isArray
      if (!isArray && !isObject) return
      collapsed.value = !collapsed.value
    }

    return () => {
      const v = props.value
      const depth = props.depth
      const isArray = Array.isArray(v)
      const isObject = v !== null && typeof v === 'object' && !isArray
      const marginLeft = `${depth * 18}px`

      const lineChildren: any[] = []

      // 토글 아이콘/공간
      if (isArray || isObject) {
        lineChildren.push(
          h(
            'button',
            {
              class:
                'inline-flex items-center justify-center w-4 h-4 mr-1 rounded text-[10px] text-slate-600 hover:bg-slate-200',
              type: 'button',
              onClick: toggle
            },
            collapsed.value ? '+' : '−'
          )
        )
      } else {
        lineChildren.push(
          h('span', { class: 'inline-block w-4 mr-1' })
        )
      }

      // 인덱스 뱃지
      if (
        props.showIndexes &&
        typeof props.index === 'number'
      ) {
        lineChildren.push(
          h(
            'span',
            {
              class:
                'inline-flex items-center justify-center mr-1 text-[11px] font-semibold text-rose-600'
            },
            `${props.index}.`
          )
        )
      }

      // key 라벨
      if (props.labelKey !== undefined) {
        lineChildren.push(
          h(
            'span',
            {
              class: 'text-[12px] text-slate-700 mr-1'
            },
            `"${props.labelKey}":`
          )
        )
      }

      const typeName = typeNameOf(v)

      // 타입 뱃지
      if (props.showTypes) {
        let color =
          'bg-sky-50 text-sky-700 border-sky-200'
        if (typeName === 'array') {
          color =
            'bg-amber-50 text-amber-700 border-amber-200'
        } else if (typeName === 'string') {
          color =
            'bg-green-50 text-green-700 border-green-200'
        } else if (typeName === 'number') {
          color =
            'bg-purple-50 text-purple-700 border-purple-200'
        } else if (typeName === 'boolean') {
          color =
            'bg-pink-50 text-pink-700 border-pink-200'
        } else if (typeName === 'null') {
          color =
            'bg-gray-100 text-gray-500 border-gray-200'
        }

        lineChildren.push(
          h(
            'span',
            {
              class:
                'inline-flex items-center px-1.5 rounded border text-[10px] font-medium mr-1 ' +
                color
            },
            typeName
          )
        )
      }

      // 값 표시
      if (isObject) {
        // 객체
        lineChildren.push(
          h(
            'span',
            { class: 'text-slate-700' },
            collapsed.value ? '{…}' : '{'
          )
        )
      } else if (isArray) {
        // 배열
        lineChildren.push(
          h(
            'span',
            { class: 'text-slate-700' },
            collapsed.value ? '[…]' : '['
          )
        )
      } else {
        // 프리미티브
        let textNode: string
        if (typeof v === 'string') {
          textNode = `"${v}"`
        } else if (v === null) {
          textNode = 'null'
        } else {
          textNode = String(v)
        }

        let className = 'text-slate-800'
        if (typeof v === 'string') className = 'text-emerald-700'
        else if (typeof v === 'number') className = 'text-purple-700'
        else if (typeof v === 'boolean') className = 'text-pink-700'
        else if (v === null) className = 'text-gray-500'

        lineChildren.push(
          h('span', { class: className }, textNode)
        )
      }

      // 콤마
      if (props.isLast === false) {
        lineChildren.push(
          h(
            'span',
            { class: 'text-slate-400' },
            ','
          )
        )
      }

      const line = h(
        'div',
        {
          class: 'leading-5',
          style: { marginLeft }
        },
        lineChildren
      )

      // 하위 노드들 (펼쳐졌을 때만)
      const childrenBlocks: any[] = []
      if (!collapsed.value && (isObject || isArray)) {
        if (isObject) {
          const keys = Object.keys(v)
          keys.forEach((k, i) => {
            childrenBlocks.push(
              h(JsonNode, {
                value: v[k],
                depth: depth + 1,
                labelKey: k,
                showTypes: props.showTypes,
                showIndexes: props.showIndexes,
                isLast: i === keys.length - 1
              })
            )
          })
          // 닫는 중괄호
          childrenBlocks.push(
            h(
              'div',
              {
                class: 'leading-5',
                style: { marginLeft }
              },
              [
                h(
                  'span',
                  { class: 'text-slate-700' },
                  '}'
                ),
                props.isLast === false
                  ? h(
                    'span',
                    { class: 'text-slate-400' },
                    ','
                  )
                  : null
              ]
            )
          )
        } else if (isArray) {
          const arr = v as any[]
          arr.forEach((item, i) => {
            childrenBlocks.push(
              h(JsonNode, {
                value: item,
                depth: depth + 1,
                index: i,
                showTypes: props.showTypes,
                showIndexes: props.showIndexes,
                isLast: i === arr.length - 1
              })
            )
          })
          // 닫는 대괄호
          childrenBlocks.push(
            h(
              'div',
              {
                class: 'leading-5',
                style: { marginLeft }
              },
              [
                h(
                  'span',
                  { class: 'text-slate-700' },
                  ']'
                ),
                props.isLast === false
                  ? h(
                    'span',
                    { class: 'text-slate-400' },
                    ','
                  )
                  : null
              ]
            )
          )
        }
      }

      return h('div', null, [line, ...childrenBlocks])
    }
  }
})

// 출력 JSON 있을 때만 루트 노드 렌더링
const hasTreeView = computed(
  () => parsedValue.value !== null
)

async function copyOutput() {
  if (!formattedJson.value) return
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    alert('Beautify 된 JSON이 복사되었습니다.')
  } catch {
    alert('클립보드 복사에 실패했습니다.')
  }
}
</script>

<template>
  <!-- 전체 폭 사용: max-w-none + w-full -->
  <UContainer class="py-6 lg:py-8 max-w-none w-full">
    <div class="space-y-6">
      <!-- 헤더 -->
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <NuxtLink to="/" class="hover:underline">Text Tools</NuxtLink>
            <span>/</span>
            <span>JSON 뷰어</span>
          </div>
          <h1 class="text-2xl font-bold">JSON 뷰어</h1>
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

      <!-- 옵션/요약 -->
      <UCard>
        <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span>입력 길이: <strong>{{ input.length }}</strong> 자</span>
            <span>Beautify 기준 길이: <strong>{{ outputLength }}</strong> 자</span>
          </div>

          <div class="flex flex-wrap gap-4 items-center text-xs">
            <div class="flex items-center gap-2">
              <UCheckbox v-model="beautify" disabled />
              <span>Beautify</span>
            </div>
            <div class="flex items-center gap-2">
              <UCheckbox v-model="showTypes" />
              <span>Show Types</span>
            </div>
            <div class="flex items-center gap-2">
              <UCheckbox v-model="showIndexes" />
              <span>Show Indexes</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 본문: 전체 가로를 사용하는 2열 레이아웃 -->
      <div class="grid gap-4 lg:gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
        <!-- 왼쪽: JSON 입력 (가로 꽉 차게) -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-gray-800">
                  JSON 입력
                </h2>
                <p class="text-[11px] text-gray-500">
                  유효한 JSON 문자열을 붙여넣으세요.
                </p>
              </div>
              <UButton
                size="xs"
                variant="ghost"
                @click="input = ''"
              >
                초기화
              </UButton>
            </div>
          </template>

          <UTextarea
            v-model="input"
            :rows="24"
            class="font-mono text-xs w-full"
            placeholder='예) { "ID": null, "name": "Doe", "hobbies": ["reading", "cinema", { "sports": ["volley-ball", "badminton"] }] }'
          />

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
              파싱에 성공하면 오른쪽에서 트리 형태로 확인할 수 있습니다.
            </p>
          </template>
        </UCard>

        <!-- 오른쪽: JSON 트리 뷰어 -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-gray-800">
                  JSON 뷰어
                </h2>
                <p class="text-[11px] text-gray-500">
                  object / array 노드를 클릭해서 접거나 펼칠 수 있습니다.
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="text-[11px] text-gray-500">
                  Beautify 길이: {{ outputLength }} 자
                </span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!formattedJson"
                  @click="copyOutput"
                >
                  Beautify JSON 복사
                </UButton>
              </div>
            </div>
          </template>

          <div
            class="h-full min-h-[360px] rounded border border-gray-200 bg-slate-50/80 font-mono text-[11px] overflow-auto p-3"
          >
            <div v-if="hasTreeView">
              <JsonNode
                :value="parsedValue"
                :depth="0"
                :show-types="showTypes"
                :show-indexes="showIndexes"
                :is-last="true"
              />
            </div>

            <div
              v-else
              class="text-[11px] text-gray-400"
            >
              유효한 JSON을 입력하면 여기에서 구조를 볼 수 있습니다.
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
