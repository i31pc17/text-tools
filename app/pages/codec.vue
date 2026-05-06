<script setup lang="ts">
import { b64Encode, b64Decode } from '~/utils/codec'

definePageMeta({ ssr: false })

const raw = ref('')
const b64In = ref('')
const urlIn = ref('')

const b64Out = computed(() => {
  try { return b64Encode(raw.value) } catch { return '' }
})

const urlOut = computed(() => {
  try { return raw.value ? encodeURIComponent(raw.value) : '' } catch { return '' }
})

const b64DecResult = computed(() => {
  if (!b64In.value) return { dec: '', err: null as string | null }
  try { return { dec: b64Decode(b64In.value), err: null } }
  catch { return { dec: '', err: '유효하지 않은 Base64 문자열입니다.' } }
})

const urlDecResult = computed(() => {
  if (!urlIn.value) return { dec: '', err: null as string | null }
  try { return { dec: decodeURIComponent(urlIn.value), err: null } }
  catch { return { dec: '', err: '유효하지 않은 URL 인코딩 문자열입니다.' } }
})
</script>

<template>
  <div>
    <PageHeader />

    <div class="col" style="gap: var(--pad-lg)">
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">인코더 (텍스트 → Base64 / URL Encode)</h2>
            <p class="card-sub">UTF-8 문자열을 Base64 / URL 인코딩합니다.</p>
          </div>
        </div>
        <div class="card-body split-2">
          <div class="col">
            <div class="row-between">
              <span class="label">입력 텍스트</span>
              <span class="hint">{{ raw.length }}자</span>
            </div>
            <textarea v-model="raw" class="textarea" rows="10" placeholder="인코딩할 문자열을 입력하세요." />
          </div>
          <div class="col" style="gap: var(--pad-md)">
            <div class="col">
              <div class="row-between">
                <div class="col-tight">
                  <span class="label">Base64 (UTF-8)</span>
                  <span class="hint">{{ b64Out.length }}자</span>
                </div>
                <CopyButton :text="b64Out" />
              </div>
              <textarea :value="b64Out" class="textarea" rows="3" readonly placeholder="Base64 결과" />
            </div>
            <div class="col">
              <div class="row-between">
                <div class="col-tight">
                  <span class="label">URL Encode</span>
                  <span class="hint">{{ urlOut.length }}자</span>
                </div>
                <CopyButton :text="urlOut" />
              </div>
              <textarea :value="urlOut" class="textarea" rows="3" readonly placeholder="URL 인코딩 결과" />
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Base64 디코더</h2>
            <p class="card-sub">Base64 → UTF-8 텍스트</p>
          </div>
        </div>
        <div class="card-body split-2">
          <div class="col">
            <div class="row-between">
              <span class="label">Base64 입력</span>
              <span class="hint">{{ b64In.length }}자</span>
            </div>
            <textarea v-model="b64In" class="textarea" rows="6" placeholder="Base64 인코딩된 문자열" />
            <span v-if="b64DecResult.err" class="hint hint-error">{{ b64DecResult.err }}</span>
          </div>
          <div class="col">
            <div class="row-between">
              <div class="col-tight">
                <span class="label">디코딩 결과</span>
                <span class="hint">{{ b64DecResult.dec.length }}자</span>
              </div>
              <CopyButton :text="b64DecResult.dec" />
            </div>
            <textarea :value="b64DecResult.dec" class="textarea" rows="6" readonly placeholder="디코딩된 문자열" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">URL 디코더</h2>
            <p class="card-sub">URL 인코딩 → UTF-8 텍스트</p>
          </div>
        </div>
        <div class="card-body split-2">
          <div class="col">
            <div class="row-between">
              <span class="label">URL-encoded 입력</span>
              <span class="hint">{{ urlIn.length }}자</span>
            </div>
            <textarea v-model="urlIn" class="textarea" rows="6" placeholder="예: %EC%95%88%EB%85%95" />
            <span v-if="urlDecResult.err" class="hint hint-error">{{ urlDecResult.err }}</span>
          </div>
          <div class="col">
            <div class="row-between">
              <div class="col-tight">
                <span class="label">디코딩 결과</span>
                <span class="hint">{{ urlDecResult.dec.length }}자</span>
              </div>
              <CopyButton :text="urlDecResult.dec" />
            </div>
            <textarea :value="urlDecResult.dec" class="textarea" rows="6" readonly placeholder="디코딩된 문자열" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
