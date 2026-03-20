import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { queryQuota } from '../services/api.js';

const AccountsContext = createContext(null);

const STORAGE_KEY = 'api_quota_accounts';

function loadAccounts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState(loadAccounts);
  const [accountData, setAccountData] = useState({});
  const refreshTimers = useRef({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const addAccount = useCallback(({ username, token }) => {
    const id = Math.random().toString(36).slice(2, 10);
    setAccounts(prev => [...prev, { id, username, token, createdAt: Date.now() }]);
    return id;
  }, []);

  const updateAccount = useCallback((id, data) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  }, []);

  const deleteAccount = useCallback((id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setAccountData(prev => { const n = { ...prev }; delete n[id]; return n; });
  }, []);

  const refreshAll = useCallback(async () => {
    const allData = { ...accountData };
    for (const acc of accounts) {
      allData[acc.id] = { ...(allData[acc.id] || {}), loading: true };
    }
    setAccountData(allData);

    for (const acc of accounts) {
      const { ok, status, body } = await queryQuota(acc.username, acc.token);
      if (ok && body.includes('"success":true')) {
        try {
          const json = JSON.parse(body);
          const d = json.data;
          setAccountData(prev => ({ ...prev, [acc.id]: {
            loading: false, planName: d.plan_name, amount: d.amount,
            amountUsed: d.amount_used, remaining: d.amount - d.amount_used,
            nextResetTime: d.next_reset_time, error: null, updatedAt: Date.now()
          }}));
        } catch {
          setAccountData(prev => ({ ...prev, [acc.id]: { loading: false, error: '解析失败' } }));
        }
      } else {
        const err = !ok ? `HTTP ${status}` : (body ? JSON.parse(body).message || '查询失败' : '空响应');
        setAccountData(prev => ({ ...prev, [acc.id]: { loading: false, error: err } }));
      }
    }
  }, [accounts]);

  const startRefreshTimer = useCallback((intervalSec) => {
    Object.values(refreshTimers.current).forEach(clearInterval);
    if (intervalSec <= 0) return;
    refreshTimers.current.main = setInterval(refreshAll, intervalSec * 1000);
  }, [refreshAll]);

  useEffect(() => {
    return () => Object.values(refreshTimers.current).forEach(clearInterval);
  }, []);

  useEffect(() => {
    if (accounts.length > 0) refreshAll();
  }, []);

  return (
    <AccountsContext.Provider value={{ accounts, accountData, addAccount, updateAccount, deleteAccount, refreshAll, startRefreshTimer }}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  return useContext(AccountsContext);
}
