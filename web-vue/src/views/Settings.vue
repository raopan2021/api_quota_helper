<template>
  <div class="settings-wrap py-4" :style="{ background: 'var(--color-bg)' }">
    <!-- 显示设置 -->
    <div class="max-w-480 mx-auto mb-3 p-4" :style="{ background: 'var(--color-bg-card)' }">
      <div class="font-bold text-sm mb-3" :style="{ color: 'var(--color-text)' }">显示</div>

      <!-- 卡片大小 -->
      <div class="flex justify-between items-center py-2" :style="{ borderColor: 'var(--color-border)' }">
        <span class="text-sm" :style="{ color: 'var(--color-text)' }">卡片大小</span>
        <div class="flex gap-1">
          <button v-for="size in ['small', 'medium', 'large']" :key="size"
            class="size-btn text-xs rounded-md border cursor-pointer transition-all" :style="settings.cardSize === size
              ? { background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
              : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }" @click="setCardSize(size)">
            {{ size === 'small' ? '小' : size === 'medium' ? '中' : '大' }}
          </button>
        </div>
      </div>

      <!-- 深色模式 -->
      <div class="flex justify-between items-center py-2">
        <span class="text-sm" :style="{ color: 'var(--color-text)' }">深色模式</span>
        <div class="toggle" :class="{ on: settings.darkMode }" @click="toggleDarkMode">
          <div class="toggle-knob" />
        </div>
      </div>
    </div>

    <!-- 定时刷新 -->
    <div class="max-w-480 mx-auto mb-3 p-4" :style="{ background: 'var(--color-bg-card)' }">
      <div class="font-bold text-sm mb-3" :style="{ color: 'var(--color-text)' }">定时刷新</div>
      <div class="flex items-center justify-center gap-2">
        <div class="flex flex-col items-center">
          <span class="text-xs mb-1" :style="{ color: 'var(--color-text-muted)' }">时</span>
          <select v-model.number="hours" @change="updateInterval" class="select-base">
            <option v-for="h in 24" :key="h - 1" :value="h - 1">{{ String(h - 1).padStart(2, '0') }}</option>
          </select>
        </div>
        <span class="text-lg font-bold mt-4" :style="{ color: 'var(--color-text-muted)' }">:</span>
        <div class="flex flex-col items-center">
          <span class="text-xs mb-1" :style="{ color: 'var(--color-text-muted)' }">分</span>
          <select v-model.number="minutes" @change="updateInterval" class="select-base">
            <option v-for="m in 60" :key="m - 1" :value="m - 1">{{ String(m - 1).padStart(2, '0') }}</option>
          </select>
        </div>
        <span class="text-lg font-bold mt-4" :style="{ color: 'var(--color-text-muted)' }">:</span>
        <div class="flex flex-col items-center">
          <span class="text-xs mb-1" :style="{ color: 'var(--color-text-muted)' }">秒</span>
          <select v-model.number="seconds" @change="updateInterval" class="select-base">
            <option v-for="s in 60" :key="s - 1" :value="s - 1">{{ String(s - 1).padStart(2, '0') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 关于 -->
    <div class="max-w-480 mx-auto p-4" :style="{ background: 'var(--color-bg-card)' }">
      <div class="font-bold text-sm mb-3" :style="{ color: 'var(--color-text)' }">关于</div>
      <div class="text-sm mb-3 flex flex-col gap-1 mb-6" :style="{ color: 'var(--color-text)' }">
        <div class="flex justify-start">
          <span class="min-w-24">当前版本</span>
          <strong>{{ version }}</strong>
        </div>
        <div class="flex justify-start">
          <span class="min-w-24">作者</span>
          <strong>raopan</strong>
        </div>
        <div class="flex justify-start">
          <span class="min-w-24">开源地址</span>
          <a href="https://github.com/raopan/api_quota_helper" target="_blank" style="color: var(--color-primary)">github.com/raopan/api_quota_helper</a>
        </div>
      </div>
      <div class="flex justify-end">
        <button class="px-4 py-2 text-sm rounded-lg border cursor-pointer transition-colors"
          :style="{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text)' }"
          :disabled="checking" @click="checkUpdate">
          {{ checking ? '检查中...' : '检查更新' }}
        </button>
      </div>
      <p v-if="updateError" class="mt-2 text-sm" style="color: var(--color-danger)">{{ updateError }}</p>
      <div v-if="updateInfo" class="mt-2 text-sm" :style="{ color: 'var(--color-text)' }">
        <p>发现新版本: <strong>{{ updateInfo.version }}</strong></p>
        <a :href="updateInfo.downloadUrl" target="_blank" class="mt-1 block" style="color: var(--color-primary)">点击下载
          →</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useSettings } from '../stores/settings.js';
import { useLogs } from '../stores/logs.js';
import { checkUpdate as apiCheckUpdate } from '../services/api.js';

const version = import.meta.env.VITE_APP_VERSION;

const { settings, setDarkMode, setRefreshInterval, setCardSize } = useSettings();
const { log: addLog } = useLogs();

const checking = ref(false);
const updateError = ref('');
const updateInfo = ref(null);

async function toggleDarkMode(e) {
  const enableTransitions = () =>
    'startViewTransition' in document &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  if (!enableTransitions()) {
    setDarkMode(!settings.value.darkMode);
    return;
  }

  const x = e.clientX;
  const y = e.clientY;
  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ];

  await document.startViewTransition(async () => {
    setDarkMode(!settings.value.darkMode);
    await nextTick();
  }).ready;

  const isDark = settings.value.darkMode;
  document.documentElement.animate(
    { clipPath: isDark ? clipPath.reverse() : clipPath },
    {
      duration: 500,
      easing: 'ease',
      fill: 'forwards',
      pseudoElement: `::view-transition-${isDark ? 'old' : 'new'}(root)`
    }
  );
}

function parseSeconds(secs) {
  const total = secs || 300;
  return {
    hour: Math.floor(total / 3600),
    minute: Math.floor((total % 3600) / 60),
    second: total % 60,
  };
}

const { hour, minute, second } = parseSeconds(settings.value.refreshIntervalSeconds);
const hours = ref(hour);
const minutes = ref(minute);
const seconds = ref(second);

function updateInterval() {
  const total = hours.value * 3600 + minutes.value * 60 + seconds.value;
  if (total > 0) {
    setRefreshInterval(total);
  }
}

async function checkUpdate() {
  checking.value = true;
  updateError.value = '';
  updateInfo.value = null;
  const result = await apiCheckUpdate();
  checking.value = false;
  if (result.error) {
    updateError.value = result.error;
    addLog({ logType: '检查更新', username: '', requestBody: '检查更新', success: false, status: 0, message: result.error, body: '', error: result.error });
  } else {
    updateInfo.value = result;
    addLog({ logType: '检查更新', username: '', requestBody: '检查更新', success: true, status: 200, message: result.version ? `发现新版本 ${result.version}` : '已是最新版本', body: JSON.stringify(result), error: '' });
  }
}
</script>

<style scoped>
.size-btn {
  padding: 6px 14px;
  min-width: 44px;
}

.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #ccc;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle.on {
  background: var(--color-primary);
}

.toggle-knob {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle.on .toggle-knob {
  left: 22px;
}

.select-base {
  width: 70px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  text-align: center;
  font-size: 16px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background: var(--color-bg-card);
  color: var(--color-text);
}
</style>
