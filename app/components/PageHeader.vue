<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { textTools } from '~/utils/tools' // tools.ts 경로에 맞게 수정하세요

const route = useRoute()
const router = useRouter()

// 현재 페이지의 'name'을 기준으로 tools.ts에서 정보 찾기
// Nuxt는 보통 파일명이 페이지의 name이 됩니다. (예: json-viewer.vue -> name: 'json-viewer')
const currentTool = computed(() => {
  return textTools.find(tool => tool.page === route.name)
})

// 만약 매칭되는 툴이 없을 경우를 대비한 기본값
const title = computed(() => currentTool.value?.name || 'Text Tools')
const description = computed(() => currentTool.value?.description || '')

useHead({
  title: `${title.value} - Text Tools`,
  meta: [
    { name: 'description', content: description.value },
  ]
})

</script>

<template>
  <div class="flex items-center justify-between gap-4 mb-6">
    <div class="space-y-1">
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <NuxtLink to="/" class="hover:underline text-gray-400">Text Tools</NuxtLink>
        <span class="text-gray-300">/</span>
        <span class="font-medium text-gray-600">{{ title }}</span>
      </div>

      <h1 class="text-2xl font-bold text-gray-900">
        {{ title }}
      </h1>

      <p v-if="description" class="text-sm text-gray-500 max-w-3xl leading-relaxed">
        {{ description }}
      </p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <UButton
        variant="soft"
        color="neutral"
        icon="i-heroicons-arrow-uturn-left"
        @click="router.push('/')"
      >
        목록으로
      </UButton>
    </div>
  </div>
</template>
