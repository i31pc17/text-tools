<script setup lang="ts">
interface Props {
  value: unknown
  showTypes?: boolean
  showIndexes?: boolean
}
withDefaults(defineProps<Props>(), {
  showTypes: false,
  showIndexes: false
})
</script>

<template>
  <div v-if="value === null || value === undefined" class="empty">
    표시할 JSON 데이터가 없습니다.
  </div>
  <div v-else class="json-tree">
    <JsonTreeNode
      :value="value"
      :show-types="showTypes"
      :show-indexes="showIndexes"
      :is-last="true"
    />
  </div>
</template>
