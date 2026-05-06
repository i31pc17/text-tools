<script setup lang="ts">
interface Props {
  text: string
  label?: string
  size?: 'xs' | 'sm' | 'lg'
  variant?: 'default' | 'solid' | 'ghost' | 'soft' | 'danger-ghost'
}
import { useCopy } from '~/composables/useToast'

const props = withDefaults(defineProps<Props>(), {
  label: '복사',
  size: 'xs',
  variant: 'soft'
})

const copy = useCopy()
function onClick() {
  copy(props.text, props.label)
}
</script>

<template>
  <BaseButton :size="size" :variant="variant" icon="copy" :disabled="!text" @click="onClick">
    {{ label }}
  </BaseButton>
</template>
