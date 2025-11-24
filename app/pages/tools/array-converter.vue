<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <!-- 헤더 -->
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <NuxtLink to="/" class="hover:underline">Text Tools</NuxtLink>
            <span>/</span>
            <span>Array 변환기</span>
          </div>
          <h1 class="text-2xl font-bold">Array 변환기</h1>
          <p class="text-sm text-gray-500">
            JSON / XML / 줄바꿈·콤마 텍스트에서 원하는 필드만 뽑아서 다양한 배열 포맷으로 변환합니다.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            variant="soft"
            color="info"
            icon="i-heroicons-arrow-uturn-left"
            @click="router.push('/')"
          >
            목록으로
          </UButton>
        </div>
      </div>

      <!-- 본문: 2열 레이아웃 -->
      <div class="grid gap-4 md:grid-cols-2">
        <!-- 입력 영역 -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">입력</span>
              <UButton size="xs" variant="ghost" @click="input = ''">
                초기화
              </UButton>
            </div>
          </template>

          <div class="flex-1">
            <UTextarea
              v-model="input"
              :rows="16"
              class="font-mono text-xs"
              placeholder="JSON, XML, 또는 줄바꿈/콤마로 구분된 텍스트를 붙여넣으세요."
            />
          </div>

          <template #footer>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>길이: {{ input.length }} 자</span>
              <span>감지된 타입: {{ detectedTypeLabel }}</span>
            </div>
          </template>
        </UCard>

        <!-- 결과 + 옵션 영역 -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-medium">변환 결과</span>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <!-- ✅ 중복 제거 옵션 반영 후 개수 -->
                  <span>아이템: {{ finalItems.length }} 개</span>
                  <UButton
                    size="xs"
                    variant="soft"
                    icon="i-heroicons-clipboard"
                    :disabled="!formattedOutput"
                    @click="copyOutput"
                  >
                    복사
                  </UButton>
                </div>
              </div>

              <!-- JSON: 배열 키 선택 -->
              <div
                v-if="detectedType === 'json' && jsonKeyOptions.length"
                class="flex items-start gap-2 text-xs"
              >
                <span class="mt-1 text-gray-500 whitespace-nowrap">
                  JSON 배열 키:
                </span>
                <div class="flex flex-wrap gap-1">
                  <UButton
                    v-for="path in jsonKeyOptions"
                    :key="path || '_root'"
                    size="xs"
                    :variant="selectedJsonKey === path ? 'solid' : 'ghost'"
                    :color="selectedJsonKey === path ? 'primary' : 'neutral'"
                    @click="selectedJsonKey = path"
                  >
                    {{ path || "(root 배열)" }}
                  </UButton>
                </div>
              </div>

              <!-- JSON: object 리스트일 때 필드 선택 -->
              <div
                v-if="detectedType === 'json' && jsonFieldOptions.length"
                class="flex items-start gap-2 text-xs"
              >
                <span class="mt-1 text-gray-500 whitespace-nowrap">
                  JSON 필드:
                </span>
                <div class="flex flex-wrap gap-1">
                  <UButton
                    v-for="field in jsonFieldOptions"
                    :key="field"
                    size="xs"
                    :variant="selectedJsonField === field ? 'solid' : 'ghost'"
                    :color="selectedJsonField === field ? 'primary' : 'neutral'"
                    @click="selectedJsonField = field"
                  >
                    {{ field }}
                  </UButton>
                </div>
              </div>

              <!-- XML: 배열 태그 선택 -->
              <div
                v-if="detectedType === 'xml' && xmlKeyOptions.length"
                class="flex items-start gap-2 text-xs"
              >
                <span class="mt-1 text-gray-500 whitespace-nowrap">
                  XML 배열 태그:
                </span>
                <div class="flex flex-wrap gap-1">
                  <UButton
                    v-for="tag in xmlKeyOptions"
                    :key="tag"
                    size="xs"
                    :variant="selectedXmlKey === tag ? 'solid' : 'ghost'"
                    :color="selectedXmlKey === tag ? 'primary' : 'neutral'"
                    @click="selectedXmlKey = tag"
                  >
                    {{ tag }}
                  </UButton>
                </div>
              </div>

              <!-- XML: object 리스트일 때 필드(child 태그) 선택 -->
              <div
                v-if="detectedType === 'xml' && xmlFieldOptions.length"
                class="flex items-start gap-2 text-xs"
              >
                <span class="mt-1 text-gray-500 whitespace-nowrap">
                  XML 필드:
                </span>
                <div class="flex flex-wrap gap-1">
                  <UButton
                    v-for="field in xmlFieldOptions"
                    :key="field"
                    size="xs"
                    :variant="selectedXmlField === field ? 'solid' : 'ghost'"
                    :color="selectedXmlField === field ? 'primary' : 'neutral'"
                    @click="selectedXmlField = field"
                  >
                    {{ field }}
                  </UButton>
                </div>
              </div>
            </div>
          </template>

          <!-- 옵션 + 결과 -->
          <div class="space-y-4">
            <!-- 포맷 옵션 -->
            <div class="space-y-2 text-xs">
              <div class="flex flex-wrap gap-4">
                <!-- 1) 따옴표 -->
                <div class="space-y-1">
                  <div class="text-gray-500">문자 감싸기</div>
                  <div class="flex gap-1">
                    <UButton
                      size="xs"
                      :variant="quoteStyle === 'none' ? 'solid' : 'ghost'"
                      :color="quoteStyle === 'none' ? 'primary' : 'neutral'"
                      @click="quoteStyle = 'none'"
                    >
                      없음
                    </UButton>
                    <UButton
                      size="xs"
                      :variant="quoteStyle === 'single' ? 'solid' : 'ghost'"
                      :color="quoteStyle === 'single' ? 'primary' : 'neutral'"
                      @click="quoteStyle = 'single'"
                    >
                      '
                    </UButton>
                    <UButton
                      size="xs"
                      :variant="quoteStyle === 'double' ? 'solid' : 'ghost'"
                      :color="quoteStyle === 'double' ? 'primary' : 'neutral'"
                      @click="quoteStyle = 'double'"
                    >
                      "
                    </UButton>
                  </div>
                </div>

                <!-- 2) 구분자 -->
                <div class="space-y-1">
                  <div class="text-gray-500">구분자</div>
                  <div class="flex gap-1">
                    <UButton
                      size="xs"
                      :variant="separator === 'space' ? 'solid' : 'ghost'"
                      :color="separator === 'space' ? 'primary' : 'neutral'"
                      @click="separator = 'space'"
                    >
                      공백
                    </UButton>
                    <UButton
                      size="xs"
                      :variant="separator === 'comma' ? 'solid' : 'ghost'"
                      :color="separator === 'comma' ? 'primary' : 'neutral'"
                      @click="separator = 'comma'"
                    >
                      콤마
                    </UButton>
                    <UButton
                      size="xs"
                      :variant="separator === 'newline' ? 'solid' : 'ghost'"
                      :color="separator === 'newline' ? 'primary' : 'neutral'"
                      @click="separator = 'newline'"
                    >
                      엔터
                    </UButton>
                  </div>
                </div>

                <!-- 3) 양끝 괄호 -->
                <div class="space-y-1">
                  <div class="text-gray-500">양끝 감싸기</div>
                  <div class="flex gap-1">
                    <UButton
                      size="xs"
                      :variant="surround === 'none' ? 'solid' : 'ghost'"
                      :color="surround === 'none' ? 'primary' : 'neutral'"
                      @click="surround = 'none'"
                    >
                      없음
                    </UButton>
                    <UButton
                      size="xs"
                      :variant="surround === 'square' ? 'solid' : 'ghost'"
                      :color="surround === 'square' ? 'primary' : 'neutral'"
                      @click="surround = 'square'"
                    >
                      [ ]
                    </UButton>
                    <UButton
                      size="xs"
                      :variant="surround === 'paren' ? 'solid' : 'ghost'"
                      :color="surround === 'paren' ? 'primary' : 'neutral'"
                      @click="surround = 'paren'"
                    >
                      ( )
                    </UButton>
                  </div>
                </div>

                <!-- 4) 기타 옵션 (중복 제거) -->
                <div class="space-y-1">
                  <div class="text-gray-500">기타</div>
                  <div class="flex gap-1 items-center">
                    <UButton
                      size="xs"
                      :variant="uniqueOnly ? 'solid' : 'ghost'"
                      :color="uniqueOnly ? 'primary' : 'neutral'"
                      @click="uniqueOnly = !uniqueOnly"
                    >
                      중복 제거
                    </UButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- 결과 -->
            <div class="min-h-[200px]">
              <UTextarea
                v-model="formattedOutput"
                :rows="10"
                class="font-mono text-xs"
                readonly
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

// DOMParser 때문에 클라이언트 전용
definePageMeta({
  ssr: false,
});

const router = useRouter();

const input = ref<string>("");

type DetectedType = "empty" | "plain" | "json" | "xml";
const detectedType = ref<DetectedType>("empty");

/* ───────────── JSON 상태 ───────────── */

const jsonRoot = ref<any | null>(null);
// array인 키들의 path 목록 (예: "", "list", "data.items")
const jsonKeyOptions = ref<string[]>([]);
const selectedJsonKey = ref<string>("");

// 선택된 array가 object 리스트일 때 내부 필드 목록
const jsonFieldOptions = ref<string[]>([]);
const selectedJsonField = ref<string>("");

/* ───────────── XML 상태 ───────────── */

const xmlDoc = ref<Document | null>(null);
// array 역할 태그 목록
const xmlKeyOptions = ref<string[]>([]);
const selectedXmlKey = ref<string>("");

// 선택된 태그가 object 리스트일 때 child 태그 이름 목록
const xmlFieldOptions = ref<string[]>([]);
const selectedXmlField = ref<string>("");

/* ───────────── 출력 포맷 옵션 ───────────── */

const quoteStyle = ref<"none" | "single" | "double">("none");
const separator = ref<"space" | "comma" | "newline">("space");
const surround = ref<"none" | "square" | "paren">("none");
const uniqueOnly = ref(false); // 중복 제거 옵션

/* ───────────── Plain 텍스트 파싱 유틸 ───────────── */

// 따옴표 밖의 콤마가 있는지 체크
function hasCommaOutsideQuotes(line: string): boolean {
  let inSingle = false;
  let inDouble = false;
  for (const ch of line) {
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (ch === "," && !inSingle && !inDouble) {
      return true;
    }
  }
  return false;
}

// CSV 한 줄을 따옴표 인식하면서 분리
function csvSplit(line: string): string[] {
  const items: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      current += ch;
    } else if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      current += ch;
    } else if (ch === "," && !inSingle && !inDouble) {
      items.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim().length > 0) {
    items.push(current.trim());
  }
  return items;
}

// 앞뒤 따옴표 제거
function stripOuterQuotes(s: string): string {
  const trimmed = s.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

// Plain 텍스트 → 배열 (한 줄일 때 [] / () 감싸기 제거 포함)
function parsePlain(text: string): string[] {
  const raw = text.trim();
  if (!raw) return [];

  let cleaned = raw;
  // 한 줄 입력의 양끝 [] / () 제거
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  const lines = cleaned.split(/\r?\n/);

  // 1) 여러 줄이면: 엔터 우선
  if (lines.length > 1) {
    const result: string[] = [];
    for (const lineRaw of lines) {
      const line = lineRaw.trim();
      if (!line) continue;

      if (hasCommaOutsideQuotes(line)) {
        const parts = csvSplit(line);
        for (const p of parts) {
          const v = stripOuterQuotes(p);
          if (v) result.push(v);
        }
      } else {
        const v = stripOuterQuotes(line);
        if (v) result.push(v);
      }
    }
    return result;
  }

  // 2) 한 줄인 경우
  const line = cleaned;

  // 2-1) 따옴표 밖 콤마 → CSV 모드
  if (hasCommaOutsideQuotes(line)) {
    return csvSplit(line)
      .map(stripOuterQuotes)
      .filter((v) => v.length > 0);
  }

  // 2-2) 공백 구분 모드 (따옴표-aware)
  const tokens: string[] = [];
  const regex = /'([^']*)'|"([^"]*)"|(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const value = match[1] ?? match[2] ?? match[3];
    const v = value.trim();
    if (v) tokens.push(v);
  }

  return tokens;
}

/* ───────────── JSON 유틸 ───────────── */

// JSON 안에서 "array 인 키" 경로 전부 찾기
function findJsonArrayPaths(root: any): string[] {
  const result: string[] = [];

  function visit(node: any, path: string) {
    if (Array.isArray(node)) {
      result.push(path);
    }
    if (node && typeof node === "object" && !Array.isArray(node)) {
      for (const key of Object.keys(node)) {
        const child = (node as any)[key];
        const childPath = path ? `${path}.${key}` : key;
        visit(child, childPath);
      }
    }
  }

  visit(root, "");
  return result;
}

// "a.b.c" 같은 path로 JSON 내부 값 가져오기
function getByPath(root: any, path: string): any {
  if (!path) return root;
  const parts = path.split(".");
  let cur: any = root;
  for (const part of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

/* ───────────── XML 유틸 ───────────── */

function getElementChildren(node: Element): Element[] {
  return Array.from(node.children) as Element[];
}

/* ───────────── 입력 분석 (타입 감지 + JSON/XML 파싱) ───────────── */

function analyzeInput() {
  const text = input.value ?? "";
  const trimmed = text.trim();

  jsonRoot.value = null;
  jsonKeyOptions.value = [];
  selectedJsonKey.value = "";
  jsonFieldOptions.value = [];
  selectedJsonField.value = "";

  xmlDoc.value = null;
  xmlKeyOptions.value = [];
  selectedXmlKey.value = "";
  xmlFieldOptions.value = [];
  selectedXmlField.value = "";

  if (!trimmed) {
    detectedType.value = "empty";
    return;
  }

  // 1) JSON 시도
  try {
    const parsed = JSON.parse(trimmed);
    jsonRoot.value = parsed;
    detectedType.value = "json";

    const paths = findJsonArrayPaths(parsed);
    if (paths.length > 0) {
      jsonKeyOptions.value = paths;
      selectedJsonKey.value = paths[0];
    } else if (Array.isArray(parsed)) {
      jsonKeyOptions.value = [""];
      selectedJsonKey.value = "";
    } else {
      jsonKeyOptions.value = [];
      selectedJsonKey.value = "";
    }

    return;
  } catch {
    // JSON 아님 → 계속
  }

  // 2) XML 시도
  if (trimmed.startsWith("<")) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, "text/xml");
      const parserError = doc.getElementsByTagName("parsererror")[0];
      if (!parserError) {
        xmlDoc.value = doc;
        detectedType.value = "xml";

        const counts = new Map<string, number>();
        const all = doc.getElementsByTagName("*");
        for (let i = 0; i < all.length; i++) {
          const tag = all[i].tagName;
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
        xmlKeyOptions.value = Array.from(counts.keys());
        selectedXmlKey.value = xmlKeyOptions.value[0] || "";

        return;
      }
    } catch {
      // XML 실패 → plain
    }
  }

  // 3) 그 외는 Plain
  detectedType.value = "plain";
}

/* ───────────── JSON: object 리스트일 때 필드 목록 계산 ───────────── */

watch(
  [jsonRoot, selectedJsonKey],
  () => {
    jsonFieldOptions.value = [];
    selectedJsonField.value = "";

    const root = jsonRoot.value;
    if (!root) return;

    const arr = getByPath(root, selectedJsonKey.value);
    if (!Array.isArray(arr) || !arr.length) return;

    const hasObject = arr.some(
      (v) => v && typeof v === "object" && !Array.isArray(v)
    );
    if (!hasObject) return;

    const keysSet = new Set<string>();
    for (const v of arr) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        Object.keys(v).forEach((k) => keysSet.add(k));
      }
    }

    const keys = Array.from(keysSet);
    jsonFieldOptions.value = keys;
    selectedJsonField.value = keys[0] || "";
  },
  { immediate: true }
);

/* ───────────── XML: object 리스트일 때 필드(child 태그) 목록 계산 ───────────── */

watch(
  [xmlDoc, selectedXmlKey],
  () => {
    xmlFieldOptions.value = [];
    selectedXmlField.value = "";

    const doc = xmlDoc.value;
    const tag = selectedXmlKey.value;
    if (!doc || !tag) return;

    const nodes = Array.from(doc.getElementsByTagName(tag));
    if (!nodes.length) return;

    const hasChildElements = nodes.some(
      (n) => getElementChildren(n).length > 0
    );
    if (!hasChildElements) return;

    const set = new Set<string>();
    nodes.forEach((n) => {
      getElementChildren(n).forEach((child) => set.add(child.tagName));
    });

    const keys = Array.from(set);
    xmlFieldOptions.value = keys;
    selectedXmlField.value = keys[0] || "";
  },
  { immediate: true }
);

/* ───────────── 기본 아이템 (포맷 적용 전 배열) ───────────── */

const baseItems = computed<string[]>(() => {
  const type = detectedType.value;
  const text = input.value ?? "";
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Plain
  if (type === "plain" || type === "empty") {
    return parsePlain(text);
  }

  // JSON
  if (type === "json" && jsonRoot.value != null) {
    const root = jsonRoot.value;
    const arr = getByPath(root, selectedJsonKey.value);
    if (!Array.isArray(arr) || !arr.length) return [];

    const first = arr[0];

    // object 리스트인 경우: 선택한 필드 기준
    if (first && typeof first === "object" && !Array.isArray(first)) {
      if (!selectedJsonField.value) return [];
      const key = selectedJsonField.value;
      return arr
        .map((row: any) =>
          row && row[key] != null ? String(row[key]) : ""
        )
        .filter((v: string) => v !== "");
    }

    // 기본 타입 리스트
    return arr.map((v: any) => String(v));
  }

  // XML
  if (type === "xml" && xmlDoc.value) {
    const doc = xmlDoc.value;
    const tag = selectedXmlKey.value;
    if (!tag) return [];

    const nodes = Array.from(doc.getElementsByTagName(tag));
    if (!nodes.length) return [];

    // object 리스트 + 필드 선택
    if (xmlFieldOptions.value.length && selectedXmlField.value) {
      const fieldTag = selectedXmlField.value;
      return nodes
        .map((n) => {
          const child = n.getElementsByTagName(fieldTag)[0];
          const text = child ? (child.textContent || "").trim() : "";
          return text;
        })
        .filter((v) => v.length > 0);
    }

    // 단순 텍스트 리스트
    return nodes
      .map((n) => (n.textContent || "").trim())
      .filter((v) => v.length > 0);
  }

  return [];
});

/* ───────────── 중복 제거까지 반영된 최종 아이템 ───────────── */

const finalItems = computed<string[]>(() => {
  let items = baseItems.value;
  if (!items.length) return [];

  if (uniqueOnly.value) {
    const seen = new Set<string>();
    items = items.filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
  }

  return items;
});

/* ───────────── 포맷 적용 (따옴표 / 구분자 / 괄호) ───────────── */

const formattedOutput = computed(() => {
  const items = finalItems.value;
  if (!items.length) return "";

  const wrapped = items.map((item) => {
    if (quoteStyle.value === "single") {
      return `'${item.replace(/'/g, "\\'")}'`;
    }
    if (quoteStyle.value === "double") {
      return `"${item.replace(/"/g, '\\"')}"`;
    }
    return item;
  });

  let sep = " ";
  if (separator.value === "comma") sep = ", ";
  if (separator.value === "newline") sep = "\n";

  let body = wrapped.join(sep);

  if (surround.value === "square") {
    body = `[${body}]`;
  } else if (surround.value === "paren") {
    body = `(${body})`;
  }

  return body;
});

const detectedTypeLabel = computed(() => {
  switch (detectedType.value) {
    case "json":
      return "JSON";
    case "xml":
      return "XML";
    case "plain":
      return "Plain 텍스트";
    case "empty":
      return "없음";
  }
});

async function copyOutput() {
  if (!formattedOutput.value) return;
  try {
    await navigator.clipboard.writeText(formattedOutput.value);
    alert("복사되었습니다.");
  } catch {
    alert("클립보드 복사에 실패했습니다.");
  }
}

/* ───────────── 입력 변경 시 타입 분석 ───────────── */

watch(
  () => input.value,
  () => {
    analyzeInput();
  },
  { immediate: true }
);

useHead({
  title: "Array 변환기 - Text Tools",
});
</script>
