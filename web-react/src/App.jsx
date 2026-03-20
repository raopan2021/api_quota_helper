import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AccountsProvider, useAccounts } from './stores/useAccounts.jsx';
import { LogsProvider } from './stores/useLogs.jsx';
import { SettingsProvider, useSettings } from './stores/useSettings.jsx';
import Home from './pages/Home.jsx';
import Logs from './pages/Logs.jsx';
import Settings from './pages/Settings.jsx';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const { accounts, addAccount, updateAccount, refreshAll } = useAccounts();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', token: '', error: '' });
  const [showToken, setShowToken] = useState(false);

  function openAdd() {
    setEditing(null);
    setForm({ username: '', token: '', error: '' });
    setShowAdd(true);
  }

  function openEdit(acc) {
    setEditing(acc);
    setForm({ username: acc.username, token: acc.token, error: '' });
    setShowAdd(true);
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
    setShowAdd(false);
    setEditing(null);
    setTimeout(() => navigate('/'), 0);
  }

  async function scanClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const m = text.match(/(sk-[\w-]+)/);
      if (m) { setForm(f => ({ ...f, token: m[1] })); return; }
      const u = text.match(/账户[：:]\s*(\S+)/);
      if (u) setForm(f => ({ ...f, username: u[1] }));
    } catch {}
  }

  return (
    <div style={{ ...styles.app, background: settings.darkMode ? '#1a1a1a' : '#f5f5f5', color: settings.darkMode ? '#e0e0e0' : '#333' }}>
      {/* Header */}
      <header style={{ ...styles.header, background: settings.darkMode ? '#2a2a2a' : '#fff', borderColor: settings.darkMode ? '#333' : '#eee' }}>
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>API 额度助手</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={styles.headerBtn} onClick={() => navigate('/logs')}>日志</button>
          <button style={styles.headerBtn} onClick={() => navigate('/settings')}>设置</button>
          <button style={styles.headerBtn} onClick={refreshAll}>刷新</button>
        </div>
      </header>

      {/* Main */}
      <main style={{ paddingBottom: '80px' }}>
        <Routes>
          <Route path="/" element={<Home onEdit={openEdit} />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Bottom Nav */}
      <nav style={{ ...styles.nav, background: settings.darkMode ? '#2a2a2a' : '#fff', borderColor: settings.darkMode ? '#333' : '#eee' }}>
        <button style={{ ...styles.navBtn, color: location.pathname === '/' ? '#1976D2' : '#666', fontWeight: location.pathname === '/' ? 'bold' : 'normal' }} onClick={() => navigate('/')}>账户</button>
        <button style={styles.addBtn} onClick={openAdd}>+</button>
        <button style={{ ...styles.navBtn, color: location.pathname === '/logs' ? '#1976D2' : '#666', fontWeight: location.pathname === '/logs' ? 'bold' : 'normal' }} onClick={() => navigate('/logs')}>日志</button>
      </nav>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={styles.modalMask} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ ...styles.modal, background: settings.darkMode ? '#2a2a2a' : '#fff' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>{editing ? '编辑账户' : '添加账户'}</h3>
            <label style={styles.label}>用户名</label>
            <input style={{ ...styles.input, background: settings.darkMode ? '#333' : '#fafafa', borderColor: settings.darkMode ? '#444' : '#ddd', color: settings.darkMode ? '#e0e0e0' : '#333' }} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="username" />
            <label style={styles.label}>Token</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input style={{ ...styles.input, flex: 1, background: settings.darkMode ? '#333' : '#fafafa', borderColor: settings.darkMode ? '#444' : '#ddd', color: settings.darkMode ? '#e0e0e0' : '#333' }} type={showToken ? 'text' : 'password'} value={form.token} onChange={e => setForm(f => ({ ...f, token: e.target.value }))} placeholder="sk-xxxx" />
              <button style={styles.smallBtn} onClick={() => setShowToken(!showToken)}>{showToken ? '隐藏' : '显示'}</button>
              <button style={styles.smallBtn} onClick={scanClipboard}>扫描</button>
            </div>
            {form.error && <p style={{ color: '#F44336', fontSize: '13px', marginTop: '8px' }}>{form.error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>取消</button>
              <button style={{ ...styles.cancelBtn, background: '#1976D2', color: '#fff', border: 'none' }} onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AccountsProvider>
          <LogsProvider>
            <AppContent />
          </LogsProvider>
        </AccountsProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

const styles = {
  app: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", minHeight: '100vh' },
  header: { position: 'sticky', top: 0, zIndex: 100, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid' },
  headerBtn: { background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px' },
  nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0 max(8px, env(safe-area-inset-bottom))', borderTop: '1px solid', zIndex: 100 },
  navBtn: { border: 'none', background: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', fontSize: '14px' },
  addBtn: { background: '#1976D2', color: '#fff', border: 'none', borderRadius: '50%', width: '48px', height: '48px', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-20px', boxShadow: '0 4px 12px rgba(25,118,210,0.4)' },
  modalMask: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  modal: { borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '360px' },
  label: { display: 'block', fontSize: '13px', color: '#666', margin: '8px 0 4px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  smallBtn: { padding: '0 10px', border: '1px solid #ddd', borderRadius: '8px', background: '#f5f5f5', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' },
  cancelBtn: { padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ddd', background: '#f5f5f5', fontSize: '14px' },
};
