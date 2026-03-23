import { useState } from 'react';
import { AccountsProvider, useAccounts } from './stores/useAccounts.jsx';
import { LogsProvider, useLogs } from './stores/useLogs.jsx';
import { SettingsProvider, useSettings } from './stores/useSettings.jsx';
import Home from './pages/Home.jsx';
import Logs from './pages/Logs.jsx';
import Settings from './pages/Settings.jsx';

function AppContent() {
  const { settings } = useSettings();
  const { accounts, addAccount, updateAccount, refreshAll } = useAccounts();
  const [showLogs, setShowLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', token: '', error: '' });
  const [recognizeResult, setRecognizeResult] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recognizeText, setRecognizeText] = useState('');

  function openAdd() {
    setEditing(null);
    setForm({ username: '', token: '', error: '' });
    setRecognizeResult(null);
    setRecognizeText('');
    setShowAdd(true);
  }

  function openEdit(acc) {
    setEditing(acc);
    setForm({ username: acc.username, token: acc.token, error: '' });
    setRecognizeResult(null);
    setShowAdd(true);
  }

  function closeAdd() {
    setShowAdd(false);
    setEditing(null);
    setForm({ username: '', token: '', error: '' });
    setRecognizeResult(null);
    setRecognizeText('');
  }

  async function handleSave() {
    const u = form.username.trim();
    const t = form.token.trim();
    if (!u) { setForm(f => ({ ...f, error: '用户名不能为空' })); return; }
    if (!t) { setForm(f => ({ ...f, error: 'Token不能为空' })); return; }
    if (!editing) {
      addAccount({ username: u, token: t });
    } else {
      updateAccount(editing.id, { username: u, token: t });
    }
    closeAdd();
    refreshAll();
  }

  // 自动识别：从剪贴板读取混合文本，解析后填入上方表单
  async function handleAutoRecognize() {
    let text = recognizeText.trim();
    if (!text) {
      try {
        text = await navigator.clipboard.readText();
      } catch {
        setRecognizeResult({ ok: false, message: '读取剪贴板失败，请手动粘贴' });
        setTimeout(() => setRecognizeResult(null), 3000);
        return;
      }
    }
    const result = parseAccount(text);
    if (result) {
      setForm(f => ({ ...f, username: result.username, token: result.token }));
      setRecognizeResult({ ok: true, message: `识别成功：${result.username}` });
    } else {
      const m = text.match(/(sk-[\w-]+)/);
      if (m) {
        setForm(f => ({ ...f, token: m[1] }));
        setRecognizeResult({ ok: true, message: '已提取 Token，请补充用户名' });
      } else {
        setRecognizeResult({ ok: false, message: '无法识别，请手动输入' });
      }
    }
    setTimeout(() => setRecognizeResult(null), 3000);
  }

  // 从文本解析账户信息
  function parseAccount(text) {
    if (!text) return null;
    const apiKey = text.match(/API Key[：:]\s*(\S+)/)?.[1] || text.match(/(sk-[\w-]+)/)?.[1];
    const username = text.match(/账户[：:]\s*(\S+)/)?.[1] || text.match(/用户名[：:]\s*(\S+)/)?.[1];
    if (apiKey && username) {
      return { username, token: apiKey };
    }
    return null;
  }

  async function handleRefresh() {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }

  return (
    <div className="min-h-screen dvh flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200" style={settings.darkMode ? {} : {}}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
        <span className="font-bold text-base truncate">API 额度助手</span>
        <div className="flex gap-2 flex-shrink-0">
          <button className="px-3 py-1 text-sm rounded-md border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 transition-colors" onClick={openAdd}>+ 添加</button>
          <button className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setShowLogs(true)}>日志</button>
          <button className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setShowSettings(true)}>设置</button>
          <button className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={handleRefresh} disabled={refreshing}>
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>⟳</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ paddingBottom: '40px', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', flex: 1, overflowY: 'auto' }}>
        <Home onEdit={openEdit} />
      </main>

      
      {/* 右侧日志弹窗 */}
      {showLogs && (
        <div style={styles.layerMask} onClick={e => e.target === e.currentTarget && setShowLogs(false)}>
          <div style={{ ...styles.layerPanel, background: settings.darkMode ? '#2a2a2a' : '#fff' }}>
            <div style={{ ...styles.layerHeader, borderColor: settings.darkMode ? '#333' : '#eee' }}>
              <h3 style={{ fontSize: '18px', margin: 0 }}>日志</h3>
              <button style={styles.layerClose} onClick={() => setShowLogs(false)}>×</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <Logs />
            </div>
          </div>
        </div>
      )}

      {/* 右侧设置弹窗 */}
      {showSettings && (
        <div style={styles.layerMask} onClick={e => e.target === e.currentTarget && setShowSettings(false)}>
          <div style={{ ...styles.layerPanel, background: settings.darkMode ? '#2a2a2a' : '#fff' }}>
            <div style={{ ...styles.layerHeader, borderColor: settings.darkMode ? '#333' : '#eee' }}>
              <h3 style={{ fontSize: '18px', margin: 0 }}>设置</h3>
              <button style={styles.layerClose} onClick={() => setShowSettings(false)}>×</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <Settings />
            </div>
          </div>
        </div>
      )}

      {/* 添加/编辑账户弹窗 */}
      {showAdd && (
        <div style={styles.modalMask} onClick={e => e.target === e.currentTarget && closeAdd()}>
          <div style={{ ...styles.modal, background: settings.darkMode ? '#2a2a2a' : '#fff' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>{editing ? '编辑账户' : '添加账户'}</h3>
            <label style={{ ...styles.label, color: settings.darkMode ? '#aaa' : '#666' }}>用户名</label>
            <input
              style={{ ...styles.input, background: settings.darkMode ? '#333' : '#fafafa', borderColor: settings.darkMode ? '#444' : '#ddd', color: settings.darkMode ? '#e0e0e0' : '#333' }}
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="输入或粘贴用户名"
            />

            <label style={{ ...styles.label, color: settings.darkMode ? '#aaa' : '#666' }}>Token</label>
            <input
              style={{ ...styles.input, background: settings.darkMode ? '#333' : '#fafafa', borderColor: settings.darkMode ? '#444' : '#ddd', color: settings.darkMode ? '#e0e0e0' : '#333', fontFamily: 'monospace' }}
              value={form.token}
              onChange={e => setForm(f => ({ ...f, token: e.target.value }))}
              placeholder="粘贴 Token，sk-xxxx"
            />

            <div style={{ ...styles.divider }}>
              <span style={styles.dividerLine} />
              <span style={{ ...styles.dividerText, color: settings.darkMode ? '#555' : '#999' }}>或从剪贴板自动识别</span>
              <span style={styles.dividerLine} />
            </div>

            <textarea
              style={{ ...styles.textarea, background: settings.darkMode ? '#333' : '#fafafa', borderColor: settings.darkMode ? '#444' : '#ddd', color: settings.darkMode ? '#e0e0e0' : '#333' }}
              value={recognizeText}
              onChange={e => setRecognizeText(e.target.value)}
              placeholder="粘贴包含用户名和 Token 的混合文本，点击识别自动填充上方字段"
              rows={3}
            />
            <button style={{ ...styles.smallBtn, marginTop: '6px', width: '100%', background: '#f0f7ff', borderColor: '#1677ff', color: '#1677ff' }} onClick={handleAutoRecognize}>
              🎯 自动识别并填充上方
            </button>
            {recognizeResult && (
              <div style={{ ...styles.recognizeResult, background: recognizeResult.ok ? '#E8F5E9' : '#FFEBEE', color: recognizeResult.ok ? '#2E7D32' : '#C62828' }}>
                {recognizeResult.message}
              </div>
            )}
            {form.error && <p style={{ color: '#F44336', fontSize: '13px', marginTop: '8px' }}>{form.error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button style={{ ...styles.cancelBtn, background: settings.darkMode ? '#333' : '#f5f5f5', color: settings.darkMode ? '#e0e0e0' : '#333' }} onClick={closeAdd}>取消</button>
              <button style={{ ...styles.cancelBtn, background: '#1976D2', color: '#fff', border: 'none' }} onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 旋转动画样式 */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AccountsProvider>
        <LogsProvider>
          <AppContent />
        </LogsProvider>
      </AccountsProvider>
    </SettingsProvider>
  );
}

const styles = {
  app: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", minHeight: '100vh' },
  header: { position: 'sticky', top: 0, zIndex: 100, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid' },
  headerBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px' },
  modalMask: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  modal: { borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '360px' },
  label: { display: 'block', fontSize: '13px', margin: '8px 0 4px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  tokenDisplay: { padding: '10px 12px', border: '1px solid', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'monospace' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'monospace', resize: 'none', lineHeight: '1.5', display: 'block' },
  divider: { display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0 8px' },
  dividerLine: { flex: 1, height: '1px', background: '#eee' },
  dividerText: { fontSize: '12px', whiteSpace: 'nowrap' },
  smallBtn: { padding: '8px 14px', border: '1px solid #ddd', borderRadius: '8px', background: '#f5f5f5', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' },
  cancelBtn: { padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ddd', background: '#f5f5f5', fontSize: '14px' },
  recognizeResult: { fontSize: '12px', padding: '6px 10px', borderRadius: '6px', marginTop: '8px' },
  layerMask: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 },
  layerPanel: { position: 'fixed', top: 0, right: 0, bottom: 0, width: '85%', maxWidth: '400px', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.25s ease-out' },
  layerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' },
  layerClose: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999', padding: 0, lineHeight: 1 },
};
