<script setup lang="ts">
import { ref, computed, h, defineComponent } from 'vue'

interface Props {
  value: any
  showTypes?: boolean
  showIndexes?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTypes: false,
  showIndexes: false
})

// ───────────── 타입 체크 유틸 ─────────────
function typeNameOf(v: any): string {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}

// ───────────── 내부 JsonNode 컴포넌트 (생략 없이 로직 동일) ─────────────
const JsonNode = defineComponent({
  name: 'JsonNode',
  props: {
    value: { type: null, required: true },
    depth: { type: Number, default: 0 },
    labelKey: { type: String, default: undefined },
    index: { type: Number, default: undefined },
    showTypes: { type: Boolean, default: false },
    showIndexes: { type: Boolean, default: false },
    isLast: { type: Boolean, default: false }
  },
  setup(nodeProps) {
    const collapsed = ref(false)
    const toggle = () => {
      const v = nodeProps.value
      const isArray = Array.isArray(v)
      const isObject = v !== null && typeof v === 'object' && !isArray
      if (!isArray && !isObject) return
      collapsed.value = !collapsed.value
    }

    return () => {
      const v = nodeProps.value
      const depth = nodeProps.depth
      const isArray = Array.isArray(v)
      const isObject = v !== null && typeof v === 'object' && !isArray
      const marginLeft = `${depth * 18}px`
      const lineChildren: any[] = []

      // 아이콘, 인덱스, 키, 타입, 값 렌더링 로직 (기존과 동일)
      if (isArray || isObject) {
        lineChildren.push(h('button', {
          class: 'inline-flex items-center justify-center w-4 h-4 mr-1 rounded text-[10px] text-slate-600 hover:bg-slate-200 transition-colors',
          type: 'button', onClick: toggle
        }, collapsed.value ? '+' : '−'))
      } else {
        lineChildren.push(h('span', { class: 'inline-block w-4 mr-1' }))
      }

      if (nodeProps.showIndexes && typeof nodeProps.index === 'number') {
        lineChildren.push(h('span', { class: 'inline-flex items-center justify-center mr-1 text-[11px] font-semibold text-rose-600' }, `${nodeProps.index}.`))
      }

      if (nodeProps.labelKey !== undefined) {
        lineChildren.push(h('span', { class: 'text-[12px] text-slate-700 mr-1 font-medium' }, `"${nodeProps.labelKey}":`))
      }

      if (nodeProps.showTypes) {
        const typeName = typeNameOf(v)
        lineChildren.push(h('span', { class: `inline-flex items-center px-1.5 rounded border text-[10px] font-medium mr-1 bg-sky-50 text-sky-700 border-sky-200` }, typeName))
      }

      if (isObject) lineChildren.push(h('span', { class: 'text-slate-700' }, collapsed.value ? '{…}' : '{'))
      else if (isArray) lineChildren.push(h('span', { class: 'text-slate-700' }, collapsed.value ? '[…]' : '['))
      else {
        let textValue = typeof v === 'string' ? `"${v}"` : String(v)
        lineChildren.push(h('span', { class: 'text-emerald-700' }, textValue))
      }

      if (!nodeProps.isLast) lineChildren.push(h('span', { class: 'text-slate-400' }, ','))

      const line = h('div', { class: 'leading-5', style: { marginLeft } }, lineChildren)
      const childrenBlocks: any[] = []

      if (!collapsed.value && (isObject || isArray)) {
        if (isObject) {
          const keys = Object.keys(v)
          keys.forEach((k, i) => {
            childrenBlocks.push(h(JsonNode, {
              value: v[k], depth: depth + 1, labelKey: k,
              showTypes: nodeProps.showTypes, showIndexes: nodeProps.showIndexes, isLast: i === keys.length - 1
            }))
          })
          childrenBlocks.push(h('div', { class: 'leading-5', style: { marginLeft } }, [h('span', { class: 'text-slate-700' }, '}'), !nodeProps.isLast ? h('span', { class: 'text-slate-400' }, ',') : null]))
        } else {
          (v as any[]).forEach((item, i) => {
            childrenBlocks.push(h(JsonNode, {
              value: item, depth: depth + 1, index: i,
              showTypes: nodeProps.showTypes, showIndexes: nodeProps.showIndexes, isLast: i === (v as any[]).length - 1
            }))
          })
          childrenBlocks.push(h('div', { class: 'leading-5', style: { marginLeft } }, [h('span', { class: 'text-slate-700' }, ']'), !nodeProps.isLast ? h('span', { class: 'text-slate-400' }, ',') : null]))
        }
      }

      return h('div', null, [line, ...childrenBlocks])
    }
  }
})
</script>

<template>
  <div class="w-full h-full overflow-auto font-mono text-[11px]">
    <JsonNode
      v-if="value !== null"
      :value="value"
      :show-types="showTypes"
      :show-indexes="showIndexes"
      :is-last="true"
    />
    <div v-else class="text-gray-400 p-4">
      No JSON data to display.
    </div>
  </div>
</template>
