export interface TextTool {
  page: string
  name: string
  description?: string
  placeholder?: string
}

export const textTools: TextTool[] = [
  {
    page: 'hash',
    name: '해시 생성기',
  },
  {
    page: 'array-converter',
    name: 'Array 변환기',
    description: 'JSON / XML / 줄바꿈·콤마 텍스트에서 원하는 필드만 뽑아서 다양한 배열 포맷으로 변환합니다.'
  },
]
