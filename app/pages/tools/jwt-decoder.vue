<script setup lang="ts">
import { ref, watch, computed } from 'vue'

import { useRouter } from "vue-router";

const router = useRouter();

definePageMeta({
  ssr: false
})

useHead({
  title: 'JWT 디코더 - Text Tools',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

const jwtInput = ref('')

const headerPretty = ref('')
const payloadPretty = ref('')

const headerError = ref<string | null>(null)
const payloadError = ref<string | null>(null)
const formatError = ref<string | null>(null)

function base64UrlDecode(part: string): string {
  // base64url → base64
  let base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad === 2) base64 += '=='
  else if (pad === 3) base64 += '='
  else if (pad === 1) {
    // 잘못된 base64url
    throw new Error('Invalid base64url')
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const decoder = new TextDecoder('utf-8', { fatal: false })
  return decoder.decode(bytes)
}

function prettyJsonOrText(str: string) {
  try {
    const parsed = JSON.parse(str)
    return JSON.stringify(parsed, null, 2)
  } catch {
    // JSON 파싱 실패하면 그냥 원문 보여주기
    return str
  }
}

function parseJwt() {
  const raw = jwtInput.value.trim()

  headerPretty.value = ''
  payloadPretty.value = ''
  headerError.value = null
  payloadError.value = null
  formatError.value = null

  if (!raw) return

  const parts = raw.split('.')
  if (parts.length < 2) {
    formatError.value = 'JWT 형식이 아닙니다. (header.payload[.signature])'
    return
  }

  const [h, p] = parts

  // HEADER
  try {
    const decodedHeader = base64UrlDecode(h)
    headerPretty.value = prettyJsonOrText(decodedHeader)
  } catch (e) {
    headerError.value = 'HEADER 디코딩에 실패했습니다.'
    headerPretty.value = ''
  }

  // PAYLOAD
  try {
    const decodedPayload = base64UrlDecode(p)
    payloadPretty.value = prettyJsonOrText(decodedPayload)
  } catch (e) {
    payloadError.value = 'PAYLOAD 디코딩에 실패했습니다.'
    payloadPretty.value = ''
  }
}

watch(jwtInput, () => {
  parseJwt()
}, { immediate: true })

const headerLength = computed(() => headerPretty.value.length)
const payloadLength = computed(() => payloadPretty.value.length)

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
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <NuxtLink to="/" class="hover:underline">Text Tools</NuxtLink>
            <span>/</span>
            <span>JWT 디코더</span>
          </div>
          <h1 class="text-2xl font-bold">JWT 디코더</h1>
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

      <div class="grid gap-4 md:grid-cols-2">
        <!-- 왼쪽: JWT 입력 -->
        <UCard class="h-full flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-gray-800">
                  JWT 입력
                </h2>
                <p class="text-[11px] text-gray-500">
                  header.payload.signature 형식의 JWT 문자열을 붙여넣으세요.
                </p>
              </div>
              <span class="text-xs text-gray-500">
                길이: {{ jwtInput.length }} 자
              </span>
            </div>
          </template>

          <UTextarea
            v-model="jwtInput"
            :rows="14"
            class="font-mono text-xs"
            placeholder="예) eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />

          <template #footer>
            <p
              v-if="formatError"
              class="text-[11px] text-red-500"
            >
              {{ formatError }}
            </p>
            <p
              v-else
              class="text-[11px] text-gray-500"
            >
              서명(signature) 부분은 검증하지 않고, HEADER / PAYLOAD 디코딩만 수행합니다.
            </p>
          </template>
        </UCard>

        <!-- 오른쪽: 결과 -->
        <UCard class="h-full flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-800">디코딩 결과</span>
            </div>
          </template>

          <div class="space-y-4 text-sm">
            <!-- HEADER -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-gray-700">
                    DECODED HEADER
                  </span>
                  <span class="text-[10px] text-gray-500">
                    길이: {{ headerLength }} 자
                  </span>
                </div>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!headerPretty"
                  @click="copyText(headerPretty)"
                >
                  복사
                </UButton>
              </div>
              <UTextarea
                :model-value="headerPretty"
                :rows="6"
                class="font-mono text-[11px]"
                placeholder="JWT HEADER 디코딩 결과가 여기에 표시됩니다."
                readonly
              />
              <p
                v-if="headerError"
                class="text-[11px] text-red-500"
              >
                {{ headerError }}
              </p>
            </div>

            <!-- PAYLOAD -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-gray-700">
                    DECODED PAYLOAD
                  </span>
                  <span class="text-[10px] text-gray-500">
                    길이: {{ payloadLength }} 자
                  </span>
                </div>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!payloadPretty"
                  @click="copyText(payloadPretty)"
                >
                  복사
                </UButton>
              </div>
              <UTextarea
                :model-value="payloadPretty"
                :rows="8"
                class="font-mono text-[11px]"
                placeholder="JWT PAYLOAD 디코딩 결과가 여기에 표시됩니다."
                readonly
              />
              <p
                v-if="payloadError"
                class="text-[11px] text-red-500"
              >
                {{ payloadError }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
