<script setup lang="ts">
import { useCopy } from '~/composables/useToast'
import { parseDate } from '~/utils/codec'

definePageMeta({ ssr: false })

interface Zone { name: string; zone: string; city: string }

const TIME_ZONES: Zone[] = [
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
  { name: '브라질', zone: 'America/Sao_Paulo', city: '상파울루' }
]

function getZoneInfo(date: Date, zone: string) {
  try {
    const f = new Intl.DateTimeFormat('ko-KR', {
      timeZone: zone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    })
    const p: Record<string, string> = {}
    f.formatToParts(date).forEach((x) => { if (x.type !== 'literal') p[x.type] = x.value })
    const dateStr = `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`
    const off = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' }).formatToParts(date).find((x) => x.type === 'timeZoneName')?.value || ''
    const abbr = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).formatToParts(date).find((x) => x.type === 'timeZoneName')?.value || ''
    return { dateStr, offset: off, abbr }
  } catch {
    return { dateStr: 'Error', offset: 'N/A', abbr: 'N/A' }
  }
}

const input = ref('')
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => { if (timer) clearInterval(timer) })

const target = computed<Date | null>(() => input.value.trim() ? parseDate(input.value) : now.value)
const unix = computed(() => target.value ? Math.floor(target.value.getTime() / 1000) : 0)

const results = computed(() => target.value
  ? TIME_ZONES.map((tz) => ({ ...tz, ...getZoneInfo(target.value!, tz.zone) }))
  : []
)

const copy = useCopy()
</script>

<template>
  <div>
    <PageHeader />

    <div class="split-2-balanced" style="grid-template-columns: 380px 1fr">
      <div class="col" style="gap: var(--pad-lg)">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">시간 입력</h2>
            <BaseButton size="xs" variant="ghost" @click="input = ''">현재 시각</BaseButton>
          </div>
          <div class="card-body col" style="gap: var(--pad-md)">
            <input v-model="input" class="input" placeholder="2024-05-20 14:30:00 또는 unix">
            <div class="unix-readout">
              <div>
                <div class="unix-label">UNIX TIMESTAMP</div>
                <div class="unix-value">{{ unix }}</div>
              </div>
              <button class="btn unix-copy" data-size="xs" @click="copy(String(unix), 'Unix 복사')">
                <IconSvg name="copy" /> 복사
              </button>
            </div>
            <div style="padding: var(--pad-md); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-2)">
              <div class="label" style="margin-bottom: 8px">도움말</div>
              <div class="hint" style="line-height: 1.7">
                <div>• <strong style="color: var(--text)">GMT+9</strong> — 기준보다 9시간 빠름 (한국)</div>
                <div>• <strong style="color: var(--text)">GMT-5</strong> — 기준보다 5시간 느림 (미국 동부)</div>
                <div>• 빈 칸 = 현재 시각</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <table class="tbl">
          <thead>
            <tr>
              <th>국가/도시</th>
              <th>현재 시각</th>
              <th>표준시 대비 (GMT)</th>
              <th style="text-align: center">복사</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in results" :key="r.zone" :data-highlight="r.zone === 'Asia/Seoul'">
              <td>
                <div style="font-weight: 500">{{ r.name }}</div>
                <div class="hint">{{ r.city }}</div>
              </td>
              <td style="font-family: var(--font-mono)">{{ r.dateStr }}</td>
              <td>
                <div class="col-tight">
                  <span class="badge" data-tone="accent">{{ r.offset }}</span>
                  <span class="hint">{{ r.abbr }}</span>
                </div>
              </td>
              <td style="text-align: center">
                <BaseButton size="xs" variant="ghost" icon="copy" @click="copy(r.dateStr, r.name)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
