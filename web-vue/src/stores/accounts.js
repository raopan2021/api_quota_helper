import { ref, watch } from 'vue';

const STORAGE_KEY = 'api_quota_accounts';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const accounts = ref(load());
export const accountsMap = ref({});

watch(accounts, (list) => save(list), { deep: true });

export function addAccount(acc) {
  const id = Math.random().toString(36).slice(2, 10);
  accounts.value.push({ id, username: acc.username, token: acc.token, createdAt: Date.now() });
  return id;
}

export function updateAccount(id, data) {
  const idx = accounts.value.findIndex(a => a.id === id);
  if (idx >= 0) {
    accounts.value[idx] = { ...accounts.value[idx], ...data };
  }
}

export function deleteAccount(id) {
  const idx = accounts.value.findIndex(a => a.id === id);
  if (idx >= 0) accounts.value.splice(idx, 1);
  delete accountsMap.value[id];
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}
