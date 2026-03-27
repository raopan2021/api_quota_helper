import { ref, watch } from 'vue';

const STORAGE_KEY = 'api_quota_settings';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

const defaults = { darkMode: false, refreshIntervalSeconds: 300, cardSize: 'medium' };
const settings = ref({ ...defaults, ...load() });

watch(settings, (s) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}, { deep: true });

// 监听 darkMode 变化，同步到 html 标签
watch(() => settings.value.darkMode, (v) => {
  if (v) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

export function useSettings() {
  return {
    settings,
    setDarkMode(v) { settings.value.darkMode = v; },
    setRefreshInterval(v) { settings.value.refreshIntervalSeconds = v; },
    setCardSize(v) { settings.value.cardSize = v; },
  };
}