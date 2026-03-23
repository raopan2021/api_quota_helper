<template>
  <div>
    <div class="settings-section">
      <div class="toggle-row">
        <span>深色模式</span>
        <div class="toggle" :class="{ on: settings.darkMode }" @click="toggleDark" />
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-title">刷新间隔</div>
      <div class="hms-row">
        <div class="hms-unit">
          <input
            class="hms-input"
            type="number"
            min="0"
            max="23"
            :value="hms.h"
            @change="e => updateField('h', e.target.value)"
          />
          <span class="hms-label">时</span>
        </div>
        <div class="hms-unit">
          <input
            class="hms-input"
            type="number"
            min="0"
            max="59"
            :value="hms.m"
            @change="e => updateField('m', e.target.value)"
          />
          <span class="hms-label">分</span>
        </div>
        <div class="hms-unit">
          <input
            class="hms-input"
            type="number"
            min="0"
            max="59"
            :value="hms.s"
            @change="e => updateField('s', e.target.value)"
          />
          <span class="hms-label">秒</span>
        </div>
      </div>
      <p style="font-size:12px;color:#888;margin-top:6px;padding-left:4px;">
        当前: {{ settings.refreshIntervalSeconds }} 秒
      </p>
    </div>

    <div class="settings-section">
      <div class="settings-title">版本更新</div>
      <button class="btn" @click="checkUpdate" :disabled="checking">
        {{ checking ? '检查中...' : '检查更新' }}
      </button>
      <p v-if="updateError" style="color:#F44336;font-size:13px;margin-top:8px;">{{ updateError }}</p>
      <p v-if="isLatest" style="color:#4CAF50;font-size:13px;margin-top:8px;">当前已是最新版本</p>
      <div v-if="updateInfo" style="margin-top:8px;">
        <p style="font-size:13px;">发现新版本: <strong>{{ updateInfo.version }}</strong></p>
        <a :href="updateInfo.downloadUrl" target="_blank" style="color:#1976D2;font-size:13px;">点击下载</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSettings } from '../stores/settings.js';
import { checkUpdate as apiCheckUpdate } from '../services/api.js';

const { settings, setDarkMode, setRefreshInterval } = useSettings();
const checking = ref(false);
const updateError = ref('');
const isLatest = ref(false);
const updateInfo = ref(null);

function toggleDark() {
  setDarkMode(!settings.value.darkMode);
}

function toHMS(seconds) {
  const s = seconds || 300;
  return {
    h: Math.floor(s / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

function toSeconds(h, m, s) {
  return h * 3600 + m * 60 + s;
}

const hms = computed(() => toHMS(settings.value.refreshIntervalSeconds));

function updateField(field, val) {
  const n = parseInt(val, 10) || 0;
  const cur = toHMS(settings.value.refreshIntervalSeconds);
  const next = toSeconds(field === 'h' ? n : cur.h, field === 'm' ? n : cur.m, field === 's' ? n : cur.s);
  setRefreshInterval(next);
}

async function checkUpdate() {
  checking.value = true;
  updateError.value = '';
  isLatest.value = false;
  updateInfo.value = null;
  const result = await apiCheckUpdate();
  checking.value = false;
  if (result.error) {
    updateError.value = result.error;
  } else {
    isLatest.value = false;
    updateInfo.value = result;
  }
}
</script>

<style scoped>
.hms-row { display: flex; gap: 12px; align-items: center; padding: 0 4px; }
.hms-unit { display: flex; align-items: center; gap: 4px; }
.hms-input { width: 52px; padding: 6px 8px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; text-align: center; background: #fafafa; }
.hms-label { font-size: 13px; color: #666; }
</style>
