<script setup lang="ts">
definePageMeta({ ssr: false })

const left = ref('')
const right = ref('')
const uniqueOnly = ref<'on' | 'off'>('on')

function normalizeLines(t: string): string[] {
  return t.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)
}

const leftItems = computed(() => normalizeLines(left.value))
const rightItems = computed(() => normalizeLines(right.value))
const leftSet = computed(() => new Set(leftItems.value))
const rightSet = computed(() => new Set(rightItems.value))

interface BuildResult { items: string[]; count: number; removed: number; text: string }

function build(base: string[]): BuildResult {
  if (uniqueOnly.value !== 'on') return { items: base, count: base.length, removed: 0, text: base.join('\n') }
  const seen = new Set<string>()
  const u: string[] = []
  for (const it of base) if (!seen.has(it)) { seen.add(it); u.push(it) }
  return { items: u, count: u.length, removed: base.length - u.length, text: u.join('\n') }
}

const union = computed(() => build([...leftItems.value, ...rightItems.value]))
const inter = computed(() => build(leftItems.value.filter((i) => rightSet.value.has(i))))
const ldiff = computed(() => build(leftItems.value.filter((i) => !rightSet.value.has(i))))
const rdiff = computed(() => build(rightItems.value.filter((i) => !leftSet.value.has(i))))
const sym = computed(() => build([
  ...leftItems.value.filter((i) => !rightSet.value.has(i)),
  ...rightItems.value.filter((i) => !leftSet.value.has(i))
]))
</script>

<template>
  <div>
    <PageHeader />

    <div class="col" style="gap: var(--pad-lg)">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">입력 리스트</h2>
          <span class="hint">각 항목을 줄바꿈으로 구분</span>
        </div>
        <div class="card-body split-2">
          <div class="col">
            <div class="row-between">
              <span class="label">왼쪽 리스트</span>
              <span class="hint">{{ leftItems.length }}개</span>
            </div>
            <textarea v-model="left" class="textarea" rows="10" placeholder="왼쪽 리스트 항목들" />
          </div>
          <div class="col">
            <div class="row-between">
              <span class="label">오른쪽 리스트</span>
              <span class="hint">{{ rightItems.length }}개</span>
            </div>
            <textarea v-model="right" class="textarea" rows="10" placeholder="오른쪽 리스트 항목들" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body row-between">
          <div class="row" style="gap: var(--pad-lg)">
            <span class="hint">왼쪽 <strong style="color: var(--text)">{{ leftItems.length }}</strong></span>
            <span class="hint">오른쪽 <strong style="color: var(--text)">{{ rightItems.length }}</strong></span>
            <span class="hint">∪ <strong style="color: var(--text)">{{ union.count }}</strong></span>
            <span class="hint">∩ <strong style="color: var(--text)">{{ inter.count }}</strong></span>
            <span class="hint">L−R <strong style="color: var(--text)">{{ ldiff.count }}</strong></span>
            <span class="hint">R−L <strong style="color: var(--text)">{{ rdiff.count }}</strong></span>
            <span class="hint">△ <strong style="color: var(--text)">{{ sym.count }}</strong></span>
          </div>
          <div class="row">
            <span class="label">중복 제거</span>
            <SegGroup
              v-model="uniqueOnly"
              :options="[{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }]"
            />
          </div>
        </div>
      </div>

      <div class="split-2">
        <ListCompareCard title="합집합 (L ∪ R)" sub="두 리스트를 합친 결과" :result="union" :unique-only="uniqueOnly === 'on'" />
        <ListCompareCard title="교집합 (L ∩ R)" sub="두 리스트에 모두 존재" :result="inter" :unique-only="uniqueOnly === 'on'" />
        <ListCompareCard title="왼쪽 차집합 (L − R)" sub="왼쪽에만 있는 값" :result="ldiff" :unique-only="uniqueOnly === 'on'" />
        <ListCompareCard title="오른쪽 차집합 (R − L)" sub="오른쪽에만 있는 값" :result="rdiff" :unique-only="uniqueOnly === 'on'" />
      </div>
      <ListCompareCard title="대칭차집합 (L △ R)" sub="한쪽에만 존재하는 값" :result="sym" :unique-only="uniqueOnly === 'on'" full />
    </div>
  </div>
</template>
