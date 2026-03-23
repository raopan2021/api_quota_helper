<template>
  <div :class="['app', { dark: settings.darkMode }]">
    <header>
      <span>API 额度助手</span>
      <div class="header-btns">
        <button @click="showLogs = true">日志</button>
        <button @click="showSettings = true">设置</button>
        <button @click="refreshAll" :disabled="refreshing">
          <span :class="{ spinning: refreshing }">⟳</span>
        </button>
      </div>
    </header>

    <main>
      <Home @edit="openEdit" />
    </main>

    <!-- 右侧日志弹窗 -->
    <div v-if="showLogs" class="layer-mask" @click.self="showLogs = false">
      <div class="layer-panel" :class="{ dark: settings.darkMode }">
        <div class="layer-header">
          <h3>日志</h3>
          <button class="layer-close" @click="showLogs = false">×</button>
        </div>
        <div class="layer-content">
          <Logs />
        </div>
      </div>
    </div>

    <!-- 右侧设置弹窗 -->
    <div v-if="showSettings" class="layer-mask" @click.self="showSettings = false">
      <div class="layer-panel" :class="{ dark: settings.darkMode }">
        <div class="layer-header">
          <h3>设置</h3>
          <button class="layer-close" @click="showSettings = false">×</button>
        </div>
        <div class="layer-content">
          <Settings />
        </div>
      </div>
    </div>

    <!-- 添加/编辑账户弹窗 -->
    <div v-if="showAdd" class="modal-mask" @click.self="closeAdd">
      <div class="modal">
        <h3>{{ editing ? '编辑账户' : '添加账户' }}</h3>
        <label>用户名</label>
        <input v-model="form.username" placeholder="username" />
        <label>Token</label>
        <div class="token-row">
          <input v-model="form.token" :type="showToken ? 'text' : 'password'" placeholder="sk-xxxx" />
          <button @click="showToken = !showToken">{{ showToken ? '隐藏' : '显示' }}</button>
          <button @click="scanClipboard">扫描</button>
        </div>
        <!-- 自动识别结果 -->
        <div v-if="recognizeResult" class="recognize-result" :class="recognizeResult.ok ? 'success' : 'fail'">
          {{ recognizeResult.message }}
        </div>
        <p v-if="form.error" class="error">{{ form.error }}</p>
        <div class="modal-actions">
          <button @click="closeAdd">取消</button>
          <button class="primary" @click="saveAccount">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, provide } from 'vue';
import { accounts, addAccount, updateAccount, deleteAccount } from './stores/accounts.js';
import { useLogs } from './stores/logs.js';
import { useSettings } from './stores/settings.js';
import { queryQuota } from './services/api.js';
import Home from './views/Home.vue';
import Logs from './views/Logs.vue';
import Settings from './views/Settings.vue';

const { settings } = useSettings();
const { log: addLog } = useLogs();

// 弹窗状态
const showLogs = ref(false);
const showSettings = ref(false);
const showAdd = ref(false);
const editing = ref(null);
const showToken = ref(false);
const refreshing = ref(false);
const form = reactive({ username: '', token: '', error: '' });
const recognizeResult = ref(null);

// 账户数据（运行时Quota状态）
const accountData = ref({});

let refreshTimer = null;
let intervalSec = 300;

function loadAccountData() {
  try {
    const raw = sessionStorage.getItem('accountData');
    if (raw) accountData.value = JSON.parse(raw);
  } catch {}
}
loadAccountData();

function saveAccountData() {
  sessionStorage.setItem('accountData', JSON.stringify(accountData.value));
}

// 扫描剪贴板并自动识别
async function scanClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    const result = parseAccountFromClipboard(text);
    if (result) {
      form.username = result.username;
      form.token = result.token;
      recognizeResult.value = { ok: true, message: `识别成功：${result.username}` };
      addLog({ logType: '账户识别', username: '系统', requestBody: text, success: true, status: 200, message: `识别成功：${result.username}`, body: JSON.stringify(result) });
    } else {
      // 尝试只匹配token
      const m = text.match(/(sk-[\w-]+)/);
      if (m) {
        form.token = m[1];
        recognizeResult.value = { ok: true, message: '已提取Token，请补充用户名' };
      } else {
        recognizeResult.value = { ok: false, message: '无法识别，请手动输入' };
      }
    }
  } catch (e) {
    recognizeResult.value = { ok: false, message: '读取剪贴板失败' };
  }
  // 3秒后清除识别结果
  setTimeout(() => { recognizeResult.value = null; }, 3000);
}

// 从文本解析账户信息
function parseAccountFromClipboard(text) {
  if (!text) return null;
  const apiKey = text.match(/API Key[：:]\s*(\S+)/)?.[1] || text.match(/(sk-[\w-]+)/)?.[1];
  const username = text.match(/账户[：:]\s*(\S+)/)?.[1] || text.match(/用户名[：:]\s*(\S+)/)?.[1];
  if (apiKey && username) {
    return { username, token: apiKey };
  }
  return null;
}

function openAdd() {
  editing.value = null;
  form.username = '';
  form.token = '';
  form.error = '';
  recognizeResult.value = null;
  showAdd.value = true;
}

function openEdit(acc) {
  editing.value = acc.id;
  form.username = acc.username;
  form.token = acc.token;
  form.error = '';
  recognizeResult.value = null;
  showAdd.value = true;
}

function closeAdd() {
  showAdd.value = false;
  editing.value = null;
  form.username = '';
  form.token = '';
  form.error = '';
  recognizeResult.value = null;
}

async function saveAccount() {
  form.error = '';
  const u = form.username.trim();
  const t = form.token.trim();
  if (!u) { form.error = '用户名不能为空'; return; }
  if (!t) { form.error = 'Token不能为空'; return; }
  if (!editing.value) {
    addAccount({ username: u, token: t });
  } else {
    updateAccount(editing.value, { username: u, token: t });
  }
  closeAdd();
  refreshAll();
}

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
          error: null,
          updatedAt: Date.now()
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

function startTimer() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(refreshAll, intervalSec * 1000);
}

onMounted(() => {
  intervalSec = settings.value.refreshIntervalSeconds || 300;
  startTimer();
  if (accounts.value.length > 0) refreshAll();
});

onUnmounted(() => clearInterval(refreshTimer));

// 暴露给子组件
provide('accounts', accounts);
provide('accountData', accountData);
provide('refreshAll', refreshAll);
provide('deleteAccount', (id) => { deleteAccount(id); delete accountData.value[id]; saveAccountData(); });
provide('editAccount', openEdit);
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  background: #f5f5f5;
  color: #333;
}
.app.dark { background: #1a1a1a; color: #e0e0e0; }

header {
  position: sticky; top: 0; z-index: 100;
  background: #fff; border-bottom: 1px solid #eee;
  padding: 12px 16px;
  display: flex; align-items: center; justify-content: space-between;
  font-weight: bold; font-size: 16px;
}
.app.dark header { background: #2a2a2a; border-color: #333; }
.header-btns { display: flex; gap: 8px; }
.header-btns button {
  background: none; border: 1px solid #ddd; border-radius: 6px;
  padding: 4px 10px; cursor: pointer; font-size: 13px;
}
.app.dark .header-btns button { border-color: #444; color: #e0e0e0; }
.header-btns button:active { background: #eee; }
.app.dark .header-btns button:active { background: #333; }

/* 刷新按钮旋转动画 */
.spinning { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

main { padding-bottom: 40px; }

/* 右侧滑出弹窗 */
.layer-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 200; }
.layer-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: 85%; max-width: 400px;
  background: #fff; box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  display: flex; flex-direction: column;
  animation: slideIn 0.25s ease-out;
}
.layer-panel.dark { background: #2a2a2a; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.layer-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px; border-bottom: 1px solid #eee;
}
.layer-panel.dark .layer-header { border-color: #333; }
.layer-header h3 { font-size: 18px; }
.layer-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 0; line-height: 1; }
.layer-close:hover { color: #333; }
.layer-content { flex: 1; overflow-y: auto; }

/* 卡片 */
.card {
  background: #fff; border-radius: 12px; margin: 12px 16px; padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.app.dark .card { background: #2a2a2a; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.card-username { font-weight: bold; font-size: 16px; }
.card-actions { display: flex; gap: 6px; }
.card-actions button { background: none; border: 1px solid #ddd; border-radius: 6px; padding: 3px 8px; cursor: pointer; font-size: 12px; }
.app.dark .card-actions button { border-color: #444; color: #e0e0e0; }
.loading { height: 3px; background: #eee; border-radius: 2px; margin: 8px 0; overflow: hidden; }
.loading::after { content: ''; display: block; height: 100%; width: 40%; background: #1976D2; animation: load 1s infinite; }
@keyframes load { from { transform: translateX(-100%); } to { transform: translateX(350%); } }
.progress-bar { height: 6px; background: #eee; border-radius: 3px; margin: 8px 0; overflow: hidden; }
.app.dark .progress-bar { background: #333; }
.progress-fill { height: 100%; background: #4CAF50; border-radius: 3px; transition: width 0.3s; }
.progress-fill.warning { background: #FF9800; }
.progress-fill.danger { background: #F44336; }
.card-meta { display: flex; justify-content: space-between; font-size: 12px; color: #888; margin-top: 4px; }
.countdown { color: #1976D2; font-size: 12px; margin-top: 4px; }

/* 弹窗 */
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 12px; padding: 24px; width: 100%; max-width: 360px; }
.app.dark .modal { background: #2a2a2a; }
.modal h3 { margin-bottom: 16px; font-size: 18px; }
.modal label { display: block; font-size: 13px; color: #666; margin: 8px 0 4px; }
.app.dark .modal label { color: #aaa; }
.modal input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: #fafafa; }
.app.dark .modal input { border-color: #444; background: #333; color: #e0e0e0; }
.token-row { display: flex; gap: 6px; }
.token-row input { flex: 1; }
.token-row button { padding: 0 10px; border: 1px solid #ddd; border-radius: 8px; background: #f5f5f5; cursor: pointer; font-size: 12px; white-space: nowrap; }
.app.dark .token-row button { border-color: #444; background: #333; color: #e0e0e0; }
.recognize-result { font-size: 12px; padding: 6px 10px; border-radius: 6px; margin-top: 8px; }
.recognize-result.success { background: #E8F5E9; color: #2E7D32; }
.recognize-result.fail { background: #FFEBEE; color: #C62828; }
.error { color: #F44336; font-size: 13px; margin-top: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.modal-actions button { padding: 8px 16px; border-radius: 8px; cursor: pointer; border: 1px solid #ddd; background: #f5f5f5; font-size: 14px; }
.modal-actions button.primary { background: #1976D2; color: #fff; border: none; }
.app.dark .modal-actions button { background: #333; border-color: #444; color: #e0e0e0; }
.app.dark .modal-actions button.primary { background: #1976D2; color: #fff; border: none; }

/* 列表页 */
.empty { text-align: center; padding: 60px 0; color: #999; font-size: 15px; }
.list-item { padding: 12px 16px; border-bottom: 1px solid #f0; }
.app.dark .list-item { border-color: #333; }
.list-item-title { font-weight: 500; margin-bottom: 4px; }
.list-item-meta { font-size: 12px; color: #888; }

/* 表单 */
.form-group { padding: 12px 16px; }
.form-group label { display: block; font-size: 13px; color: #666; margin-bottom: 4px; }
.app.dark .form-group label { color: #aaa; }
.form-group input[type="text"], .form-group input[type="password"] {
  width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: #fff;
}
.app.dark .form-group input { border-color: #444; background: #333; color: #e0e0e0; }
.btn-row { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 16px 16px; }
.btn { padding: 8px 14px; border-radius: 8px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 13px; }
.btn.active { background: #1976D2; color: #fff; border-color: #1976D2; }
.app.dark .btn { background: #333; border-color: #444; color: #e0e0e0; }
.app.dark .btn.active { background: #1976D2; border-color: #1976D2; }

/* 设置页 */
.settings-section { padding: 16px; border-bottom: 1px solid #eee; }
.app.dark .settings-section { border-color: #333; }
.settings-title { font-weight: bold; margin-bottom: 12px; font-size: 15px; }
.toggle-row { display: flex; justify-content: space-between; align-items: center; }
.toggle { width: 44px; height: 24px; border-radius: 12px; background: #ccc; position: relative; cursor: pointer; transition: background 0.2s; }
.toggle.on { background: #1976D2; }
.toggle::after { content: ''; position: absolute; width: 20px; height: 20px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: left 0.2s; }
.toggle.on::after { left: 22px; }

/* 日志页 */
.log-tabs { display: flex; gap: 8px; padding: 12px 16px; overflow-x: auto; white-space: nowrap; }
.log-tab { padding: 4px 12px; border-radius: 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 12px; }
.log-tab.active { background: #1976D2; color: #fff; border-color: #1976D2; }
.app.dark .log-tab { background: #333; border-color: #444; color: #e0e0e0; }
.log-entry { background: #fff; border-radius: 8px; margin: 8px 16px; padding: 12px; font-size: 13px; }
.app.dark .log-entry { background: #2a2a2a; }
.log-entry-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.log-entry .success { color: #4CAF50; }
.log-entry .fail { color: #F44336; }
.log-detail { margin-top: 8px; font-size: 11px; color: #888; word-break: break-all; }
.app.dark .log-detail { color: #666; }
.log-empty { text-align: center; padding: 40px; color: #aaa; font-size: 14px; }
</style>
