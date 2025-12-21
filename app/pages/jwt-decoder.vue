<script setup lang="ts">
import { ref, watch, computed } from 'vue'

definePageMeta({
  ssr: false
})

const jwtInput = ref('')

// 문자열 대신 파싱된 '객체'를 저장합니다.
const headerObj = ref<any>(null)
const payloadObj = ref<any>(null)

const headerError = ref<string | null>(null)
const payloadError = ref<string | null>(null)
const formatError = ref<string | null>(null)

// Base64Url 디코딩 유틸
function base64UrlDecode(part: string): string {
  let base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad === 2) base64 += '=='
  else if (pad === 3) base64 += '='
  else if (pad === 1) throw new Error('Invalid base64url')

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder('utf-8').decode(bytes)
}

function parseJwt() {
  let raw = jwtInput.value.trim()

  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1)
  }

  headerObj.value = null
  payloadObj.value = null
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

  // HEADER 처리
  try {
    const decoded = base64UrlDecode(h)
    headerObj.value = JSON.parse(decoded)
  } catch (e) {
    headerError.value = 'HEADER 디코딩/파싱 실패'
  }

  // PAYLOAD 처리
  try {
    const decoded = base64UrlDecode(p)
    payloadObj.value = JSON.parse(decoded)
  } catch (e) {
    payloadError.value = 'PAYLOAD 디코딩/파싱 실패'
  }
}

watch(jwtInput, parseJwt, { immediate: true })

// 복사용 유틸리티 (객체를 문자열로 변환해서 복사)
async function copyAsJson(obj: any) {
  if (!obj) return
  try {
    await navigator.clipboard.writeText(JSON.stringify(obj, null, 2))
    alert('JSON이 클립보드에 복사되었습니다.')
  } catch {
    alert('복사 실패')
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-none w-full">
    <div class="space-y-6">
      <PageHeader />

      <div class="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <UCard class="h-full flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-gray-800">JWT 입력</h2>
                <p class="text-[11px] text-gray-500">Encoded 토큰을 입력하세요.</p>
              </div>
              <UButton size="xs" variant="ghost" color="neutral" @click="jwtInput = ''">초기화</UButton>
            </div>
          </template>

          <UTextarea
            v-model="jwtInput"
            :rows="20"
            class="font-mono text-xs w-full"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />

          <template #footer>
            <p v-if="formatError" class="text-[11px] text-red-500 font-medium">{{ formatError }}</p>
            <p v-else class="text-[11px] text-gray-500">Header와 Payload만 디코딩하여 보여줍니다.</p>
          </template>
        </UCard>

        <div class="space-y-6">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-700">DECODED HEADER</span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!headerObj"
                  @click="copyAsJson(headerObj)"
                >복사</UButton>
              </div>
            </template>

            <div class="h-22 bg-slate-50 rounded border border-gray-100 overflow-hidden">
              <JsonTreeView :value="headerObj" />
            </div>

            <p v-if="headerError" class="mt-2 text-[11px] text-red-500">{{ headerError }}</p>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-700">DECODED PAYLOAD</span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-heroicons-clipboard"
                  :disabled="!payloadObj"
                  @click="copyAsJson(payloadObj)"
                >복사</UButton>
              </div>
            </template>

            <div class="h-80 bg-slate-50 rounded border border-gray-100 overflow-hidden">
              <JsonTreeView :value="payloadObj" :show-types="true" />
            </div>

            <p v-if="payloadError" class="mt-2 text-[11px] text-red-500">{{ payloadError }}</p>
          </UCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>
