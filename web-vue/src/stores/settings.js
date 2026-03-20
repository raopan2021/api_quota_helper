import { ref, watch } from 'vue';

const STORAGE_KEY = 'api_quota_settings';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

const defaults = { darkMode: false, refreshIntervalSeconds: 300 };
const settings = ref({ ...defaults, ...load() });

watch(settings, (s) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}, { deep: true });

export function useSettings() {
  return {
    settings,
    setDarkMode(v) { settings.value.darkMode = v; },
    setRefreshInterval(v) { settings.value.refreshIntervalSeconds = v; }
  };
}
