import { useState, useEffect } from 'react';
import { useAccounts } from '../stores/useAccounts.jsx';
import { useLogs } from '../stores/useLogs.jsx';

export default function Home({ onEdit }) {
  const { accounts, accountData, refreshAll, deleteAccount } = useAccounts();
  const { log: addLog } = useLogs();
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

  function pclass(d) {
    const p = pct(d);
    if (p > 80) return 'danger';
    if (p > 50) return 'warning';
    return '';
  }

  if (accounts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '15px' }}>
        <p>暂无账户</p>
        <p style={{ fontSize: '13px', marginTop: '8px', color: '#bbb' }}>点击底部 + 添加账户</p>
      </div>
    );
  }

  return (
    <div>
      {accounts.map(acc => {
        const d = accountData[acc.id];
        return (
          <div key={acc.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.username}>{acc.username}</span>
              <div style={styles.actions}>
                <button style={styles.btn} onClick={handleRefresh} disabled={refreshing}>刷新</button>
                <button style={styles.btn} onClick={() => onEdit(acc)}>编辑</button>
                <button style={{...styles.btn, color: '#F44336'}} onClick={() => deleteAccount(acc.id)}>删除</button>
              </div>
            </div>
            {d?.loading && <div style={styles.loadingBar} />}
            {d?.error && <p style={{ color: '#F44336', fontSize: '13px', marginTop: '8px' }}>{d.error}</p>}
            {d && !d.loading && !d.error && (
              <>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>{d.planName}</p>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${pct(d)}%`, background: pclass(d) === 'danger' ? '#F44336' : pclass(d) === 'warning' ? '#FF9800' : '#4CAF50' }} />
                </div>
                <div style={styles.meta}>
                  <span>已用: {d.amountUsed?.toFixed(1)}</span>
                  <span>剩余: {d.remaining?.toFixed(1)}</span>
                </div>
                {d.nextResetTime && <p style={{ color: '#1976D2', fontSize: '12px', marginTop: '4px' }}>重置: {d.nextResetTime}</p>}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: '12px', margin: '12px 16px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  username: { fontWeight: 'bold', fontSize: '16px' },
  actions: { display: 'flex', gap: '6px' },
  btn: { background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' },
  loadingBar: { height: '3px', background: '#eee', borderRadius: '2px', margin: '8px 0', overflow: 'hidden' },
  progressBar: { height: '6px', background: '#eee', borderRadius: '3px', margin: '8px 0', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  meta: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginTop: '4px' },
};
