<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { message } = useToast()
</script>

<template>
  <Teleport to="body">
    <div v-if="message" class="toast">{{ message }}</div>
  </Teleport>
</template>
