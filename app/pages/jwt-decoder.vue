<script setup lang="ts">
import { decodeJwt } from '~/utils/codec'

definePageMeta({ ssr: false })

const input = ref('')

const result = computed(() => decodeJwt(input.value))

const headerJson = computed(() => result.value.header ? JSON.stringify(result.value.header, null, 2) : '')
const payloadJson = computed(() => result.value.payload ? JSON.stringify(result.value.payload, null, 2) : '')
</script>

<template>
  <div>
    <PageHeader />

    <div class="split-2-balanced">
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">JWT 입력</h2>
            <p class="card-sub">Encoded 토큰</p>
          </div>
          <BaseButton size="xs" variant="danger-ghost" icon="reset" @click="input = ''">초기화</BaseButton>
        </div>
        <div class="card-body">
          <textarea
            v-model="input"
            class="textarea"
            rows="18"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />
        </div>
        <div class="card-footer">
          <span :class="result.formatErr ? 'hint hint-error' : 'hint'">
            {{ result.formatErr || 'Header와 Payload만 디코딩하여 보여줍니다.' }}
          </span>
        </div>
      </div>

      <div class="col" style="gap: var(--pad-lg)">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title" style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em">DECODED HEADER</h2>
            <CopyButton :text="headerJson" label="복사" />
          </div>
          <div style="min-height: 80px; max-height: 180px; overflow: auto">
            <JsonTreeView :value="result.header" />
          </div>
          <div v-if="result.hErr" class="card-footer">
            <span class="hint hint-error">{{ result.hErr }}</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title" style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em">DECODED PAYLOAD</h2>
            <CopyButton :text="payloadJson" label="복사" />
          </div>
          <div style="min-height: 200px; max-height: 360px; overflow: auto">
            <JsonTreeView :value="result.payload" :show-types="true" />
          </div>
          <div v-if="result.pErr" class="card-footer">
            <span class="hint hint-error">{{ result.pErr }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
