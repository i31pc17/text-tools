<script setup lang="ts" generic="T extends string">
interface Option { value: T; label: string }
const props = defineProps<{ modelValue: T; options: Array<T | Option> }>()
const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

function valueOf(opt: T | Option): T {
  return typeof opt === 'string' ? opt : opt.value
}
function labelOf(opt: T | Option): string {
  return typeof opt === 'string' ? opt : opt.label
}
</script>

<template>
  <div class="chip-row">
    <button
      v-for="opt in options"
      :key="valueOf(opt)"
      type="button"
      class="chip"
      :data-active="modelValue === valueOf(opt)"
      @click="emit('update:modelValue', valueOf(opt))"
    >
      {{ labelOf(opt) }}
    </button>
  </div>
</template>
