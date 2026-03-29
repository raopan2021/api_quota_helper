/**
 * Header 组件
 * 顶部导航栏，包含标题和操作按钮
 */
import { useSettings } from '../stores/useSettings.jsx';

export default function Header({ refreshing, onOpenLogs, onOpenSettings, onRefresh }) {
  const { settings } = useSettings();
  const darkMode = settings.darkMode;

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: darkMode ? '#1a1a1a' : '#ffffff',
    borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`,
    paddingTop: 'max(12px, env(safe-area-inset-top))',
    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    paddingLeft: '16px',
    paddingRight: '16px',
  };

  const btnStyle = {
    padding: '4px 10px',
    fontSize: '13px',
    borderRadius: '6px',
    border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
    background: darkMode ? '#2a2a2a' : '#fff',
    color: darkMode ? '#e0e0e0' : '#333',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const refreshBtnStyle = {
    ...btnStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
  };

  return (
    <header style={headerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
        <span style={{ fontWeight: 'bold', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          API 额度助手
        </span>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button style={btnStyle} onClick={onOpenLogs}>日志</button>
          <button style={btnStyle} onClick={onOpenSettings}>设置</button>
          <button style={refreshBtnStyle} onClick={onRefresh} disabled={refreshing}>
            <span style={{
              display: 'inline-block',
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }}>⟳</span>
          </button>
        </div>
      </div>
      {/* 旋转动画 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
