<template>
  <!-- 卡片容器 -->
  <div class="rounded-xl shadow-sm overflow-hidden" :class="cardPadding" :style="{
    background: 'var(--color-bg-card)',
    '--quota-color': quotaColor,
    maxWidth: '480px',
  }">
    <!-- 状态条 -->
    <div class="status-bar" :style="{ background: quotaColor, height: refreshing ? '6px' : '4px' }" />

    <div class="card-content">
      <!-- 头部 -->
      <div class="flex justify-between items-center mt-3">
        <div class="flex items-center gap-3">
          <!-- 头像 -->
          <div class="avatar" :style="{ background: quotaColor + '20', color: quotaColor }">
            {{ account.username.charAt(0).toUpperCase() }}
          </div>
          <div>
            <div class="font-bold text-base" :style="{ color: 'var(--color-text)' }">{{ account.username }}</div>
            <div class="text-xs mt-0.5" :style="{ color: 'var(--color-text-muted)' }" v-if="info.planName">
              {{ info.planName }}
              <span v-if="info.daysRemaining != null" :style="{ color: daysColor }">
                · 剩余 {{ info.daysRemaining }} 天
              </span>
            </div>
          </div>
        </div>

        <!-- 百分比徽章 -->
        <div v-if="!loading && !error" class="percent-badge"
          :style="{ background: quotaColor + '18', color: quotaColor }">
          {{ percent.toFixed(1) }}%
        </div>
        <div v-else-if="loading" class="percent-badge"
          :style="{ background: 'rgba(158,158,158,0.1)', color: 'var(--color-muted)' }">加载中</div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="mt-2 text-sm" style="color: var(--color-danger)">{{ error }}</div>

      <!-- 额度信息 -->
      <template v-if="!loading && info.amount">
        <div class="flex justify-between text-sm mt-3">
          <div class="text-left">
            <div class="text-xs" :style="{ color: 'var(--color-text-muted)' }">已用额度</div>
            <div class="font-bold mt-0.5" :style="{ color: 'var(--color-text)' }">{{ info.amountUsed?.toFixed(1) }}
            </div>
          </div>
          <div class="text-left">
            <div class="text-xs" :style="{ color: 'var(--color-text-muted)' }">总额度</div>
            <div class="font-bold mt-0.5" :style="{ color: 'var(--color-text)' }">{{ info.amount?.toFixed(1) }}</div>
          </div>
          <div class="text-right">
            <div class="text-xs" :style="{ color: 'var(--color-text-muted)' }">剩余额度</div>
            <div class="font-bold mt-0.5" :style="{ color: quotaColor }">{{ info.remaining?.toFixed(1) }}</div>
          </div>
        </div>

        <!-- 进度条：左侧已用 + 进度条 + 右侧剩余 -->
        <div class="flex items-center gap-2 mt-3">
          <div class="progress-track flex-1">
            <div class="progress-fill" :style="{ width: Math.min(100, usedPercent) + '%', background: usedColor }" />
          </div>
        </div>

        <!-- 距重置时间 + 下次重置时间 -->
        <div class="flex justify-between text-xs mt-2" :style="{ color: 'var(--color-text-muted)' }">
          <span v-if="info.nextResetTime">
            距重置: <span :style="{ color: 'var(--color-primary)', fontWeight: 500 }">{{ countdown }}</span>
          </span>
          <span v-if="info.nextResetTime">
            下次重置:
            <span :style="{ color: 'var(--color-primary)', fontWeight: 500 }">{{ nextResetLabel }}</span>
          </span>
        </div>
      </template>

      <!-- 操作按钮 -->
      <div class="flex gap-2 justify-end mt-3">
        <button class="px-3 py-1 text-xs rounded-md border cursor-pointer transition-colors"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }" :disabled="refreshing"
          @click="$emit('refresh')">
          {{ refreshing ? '刷新中' : '刷新' }}
        </button>
        <button class="px-3 py-1 text-xs rounded-md border cursor-pointer transition-colors"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }" @click="$emit('edit')">编辑</button>
        <button class="px-3 py-1 text-xs rounded-md border cursor-pointer transition-colors"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-danger)' }"
          @click="$emit('delete')">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useSettings } from '../stores/settings.js';

dayjs.extend(relativeTime);

defineEmits(['edit', 'delete', 'refresh']);

const props = defineProps({
  account: { type: Object, required: true },
  refreshing: { type: Boolean, default: false },
});

const { settings } = useSettings();
const accountData = inject('accountData');

const info = computed(() => accountData.value[props.account.id] || {});
const loading = computed(() => info.value.loading);
const error = computed(() => info.value.error);

const cardPadding = computed(() => ({
  'p-3': settings.value.cardSize === 'small',
  'p-4': settings.value.cardSize === 'medium',
  'p-5': settings.value.cardSize === 'large',
}));

const percent = computed(() => {
  const { amount, remaining } = info.value;
  if (!amount) return 0;
  return Math.min(100, (remaining / amount) * 100);
});

// 已使用百分比（进度条用）
const usedPercent = computed(() => {
  const { amount, amountUsed } = info.value;
  if (!amount) return 0;
  return Math.min(100, (amountUsed / amount) * 100);
});

// 已使用额度颜色（高=危险，低=安全）
const usedColor = computed(() => {
  if (props.refreshing) return '#9E9E9E';
  const { amount, amountUsed } = info.value;
  if (!amount) return '#9E9E9E';
  const p = (amountUsed / amount) * 100;
  if (p < 50) return '#4CAF50';
  if (p < 80) return '#FFC107';
  return '#F44336';
});

const quotaColor = computed(() => {
  if (props.refreshing) return '#9E9E9E';
  const { amount, remaining } = info.value;
  if (!amount) return '#9E9E9E';
  const p = (remaining / amount) * 100;
  if (p > 50) return '#4CAF50';
  if (p > 20) return '#FFC107';
  return '#F44336';
});

const daysColor = computed(() => {
  const days = info.value.daysRemaining;
  if (days == null) return '#9E9E9E';
  if (days > 10) return '#4CAF50';
  if (days > 3) return '#FFC107';
  return '#F44336';
});

const nextResetLabel = computed(() => {
  const t = info.value.nextResetTime;
  if (!t) return '';
  const reset = dayjs(t);
  const isTomorrow = reset.isAfter(dayjs().endOf('day'));
  const prefix = isTomorrow ? '明天 ' : '';
  const h = reset.hour();
  const m = reset.minute();
  const s = reset.second();
  const period = h < 6 ? '凌晨' : h < 12 ? '早上' : h < 18 ? '下午' : '晚上';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${prefix}${period}${hour12}点${m}分${s}秒`;
});

// 下次更新时间
const lastUpdated = computed(() => {
  const ts = info.value.updatedAt;
  if (!ts) return '';
  return dayjs(ts).add(settings.value.refreshIntervalSeconds || 300, 'second').fromNow();
});

// 倒计时
const tick = ref(0);
let timer = null;

onMounted(() => { timer = setInterval(() => tick.value++, 1000); });
onUnmounted(() => { if (timer) clearInterval(timer); });

const countdown = computed(() => {
  tick.value;
  const resetTime = info.value.nextResetTime;
  if (!resetTime) return '';
  const diff = dayjs(resetTime).diff(dayjs());
  if (diff <= 0) return '已重置';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}小时${m}分${s}秒`;
});
</script>

<style scoped>
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

.percent-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 15px;
}

.progress-track {
  height: 8px;
  background: var(--color-progress-track, #eee);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}
</style>
