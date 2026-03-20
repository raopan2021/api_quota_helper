import { ref } from 'vue';

const MAX_SIZE = 50;
const logs = ref([]);

export function useLogs() {
  function log({ logType, username, requestBody, success, status, message, body, error }) {
    logs.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      logType, username, requestBody,
      success, status, message, body, error
    });
    while (logs.value.length > MAX_SIZE) logs.value.pop();
  }

  function clearByType(type) {
    logs.value = logs.value.filter(l => l.logType !== type);
  }

  function clear() {
    logs.value = [];
  }

  function getTypes() {
    return [...new Set(logs.value.map(l => l.logType))];
  }

  return { logs, log, clearByType, clear, getTypes };
}
