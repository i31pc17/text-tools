<script setup lang="ts">
definePageMeta({ ssr: false })

const html = ref('')
const excludeInput = ref('')
const excludeDisplayNone = ref(false)
const excludeVisHidden = ref(false)
const autoExcluded = ref<string[]>([])

const manual = computed(() =>
  excludeInput.value.split(/\s+/).map((s) => s.trim()).filter(Boolean)
)
const excludeSet = computed(() => new Set([...manual.value, ...autoExcluded.value]))

interface Result { text: string; counts: Record<string, number>; error: string | null }

const result = computed<Result>(() => {
  const trimmed = html.value.trim()
  if (!trimmed) return { text: '', counts: {}, error: null }
  if (typeof DOMParser === 'undefined') return { text: '', counts: {}, error: null }
  try {
    const doc = new DOMParser().parseFromString(html.value, 'text/html')
    doc.querySelectorAll('script, style, noscript, template').forEach((el) => el.remove())
    const all = Array.from(doc.body.querySelectorAll('*'))
    const counts: Record<string, number> = {}
    for (const el of all) {
      el.classList.forEach((c) => { if (c) counts[c] = (counts[c] || 0) + 1 })
      const sty = (el.getAttribute('style') || '').toLowerCase()
      const hasDN = /display\s*:\s*none/.test(sty)
      const hasVH = /visibility\s*:\s*hidden/.test(sty)
      const styleX = (excludeDisplayNone.value && hasDN) || (excludeVisHidden.value && hasVH)
      const classX = Array.from(el.classList).some((c) => excludeSet.value.has(c))
      if (styleX || classX) el.remove()
    }
    const raw = (doc.body as HTMLElement).innerText || ''
    const text = raw.split('\n').map((l) => l.trim()).filter((l) => l.length > 0).join('\n')
    return { text, counts, error: null }
  } catch {
    return { text: '', counts: {}, error: 'HTML 파싱 중 오류가 발생했습니다.' }
  }
})

const topClasses = computed(() =>
  Object.entries(result.value.counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
)

const lineCount = computed(() => result.value.text ? result.value.text.split('\n').length : 0)

function toggleAuto(c: string) {
  if (autoExcluded.value.includes(c)) {
    autoExcluded.value = autoExcluded.value.filter((x) => x !== c)
  } else {
    autoExcluded.value = [...autoExcluded.value, c]
  }
}
</script>

<template>
  <div>
    <PageHeader />

    <div class="split-2-balanced">
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">HTML 입력</h2>
            <p class="card-sub">붙여넣은 소스에서 텍스트 추출</p>
          </div>
          <BaseButton size="xs" variant="danger-ghost" icon="reset" @click="html = ''">초기화</BaseButton>
        </div>
        <div class="card-body col" style="gap: var(--pad-md)">
          <div class="row" style="gap: var(--pad-lg)">
            <label class="checkbox"><input v-model="excludeDisplayNone" type="checkbox"> display:none 제외</label>
            <label class="checkbox"><input v-model="excludeVisHidden" type="checkbox"> visibility:hidden 제외</label>
          </div>
          <textarea v-model="html" class="textarea" rows="16" placeholder="HTML 소스를 붙여넣으세요." />
          <div class="col-tight">
            <span class="label">제외할 class (공백 구분)</span>
            <input v-model="excludeInput" class="input" placeholder="예: ads banner hidden-text">
          </div>
        </div>
        <div class="card-footer">
          <span :class="result.error ? 'hint hint-error' : 'hint'">
            {{ result.error || '체크한 옵션의 태그는 파싱 단계에서 제거됩니다.' }}
          </span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">추출된 텍스트</h2>
            <p class="card-sub">렌더링과 유사한 줄바꿈으로 출력</p>
          </div>
          <div class="col-tight" style="align-items: flex-end">
            <span class="hint">줄 {{ lineCount }} • {{ result.text.length }}자</span>
            <CopyButton :text="result.text" label="결과 복사" />
          </div>
        </div>

        <div v-if="topClasses.length > 0" style="padding: var(--pad-md); border-bottom: 1px solid var(--border)">
          <div class="hint" style="margin-bottom: 8px">자주 등장하는 클래스 — 클릭해서 해당 영역 텍스트를 제외</div>
          <div class="chip-row">
            <button
              v-for="[c, n] in topClasses"
              :key="c"
              class="chip"
              :data-active="autoExcluded.includes(c)"
              @click="toggleAuto(c)"
            >
              {{ c }} <span style="opacity: 0.6">({{ n }})</span>
            </button>
          </div>
        </div>

        <div
          class="card-body"
          style="max-height: 540px; overflow: auto; font-family: var(--font-mono); font-size: var(--fs-xs); line-height: 1.7; white-space: pre-wrap"
        >
          <template v-if="result.text">{{ result.text }}</template>
          <span v-else class="hint">HTML을 입력하면 여기에 추출된 텍스트가 표시됩니다.</span>
        </div>
      </div>
    </div>
  </div>
</template>
