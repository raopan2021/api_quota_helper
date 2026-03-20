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
      <div class="btn-row">
        <button v-for="opt in intervalOptions" :key="opt.value" class="btn" :class="{ active: settings.refreshIntervalSeconds === opt.value }" @click="setInterval(opt.value)">
          {{ opt.label }}
        </button>
      </div>
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
import { ref } from 'vue';
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

function setInterval(v) {
  setRefreshInterval(v);
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

const intervalOptions = [
  { label: '30秒', value: 30 },
  { label: '1分钟', value: 60 },
  { label: '5分钟', value: 300 },
  { label: '10分钟', value: 600 },
];
</script>
