<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  ssr: false
})

// 상태 관리
const input = ref('')
const parseError = ref<string | null>(null)

// 옵션 (Props로 전달될 값들)
const beautify = ref(true)
const showTypes = ref(false)
const showIndexes = ref(false)

// JSON 파싱 로직
const parsedValue = computed(() => {
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

// 복사용 포맷팅
const formattedJson = computed(() => {
  if (!parsedValue.value) return ''
  return beautify.value
    ? JSON.stringify(parsedValue.value, null, 2)
    : JSON.stringify(parsedValue.value)
})

const outputLength = computed(() => formattedJson.value.length)

async function copyOutput() {
  if (!formattedJson.value) return
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    alert('복사되었습니다.')
  } catch {
    alert('복사 실패')
  }
}
</script>

<template>
  <UContainer class="py-6 lg:py-8 max-w-none w-full">
    <div class="space-y-6">
      <PageHeader />

      <UCard>
        <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span>입력: <strong>{{ input.length }}</strong>자</span>
            <span>결과: <strong>{{ outputLength }}</strong>자</span>
          </div>
          <div class="flex flex-wrap gap-4 items-center text-xs font-medium">
            <UCheckbox v-model="beautify" label="Beautify" disabled />
            <UCheckbox v-model="showTypes" label="Show Types" />
            <UCheckbox v-model="showIndexes" label="Show Indexes" />
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 lg:gap-6 md:grid-cols-[1fr_1.2fr]">
        <UCard class="flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold">JSON 입력</h2>
              <UButton size="xs" variant="ghost" color="error" @click="input = ''">초기화</UButton>
            </div>
          </template>
          <UTextarea
            v-model="input"
            :rows="24"
            class="font-mono text-xs w-full"
            placeholder='{ "key": "value" }'
          />
          <template #footer>
            <p :class="parseError ? 'text-red-500' : 'text-gray-500'" class="text-[11px]">
              {{ parseError || '성공적으로 파싱되면 우측에 트리가 표시됩니다.' }}
            </p>
          </template>
        </UCard>

        <UCard class="flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold">JSON 뷰어</h2>
              <UButton
                size="xs"
                variant="soft"
                icon="i-heroicons-clipboard"
                :disabled="!parsedValue"
                @click="copyOutput"
              >
                결과 복사
              </UButton>
            </div>
          </template>

          <JsonTreeView
            :value="parsedValue"
            :show-types="showTypes"
            :show-indexes="showIndexes"
          />
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
