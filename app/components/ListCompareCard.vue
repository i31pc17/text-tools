<script setup lang="ts">
interface Result { items: string[]; count: number; removed: number; text: string }

defineProps<{
  title: string
  sub: string
  result: Result
  uniqueOnly: boolean
  full?: boolean
}>()
</script>

<template>
  <div class="card" :style="full ? 'grid-column: 1 / -1' : undefined">
    <div class="card-header">
      <div>
        <h2 class="card-title">{{ title }}</h2>
        <p class="card-sub">
          {{ sub }}<template v-if="uniqueOnly && result.removed > 0"> · 중복 {{ result.removed }}개 제거됨</template>
        </p>
      </div>
      <div class="col-tight" style="align-items: flex-end">
        <span class="hint">{{ result.count }}개</span>
        <CopyButton :text="result.text" />
      </div>
    </div>
    <div class="card-body">
      <textarea :value="result.text" class="textarea" rows="6" readonly placeholder="결과가 여기에 표시됩니다." />
    </div>
  </div>
</template>
