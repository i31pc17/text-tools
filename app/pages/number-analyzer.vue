<script setup lang="ts">
import { ref, computed, watch } from "vue";

definePageMeta({
  ssr: false,
});

const input = ref<string>("");

type DetectedType = "empty" | "plain" | "json" | "xml";
const detectedType = ref<DetectedType>("empty");

/* ───────────── 데이터 상태 ───────────── */
// JSON 데이터는 구조를 알 수 없으므로 record 혹은 unknown으로 처리
const jsonRoot = ref<unknown>(null);
const jsonKeyOptions = ref<string[]>([]);
const selectedJsonKey = ref<string>("");
const jsonFieldOptions = ref<string[]>([]);
const selectedJsonField = ref<string>("");

const xmlDoc = ref<Document | null>(null);
const xmlKeyOptions = ref<string[]>([]);
const selectedXmlKey = ref<string>("");
const xmlFieldOptions = ref<string[]>([]);
const selectedXmlField = ref<string>("");

/* ───────────── 타입 가드 및 유틸 ───────────── */
function isObject(val: unknown): val is Record<string, any> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function getByPath(root: unknown, path: string): unknown {
  if (!path) return root;
  const parts = path.split(".");
  let current: any = root;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

/* ───────────── 파싱 로직 ───────────── */
function hasCommaOutsideQuotes(line: string): boolean {
  let inSingle = false, inDouble = false;
  for (const ch of line) {
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "," && !inSingle && !inDouble) return true;
  }
  return false;
}

function csvSplit(line: string): string[] {
  const items: string[] = [];
  let current = "", inSingle = false, inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; }
    else if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; }
    else if (ch === "," && !inSingle && !inDouble) { items.push(current.trim()); current = ""; }
    else current += ch;
  }
  if (current.trim().length > 0) items.push(current.trim());
  return items;
}

function stripOuterQuotes(s: string): string {
  const trimmed = s.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parsePlain(text: string): string[] {
  const raw = text.trim();
  if (!raw) return [];
  let cleaned = raw;
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) cleaned = cleaned.slice(1, -1).trim();

  const lines = cleaned.split(/\r?\n/);
  if (lines.length > 1) {
    const result: string[] = [];
    for (const lineRaw of lines) {
      const line = lineRaw.trim();
      if (!line) continue;
      if (hasCommaOutsideQuotes(line)) {
        csvSplit(line).forEach(p => { const v = stripOuterQuotes(p); if (v) result.push(v); });
      } else {
        const v = stripOuterQuotes(line); if (v) result.push(v);
      }
    }
    return result;
  }
  if (hasCommaOutsideQuotes(cleaned)) return csvSplit(cleaned).map(stripOuterQuotes).filter(v => v.length > 0);
  return cleaned.split(/\s+/).filter(v => v.length > 0);
}

function findJsonArrayPaths(root: unknown): string[] {
  const result: string[] = [];
  function visit(node: unknown, path: string) {
    if (Array.isArray(node)) {
      result.push(path);
      // 배열 내부의 첫 번째 객체만 탐색해서 중첩 배열 찾기 (성능 및 복잡도 제한)
      if (node.length > 0) visit(node[0], path);
    } else if (isObject(node)) {
      Object.keys(node).forEach(key => visit(node[key], path ? `${path}.${key}` : key));
    }
  }
  visit(root, "");
  return result;
}

/* ───────────── 분석 실행 ───────────── */
function analyzeInput() {
  const trimmed = (input.value ?? "").trim();
  jsonRoot.value = null; xmlDoc.value = null;
  if (!trimmed) { detectedType.value = "empty"; return; }

  try {
    const parsed = JSON.parse(trimmed);
    jsonRoot.value = parsed;
    detectedType.value = "json";
    const paths = findJsonArrayPaths(parsed);
    jsonKeyOptions.value = paths.length ? paths : (Array.isArray(parsed) ? [""] : []);
    selectedJsonKey.value = jsonKeyOptions.value[0] || "";
    return;
  } catch { /* Fail silently */ }

  if (trimmed.startsWith("<")) {
    try {
      const doc = new DOMParser().parseFromString(trimmed, "text/xml");
      if (!doc.getElementsByTagName("parsererror").length) {
        xmlDoc.value = doc;
        detectedType.value = "xml";
        const tags = new Set<string>();
        const allElements = doc.getElementsByTagName("*");
        for (let i = 0; i < allElements.length; i++) {
          tags.add(allElements[i]!.tagName);
        }
        xmlKeyOptions.value = Array.from(tags);
        selectedXmlKey.value = xmlKeyOptions.value[0] || "";
        return;
      }
    } catch { /* Fail silently */ }
  }
  detectedType.value = "plain";
}

watch(() => input.value, analyzeInput, { immediate: true });

/* ───────────── 필드 매칭 ───────────── */
watch([jsonRoot, selectedJsonKey], () => {
  const arr = getByPath(jsonRoot.value, selectedJsonKey.value);
  if (Array.isArray(arr) && arr.length > 0) {
    const firstItem = arr[0];
    if (isObject(firstItem)) {
      const keys = new Set<string>();
      arr.forEach(v => { if (isObject(v)) Object.keys(v).forEach(k => keys.add(k)); });
      jsonFieldOptions.value = Array.from(keys);
      selectedJsonField.value = jsonFieldOptions.value[0] || "";
      return;
    }
  }
  jsonFieldOptions.value = [];
  selectedJsonField.value = "";
});

watch([xmlDoc, selectedXmlKey], () => {
  if (!xmlDoc.value || !selectedXmlKey.value) return;
  const nodes = Array.from(xmlDoc.value.getElementsByTagName(selectedXmlKey.value));
  const tags = new Set<string>();
  nodes.forEach(n => {
    Array.from(n.children).forEach(c => tags.add(c.tagName));
  });
  xmlFieldOptions.value = Array.from(tags);
  selectedXmlField.value = xmlFieldOptions.value[0] || "";
});

/* ───────────── 숫자 추출 및 통계 ───────────── */
const numberItems = computed<number[]>(() => {
  let raw: string[] = [];
  const type = detectedType.value;

  if (type === "plain") {
    raw = parsePlain(input.value);
  } else if (type === "json") {
    const arr = getByPath(jsonRoot.value, selectedJsonKey.value);
    if (Array.isArray(arr)) {
      raw = arr.map(v => {
        if (selectedJsonField.value && isObject(v)) return String(v[selectedJsonField.value]);
        return String(v);
      });
    }
  } else if (type === "xml" && xmlDoc.value) {
    const nodes = Array.from(xmlDoc.value.getElementsByTagName(selectedXmlKey.value));
    raw = nodes.map(n => {
      if (selectedXmlField.value) {
        const child = n.getElementsByTagName(selectedXmlField.value)[0];
        return child ? child.textContent || "" : "";
      }
      return n.textContent || "";
    });
  }

  return raw
    .map(v => v.replace(/,/g, '').trim())
    .filter(v => v !== "" && !isNaN(Number(v)))
    .map(Number);
});

interface Statistics {
  count: number; sum: number; avg: number; median: number; mode: string; min: number; max: number;
}

const stats = computed<Statistics | null>(() => {
  const data = [...numberItems.value].sort((a, b) => a - b);
  if (data.length === 0) return null;

  const sum = data.reduce((a, b) => a + b, 0);

  // 배열이 비어있지 않음을 확인했으므로 ! 연산자를 사용해 경고를 제거합니다.
  const min = data[0]!;
  const max = data[data.length - 1]!;
  const avg = sum / data.length;

  const mid = Math.floor(data.length / 2);
  let median = 0;

  if (data.length % 2 !== 0) {
    // 홀수 개인 경우
    median = data[mid]!;
  } else {
    // 짝수 개인 경우 (가운데 두 값의 평균)
    const val1 = data[mid - 1]!;
    const val2 = data[mid]!;
    median = (val1 + val2) / 2;
  }

  const counts = new Map<number, number>();
  let maxFreq = 0;
  data.forEach(v => {
    const c = (counts.get(v) || 0) + 1;
    counts.set(v, c);
    if (c > maxFreq) maxFreq = c;
  });

  const modes = Array.from(counts.entries())
    .filter(([_, c]) => c === maxFreq)
    .map(([v]) => v);

  const modeStr = (maxFreq === 1 && data.length > 1) ? "없음" : modes.join(", ");

  return { count: data.length, sum, avg, median, mode: modeStr, min, max };
});

const format = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 });
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <PageHeader />

      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-4">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold">데이터 소스</span>
                <UButton size="xs" variant="ghost" color="neutral" @click="input = ''">비우기</UButton>
              </div>
            </template>
            <UTextarea v-model="input" :rows="16" class="font-mono text-xs w-full" placeholder="여기에 JSON, XML 또는 텍스트 숫자를 입력하세요." />
          </UCard>

          <UCard v-if="detectedType === 'json' || detectedType === 'xml'">
            <template #header><span class="text-sm font-bold">추출 옵션</span></template>
            <div class="space-y-4">
              <template v-if="detectedType === 'json'">
                <div v-if="jsonKeyOptions.length" class="space-y-1">
                  <div class="text-[10px] text-gray-400 uppercase">배열 키 (Path)</div>
                  <div class="flex flex-wrap gap-1">
                    <UButton v-for="p in jsonKeyOptions" :key="p" size="xs" :variant="selectedJsonKey === p ? 'solid' : 'soft'" @click="selectedJsonKey = p">{{ p || '(root)' }}</UButton>
                  </div>
                </div>
                <div v-if="jsonFieldOptions.length" class="space-y-1">
                  <div class="text-[10px] text-gray-400 uppercase">숫자 필드 명</div>
                  <div class="flex flex-wrap gap-1">
                    <UButton v-for="f in jsonFieldOptions" :key="f" size="xs" :variant="selectedJsonField === f ? 'solid' : 'soft'" color="primary" @click="selectedJsonField = f">{{ f }}</UButton>
                  </div>
                </div>
              </template>

              <template v-if="detectedType === 'xml'">
                <div v-if="xmlKeyOptions.length" class="space-y-1">
                  <div class="text-[10px] text-gray-400 uppercase">태그 (Tag)</div>
                  <div class="flex flex-wrap gap-1">
                    <UButton v-for="t in xmlKeyOptions" :key="t" size="xs" :variant="selectedXmlKey === t ? 'solid' : 'soft'" @click="selectedXmlKey = t">{{ t }}</UButton>
                  </div>
                </div>
                <div v-if="xmlFieldOptions.length" class="space-y-1">
                  <div class="text-[10px] text-gray-400 uppercase">숫자 필드 (Child Tag)</div>
                  <div class="flex flex-wrap gap-1">
                    <UButton v-for="f in xmlFieldOptions" :key="f" size="xs" :variant="selectedXmlField === f ? 'solid' : 'soft'" color="primary" @click="selectedXmlField = f">{{ f }}</UButton>
                  </div>
                </div>
              </template>
            </div>
          </UCard>
        </div>

        <div class="space-y-4">
          <div v-if="stats" class="grid grid-cols-2 gap-3">
            <UCard class="col-span-1">
              <div class="text-[10px] text-gray-500 font-bold uppercase">합계</div>
              <div class="text-xl font-mono font-bold text-primary">{{ format(stats.sum) }}</div>
            </UCard>
            <UCard class="col-span-1">
              <div class="text-[10px] text-gray-500 font-bold uppercase">평균</div>
              <div class="text-xl font-mono font-bold text-primary">{{ format(stats.avg) }}</div>
            </UCard>
            <UCard class="col-span-1">
              <div class="text-[10px] text-gray-500 font-bold uppercase">중앙값</div>
              <div class="text-md font-mono">{{ format(stats.median) }}</div>
            </UCard>
            <UCard class="col-span-1">
              <div class="text-[10px] text-gray-500 font-bold uppercase">최빈값</div>
              <div class="text-md font-mono truncate" :title="stats.mode">{{ stats.mode }}</div>
            </UCard>
            <UCard class="col-span-1">
              <div class="text-[10px] text-blue-500 font-bold uppercase">최소값</div>
              <div class="text-md font-mono">{{ format(stats.min) }}</div>
            </UCard>
            <UCard class="col-span-1">
              <div class="text-[10px] text-red-500 font-bold uppercase">최대값</div>
              <div class="text-md font-mono">{{ format(stats.max) }}</div>
            </UCard>
          </div>

          <UCard v-if="numberItems.length">
            <template #header><span class="text-xs font-bold text-gray-400">추출된 데이터 ({{ numberItems.length }}개)</span></template>
            <div class="max-h-48 overflow-y-auto font-mono text-[11px] p-3 bg-slate-900 text-slate-300 rounded leading-relaxed">
              {{ numberItems.join(', ') }}
            </div>
          </UCard>

          <UAlert v-if="input && !numberItems.length" color="red" variant="soft" icon="i-heroicons-information-circle" title="숫자 감지 실패" description="선택한 조건으로 추출된 유효한 숫자가 없습니다." />
        </div>
      </div>
    </div>
  </UContainer>
</template>
