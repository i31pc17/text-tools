<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({
  ssr: false
})

const input = ref('')
const currentTime = ref(new Date())
let timer: any = null

function parseDate(val: string): Date | null {
  const trimmed = val.trim()
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed)
    return new Date(num < 10000000000 ? num * 1000 : num)
  }
  let dateStr = trimmed.replace(/\s+/g, 'T')
  if (!/[Z+-]/.test(dateStr)) {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr)) {
      dateStr += "+09:00"
    }
  }
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const targetDate = computed(() => {
  if (!input.value.trim()) return currentTime.value
  return parseDate(input.value)
})

const commonUnixTime = computed(() => {
  return targetDate.value ? Math.floor(targetDate.value.getTime() / 1000) : 0
})

const timeZones = [
  { name: '대한민국', zone: 'Asia/Seoul', city: '서울' },
  { name: '일본', zone: 'Asia/Tokyo', city: '도쿄' },
  { name: '중국', zone: 'Asia/Shanghai', city: '베이징' },
  { name: '베트남', zone: 'Asia/Ho_Chi_Minh', city: '호치민' },
  { name: '인도', zone: 'Asia/Kolkata', city: '뉴델리' },
  { name: '영국', zone: 'Europe/London', city: '런던' },
  { name: '독일', zone: 'Europe/Berlin', city: '베를린' },
  { name: '미국 (동부)', zone: 'America/New_York', city: '뉴욕 (EST)' },
  { name: '미국 (서부)', zone: 'America/Los_Angeles', city: 'LA (PST)' },
  { name: '호주', zone: 'Australia/Sydney', city: '시드니' },
  { name: '브라질', zone: 'America/Sao_Paulo', city: '상파울루' },
]

function getZoneInfo(date: Date, zone: string) {
  try {
    const formatter = new Intl.DateTimeFormat('ko-KR', {
      timeZone: zone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(date)
    const p: Record<string, string> = {}
    parts.forEach(part => { p[part.type] = part.value })
    const dateStr = `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`

    // GMT 오프셋(차이) 계산
    const parts_offset = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'shortOffset' // "GMT+9" 형식으로 가져옴
    }).formatToParts(date)
    const offset = parts_offset.find(p => p.type === 'timeZoneName')?.value || ''

    // 시간대 약어 (KST, EST 등)
    const parts_abbr = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'short'
    }).formatToParts(date)
    const abbr = parts_abbr.find(p => p.type === 'timeZoneName')?.value || ''

    return { dateStr, offset, abbr }
  } catch {
    return { dateStr: 'Error', offset: 'N/A', abbr: 'N/A' }
  }
}

const results = computed(() => {
  const d = targetDate.value
  if (!d) return []
  return timeZones.map(tz => ({ ...tz, ...getZoneInfo(d, tz.zone) }))
})

async function copyText(text: string, msg: string) {
  await navigator.clipboard.writeText(text)
  alert(`${msg} 복사 완료!`)
}
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <PageHeader title="세계 시간 변환기" description="표준 시간(GMT)을 기준으로 각 국가별 시각을 계산합니다." />

      <div class="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div class="space-y-4">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold">시간 입력</span>
                <UButton size="xs" variant="ghost" @click="input = ''">현재 시각</UButton>
              </div>
            </template>

            <div class="space-y-5">
              <UInput v-model="input" placeholder="2024-05-20 14:30:00" icon="i-heroicons-clock" size="lg" />

              <div class="p-4 bg-slate-900 rounded-lg">
                <div class="text-[10px] text-slate-500 font-bold mb-1">UNIX TIMESTAMP (공통)</div>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-mono font-bold text-green-400">{{ commonUnixTime }}</span>
                  <UButton size="xs" color="neutral" variant="soft" @click="copyText(commonUnixTime.toString(), '유닉스 타임')">복사</UButton>
                </div>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-[11px] text-blue-700 dark:text-blue-300">
                <p>💡 <b>도움말:</b></p>
                <p>• <b>GMT+9:</b> 기준보다 9시간 빠름 (한국)</p>
                <p>• <b>GMT-5:</b> 기준보다 5시간 느림 (미국 동부)</p>
              </div>
            </div>
          </UCard>
        </div>

        <UCard overflow-hidden>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th class="px-4 py-3 font-semibold">국가/도시</th>
                <th class="px-4 py-3 font-semibold">현재 시각 (Y-m-d H:i:s)</th>
                <th class="px-4 py-3 font-semibold">표준시 대비 (GMT)</th>
                <th class="px-4 py-3 font-semibold text-center">복사</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="res in results" :key="res.zone" :class="{'bg-primary-50/30 dark:bg-primary-900/10': res.zone === 'Asia/Seoul'}">
                <td class="px-4 py-4">
                  <div class="font-bold text-sm">{{ res.name }}</div>
                  <div class="text-[10px] text-gray-500">{{ res.city }}</div>
                </td>
                <td class="px-4 py-4 font-mono text-sm">
                  {{ res.dateStr }}
                </td>
                <td class="px-4 py-4">
                  <div class="flex flex-col gap-1">
                    <UBadge size="xs" variant="subtle" color="primary" class="w-fit font-mono">{{ res.offset }}</UBadge>
                    <span class="text-[10px] text-gray-400">{{ res.abbr }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 text-center">
                  <UButton size="xs" color="neutral" variant="ghost" icon="i-heroicons-clipboard" @click="copyText(res.dateStr, res.name)" />
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
