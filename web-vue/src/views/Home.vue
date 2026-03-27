<template>
  <div class="home-wrap py-3" :style="{ background: 'var(--color-bg)' }">
    <!-- 空状态 -->
    <div v-if="accounts.length === 0" class="text-center py-16 text-sm" :style="{ color: 'var(--color-text-muted)' }">
      <p>暂无账户</p>
      <p class="mt-2 text-xs" :style="{ color: 'var(--color-text-muted)', opacity: 0.7 }">点击下方 + 添加账户</p>
    </div>

    <!-- 账户卡片 -->
    <div v-for="acc in accounts" :key="acc.id" class="max-w-480 mx-auto px-4">
      <AccountCard
        :account="acc"
        :refreshing="refreshing && refreshingId === acc.id"
        @refresh="refreshAccount(acc)"
        @edit="$emit('edit', acc)"
        @delete="deleteAccount(acc.id)"
      />
    </div>

    <!-- 底部悬浮按钮 -->
    <div class="fixed bottom-6 right-6 z-100 flex gap-3 pointer-events-none">
      <button class="btn-float shadow-lg flex-col" :style="{ background: 'var(--color-primary)', color: '#fff' }" @click="$emit('add')">
        <span>+</span>
        <span class="text-xs mt-0.5">添加</span>
      </button>
      <button class="btn-float shadow-lg flex-col" :style="{ background: 'var(--color-bg-card)', color: 'var(--color-text)' }" @click="handleRefreshAll" :disabled="refreshing">
        <span :class="{ 'animate-spin': refreshing }">⟳</span>
        <span class="text-xs mt-0.5">刷新</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-float {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.2s, opacity 0.2s;
}
.btn-float:active {
  transform: scale(0.95);
}
.btn-float:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

<script setup>
import { inject, ref } from 'vue';
import AccountCard from '../components/AccountCard.vue';

defineEmits(['edit', 'add']);

const accounts = inject('accounts');
const refreshAll = inject('refreshAll');
const deleteAccount = inject('deleteAccount');

const refreshing = ref(false);
const refreshingId = ref(null);

async function refreshAccount(acc) {
  refreshing.value = true;
  refreshingId.value = acc.id;
  try {
    await refreshAll();
  } finally {
    setTimeout(() => {
      refreshing.value = false;
      refreshingId.value = null;
    }, 500);
  }
}

async function handleRefreshAll() {
  refreshing.value = true;
  try {
    await refreshAll();
  } finally {
    setTimeout(() => {
      refreshing.value = false;
      refreshingId.value = null;
    }, 500);
  }
}
</script>
