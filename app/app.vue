<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'ko'
  }
})

const title = 'Text Tools – 텍스트 변환/가공 도구 모음'
const description =
  'JSON 파서, 해시 계산기, 배열 변환기 등 개발자가 자주 사용하는 텍스트 도구를 한 곳에서 제공합니다.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/og-text-tools.png',
  twitterImage: '/og-text-tools.png',
  twitterCard: 'summary_large_image'
})

const currentYear = new Date().getFullYear()
</script>

<template>
  <UApp>

    <!-- 헤더: 로고/네비 제거한 심플 헤더 -->
    <UHeader class="backdrop-blur border-b border-gray-200 bg-white/70" :hideToggle="true">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="font-semibold text-gray-800 text-base">
            Text Tools
          </span>
        </NuxtLink>
      </template>

      <template #right>
        <!-- 필요하면 오른쪽에 버튼 추가 가능 -->
      </template>
    </UHeader>

    <!-- 본문 -->
    <UMain>
      <UContainer class="py-6 md:py-10">
        <NuxtPage />
      </UContainer>
    </UMain>

    <!-- 구분선 -->
    <USeparator class="my-4" />

    <!-- 푸터: 밝고 단순하게 -->
    <UFooter class="bg-white/70 backdrop-blur">
      <template #left>
        <p class="text-xs text-gray-500">
          © {{ currentYear }} Text Tools
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
          size="xs"
        />
      </template>
    </UFooter>

  </UApp>
</template>
