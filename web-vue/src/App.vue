<template>
  <div class="app min-h-screen dvh flex flex-col"
    :style="{ background: 'var(--color-bg)', color: 'var(--color-text)' }">
    <Header :refreshing="refreshing" @add="openAdd" @open-logs="showLogs = true" @open-settings="showSettings = true"
      @refresh="refreshAll" />

    <main class="flex-1 overflow-y-auto pb-4" style="overscroll-behavior:contain;-webkit-overflow-scrolling:touch;">
      <Home @edit="openEdit" @add="openAdd" />
    </main>

    <SlidingPanel :show="showLogs" title="日志" @close="showLogs = false">
      <Logs />
    </SlidingPanel>

    <SlidingPanel :show="showSettings" title="设置" @close="showSettings = false">
      <Settings />
    </SlidingPanel>

    <AddEditModal :show="showAdd" :editing="editingAccount" @close="closeAdd" @save="handleSave" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue';
import { accounts, addAccount, updateAccount, deleteAccount } from './stores/accounts.js';
import { useLogs } from './stores/logs.js';
import { useSettings } from './stores/settings.js';
import { queryQuota } from './services/api.js';
import Home from './views/Home.vue';
import Logs from './views/Logs.vue';
import Settings from './views/Settings.vue';
import Header from './components/Header.vue';
import SlidingPanel from './components/SlidingPanel.vue';
import AddEditModal from './components/AddEditModal.vue';

const { settings } = useSettings();
const { log: addLog } = useLogs();

// ========== 弹窗状态 ==========
const showLogs = ref(false);
const showSettings = ref(false);
const showAdd = ref(false);
const refreshing = ref(false);

// 编辑中的账户，null 表示添加模式
const editingAccount = ref(null);

// ========== 账户数据 ==========
const accountData = ref({});

function loadAccountData() {
  try {
    const raw = sessionStorage.getItem('accountData');
    if (raw) accountData.value = JSON.parse(raw);
  } catch { }
}
loadAccountData();

function saveAccountData() {
  sessionStorage.setItem('accountData', JSON.stringify(accountData.value));
}

// ========== 打开弹窗 ==========
function openAdd() {
  editingAccount.value = null;
  showAdd.value = true;
}

function openEdit(acc) {
  editingAccount.value = acc;
  showAdd.value = true;
}

function closeAdd() {
  showAdd.value = false;
  editingAccount.value = null;
}

function handleSave({ username, token }) {
  if (editingAccount.value) {
    updateAccount(editingAccount.value.id, { username, token });
  } else {
    addAccount({ username, token });
  }
  closeAdd();
  refreshAll();
}

// ========== 刷新所有账户额度 ==========
async function refreshAll() {
  refreshing.value = true;
  for (const acc of accounts.value) {
    const key = acc.id;
    accountData.value[key] = { ...(accountData.value[key] || {}), loading: true };
    const { ok, status, body } = await queryQuota(acc.username, acc.token);
    if (ok && body.includes('"success":true')) {
      try {
        const json = JSON.parse(body);
        const d = json.data;
        accountData.value[key] = {
          loading: false,
          planName: d.plan_name,
          amount: d.amount,
          amountUsed: d.amount_used,
          remaining: d.amount - d.amount_used,
          nextResetTime: d.next_reset_time,
          daysRemaining: d.days_remaining,
          error: null,
          updatedAt: Date.now(),
        };
        addLog({ logType: '额度查询', username: acc.username, requestBody: JSON.stringify({ username: acc.username }), success: true, status: 200, message: '查询成功', body });
      } catch {
        accountData.value[key] = { loading: false, error: '解析失败' };
        addLog({ logType: '额度查询', username: acc.username, requestBody: '', success: false, status: 0, message: '解析失败', body, error: 'JSON解析失败' });
      }
    } else {
      const err = !ok ? `HTTP ${status}` : (body ? JSON.parse(body).message || '查询失败' : '空响应');
      accountData.value[key] = { loading: false, error: err };
      addLog({ logType: '额度查询', username: acc.username, requestBody: '', success: false, status, message: err, body, error: err });
    }
  }
  saveAccountData();
  refreshing.value = false;
}

// ========== 定时刷新 ==========
let refreshTimer = null;

onMounted(() => {
  const intervalSec = settings.value.refreshIntervalSeconds || 300;
  refreshTimer = setInterval(refreshAll, intervalSec * 1000);
  if (accounts.value.length > 0) refreshAll();
});

onUnmounted(() => clearInterval(refreshTimer));

// ========== Provide ==========
provide('accounts', accounts);
provide('accountData', accountData);
provide('refreshAll', refreshAll);
provide('deleteAccount', (id) => {
  deleteAccount(id);
  delete accountData.value[id];
  saveAccountData();
});
provide('editAccount', openEdit);
</script>

<style>
/* 滑入动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.25s ease-out;
}

/* 刷新旋转 */
.animate-spin {
  display: inline-block;
  animation: spin 0.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* View Transition */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
  animation-timing-function: ease;
}

/* placeholder 颜色 */
input::placeholder,
textarea::placeholder {
  color: var(--color-text-muted);
}
</style>
