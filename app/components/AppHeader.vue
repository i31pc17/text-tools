<script setup lang="ts">
import { textTools } from '~/utils/tools'
import { useTweaks } from '~/composables/useTweaks'

const route = useRoute()
const { tweaks, toggleTheme } = useTweaks()
const currentPage = computed(() => {
  const p = route.path === '/' ? 'home' : route.path.replace(/^\/+/, '')
  return p
})
</script>

<template>
  <header class="app-header">
    <div class="app-header-inner">
      <NuxtLink to="/" class="brand">
        <div class="brand-mark">1T</div>
        <span class="brand-name">text-tools</span>
        <span class="brand-divider" />
        <span class="brand-tag">v2026.04 · 10 utils</span>
      </NuxtLink>
      <div class="header-actions">
        <button class="icon-btn" :title="tweaks.theme === 'dark' ? 'Light' : 'Dark'" @click="toggleTheme">
          <IconSvg :name="tweaks.theme === 'dark' ? 'sun' : 'moon'" />
        </button>
        <a class="icon-btn" href="https://github.com/i31pc17/text-tools" target="_blank" rel="noopener" title="GitHub">
          <IconSvg name="github" />
        </a>
      </div>
    </div>
    <nav class="tab-bar">
      <div class="tab-bar-inner">
        <NuxtLink to="/" custom v-slot="{ navigate }">
          <button class="tab" :data-active="currentPage === 'home'" @click="navigate">
            <span class="tab-num">00</span> HOME
          </button>
        </NuxtLink>
        <NuxtLink
          v-for="t in textTools"
          :key="t.page"
          :to="`/${t.page}`"
          custom
          v-slot="{ navigate }"
        >
          <button class="tab" :data-active="currentPage === t.page" @click="navigate">
            <span class="tab-num">{{ t.code }}</span> {{ t.name }}
          </button>
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
