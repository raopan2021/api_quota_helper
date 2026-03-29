/**
 * Header 组件
 * 顶部导航栏
 */
import { useSettings } from '../stores/useSettings.jsx';

export default function Header({ refreshing, onOpenLogs, onOpenSettings, onRefresh }) {
  const { settings } = useSettings();

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--color-bg-card)',
    borderBottom: '1px solid var(--color-border)',
    paddingTop: 'max(12px, env(safe-area-inset-top))',
    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    paddingLeft: '16px',
    paddingRight: '16px',
  };

  const btnStyle = {
    padding: '4px 10px',
    fontSize: '13px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-btn-bg)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const primaryBtnStyle = {
    ...btnStyle,
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: '#fff',
  };

  return (
    <header style={headerStyle}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
      }}>
        <span style={{
          fontWeight: 'bold',
          fontSize: '16px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'var(--color-text)',
        }}>
          API 额度助手
        </span>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {/* 添加按钮 - 主要操作 */}
          <button
            style={primaryBtnStyle}
            onClick={onOpenAdd}
          >
            + 添加
          </button>

          {/* 日志按钮 */}
          <button
            style={btnStyle}
            onClick={onOpenLogs}
          >
            日志
          </button>

          {/* 设置按钮 */}
          <button
            style={btnStyle}
            onClick={onOpenSettings}
          >
            设置
          </button>

          {/* 刷新按钮 */}
          <button
            style={{
              ...btnStyle,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '32px',
            }}
            onClick={onRefresh}
            disabled={refreshing}
          >
            <span style={{
              display: 'inline-block',
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }}>
              ⟳
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
