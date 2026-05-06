<script setup lang="ts" generic="T extends string">
interface Option { value: T; label: string }
const props = defineProps<{ modelValue: T; options: Option[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: T] }>()
</script>

<template>
  <div class="btn-group">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="btn"
      data-size="xs"
      :data-active="modelValue === opt.value"
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
