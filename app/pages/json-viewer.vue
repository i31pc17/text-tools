<script setup lang="ts">
import { safeParseJson } from '~/utils/json'

definePageMeta({ ssr: false })

const input = ref('')
const showTypes = ref(false)
const showIndexes = ref(false)

const result = computed(() => safeParseJson(input.value))
const formatted = computed(() =>
  result.value.data != null ? JSON.stringify(result.value.data, null, 2) : ''
)
</script>

<template>
  <div>
    <PageHeader />

    <div class="card" style="margin-bottom: var(--pad-lg)">
      <div class="card-body row-between">
        <div class="row" style="gap: var(--pad-lg)">
          <span class="hint">입력 <strong style="color: var(--text)">{{ input.length }}</strong>자</span>
          <span class="hint">결과 <strong style="color: var(--text)">{{ formatted.length }}</strong>자</span>
        </div>
        <div class="row">
          <label class="checkbox"><input type="checkbox" checked disabled> Beautify</label>
          <label class="checkbox"><input v-model="showTypes" type="checkbox"> Show Types</label>
          <label class="checkbox"><input v-model="showIndexes" type="checkbox"> Show Indexes</label>
        </div>
      </div>
    </div>

    <div class="split-2-balanced">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">JSON 입력</h2>
          <BaseButton size="xs" variant="danger-ghost" icon="reset" @click="input = ''">초기화</BaseButton>
        </div>
        <div class="card-body">
          <textarea
            v-model="input"
            class="textarea"
            rows="22"
            placeholder='{ "key": "value" }'
          />
        </div>
        <div class="card-footer">
          <span :class="result.error ? 'hint hint-error' : 'hint'">
            {{ result.error || '파싱되면 우측에 트리가 표시됩니다.' }}
          </span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">JSON 뷰어</h2>
          <CopyButton :text="formatted" label="결과 복사" />
        </div>
        <JsonTreeView :value="result.data" :show-types="showTypes" :show-indexes="showIndexes" />
      </div>
    </div>
  </div>
</template>
