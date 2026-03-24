<template>
  <div :class="['settings-wrap', { dark: settings.darkMode }]">
    <!-- 显示设置 -->
    <div class="settings-section">
      <div class="settings-title">显示</div>

      <!-- 卡片大小 -->
      <div class="setting-row">
        <span>卡片大小</span>
        <div class="picker-group">
          <button
            v-for="size in ['small', 'medium', 'large']"
            :key="size"
            :class="{ active: settings.cardSize === size }"
            @click="setCardSize(size)"
          >
            {{ size === 'small' ? '小' : size === 'medium' ? '中' : '大' }}
          </button>
        </div>
      </div>

      <!-- 深色模式 -->
      <div class="setting-row">
        <span>深色模式</span>
        <div
          class="toggle"
          :class="{ on: settings.darkMode }"
          @click="setDarkMode(!settings.darkMode)"
        >
          <div class="toggle-knob" />
        </div>
      </div>
    </div>

    <!-- 刷新间隔 -->
    <div class="settings-section">
      <div class="settings-title">定时刷新</div>
      <div class="interval-picker">
        <div class="interval-unit">
          <div class="interval-label">时</div>
          <select v-model.number="hours" @change="updateInterval">
            <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2, '0') }}</option>
          </select>
        </div>
        <span class="interval-sep">:</span>
        <div class="interval-unit">
          <div class="interval-label">分</div>
          <select v-model.number="minutes" @change="updateInterval">
            <option v-for="m in 60" :key="m-1" :value="m-1">{{ String(m-1).padStart(2, '0') }}</option>
          </select>
        </div>
        <span class="interval-sep">:</span>
        <div class="interval-unit">
          <div class="interval-label">秒</div>
          <select v-model.number="seconds" @change="updateInterval">
            <option v-for="s in 60" :key="s-1" :value="s-1">{{ String(s-1).padStart(2, '0') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 关于 -->
    <div class="settings-section">
      <div class="settings-title">关于</div>
      <button class="btn" @click="checkUpdate" :disabled="checking">
        {{ checking ? '检查中...' : '检查更新' }}
      </button>
      <p v-if="updateError" class="error-msg">{{ updateError }}</p>
      <div v-if="updateInfo" class="update-info">
        <p>发现新版本: <strong>{{ updateInfo.version }}</strong></p>
        <a :href="updateInfo.downloadUrl" target="_blank" class="download-link">点击下载</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSettings } from '../stores/settings.js';
import { checkUpdate as apiCheckUpdate } from '../services/api.js';

const { settings, setDarkMode, setRefreshInterval, setCardSize } = useSettings();

const checking = ref(false);
const updateError = ref('');
const updateInfo = ref(null);

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
  } else {
    updateInfo.value = result;
  }
}
</script>

<style scoped>
.settings-wrap {
  padding: 16px 0;
  background: #f5f5f5;
  min-height: 100vh;
}
.settings-wrap.dark {
  background: #1a1a1a;
}
.settings-section {
  max-width: 480px;
  margin: 0 auto 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}
.dark .settings-section {
  background: #2a2a2a;
}
.settings-title {
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 15px;
}
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.dark .setting-row {
  border-color: #333;
}
.picker-group {
  display: flex;
  gap: 4px;
}
.picker-group button {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
}
.dark .picker-group button {
  border-color: #444;
  color: #e0e0e0;
}
.picker-group button.active {
  background: #1677ff;
  border-color: #1677ff;
  color: #fff;
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
  background: #1677ff;
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle.on .toggle-knob {
  left: 22px;
}
.interval-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
}
.interval-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.interval-label {
  font-size: 12px;
  margin-bottom: 4px;
  color: #888;
}
.dark .interval-label {
  color: #888;
}
.interval-sep {
  font-size: 18px;
  font-weight: bold;
  margin-top: -16px;
}
.dark .interval-sep {
  color: #e0e0e0;
}
select {
  width: 70px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 16px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background: #fff;
}
.dark select {
  border-color: #444;
  background: #1a1a1a;
  color: #e0e0e0;
}
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}
.dark .btn {
  background: #2a2a2a;
  color: #e0e0e0;
}
.error-msg {
  color: #F44336;
  font-size: 13px;
  margin-top: 8px;
}
.update-info {
  margin-top: 8px;
  font-size: 13px;
}
.download-link {
  color: #1677ff;
  font-size: 13px;
  display: block;
  margin-top: 4px;
}
</style>
