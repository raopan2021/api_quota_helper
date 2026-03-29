/**
 * App 根组件
 * API 额度助手 - React 版本
 */
import { useState, useEffect, useCallback } from 'react';
import { AccountsProvider, useAccounts } from './stores/useAccounts.jsx';
import { LogsProvider, useLogs } from './stores/useLogs.jsx';
import { SettingsProvider, useSettings } from './stores/useSettings.jsx';
import Header from './components/Header.jsx';
import SlidingPanel from './components/SlidingPanel.jsx';
import AddEditModal from './components/AddEditModal.jsx';
import Home from './pages/Home.jsx';
import Logs from './pages/Logs.jsx';
import Settings from './pages/Settings.jsx';

function AppContent() {
  const { settings } = useSettings();
  const { accounts, addAccount, updateAccount, deleteAccount, refreshAll, accountData } = useAccounts();
  const { log: addLog } = useLogs();

  const [showLogs, setShowLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 定时刷新
  useEffect(() => {
    const intervalSec = settings.refreshIntervalSeconds || 300;
    if (intervalSec > 0 && accounts.length > 0) {
      const timer = setInterval(() => {
        refreshAll();
      }, intervalSec * 1000);
      return () => clearInterval(timer);
    }
  }, [settings.refreshIntervalSeconds, accounts.length, refreshAll]);

  // 初始加载时刷新
  useEffect(() => {
    if (accounts.length > 0) {
      refreshAll();
    }
  }, []);

  // 打开添加弹窗
  function openAdd() {
    setEditing(null);
    setShowAdd(true);
  }

  // 打开编辑弹窗
  function openEdit(acc) {
    setEditing(acc);
    setShowAdd(true);
  }

  // 关闭添加弹窗
  function closeAdd() {
    setShowAdd(false);
    setEditing(null);
  }

  // 保存账户
  function handleSave({ username, token }) {
    if (editing) {
      updateAccount(editing.id, { username, token });
    } else {
      addAccount({ username, token });
    }
    closeAdd();
    refreshAll();
  }

  // 刷新
  async function handleRefresh() {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }

  const darkMode = settings.darkMode;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: darkMode ? '#1a1a1a' : '#f5f5f5',
      color: darkMode ? '#e0e0e0' : '#333',
    }}>
      {/* 顶部导航 */}
      <Header
        refreshing={refreshing}
        onOpenAdd={openAdd}
        onOpenLogs={() => setShowLogs(true)}
        onOpenSettings={() => setShowSettings(true)}
        onRefresh={handleRefresh}
      />

      {/* 主内容区 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '80px',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}>
        <Home
          onEdit={openEdit}
          accountData={accountData}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onDelete={deleteAccount}
        />
      </main>

      {/* 右滑日志面板 */}
      <SlidingPanel
        show={showLogs}
        title="日志"
        onClose={() => setShowLogs(false)}
      >
        <Logs />
      </SlidingPanel>

      {/* 右滑设置面板 */}
      <SlidingPanel
        show={showSettings}
        title="设置"
        onClose={() => setShowSettings(false)}
      >
        <Settings />
      </SlidingPanel>

      {/* 添加/编辑弹窗 */}
      <AddEditModal
        show={showAdd}
        editing={editing}
        onClose={closeAdd}
        onSave={handleSave}
      />
    </div>
  );
}

// 根组件
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
