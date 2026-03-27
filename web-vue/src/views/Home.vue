<template>
  <div :class="['home-wrap', { dark: settings.darkMode }]">
    <div v-if="accounts.length === 0" class="empty">
      <p>暂无账户</p>
      <p style="font-size:13px;margin-top:8px;color:#bbb;">点击上方 + 添加账户</p>
    </div>

    <div v-for="acc in accounts" :key="acc.id" class="card-wrap">
      <div class="card" :class="settings.cardSize" :style="cardStyle(acc)">
        <!-- Status bar -->
        <div class="status-bar" :style="{ background: quotaColor(acc), height: refreshing ? '6px' : '4px' }" />

        <div class="card-content">
          <!-- Header: avatar + username + percent badge -->
          <div class="card-header-row">
            <div class="user-info">
              <div class="avatar" :style="{ background: quotaColor(acc) + '20', color: quotaColor(acc) }">
                {{ acc.username.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="username">{{ acc.username }}</div>
                <div class="plan-info" v-if="data[acc.id]?.planName">
                  {{ data[acc.id].planName }}
                  <span v-if="data[acc.id]?.days_remaining != null" :style="{ color: daysColor(acc) }">
                    · 剩余 {{ data[acc.id].days_remaining }} 天
                  </span>
                </div>
              </div>
            </div>

            <div v-if="data[acc.id]" class="percent-badge" :style="{ background: quotaColor(acc) + '15', color: quotaColor(acc) }">
              {{ percent(acc).toFixed(1) }}%
            </div>
            <div v-else-if="data[acc.id]?.loading" class="percent-badge loading-badge">
              加载中
            </div>
          </div>

          <!-- Error -->
          <div v-if="data[acc.id]?.error" class="error-msg">{{ data[acc.id].error }}</div>

          <!-- Quota info -->
          <template v-else-if="data[acc.id]">
            <div class="quota-row">
              <div class="quota-item">
                <div class="quota-label">已用额度</div>
                <div class="quota-value">{{ data[acc.id].amountUsed?.toFixed(1) }}</div>
              </div>
              <div class="quota-item">
                <div class="quota-label">总额度</div>
                <div class="quota-value">{{ data[acc.id].amount?.toFixed(1) }}</div>
              </div>
              <div class="quota-item text-right">
                <div class="quota-label">剩余额度</div>
                <div class="quota-value" :style="{ color: quotaColor(acc) }">{{ data[acc.id].remaining?.toFixed(1) }}</div>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: Math.min(100, percent(acc)) + '%', background: quotaColor(acc) }" />
            </div>

            <!-- Countdown to reset -->
            <div class="countdown-row" v-if="data[acc.id]?.nextResetTime">
              距重置: <span class="countdown-value">{{ getCountdown(data[acc.id].nextResetTime) }}</span>
            </div>
          </template>

          <!-- Actions -->
          <div class="actions-row">
            <button @click="refreshAccount(acc)" :disabled="refreshing">
              {{ refreshing ? '刷新中' : '刷新' }}
            </button>
            <button @click="$emit('edit', acc)">编辑</button>
            <button @click="deleteAccount(acc.id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, onMounted, onUnmounted } from 'vue';
import { useSettings } from '../stores/settings.js';

defineEmits(['edit']);

const { settings } = useSettings();
const accounts = inject('accounts');
const accountData = inject('accountData');
const refreshAll = inject('refreshAll');
const deleteAccount = inject('deleteAccount');

const data = accountData;
const refreshing = ref(false);
const tick = ref(0);
let timer = null;

onMounted(() => {
  timer = setInterval(() => { tick.value++; }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

function refreshAccount(acc) {
  refreshing.value = true;
  refreshAll().finally(() => {
    setTimeout(() => { refreshing.value = false; }, 500);
  });
}

function percent(acc) {
  const d = data[acc.id];
  if (!d || !d.amount) return 0;
  // 剩余百分比 = (剩余额度 / 总额度) * 100
  return Math.min(100, (d.remaining / d.amount) * 100);
}

function quotaColor(acc) {
  const p = percent(acc);
  if (refreshing.value) return '#9E9E9E';
  // 剩余越多越绿，越少越红
  if (p > 50) return '#4CAF50';
  if (p > 20) return '#FFC107';
  return '#F44336';
}

function daysColor(acc) {
  const d = data[acc.id];
  if (!d) return '#9E9E9E';
  if (d.days_remaining > 10) return '#4CAF50';
  if (d.days_remaining > 3) return '#FFC107';
  return '#F44336';
}

function cardStyle(acc) {
  return { '--quota-color': quotaColor(acc) };
}

function getCountdown(resetTime) {
  // Access tick to make reactive
  const _ = tick.value;
  if (!resetTime) return '';
  try {
    const sdf = new Date(resetTime.replace(/\//g, '/'));
    const diff = sdf.getTime() - Date.now();
    if (diff <= 0) return '已重置';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h}小时${m}分${s}秒`;
  } catch {
    return '';
  }
}
</script>

<style scoped>
.home-wrap {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 12px 0;
}
.home-wrap.dark {
  background: #1a1a1a;
}
.card-wrap {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px;
}
.card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
}
.card.small { padding: 12px; }
.card.medium { padding: 16px; }
.card.large { padding: 20px; }
.dark .card { background: #2a2a2a; }
.status-bar {
  margin: -12px -16px 0 -16px;
  height: 4px;
  transition: height 0.2s;
}
.card.small .status-bar { margin: -12px -12px 0 -12px; }
.card.large .status-bar { margin: -20px -20px 0 -20px; }
.card-content { padding: 0 4px; }
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
.user-info { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}
.username { font-weight: bold; font-size: 16px; }
.plan-info { font-size: 12px; color: #888; margin-top: 2px; }
.percent-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 15px;
}
.loading-badge { background: #9E9E9E15; color: #9E9E9E; font-size: 12px; font-weight: normal; }
.error-msg { color: #F44336; font-size: 13px; margin-top: 8px; }
.quota-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-top: 12px;
}
.quota-item { text-align: left; }
.quota-item.text-right { text-align: right; }
.quota-label { color: #888; font-size: 12px; }
.quota-value { font-weight: bold; margin-top: 2px; }
.progress-track {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  margin-top: 12px;
  overflow: hidden;
}
.dark .progress-track { background: #333; }
.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}
.countdown-row {
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}
.countdown-value { color: #1976D2; }
.actions-row {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}
.actions-row button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 12px;
}
.dark .actions-row button { border-color: #444; color: #e0e0e0; }
.actions-row .delete-btn { color: #F44336; }
.empty { text-align: center; padding: 60px 20px; color: #999; font-size: 15px; }
</style>
