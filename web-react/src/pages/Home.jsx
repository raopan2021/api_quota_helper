import { useState, useEffect } from 'react';
import { useAccounts } from '../stores/useAccounts.jsx';
import { useSettings } from '../stores/useSettings.jsx';

export default function Home({ onEdit }) {
  const { accounts, accountData, refreshAll, deleteAccount } = useAccounts();
  const { settings } = useSettings();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && Object.keys(accountData).length === 0) {
      refreshAll();
    }
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }

  function pct(d) {
    if (!d || !d.amount) return 0;
    return Math.min(100, (d.amountUsed / d.amount) * 100);
  }

  function getColor(d) {
    const p = pct(d);
    if (p > 80) return '#F44336';
    if (p > 50) return '#FF9800';
    return '#4CAF50';
  }

  const bg = settings.darkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBg = settings.darkMode ? '#2a2a2a' : '#fff';
  const textColor = settings.darkMode ? '#e0e0e0' : '#333';
  const metaColor = settings.darkMode ? '#888' : '#888';

  if (accounts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999', fontSize: '15px' }}>
        <p>暂无账户</p>
        <p style={{ fontSize: '13px', marginTop: '8px', color: '#bbb' }}>点击上方 + 添加账户</p>
      </div>
    );
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '12px 0' }}>
      {accounts.map(acc => {
        const d = accountData[acc.id];
        return (
          <div key={acc.id} style={cardWrapStyle}>
            <div style={{ ...cardStyle, background: cardBg }}>
              <div style={{ ...cardHeaderStyle, borderColor: settings.darkMode ? '#333' : '#eee' }}>
                <span style={{ ...usernameStyle, color: textColor }}>{acc.username}</span>
                <div style={actionsStyle}>
                  <button style={{ ...btnStyle, borderColor: settings.darkMode ? '#444' : '#ddd', color: textColor }} onClick={handleRefresh} disabled={refreshing}>刷新</button>
                  <button style={{ ...btnStyle, borderColor: settings.darkMode ? '#444' : '#ddd', color: textColor }} onClick={() => onEdit(acc)}>编辑</button>
                  <button style={{ ...btnStyle, borderColor: settings.darkMode ? '#444' : '#ddd', color: '#F44336' }} onClick={() => deleteAccount(acc.id)}>删除</button>
                </div>
              </div>
              {d?.loading && <div style={{ ...loadingBarStyle, background: settings.darkMode ? '#333' : '#eee' }} />}
              {d?.error && <p style={{ color: '#F44336', fontSize: '13px', marginTop: '8px' }}>{d.error}</p>}
              {d && !d.loading && !d.error && (
                <>
                  <p style={{ fontSize: '13px', opacity: 0.7, color: metaColor }}>{d.planName}</p>
                  <div style={{ ...progressBarStyle, background: settings.darkMode ? '#333' : '#eee' }}>
                    <div style={{ ...progressFillStyle, width: `${pct(d)}%`, background: getColor(d) }} />
                  </div>
                  <div style={{ ...metaStyle, color: metaColor }}>
                    <span>已用: {d.amountUsed?.toFixed(1)}</span>
                    <span>剩余: {d.remaining?.toFixed(1)}</span>
                  </div>
                  {d.nextResetTime && <p style={{ color: '#1976D2', fontSize: '12px', marginTop: '4px' }}>重置: {d.nextResetTime}</p>}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const cardWrapStyle = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '0 16px',
};

const cardStyle = {
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  marginBottom: '12px',
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  borderBottom: '1px solid #eee',
  paddingBottom: '8px',
};

const usernameStyle = { fontWeight: 'bold', fontSize: '16px' };

const actionsStyle = { display: 'flex', gap: '6px' };

const btnStyle = {
  background: 'none',
  border: '1px solid #ddd',
  borderRadius: '6px',
  padding: '3px 8px',
  cursor: 'pointer',
  fontSize: '12px',
};

const loadingBarStyle = {
  height: '3px',
  borderRadius: '2px',
  margin: '8px 0',
  overflow: 'hidden',
};

const progressBarStyle = {
  height: '6px',
  borderRadius: '3px',
  margin: '8px 0',
  overflow: 'hidden',
};

const progressFillStyle = {
  height: '100%',
  borderRadius: '3px',
  transition: 'width 0.3s',
};

const metaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  marginTop: '4px',
};
