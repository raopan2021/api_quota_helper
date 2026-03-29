/**
 * Home 页面
 * 账户列表首页
 */
import { useEffect } from 'react';
import { useAccounts } from '../stores/useAccounts.jsx';
import { useSettings } from '../stores/useSettings.jsx';
import AccountCard from '../components/AccountCard.jsx';

export default function Home({ onEdit, accountData, refreshing, onRefresh, onDelete }) {
  const { accounts } = useAccounts();
  const { settings } = useSettings();

  const darkMode = settings.darkMode;
  const bg = darkMode ? '#1a1a1a' : '#f5f5f5';

  // 空状态
  if (accounts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#999',
        fontSize: '15px',
        background: bg,
        minHeight: '60vh',
      }}>
        <p>暂无账户</p>
        <p style={{ fontSize: '13px', marginTop: '8px', color: '#bbb' }}>
          点击上方 + 添加账户
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '12px 0' }}>
      {accounts.map(acc => (
        <div key={acc.id} style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px' }}>
          <AccountCard
            account={acc}
            data={accountData[acc.id]}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onEdit={() => onEdit(acc)}
            onDelete={() => onDelete(acc.id)}
          />
        </div>
      ))}
    </div>
  );
}
