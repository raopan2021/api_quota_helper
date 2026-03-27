<template>
  <div v-if="show" class="fixed inset-0 z-300 flex items-center justify-center p-4" :style="{
    background: 'rgba(0,0,0,0.5)',
  }" @click.self="$emit('close')">
    <div class="rounded-xl p-6 w-full max-w-sm" :style="{ background: 'var(--color-bg-card)', maxWidth: '420px' }">
      <h3 class="mb-4 text-lg font-bold" :style="{ color: 'var(--color-text)' }">
        {{ editing ? '编辑账户' : '添加账户' }}
      </h3>

      <label class="block text-sm mb-1" :style="{ color: 'var(--color-text-muted)' }">用户名</label>
      <input v-model="localUsername"
        class="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none transition-colors"
        :style="{ borderColor: 'var(--color-border)', background: 'var(--color-gray-50)', color: 'var(--color-text)' }"
        placeholder="输入或粘贴用户名" />

      <label class="block text-sm mt-3 mb-1" :style="{ color: 'var(--color-text-muted)' }">Token</label>
      <input v-model="localToken"
        class="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none transition-colors font-mono"
        :style="{ borderColor: 'var(--color-border)', background: 'var(--color-gray-50)', color: 'var(--color-text)' }"
        placeholder="粘贴 Token，sk-xxxx" />

      <div class="flex items-center gap-2 my-4">
        <div class="flex-1 h-px" :style="{ background: 'var(--color-border)' }"></div>
        <span class="text-xs" :style="{ color: 'var(--color-text-muted)' }">或从剪贴板自动识别</span>
        <div class="flex-1 h-px" :style="{ background: 'var(--color-border)' }"></div>
      </div>

      <textarea v-model="recognizeText"
        class="w-full px-3 py-2 rounded-lg text-xs border focus:outline-none transition-colors resize-none leading-relaxed font-mono"
        :style="{ borderColor: 'var(--color-border)', background: 'var(--color-gray-50)', color: 'var(--color-text)' }"
        placeholder="粘贴包含用户名和 Token 的混合文本，点击识别自动填充上方字段" rows="3" />
      <button class="w-full mt-2 px-3 py-2 text-sm rounded-lg border cursor-pointer transition-colors hover:opacity-90"
        :style="{ borderColor: 'var(--color-primary)', background: 'var(--color-gray-50)', color: 'var(--color-primary)' }"
        @click="handleAutoRecognize">🎯 自动识别并填充上方</button>

      <div v-if="recognizeResult" class="mt-2 px-3 py-2 text-xs rounded-md" :style="recognizeResult.ok
        ? { background: 'rgba(76,175,80,0.1)', color: '#4CAF50' }
        : { background: 'rgba(244,67,54,0.1)', color: '#F44336' }">{{ recognizeResult.message }}</div>

      <p v-if="error" class="mt-2 text-sm" style="color: var(--color-danger)">{{ error }}</p>

      <div class="flex justify-end gap-2 mt-4">
        <button class="px-4 py-2 text-sm rounded-lg border cursor-pointer transition-colors"
          :style="{ borderColor: 'var(--color-border)', background: 'var(--color-gray-100)', color: 'var(--color-text)' }"
          @click="$emit('close')">取消</button>
        <button class="px-4 py-2 text-sm rounded-lg border-none cursor-pointer transition-colors hover:opacity-90"
          :style="{ background: 'var(--color-primary)', color: '#fff' }" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  editing: { type: Object, default: null }, // null = 添加模式, object = 编辑模式
});
const emit = defineEmits(['close', 'save']);

const localUsername = ref('');
const localToken = ref('');
const error = ref('');
const recognizeResult = ref(null);
const recognizeText = ref('');

watch(() => props.show, (v) => {
  if (v) {
    if (props.editing) {
      localUsername.value = props.editing.username;
      localToken.value = props.editing.token;
    } else {
      localUsername.value = '';
      localToken.value = '';
    }
    error.value = '';
    recognizeResult.value = null;
    recognizeText.value = '';
  }
});

function parseAccount(text) {
  if (!text) return null;
  const apiKey = text.match(/API Key[：:]\s*(\S+)/)?.[1] || text.match(/(sk-[\w-]+)/)?.[1];
  const username = text.match(/账户[：:]\s*(\S+)/)?.[1] || text.match(/用户名[：:]\s*(\S+)/)?.[1];
  if (apiKey && username) return { username, token: apiKey };
  return null;
}

async function handleAutoRecognize() {
  let text = recognizeText.value.trim();
  if (!text) {
    try {
      text = await navigator.clipboard.readText();
    } catch {
      recognizeResult.value = { ok: false, message: '读取剪贴板失败，请手动粘贴' };
      setTimeout(() => { recognizeResult.value = null; }, 3000);
      return;
    }
  }
  const result = parseAccount(text);
  if (result) {
    localUsername.value = result.username;
    localToken.value = result.token;
    recognizeResult.value = { ok: true, message: `识别成功：${result.username}` };
  } else {
    const m = text.match(/(sk-[\w-]+)/);
    if (m) {
      localToken.value = m[1];
      recognizeResult.value = { ok: true, message: '已提取 Token，请补充用户名' };
    } else {
      recognizeResult.value = { ok: false, message: '无法识别，请手动输入' };
    }
  }
  setTimeout(() => { recognizeResult.value = null; }, 3000);
}

function handleSave() {
  error.value = '';
  const u = localUsername.value.trim();
  const t = localToken.value.trim();
  if (!u) { error.value = '用户名不能为空'; return; }
  if (!t) { error.value = 'Token不能为空'; return; }
  emit('save', { username: u, token: t });
}
</script>
