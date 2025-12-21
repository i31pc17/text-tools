<script setup lang="ts">
import { computed, ref } from "vue";

import MD5 from "crypto-js/md5";
import SHA256 from "crypto-js/sha256";
import SHA512 from "crypto-js/sha512";

const input = ref<string>("");

// 나중에 알고리즘 추가 편하게 하려고 배열로 정의
const algorithms = [
  {
    id: "md5",
    label: "MD5",
    compute: (text: string) => MD5(text).toString(),
  },
  {
    id: "sha256",
    label: "SHA-256",
    compute: (text: string) => SHA256(text).toString(),
  },
  {
    id: "sha512",
    label: "SHA-512",
    compute: (text: string) => SHA512(text).toString(),
  },
];

const hashResults = computed(() =>
  algorithms.map((algo) => ({
    id: algo.id,
    label: algo.label,
    value: input.value ? algo.compute(input.value) : "",
  }))
);

async function copyHash(value: string) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    alert("복사되었습니다.");
  } catch (e) {
    alert("클립보드 복사에 실패했습니다.");
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <!-- 헤더 -->
      <PageHeader />

      <!-- 본문: 2열 레이아웃 -->
      <div class="grid gap-4 md:grid-cols-2">
        <!-- 입력 영역 -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">입력 문자열</span>
              <UButton
                size="xs"
                variant="ghost"
                @click="input = ''"
              >
                초기화
              </UButton>
            </div>
          </template>

          <div class="flex-1">
            <UTextarea
              v-model="input"
              :rows="12"
              class="font-mono text-sm w-full"
              placeholder="해시를 계산할 문자열을 입력하세요."
            />
          </div>

          <template #footer>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>길이: {{ input.length }} 자</span>
              <span v-if="!input" class="text-gray-400">
                문자열을 입력하면 오른쪽에 해시 값이 표시됩니다.
              </span>
            </div>
          </template>
        </UCard>

        <!-- 결과 영역 -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">해시 결과</span>
              <span class="text-xs text-gray-500">
                알고리즘별로 계산된 값을 확인하고 복사할 수 있습니다.
              </span>
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-for="hash in hashResults"
              :key="hash.id"
              class="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs"
            >
              <div class="mb-1 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center rounded bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                    {{ hash.label }}
                  </span>
                  <span class="text-[10px] text-gray-500">
                    {{ hash.value ? hash.value.length : 0 }} chars
                  </span>
                </div>
                <UButton
                  size="2xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!hash.value"
                  @click="copyHash(hash.value)"
                >
                  복사
                </UButton>
              </div>

              <div class="overflow-x-auto">
                <code class="block whitespace-pre text-[11px] break-all">
                  {{ hash.value || "입력값이 없어서 해시를 계산하지 않았습니다." }}
                </code>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
