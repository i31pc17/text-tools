<!-- pages/index.vue -->
<script setup lang="ts">
import { textTools } from '@/utils/tools'

const tools = textTools
</script>

<template>
  <UContainer class="py-10">
    <div class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold">Text Tools</h1>
        <p class="text-sm text-gray-500">
          자주 쓰는 텍스트 가공 기능들을 한 곳에 모아둔 도구 모음입니다.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="tool in tools"
          :key="tool.page"
          class="flex flex-col justify-between"
        >
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">
              {{ tool.name }}
            </h2>
            <p v-if="tool.description" class="text-sm text-gray-500">
              {{ tool.description }}
            </p>
          </div>

          <div class="mt-4 flex justify-end">
            <NuxtLink :to="`/${tool.page}`">
              <UButton size="sm">사용하기</UButton>
            </NuxtLink>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
