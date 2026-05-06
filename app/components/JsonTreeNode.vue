<script setup lang="ts">
interface Props {
  value: unknown
  depth?: number
  labelKey?: string
  index?: number
  showTypes?: boolean
  showIndexes?: boolean
  isLast?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  showTypes: false,
  showIndexes: false,
  isLast: false
})

const collapsed = ref(false)

const isArray = computed(() => Array.isArray(props.value))
const isObject = computed(() => props.value !== null && typeof props.value === 'object' && !Array.isArray(props.value))

const indent = computed(() => `${props.depth * 16}px`)

function typeName(v: unknown): string {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}
</script>

<template>
  <div>
    <div :style="{ marginLeft: indent }">
      <button
        v-if="isArray || isObject"
        class="jt-toggle"
        type="button"
        @click="collapsed = !collapsed"
      >{{ collapsed ? '+' : '−' }}</button>
      <span v-else class="jt-spacer" />
      <span v-if="showIndexes && typeof index === 'number'" class="jt-idx">{{ index }}.</span>
      <span v-if="labelKey !== undefined" class="jt-key">"{{ labelKey }}":</span>
      <span v-if="showTypes" class="jt-type">{{ typeName(value) }}</span>
      <template v-if="isObject">
        <span class="jt-bracket">{{ collapsed ? '{…}' : '{' }}</span>
      </template>
      <template v-else-if="isArray">
        <span class="jt-bracket">{{ collapsed ? '[…]' : '[' }}</span>
      </template>
      <template v-else>
        <span v-if="value === null" class="jt-null">null</span>
        <span v-else-if="typeof value === 'string'" class="jt-string">"{{ value }}"</span>
        <span v-else-if="typeof value === 'number'" class="jt-number">{{ value }}</span>
        <span v-else-if="typeof value === 'boolean'" class="jt-bool">{{ value }}</span>
        <span v-else>{{ String(value) }}</span>
      </template>
      <span v-if="!isLast" class="jt-bracket">,</span>
    </div>

    <template v-if="!collapsed && isObject">
      <JsonTreeNode
        v-for="(v, k, i) in (value as Record<string, unknown>)"
        :key="String(k)"
        :value="v"
        :depth="depth + 1"
        :label-key="String(k)"
        :show-types="showTypes"
        :show-indexes="showIndexes"
        :is-last="i === Object.keys(value as Record<string, unknown>).length - 1"
      />
      <div :style="{ marginLeft: indent }">
        <span class="jt-spacer" />
        <span class="jt-bracket">{{ '}' }}<template v-if="!isLast">,</template></span>
      </div>
    </template>

    <template v-if="!collapsed && isArray">
      <JsonTreeNode
        v-for="(item, i) in (value as unknown[])"
        :key="i"
        :value="item"
        :depth="depth + 1"
        :index="i"
        :show-types="showTypes"
        :show-indexes="showIndexes"
        :is-last="i === (value as unknown[]).length - 1"
      />
      <div :style="{ marginLeft: indent }">
        <span class="jt-spacer" />
        <span class="jt-bracket">]<template v-if="!isLast">,</template></span>
      </div>
    </template>
  </div>
</template>
