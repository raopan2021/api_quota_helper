import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Account, QuotaInfo } from '../models/account';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

interface AppContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  darkMode: boolean;
  refreshInterval: number;
  addAccount: (name: string, apiKey: string, apiUrl: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  updateAccount: (id: string, name: string, apiKey: string, apiUrl: string) => Promise<void>;
  selectAccount: (account: Account) => void;
  refreshQuota: () => Promise<void>;
  setDarkMode: (value: boolean) => Promise<void>;
  setRefreshInterval: (minutes: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkModeState] = useState(false);
  const [refreshInterval, setRefreshIntervalState] = useState(5);

  // 初始化加载
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedAccounts, settings] = await Promise.all([
        storageService.loadAccounts(),
        storageService.loadSettings(),
      ]);
      
      setAccounts(loadedAccounts);
      setDarkModeState(settings.darkMode || false);
      setRefreshIntervalState(settings.refreshInterval || 5);
      
      if (loadedAccounts.length > 0) {
        setSelectedAccount(loadedAccounts[0]);
        // 初始刷新额度
        refreshQuotaForAccount(loadedAccounts[0]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const refreshQuotaForAccount = async (account: Account) => {
    setIsLoading(true);
    try {
      const quotaInfo: QuotaInfo = await apiService.fetchQuota(account);
      const updatedAccount = {
        ...account,
        quotaInfo,
        lastRefresh: new Date().toISOString(),
      };
      
      setAccounts(prev => prev.map(a => a.id === account.id ? updatedAccount : a));
      if (selectedAccount?.id === account.id) {
        setSelectedAccount(updatedAccount);
      }
      
      // 保存到本地
      await storageService.updateAccount(updatedAccount);
    } catch (error) {
      console.error('Failed to refresh quota:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAccount = async (name: string, apiKey: string, apiUrl: string) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name,
      apiKey,
      apiUrl,
    };
    
    await storageService.addAccount(newAccount);
    setAccounts(prev => [...prev, newAccount]);
    
    if (!selectedAccount) {
      setSelectedAccount(newAccount);
      refreshQuotaForAccount(newAccount);
    }
  };

  const deleteAccount = async (id: string) => {
    await storageService.deleteAccount(id);
    const filtered = accounts.filter(a => a.id !== id);
    setAccounts(filtered);
    
    if (selectedAccount?.id === id) {
      setSelectedAccount(filtered.length > 0 ? filtered[0] : null);
    }
  };

  const updateAccount = async (id: string, name: string, apiKey: string, apiUrl: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    
    const updatedAccount = { ...account, name, apiKey, apiUrl };
    await storageService.updateAccount(updatedAccount);
    
    setAccounts(prev => prev.map(a => a.id === id ? updatedAccount : a));
    if (selectedAccount?.id === id) {
      setSelectedAccount(updatedAccount);
      refreshQuotaForAccount(updatedAccount);
    }
  };

  const selectAccount = (account: Account) => {
    setSelectedAccount(account);
  };

  const refreshQuota = async () => {
    if (selectedAccount) {
      await refreshQuotaForAccount(selectedAccount);
    }
  };

  const setDarkMode = async (value: boolean) => {
    setDarkModeState(value);
    await storageService.saveSettings({ darkMode: value, refreshInterval });
  };

  const setRefreshInterval = async (minutes: number) => {
    setRefreshIntervalState(minutes);
    await storageService.saveSettings({ darkMode, refreshInterval: minutes });
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        selectedAccount,
        isLoading,
        darkMode,
        refreshInterval,
        addAccount,
        deleteAccount,
        updateAccount,
        selectAccount,
        refreshQuota,
        setDarkMode,
        setRefreshInterval,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
