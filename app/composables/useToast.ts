const message = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function show(msg: string) {
    if (timer) clearTimeout(timer)
    message.value = null
    nextTick(() => {
      message.value = msg
      timer = setTimeout(() => { message.value = null }, 1800)
    })
  }
  return { message, show }
}

export function useCopy() {
  const { show } = useToast()
  return async function copy(text: string, label = '복사 완료') {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      show(`✓ ${label}`)
    } catch {
      show('✗ 복사 실패')
    }
  }
}
