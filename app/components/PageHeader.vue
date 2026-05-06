<script setup lang="ts">
import { findToolByPage } from '~/utils/tools'
import { useTweaks } from '~/composables/useTweaks'

const route = useRoute()
const router = useRouter()
const { widthMode, setWidthMode } = useTweaks()

const currentPage = computed(() => {
  const name = (route.name as string | undefined) || ''
  return name || route.path.replace(/^\/+/, '')
})
const currentTool = computed(() => findToolByPage(currentPage.value))
const title = computed(() => currentTool.value?.name || 'Text Tools')
const description = computed(() => currentTool.value?.description || '')
const code = computed(() => currentTool.value?.code || '')

useHead({
  title: () => `${title.value} – Text Tools`,
  meta: [{ name: 'description', content: description.value }]
})
</script>

<template>
  <div class="page-header">
    <div class="page-header-text">
      <div class="page-eyebrow">
        <a @click="router.push('/')">TEXT TOOLS</a>
        <span class="crumb-sep">/</span>
        <span>{{ code }}</span>
      </div>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="description" class="page-desc">{{ description }}</p>
    </div>
    <div class="row">
      <div class="width-toggle" role="group" aria-label="Width">
        <button
          type="button"
          class="wt-btn"
          :data-active="widthMode === 'boxed'"
          title="고정 너비"
          @click="setWidthMode('boxed')"
        >
          <IconSvg name="boxed" />
          <span>BOXED</span>
        </button>
        <button
          type="button"
          class="wt-btn"
          :data-active="widthMode === 'full'"
          title="전체 너비"
          @click="setWidthMode('full')"
        >
          <IconSvg name="full" />
          <span>FULL</span>
        </button>
      </div>
      <BaseButton variant="ghost" icon="back" @click="router.push('/')">목록으로</BaseButton>
    </div>
  </div>
</template>
