import * as VueRuntime from 'vue'

const G = globalThis as unknown as Record<string, unknown>
for (const [k, v] of Object.entries(VueRuntime)) {
  if (G[k] === undefined) G[k] = v
}
