<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  ssr: false
})

const rawInput = ref('')        // 1) 원본 텍스트
const base64Input = ref('')     // 2) Base64 인코딩된 문자열
const urlEncodedInput = ref('') // 3) URL-encoded 문자열

const base64DecodeError = ref<string | null>(null)
const urlDecodeError = ref<string | null>(null)

// UTF-8 고정 인코더/디코더
const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: false })

function encodeBase64(str: string): string {
  if (!str) return ''
  const bytes = encoder.encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function decodeBase64(str: string): string {
  if (!str) return ''
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return decoder.decode(bytes)
}

function encodeUrl(str: string): string {
  if (!str) return ''
  return encodeURIComponent(str)
}

function decodeUrl(str: string): string {
  if (!str) return ''
  return decodeURIComponent(str)
}

// 1) 텍스트 → Base64 / URL Encode
const base64Encoded = computed(() => {
  try {
    return encodeBase64(rawInput.value)
  } catch {
    return ''
  }
})

const urlEncoded = computed(() => {
  try {
    return encodeUrl(rawInput.value)
  } catch {
    return ''
  }
})

// 2) Base64 → 텍스트
const base64Decoded = computed(() => {
  base64DecodeError.value = null
  if (!base64Input.value) return ''
  try {
    return decodeBase64(base64Input.value)
  } catch {
    base64DecodeError.value = '유효하지 않은 Base64 문자열입니다.'
    return ''
  }
})

// 3) URL-encoded → 텍스트
const urlDecoded = computed(() => {
  urlDecodeError.value = null
  if (!urlEncodedInput.value) return ''
  try {
    return decodeUrl(urlEncodedInput.value)
  } catch {
    urlDecodeError.value = '유효하지 않은 URL 인코딩 문자열입니다.'
    return ''
  }
})

async function copyText(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    alert('복사되었습니다.')
  } catch {
    alert('클립보드 복사에 실패했습니다.')
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <!-- 헤더 -->
      <PageHeader />

      <!-- 1. 텍스트 → Base64 / URL Encode -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold text-gray-800">
                인코더 (텍스트 → Base64 / URL Encode)
              </h2>
              <p class="text-[11px] text-gray-500">
                UTF-8 문자열을 Base64 / URL 인코딩합니다.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <!-- 입력 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">
                입력 텍스트
              </span>
              <span class="text-xs text-gray-500">
                길이: {{ rawInput.length }} 자
              </span>
            </div>
            <UTextarea
              v-model="rawInput"
              :rows="12"
              class="font-mono text-xs w-full"
              placeholder="인코딩할 문자열을 입력하세요."
            />
          </div>

          <!-- 결과 -->
          <div class="space-y-4 text-sm">
            <!-- Base64 -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-xs font-medium text-gray-700">
                    Base64 (UTF-8)
                  </span>
                  <span class="text-[10px] text-gray-500">
                    길이: {{ base64Encoded.length }}
                  </span>
                </div>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!base64Encoded"
                  @click="copyText(base64Encoded)"
                >
                  복사
                </UButton>
              </div>
              <UTextarea
                :model-value="base64Encoded"
                :rows="4"
                class="font-mono text-[11px] w-full"
                placeholder="Base64 인코딩 결과가 여기에 표시됩니다."
                readonly
              />
            </div>

            <!-- URL Encode -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-xs font-medium text-gray-700">
                    URL Encode (encodeURIComponent, UTF-8)
                  </span>
                  <span class="text-[10px] text-gray-500">
                    길이: {{ urlEncoded.length }}
                  </span>
                </div>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!urlEncoded"
                  @click="copyText(urlEncoded)"
                >
                  복사
                </UButton>
              </div>
              <UTextarea
                :model-value="urlEncoded"
                :rows="4"
                class="font-mono text-[11px] w-full"
                placeholder="URL 인코딩 결과가 여기에 표시됩니다."
                readonly
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- 2. Base64 → 텍스트 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold text-gray-800">
                Base64 디코더
              </h2>
              <p class="text-[11px] text-gray-500">
                Base64 인코딩된 문자열을 UTF-8 텍스트로 디코딩합니다.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <!-- 입력 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">
                Base64 입력
              </span>
              <span class="text-xs text-gray-500">
                길이: {{ base64Input.length }} 자
              </span>
            </div>
            <UTextarea
              v-model="base64Input"
              :rows="6"
              class="font-mono text-xs w-full"
              placeholder="Base64 인코딩된 문자열을 입력하세요."
            />
            <p
              v-if="base64DecodeError"
              class="text-[11px] text-red-500"
            >
              {{ base64DecodeError }}
            </p>
          </div>

          <!-- 결과 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs font-medium text-gray-700">
                  디코딩 결과 (UTF-8)
                </span>
                <span class="text-[10px] text-gray-500">
                  길이: {{ base64Decoded.length }}
                </span>
              </div>
              <UButton
                size="xs"
                variant="soft"
                icon="i-heroicons-clipboard"
                :disabled="!base64Decoded"
                @click="copyText(base64Decoded)"
              >
                복사
              </UButton>
            </div>
            <UTextarea
              :model-value="base64Decoded"
              :rows="6"
              class="font-mono text-xs w-full"
              placeholder="디코딩된 문자열이 여기에 표시됩니다."
              readonly
            />
          </div>
        </div>
      </UCard>

      <!-- 3. URL-encoded → 텍스트 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold text-gray-800">
                URL 디코더
              </h2>
              <p class="text-[11px] text-gray-500">
                URL 인코딩된 문자열(쿼리 파라미터 등)을 UTF-8 텍스트로 디코딩합니다.
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <!-- 입력 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">
                URL-encoded 입력
              </span>
              <span class="text-xs text-gray-500">
                길이: {{ urlEncodedInput.length }} 자
              </span>
            </div>
            <UTextarea
              v-model="urlEncodedInput"
              :rows="6"
              class="font-mono text-xs w-full"
              placeholder="URL 인코딩된 문자열을 입력하세요. (예: %EC%95%88%EB%85%95)"
            />
            <p
              v-if="urlDecodeError"
              class="text-[11px] text-red-500"
            >
              {{ urlDecodeError }}
            </p>
          </div>

          <!-- 결과 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs font-medium text-gray-700">
                  디코딩 결과 (UTF-8)
                </span>
                <span class="text-[10px] text-gray-500">
                  길이: {{ urlDecoded.length }}
                </span>
              </div>
              <UButton
                size="xs"
                variant="soft"
                icon="i-heroicons-clipboard"
                :disabled="!urlDecoded"
                @click="copyText(urlDecoded)"
              >
                복사
              </UButton>
            </div>
            <UTextarea
              :model-value="urlDecoded"
              :rows="6"
              class="font-mono text-xs w-full"
              placeholder="디코딩된 문자열이 여기에 표시됩니다."
              readonly
            />
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
