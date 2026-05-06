# Text Tools

개발자가 자주 쓰는 텍스트 변환·가공 도구를 한 곳에 모은 Nuxt 4 SPA. Neo-Swiss 테마(라이트/다크 토글, 액센트 커스터마이징, 밀도 조절)에 100% 클라이언트 사이드 동작.

## 도구 목록

| #  | 도구                  | 경로                    |
|----|-----------------------|-------------------------|
| 01 | JSON 뷰어             | `/json-viewer`          |
| 02 | Array 변환기          | `/array-converter`      |
| 03 | 리스트 비교            | `/list-compare`         |
| 04 | Base64 / URL 인코더    | `/codec`                |
| 05 | JWT 디코더            | `/jwt-decoder`          |
| 06 | JSON / XML / YAML 변환 | `/format-converter`     |
| 07 | 해시 생성기 (MD5/SHA) | `/hash`                 |
| 08 | HTML 텍스트 추출기     | `/html-to-text`         |
| 09 | 숫자 통계 분석기       | `/number-analyzer`      |
| 10 | 세계 시간 변환기       | `/time-converter`       |

## 기술 스택

- **Nuxt 4** + Vue 3 (`<script setup>`, Composition API)
- **TypeScript**
- **CSS 변수 기반 Neo-Swiss 테마** — Tailwind나 컴포넌트 라이브러리 없이 순수 CSS
- **Geist** + **JetBrains Mono** + **Pretendard**
- 정적 사이트 생성 (`nitro: { preset: 'static' }`)

## 개발

의존성 설치:

```bash
pnpm install
```

개발 서버 (`http://localhost:3000`):

```bash
pnpm dev
```

## 빌드

```bash
pnpm build      # → .output/public 에 정적 사이트 생성
pnpm preview    # 빌드 결과 미리보기
```

## 테스트

### 단위 테스트 (Vitest, 71개)

```bash
pnpm test         # 1회 실행
pnpm test:watch   # 와치 모드
```

`tests/` 디렉토리:

- `parse.test.ts` — `parsePlain`, `findJsonArrayPaths`, `getByPath`
- `codec.test.ts` — Base64 / URL / JWT 디코더 (정상 + 깨진 입력 케이스)
- `json.test.ts` — `safeParseJson` (trailing comma, unquoted keys 등 11가지 malformed 케이스)
- `tools.test.ts` — 툴 레지스트리 무결성
- `components.test.ts` — `ChipGroup`, `SegGroup`, `JsonTreeView`

### E2E 테스트 (Playwright, 34개)

```bash
pnpm test:e2e        # 빌드 + 실행
pnpm test:e2e:ui     # Playwright UI 모드
```

`e2e/` 디렉토리:

- `home.spec.ts` — 히어로/터미널 패널/툴 카드 10개 렌더
- `navigation.spec.ts` — 탭바, 카드 클릭, breadcrumb, 목록으로 버튼
- `theme-and-tweaks.spec.ts` — 다크모드 토글, Tweaks 패널, 액센트 변경
- `json-viewer.spec.ts` — 파싱 + 7가지 malformed 입력 + Width 토글 + 반영구화
- `jwt-decoder.spec.ts` — 정상 토큰 / 단일 세그먼트 / 깨진 헤더·페이로드 / 인용 처리
- `codec.spec.ts` — Base64 / URL 인코딩·디코딩 정상 + 오류 케이스

E2E는 `.output/public`을 `serve`로 서빙하기 때문에 실제 정적 빌드 산출물을 검증합니다.

첫 실행 시 Playwright 브라우저를 받아야 합니다:

```bash
pnpm exec playwright install chromium
```

## 디렉토리 구조

```
app/
├── app.vue                # 셸 (헤더 + 탭바 + Footer + Tweaks + Toast)
├── assets/css/main.css    # Neo-Swiss 테마 토큰 + 컴포넌트 클래스
├── components/            # AppHeader, PageHeader, JsonTreeView, ChipGroup ...
├── composables/
│   ├── useTweaks.ts       # 테마/밀도/액센트/너비 모드 + localStorage
│   └── useToast.ts        # 토스트 + 클립보드 헬퍼
├── pages/                 # 10 도구 페이지 + index
└── utils/
    ├── tools.ts           # 툴 레지스트리
    ├── parse.ts           # CSV/JSON/XML 공용 파서
    ├── codec.ts           # Base64 / URL / JWT 디코더
    └── json.ts            # safeParseJson
```

## 라이선스

MIT
