/**
 * FloatingButtons 组件
 * 右下角浮动操作按钮
 */
export default function FloatingButtons({ onAdd, onRefresh, refreshing }) {
  const btnBaseStyle = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.2s, opacity 0.2s',
    fontSize: '18px',
  };

  const addBtnStyle = {
    ...btnBaseStyle,
    background: 'var(--color-primary)',
    color: '#fff',
  };

  const refreshBtnStyle = {
    ...btnBaseStyle,
    background: 'var(--color-bg-card)',
    color: 'var(--color-text)',
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none', // 容器不捕获事件
    }}>
      {/* 刷新按钮 */}
      <button
        style={{
          ...refreshBtnStyle,
          opacity: refreshing ? 0.6 : 1,
          pointerEvents: 'auto',
        }}
        onClick={onRefresh}
        disabled={refreshing}
      >
        <span style={{
          display: 'inline-block',
          animation: refreshing ? 'spin 1s linear infinite' : 'none',
        }}>⟳</span>
        <span style={{
          fontSize: '10px',
          marginTop: '2px',
        }}>刷新</span>
      </button>

      {/* 添加按钮 */}
      <button
        style={{
          ...addBtnStyle,
          pointerEvents: 'auto',
        }}
        onClick={onAdd}
      >
        <span>+</span>
        <span style={{
          fontSize: '10px',
          marginTop: '2px',
        }}>添加</span>
      </button>
    </div>
  );
}
