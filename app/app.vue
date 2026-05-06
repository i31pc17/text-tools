<script setup lang="ts">
import { useTweaks, hydrateTweaks } from '~/composables/useTweaks'

const title = 'Text Tools – 텍스트 변환/가공 도구 모음'
const description =
  'JSON 파서, 해시 계산기, 배열 변환기 등 개발자가 자주 사용하는 텍스트 도구를 한 곳에서 제공합니다.'

useHead({
  title
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/og-text-tools.png',
  twitterImage: '/og-text-tools.png',
  twitterCard: 'summary_large_image'
})

const route = useRoute()
const { widthMode } = useTweaks()
const isDev = import.meta.dev

const isHome = computed(() => route.path === '/')
const mainWidth = computed(() => (isHome.value ? 'boxed' : widthMode.value))

watch(() => route.path, () => {
  if (typeof window !== 'undefined') window.scrollTo(0, 0)
})

onMounted(() => {
  hydrateTweaks()
})
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="main" :data-width="mainWidth">
      <NuxtPage />
    </main>
    <footer class="app-footer">
      <span>1t.co.kr / text-tools — built with Nuxt</span>
      <span>© 2026 · MIT</span>
    </footer>
    <TweaksPanel v-if="isDev" />
    <AppToast />
  </div>
</template>
