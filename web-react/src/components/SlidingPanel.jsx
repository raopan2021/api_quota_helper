/**
 * SlidingPanel 组件
 * 右侧滑入面板，用于显示日志和设置
 */
import { useSettings } from '../stores/useSettings.jsx';

export default function SlidingPanel({ show, title, onClose, children }) {
  const { settings } = useSettings();
  const darkMode = settings.darkMode;

  if (!show) return null;

  const maskStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 200,
    display: 'flex',
    justifyContent: 'flex-end',
  };

  const panelStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    width: '85%',
    maxWidth: '400px',
    background: darkMode ? '#1a1a1a' : '#fff',
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.25s ease-out',
    paddingBottom: 'env(safe-area-inset-bottom)',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`,
    paddingTop: 'max(16px, env(safe-area-inset-top))',
  };

  const closeBtnStyle = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: darkMode ? '#666' : '#999',
    padding: 0,
    lineHeight: 1,
  };

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
  };

  return (
    <div style={maskStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: darkMode ? '#e0e0e0' : '#333' }}>
            {title}
          </h3>
          <button style={closeBtnStyle} onClick={onClose}>×</button>
        </div>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
      {/* 滑入动画 */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
