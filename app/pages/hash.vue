<script setup lang="ts">
import CryptoJS from 'crypto-js'

definePageMeta({ ssr: false })

const input = ref('')

const algos = [
  { id: 'md5', label: 'MD5', fn: (t: string) => CryptoJS.MD5(t).toString() },
  { id: 'sha256', label: 'SHA-256', fn: (t: string) => CryptoJS.SHA256(t).toString() },
  { id: 'sha512', label: 'SHA-512', fn: (t: string) => CryptoJS.SHA512(t).toString() }
]

const results = computed(() =>
  algos.map((a) => ({ ...a, value: input.value ? a.fn(input.value) : '' }))
)
</script>

<template>
  <div>
    <PageHeader />

    <div class="split-2">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">입력 문자열</h2>
          <BaseButton size="xs" variant="danger-ghost" icon="reset" @click="input = ''">초기화</BaseButton>
        </div>
        <div class="card-body">
          <textarea
            v-model="input"
            class="textarea"
            rows="12"
            placeholder="해시를 계산할 문자열을 입력하세요."
          />
        </div>
        <div class="card-footer">
          <span class="hint">길이 {{ input.length }}자</span>
          <span v-if="!input" class="hint">→ 우측에 해시값이 표시됩니다</span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">해시 결과</h2>
          <span class="hint">알고리즘별 계산 / 복사</span>
        </div>
        <div class="card-body col">
          <div v-for="r in results" :key="r.id" class="hash-row">
            <div class="hash-meta">
              <div class="row">
                <span class="badge" data-tone="solid">{{ r.label }}</span>
                <span class="hint">{{ r.value ? r.value.length : 0 }} chars</span>
              </div>
              <CopyButton :text="r.value" />
            </div>
            <div class="hash-value">{{ r.value || '입력값이 없습니다.' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
