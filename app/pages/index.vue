<script setup lang="ts">
import { textTools } from '~/utils/tools'

const tools = textTools

useHead({ title: 'Text Tools — 1t.co.kr' })
</script>

<template>
  <div>
    <section class="home-hero">
      <div class="home-hero-grid">
        <div class="home-hero-text">
          <div class="home-meta">
            <span><strong>10</strong> tools</span>
            <span>v<strong>2026.04</strong></span>
            <span>by <strong>1t.co.kr</strong></span>
          </div>
          <h1>Text Tools<br>for everyday devs.</h1>
          <p>JSON, Base64, JWT, 해시, 시간대 — 작업 흐름을 끊지 않는 가벼운 텍스트 유틸리티 모음.</p>
        </div>
        <aside class="home-hero-aside" aria-hidden="true">
          <div class="hero-terminal">
            <div class="hero-terminal-bar">
              <span class="hero-terminal-dot" data-c="r" />
              <span class="hero-terminal-dot" data-c="y" />
              <span class="hero-terminal-dot" data-c="g" />
              <span class="hero-terminal-title">~/text-tools — bash</span>
            </div>
            <div class="hero-terminal-body">
              <div><span class="ht-prompt">$</span><span class="ht-cmd">tt</span> <span class="ht-flag">--list</span></div>
              <div v-for="t in tools" :key="t.page" class="ht-row">
                <span class="ht-num">{{ t.code }}</span>
                <span>{{ t.page }}</span>
                <span class="ht-tag">{{ t.tag }}</span>
              </div>
              <div><span class="ht-prompt">$</span><span class="ht-caret">▌</span></div>
            </div>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hs-num">10</div>
              <div class="hs-lbl">UTILITIES</div>
            </div>
            <div class="hero-stat">
              <div class="hs-num">0kb</div>
              <div class="hs-lbl">SERVER · 100% CLIENT</div>
            </div>
            <div class="hero-stat">
              <div class="hs-num">MIT</div>
              <div class="hs-lbl">OPEN SOURCE</div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="tool-grid">
      <NuxtLink v-for="t in tools" :key="t.page" :to="`/${t.page}`" class="tool-card">
        <span class="tool-num">— {{ t.code }}</span>
        <h3>{{ t.name }}</h3>
        <p>{{ t.description }}</p>
        <span class="tool-arrow">열기 <IconSvg name="arrow" /></span>
      </NuxtLink>
    </section>
  </div>
</template>
