<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from "vue-router";

const router = useRouter();

const leftInput = ref('')
const rightInput = ref('')

const uniqueOnly = ref(true) // 결과 리스트 중복 제거 On/Off

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

const leftItems = computed(() => normalizeLines(leftInput.value))
const rightItems = computed(() => normalizeLines(rightInput.value))

const leftCount = computed(() => leftItems.value.length)
const rightCount = computed(() => rightItems.value.length)

const leftSet = computed(() => new Set(leftItems.value))
const rightSet = computed(() => new Set(rightItems.value))

// ── 세트 연산용 "기본 배열" (중복 제거 적용 전) ──

// 합집합 (왼쪽 → 오른쪽 순서로 그냥 이어붙임)
const unionBase = computed(() => [
  ...leftItems.value,
  ...rightItems.value
])

// 교집합 (왼쪽 기준, 오른쪽에 존재하는 모든 값)
const intersectionBase = computed(() =>
  leftItems.value.filter(item => rightSet.value.has(item))
)

// 왼쪽 차집합 (왼쪽에는 있지만 오른쪽에는 없는 값들)
const leftDiffBase = computed(() =>
  leftItems.value.filter(item => !rightSet.value.has(item))
)

// 오른쪽 차집합 (오른쪽에는 있지만 왼쪽에는 없는 값들)
const rightDiffBase = computed(() =>
  rightItems.value.filter(item => !leftSet.value.has(item))
)

// 대칭차집합 (왼쪽 차집합 + 오른쪽 차집합을 그대로 합침)
const symDiffBase = computed(() => [
  ...leftDiffBase.value,
  ...rightDiffBase.value
])

// ── 결과 빌더: 중복 제거 토글 적용 ──

type ResultInfo = {
  base: string[]
  items: string[]
  baseCount: number
  count: number
  removed: number
  text: string
}

function buildResult(base: string[]): ResultInfo {
  const baseCount = base.length

  if (!uniqueOnly.value) {
    return {
      base,
      items: base,
      baseCount,
      count: baseCount,
      removed: 0,
      text: base.join('\n')
    }
  }

  const seen = new Set<string>()
  const unique: string[] = []
  for (const item of base) {
    if (!seen.has(item)) {
      seen.add(item)
      unique.push(item)
    }
  }

  return {
    base,
    items: unique,
    baseCount,
    count: unique.length,
    removed: baseCount - unique.length,
    text: unique.join('\n')
  }
}

const unionResult = computed(() => buildResult(unionBase.value))
const intersectionResult = computed(() => buildResult(intersectionBase.value))
const leftDiffResult = computed(() => buildResult(leftDiffBase.value))
const rightDiffResult = computed(() => buildResult(rightDiffBase.value))
const symDiffResult = computed(() => buildResult(symDiffBase.value))

async function copyText(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    alert('복사되었습니다.')
  } catch (e) {
    alert('클립보드 복사에 실패했습니다.')
  }
}

useHead({
  title: '리스트 비교기 - Text Tools'
})
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <!-- 헤더 -->
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <NuxtLink to="/" class="hover:underline">Text Tools</NuxtLink>
            <span>/</span>
            <span>리스트 비교</span>
          </div>
          <h1 class="text-2xl font-bold">리스트 비교</h1>
          <p class="text-sm text-gray-500">
            엔터(줄바꿈)로 구분된 두 개의 리스트를 비교해서 합집합, 교집합, 차집합, 대칭차집합을 한 번에 확인하고 복사할 수 있습니다.
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

      <!-- 입력 영역: 왼쪽 / 오른쪽 나란히 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">입력 리스트</span>
            <span class="text-xs text-gray-500">
              각 항목을 줄바꿈(엔터)으로 구분하세요.
            </span>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <!-- 왼쪽 리스트 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">왼쪽 리스트</span>
              <span class="text-xs text-gray-500">
                {{ leftCount }} 개
              </span>
            </div>
            <UTextarea
              v-model="leftInput"
              :rows="12"
              class="font-mono text-xs"
              placeholder="왼쪽 리스트 항목들을 줄바꿈으로 입력하세요."
            />
          </div>

          <!-- 오른쪽 리스트 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">오른쪽 리스트</span>
              <span class="text-xs text-gray-500">
                {{ rightCount }} 개
              </span>
            </div>
            <UTextarea
              v-model="rightInput"
              :rows="12"
              class="font-mono text-xs"
              placeholder="오른쪽 리스트 항목들을 줄바꿈으로 입력하세요."
            />
          </div>
        </div>
      </UCard>

      <!-- 요약 + 중복 제거 토글 -->
      <UCard>
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="space-y-1 text-xs text-gray-600">
            <div class="flex flex-wrap gap-x-4 gap-y-1">
              <span>왼쪽 리스트: <strong>{{ leftCount }}</strong> 개</span>
              <span>오른쪽 리스트: <strong>{{ rightCount }}</strong> 개</span>
            </div>
            <div class="flex flex-wrap gap-x-4 gap-y-1">
              <span>합집합: <strong>{{ unionResult.count }}</strong> 개</span>
              <span>교집합: <strong>{{ intersectionResult.count }}</strong> 개</span>
              <span>왼쪽 차집합: <strong>{{ leftDiffResult.count }}</strong> 개</span>
              <span>오른쪽 차집합: <strong>{{ rightDiffResult.count }}</strong> 개</span>
              <span>대칭차집합: <strong>{{ symDiffResult.count }}</strong> 개</span>
            </div>
          </div>

          <!-- 중복 제거 토글 -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">
              결과 리스트 중복 제거
            </span>
            <UButtonGroup size="xs">
              <UButton
                :variant="!uniqueOnly ? 'solid' : 'ghost'"
                :color="!uniqueOnly ? 'primary' : 'neutral'"
                @click="uniqueOnly = false"
              >
                Off
              </UButton>
              <UButton
                :variant="uniqueOnly ? 'solid' : 'ghost'"
                :color="uniqueOnly ? 'primary' : 'neutral'"
                @click="uniqueOnly = true"
              >
                On
              </UButton>
            </UButtonGroup>
          </div>
        </div>
      </UCard>

      <!-- 결과 영역: 집합별 카드 -->
      <div class="grid gap-4 md:grid-cols-2">
        <!-- 합집합 -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <h2 class="text-sm font-semibold text-gray-800">
                  합집합 (왼쪽 ∪ 오른쪽)
                </h2>
                <p class="text-[11px] text-gray-500">
                  왼쪽과 오른쪽 리스트를 합친 결과입니다.
                  <span v-if="uniqueOnly && unionResult.removed > 0">
                    (중복 {{ unionResult.removed }}개 제거됨)
                  </span>
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="text-[11px] text-gray-500">
                  항목: {{ unionResult.count }} 개
                </span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!unionResult.text"
                  @click="copyText(unionResult.text)"
                >
                  복사
                </UButton>
              </div>
            </div>
          </template>

          <UTextarea
            :model-value="unionResult.text"
            :rows="6"
            class="font-mono text-xs"
            placeholder="합집합 결과가 여기에 표시됩니다."
            readonly
          />
        </UCard>

        <!-- 교집합 -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <h2 class="text-sm font-semibold text-gray-800">
                  교집합 (왼쪽 ∩ 오른쪽)
                </h2>
                <p class="text-[11px] text-gray-500">
                  두 리스트에 모두 존재하는 값만 모은 결과입니다.
                  <span v-if="uniqueOnly && intersectionResult.removed > 0">
                    (중복 {{ intersectionResult.removed }}개 제거됨)
                  </span>
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="text-[11px] text-gray-500">
                  항목: {{ intersectionResult.count }} 개
                </span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!intersectionResult.text"
                  @click="copyText(intersectionResult.text)"
                >
                  복사
                </UButton>
              </div>
            </div>
          </template>

          <UTextarea
            :model-value="intersectionResult.text"
            :rows="6"
            class="font-mono text-xs"
            placeholder="교집합 결과가 여기에 표시됩니다."
            readonly
          />
        </UCard>

        <!-- 왼쪽 차집합 -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <h2 class="text-sm font-semibold text-gray-800">
                  왼쪽 차집합 (왼쪽 − 오른쪽)
                </h2>
                <p class="text-[11px] text-gray-500">
                  왼쪽에는 있지만 오른쪽에는 없는 값들입니다.
                  <span v-if="uniqueOnly && leftDiffResult.removed > 0">
                    (중복 {{ leftDiffResult.removed }}개 제거됨)
                  </span>
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="text-[11px] text-gray-500">
                  항목: {{ leftDiffResult.count }} 개
                </span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!leftDiffResult.text"
                  @click="copyText(leftDiffResult.text)"
                >
                  복사
                </UButton>
              </div>
            </div>
          </template>

          <UTextarea
            :model-value="leftDiffResult.text"
            :rows="6"
            class="font-mono text-xs"
            placeholder="왼쪽 차집합 결과가 여기에 표시됩니다."
            readonly
          />
        </UCard>

        <!-- 오른쪽 차집합 -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <h2 class="text-sm font-semibold text-gray-800">
                  오른쪽 차집합 (오른쪽 − 왼쪽)
                </h2>
                <p class="text-[11px] text-gray-500">
                  오른쪽에는 있지만 왼쪽에는 없는 값들입니다.
                  <span v-if="uniqueOnly && rightDiffResult.removed > 0">
                    (중복 {{ rightDiffResult.removed }}개 제거됨)
                  </span>
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="text-[11px] text-gray-500">
                  항목: {{ rightDiffResult.count }} 개
                </span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!rightDiffResult.text"
                  @click="copyText(rightDiffResult.text)"
                >
                  복사
                </UButton>
              </div>
            </div>
          </template>

          <UTextarea
            :model-value="rightDiffResult.text"
            :rows="6"
            class="font-mono text-xs"
            placeholder="오른쪽 차집합 결과가 여기에 표시됩니다."
            readonly
          />
        </UCard>

        <!-- 대칭차집합 -->
        <UCard class="md:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <h2 class="text-sm font-semibold text-gray-800">
                  대칭차집합 (왼쪽 △ 오른쪽)
                </h2>
                <p class="text-[11px] text-gray-500">
                  왼쪽/오른쪽 중 한쪽에만 존재하는 값들입니다.
                  <span v-if="uniqueOnly && symDiffResult.removed > 0">
                    (중복 {{ symDiffResult.removed }}개 제거됨)
                  </span>
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="text-[11px] text-gray-500">
                  항목: {{ symDiffResult.count }} 개
                </span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!symDiffResult.text"
                  @click="copyText(symDiffResult.text)"
                >
                  복사
                </UButton>
              </div>
            </div>
          </template>

          <UTextarea
            :model-value="symDiffResult.text"
            :rows="6"
            class="font-mono text-xs"
            placeholder="대칭차집합 결과가 여기에 표시됩니다."
            readonly
          />
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
