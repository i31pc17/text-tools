<script setup lang="ts">
import { ACCENT_PRESETS, useTweaks } from '~/composables/useTweaks'

const { tweaks, setTweak, tweaksOpen } = useTweaks()
</script>

<template>
  <Teleport to="body">
    <button
      class="tweaks-fab"
      :title="tweaksOpen ? 'Close tweaks' : 'Open tweaks'"
      @click="tweaksOpen = !tweaksOpen"
    >
      <IconSvg :name="tweaksOpen ? 'close' : 'sliders'" />
    </button>
    <Transition>
      <div v-if="tweaksOpen" class="tweaks-panel">
        <div class="tweaks-header">
          <span>Tweaks</span>
          <button class="icon-btn" style="width:24px;height:24px;border:none" @click="tweaksOpen = false">
            <IconSvg name="close" />
          </button>
        </div>

        <div class="tweaks-section">
          <div class="tweaks-section-title">외관</div>
          <div class="tweaks-row">
            <span class="tweaks-row-label">테마</span>
            <SegGroup
              :model-value="tweaks.theme"
              :options="[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]"
              @update:model-value="(v) => setTweak('theme', v as any)"
            />
          </div>
          <div class="tweaks-row">
            <span class="tweaks-row-label">밀도</span>
            <SegGroup
              :model-value="tweaks.density"
              :options="[{ value: 'compact', label: 'Compact' }, { value: 'default', label: 'Default' }, { value: 'spacious', label: 'Spacious' }]"
              @update:model-value="(v) => setTweak('density', v as any)"
            />
          </div>
        </div>

        <div class="tweaks-section">
          <div class="tweaks-section-title">액센트</div>
          <div class="tweaks-row">
            <span class="tweaks-row-label">컬러 — {{ tweaks.accent.toUpperCase() }}</span>
            <input
              type="color"
              :value="tweaks.accent"
              style="width:100%; height:32px; border:1px solid var(--border); border-radius:4px; background:var(--surface); cursor:pointer"
              @input="(e) => setTweak('accent', (e.target as HTMLInputElement).value)"
            />
          </div>
          <div class="tweaks-swatches">
            <button
              v-for="c in ACCENT_PRESETS"
              :key="c"
              class="tweaks-swatch"
              :style="{ background: c }"
              :data-active="tweaks.accent.toLowerCase() === c.toLowerCase()"
              @click="setTweak('accent', c)"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.v-enter-active,
.v-leave-active { transition: opacity .15s, transform .15s; }
.v-enter-from,
.v-leave-to { opacity: 0; transform: translateY(8px); }
</style>
