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
      <div style="padding: 0 16px 16px">
        <van-field
          readonly
          clickable
          :model-value="displayText"
          placeholder="选择刷新间隔"
          @click="showPicker = true"
          input-align="left"
        />
        <p style="font-size:12px;color:#888;margin-top:8px;">
          当前: {{ displayText }}
        </p>
      </div>

      <van-popup v-model:show="showPicker" position="bottom" round>
        <van-picker-group
          :tabs="['选择时间']"
          @cancel="showPicker = false"
        >
          <van-time-picker
            v-model="currentTime"
            :columns-type="['hour', 'minute', 'second']"
            @confirm="onTimeConfirm"
          />
        </van-picker-group>
      </van-popup>
    </div>

    <div class="settings-section">
      <div class="settings-title">版本更新</div>
      <button class="btn" @click="checkUpdate" :disabled="checking">
        {{ checking ? '检查中...' : '检查更新' }}
      </button>
      <p v-if="updateError" style="color:#F44336;font-size:13px;margin-top:8px;">{{ updateError }}</p>
      <div v-if="updateInfo" style="margin-top:8px;">
        <p style="font-size:13px;">发现新版本: <strong>{{ updateInfo.version }}</strong></p>
        <a :href="updateInfo.downloadUrl" target="_blank" style="color:#1989fa;font-size:13px;">点击下载</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSettings } from '../stores/settings.js';
import { checkUpdate as apiCheckUpdate } from '../services/api.js';
import { showToast } from 'vant';

const { settings, setDarkMode, setRefreshInterval } = useSettings();
const checking = ref(false);
const updateError = ref('');
const updateInfo = ref(null);
const showPicker = ref(false);

function toggleDark() {
  setDarkMode(!settings.value.darkMode);
}

function parseSeconds(secs) {
  const total = secs || 300;
  return {
    hour: Math.floor(total / 3600),
    minute: Math.floor((total % 3600) / 60),
    second: total % 60,
  };
}

const currentTime = ref(parseSeconds(settings.value.refreshIntervalSeconds));

function formatTime(secs) {
  const { hour: h, minute: m, second: s } = parseSeconds(secs);
  const parts = [];
  if (h > 0) parts.push(`${h} 小时`);
  if (m > 0) parts.push(`${m} 分钟`);
  if (s > 0 || parts.length === 0) parts.push(`${s} 秒`);
  return parts.join(' ');
}

const displayText = computed(() => formatTime(settings.value.refreshIntervalSeconds || 300));

function onTimeConfirm(values) {
  // values 是字符串数组 [hourStr, minuteStr, secondStr]
  const hour = parseInt(values[0], 10) || 0;
  const minute = parseInt(values[1], 10) || 0;
  const second = parseInt(values[2], 10) || 0;
  const total = hour * 3600 + minute * 60 + second;
  setRefreshInterval(total);
  showPicker.value = false;
  showToast({ message: `已设置为 ${formatTime(total)}`, position: 'top' });
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
.settings-section { padding: 0 16px 16px; border-bottom: 1px solid #eee; }
.settings-title { font-weight: bold; margin-bottom: 12px; font-size: 15px; }
.toggle-row { display: flex; justify-content: space-between; align-items: center; }
.toggle { width: 44px; height: 24px; border-radius: 12px; background: #ccc; position: relative; cursor: pointer; transition: background 0.2s; }
.toggle.on { background: #1989fa; }
.toggle::after { content: ''; position: absolute; width: 20px; height: 20px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: left 0.2s; }
.toggle.on::after { left: 22px; }
.btn { padding: 8px 14px; border-radius: 8px; border: 1px solid #d9d9d9; background: #fff; cursor: pointer; font-size: 13px; }
</style>
