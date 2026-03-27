<template>
  <div v-if="show" class="fixed inset-0 z-200 flex justify-end" :style="{ background: 'rgba(0,0,0,0.3)' }"
    @click.self="$emit('close')">
    <div class="h-full flex flex-col shadow-[-4px_0_20px_rgba(0,0,0,0.15)] animate-slide-in" :style="{
      width: '85%',
      maxWidth: '400px',
      background: 'var(--color-bg-card)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }">
      <div class="flex justify-between items-center p-4 border-b"
        :style="{ borderColor: 'var(--color-border)', paddingTop: 'max(16px, env(safe-area-inset-top))' }">
        <h3 class="text-lg font-bold">{{ title }}</h3>
        <button
          class="w-8 h-8 flex items-center justify-center text-2xl leading-none bg-transparent border-0 cursor-pointer"
          :style="{ color: 'var(--color-text-muted)' }" @click="$emit('close')">×</button>
      </div>
      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, required: true },
});
defineEmits(['close']);
</script>
