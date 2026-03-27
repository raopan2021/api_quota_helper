<template>
  <header class="sticky top-0 z-100 flex-shrink-0 border-b shadow-sm" :style="{
    background: 'var(--color-bg-card)',
    borderColor: 'var(--color-border)',
    paddingTop: 'max(12px, env(safe-area-inset-top))',
    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    paddingLeft: '16px',
    paddingRight: '16px',
  }">
    <div class="flex items-center justify-between h-full">
      <span class="font-bold text-base truncate">API 额度助手</span>
      <div class="flex gap-2 flex-shrink-0">
        <button class="btn" @click="$emit('open-logs')">日志</button>
        <button class="btn" @click="$emit('open-settings')">设置</button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(['open-logs', 'open-settings']);
</script>
