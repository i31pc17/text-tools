<script setup lang="ts">
interface Props {
  variant?: 'default' | 'solid' | 'ghost' | 'soft' | 'danger-ghost'
  size?: 'xs' | 'sm' | 'lg'
  icon?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}
withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
  type: 'button'
})
</script>

<template>
  <button
    class="btn"
    :data-variant="variant === 'default' ? undefined : variant"
    :data-size="size === 'sm' ? undefined : size"
    :disabled="disabled"
    :type="type"
  >
    <IconSvg v-if="icon" :name="icon" />
    <slot />
  </button>
</template>
