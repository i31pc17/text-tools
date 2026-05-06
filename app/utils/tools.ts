export interface TextTool {
  page: string
  code: string
  name: string
  description: string
  tag: string
}

export const textTools: TextTool[] = [
  {
    page: 'json-viewer',
    code: '01',
    name: 'JSON 뷰어',
    description: 'JSON을 트리 형태로 보고, 타입과 인덱스를 함께 표시합니다.',
    tag: 'view'
  },
  {
    page: 'array-converter',
    code: '02',
    name: 'Array 변환기',
    description: 'JSON / XML / 줄바꿈·콤마 텍스트에서 원하는 필드만 뽑아서 다양한 배열 포맷으로 변환합니다.',
    tag: 'convert'
  },
  {
    page: 'list-compare',
    code: '03',
    name: '리스트 비교',
    description: '엔터(줄바꿈)로 구분된 두 개의 리스트를 비교해서 합집합, 교집합, 차집합, 대칭차집합을 한 번에 확인하고 복사할 수 있습니다.',
    tag: 'diff'
  },
  {
    page: 'codec',
    code: '04',
    name: 'Base64 & URL 인코더/디코더',
    description: 'UTF-8 텍스트를 Base64·URL 인코딩하거나 거꾸로 디코딩합니다.',
    tag: 'encode'
  },
  {
    page: 'jwt-decoder',
    code: '05',
    name: 'JWT 디코더',
    description: 'JWT 토큰의 Header와 Payload를 디코딩하여 트리뷰로 보여줍니다.',
    tag: 'decode'
  },
  {
    page: 'format-converter',
    code: '06',
    name: 'JSON / XML / YAML 변환기',
    description: '세 포맷을 자동 감지해서 서로 변환합니다. JSON5 입력도 지원.',
    tag: 'convert'
  },
  {
    page: 'hash',
    code: '07',
    name: '해시 생성기',
    description: 'MD5, SHA-256, SHA-512 해시를 한 번에 계산합니다.',
    tag: 'crypto'
  },
  {
    page: 'html-to-text',
    code: '08',
    name: 'HTML 텍스트 추출기',
    description: 'HTML 소스에서 보이는 텍스트만 추출하고, 특정 클래스나 숨김 요소는 제외합니다.',
    tag: 'extract'
  },
  {
    page: 'number-analyzer',
    code: '09',
    name: '숫자 통계 분석기',
    description: 'JSON, XML, 텍스트에서 숫자를 추출하여 합계, 평균, 중앙값, 최빈값 등을 계산합니다.',
    tag: 'stats'
  },
  {
    page: 'time-converter',
    code: '10',
    name: '세계 시간 변환기',
    description: '날짜 문자열이나 유닉스 타임을 주요 국가별 시간으로 변환합니다.',
    tag: 'time'
  }
]

export function findToolByPage(page: string | undefined | null): TextTool | undefined {
  if (!page) return undefined
  return textTools.find((t) => t.page === page)
}
