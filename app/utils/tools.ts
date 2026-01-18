export interface TextTool {
  page: string
  name: string
  description?: string
  placeholder?: string
}

export const textTools: TextTool[] = [
  {
    page: 'json-viewer',
    name: 'JSON 뷰어',
  },
  {
    page: 'array-converter',
    name: 'Array 변환기',
    description: 'JSON / XML / 줄바꿈·콤마 텍스트에서 원하는 필드만 뽑아서 다양한 배열 포맷으로 변환합니다.'
  },
  {
    page: 'list-compare',
    name: '리스트 비교',
    description: '엔터(줄바꿈)로 구분된 두 개의 리스트를 비교해서 합집합, 교집합, 차집합, 대칭차집합을 한 번에 확인하고 복사할 수 있습니다.'
  },
  {
    page: 'codec',
    name: 'Base64 & URL 인코더/디코더',
  },
  {
    page: 'jwt-decoder',
    name: 'JWT 디코더',
  },
  {
    page: 'format-converter',
    name: 'JSON / XML / YAML 포맷 변환기',
  },
  {
    page: 'hash',
    name: '해시 생성기',
  },
  {
    page: 'html-to-text',
    name: 'HTML 텍스트 추출기',
  },
  {
    name: "숫자 통계 분석기",
    description: "JSON, XML, 텍스트에서 숫자를 추출하여 합계, 평균 등 통계를 계산합니다.",
    page: "number-analyzer",
  },
]
