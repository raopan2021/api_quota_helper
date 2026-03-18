/**
 * 应用全局状态管理
 * 使用 React Context 实现状态共享和组件间通信
 * 作者: raopan2021
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Account, QuotaInfo } from '../models/account';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

/**
 * 应用上下文类型定义
 */
interface AppContextType {
  accounts: Account[];                    // 账户列表
  selectedAccount: Account | null;        // 当前选中的账户
  isLoading: boolean;                     // 是否正在加载
  darkMode: boolean;                      // 是否开启暗黑模式
  refreshInterval: number;                 // 自动刷新间隔（分钟）
  addAccount: (name: string, apiKey: string, apiUrl: string) => Promise<void>;    // 添加账户
  deleteAccount: (id: string) => Promise<void>;                                  // 删除账户
  updateAccount: (id: string, name: string, apiKey: string, apiUrl: string) => Promise<void>;  // 更新账户
  selectAccount: (account: Account) => void;                                      // 选择账户
  refreshQuota: () => Promise<void>;                                             // 刷新额度
  setDarkMode: (value: boolean) => Promise<void>;                                // 设置暗黑模式
  setRefreshInterval: (minutes: number) => Promise<void>;                         // 设置刷新间隔
}

// 创建上下文
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * 使用上下文的 Hook
 * @returns 上下文对象
 * @throws 如果不在 AppProvider 内部使用，抛出错误
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

/**
 * AppProvider 组件属性
 */
interface AppProviderProps {
  children: ReactNode;  // 子组件
}

/**
 * 应用状态提供者组件
 * 提供全局状态管理和数据持久化
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // 状态定义
  const [accounts, setAccounts] = useState<Account[]>([]);           // 账户列表
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);  // 当前选中的账户
  const [isLoading, setIsLoading] = useState(false);                 // 加载状态
  const [darkMode, setDarkModeState] = useState(false);              // 暗黑模式
  const [refreshInterval, setRefreshIntervalState] = useState(5);   // 刷新间隔（分钟）

  /**
   * 初始化加载数据
   * 页面加载时从本地存储读取账户和设置
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载数据函数
   * 异步加载账户列表和应用设置
   */
  const loadData = async () => {
    try {
      const [loadedAccounts, settings] = await Promise.all([
        storageService.loadAccounts(),
        storageService.loadSettings(),
      ]);
      
      setAccounts(loadedAccounts);
      setDarkModeState(settings.darkMode || false);
      setRefreshIntervalState(settings.refreshInterval || 5);
      
      // 如果有账户，自动选择第一个并查询额度
      if (loadedAccounts.length > 0) {
        setSelectedAccount(loadedAccounts[0]);
        // 初始刷新额度
        refreshQuotaForAccount(loadedAccounts[0]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  /**
   * 为指定账户刷新额度
   * @param account - 要查询额度的账户
   */
  const refreshQuotaForAccount = async (account: Account) => {
    setIsLoading(true);
    try {
      // 调用 API 查询额度
      const quotaInfo: QuotaInfo = await apiService.fetchQuota(account);
      
      // 更新账户信息
      const updatedAccount = {
        ...account,
        quotaInfo,
        lastRefresh: new Date().toISOString(),
      };
      
      // 更新状态
      setAccounts(prev => prev.map(a => a.id === account.id ? updatedAccount : a));
      if (selectedAccount?.id === account.id) {
        setSelectedAccount(updatedAccount);
      }
      
      // 保存到本地存储
      await storageService.updateAccount(updatedAccount);
    } catch (error) {
      console.error('Failed to refresh quota:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 添加新账户
   * @param name - 用户名
   * @param apiKey - API 密钥
   * @param apiUrl - API 接口地址
   */
  const addAccount = async (name: string, apiKey: string, apiUrl: string) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name,
      apiKey,
      apiUrl,
    };
    
    // 保存到本地存储
    await storageService.addAccount(newAccount);
    // 更新状态
    setAccounts(prev => [...prev, newAccount]);
    
    // 如果没有选中账户，自动选中新账户并查询额度
    if (!selectedAccount) {
      setSelectedAccount(newAccount);
      refreshQuotaForAccount(newAccount);
    }
  };

  /**
   * 删除账户
   * @param id - 要删除的账户 ID
   */
  const deleteAccount = async (id: string) => {
    await storageService.deleteAccount(id);
    const filtered = accounts.filter(a => a.id !== id);
    setAccounts(filtered);
    
    // 如果删除的是当前选中的账户，自动选择下一个
    if (selectedAccount?.id === id) {
      setSelectedAccount(filtered.length > 0 ? filtered[0] : null);
    }
  };

  /**
   * 更新账户信息
   * @param id - 账户 ID
   * @param name - 用户名
   * @param apiKey - API 密钥
   * @param apiUrl - API 接口地址
   */
  const updateAccount = async (id: string, name: string, apiKey: string, apiUrl: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    
    const updatedAccount = { ...account, name, apiKey, apiUrl };
    await storageService.updateAccount(updatedAccount);
    
    setAccounts(prev => prev.map(a => a.id === id ? updatedAccount : a));
    if (selectedAccount?.id === id) {
      setSelectedAccount(updatedAccount);
      // 重新查询额度
      refreshQuotaForAccount(updatedAccount);
    }
  };

  /**
   * 选择账户
   * @param account - 要选择的账户
   */
  const selectAccount = (account: Account) => {
    setSelectedAccount(account);
  };

  /**
   * 刷新当前选中账户的额度
   */
  const refreshQuota = async () => {
    if (selectedAccount) {
      await refreshQuotaForAccount(selectedAccount);
    }
  };

  /**
   * 设置暗黑模式
   * @param value - 是否开启暗黑模式
   */
  const setDarkMode = async (value: boolean) => {
    setDarkModeState(value);
    await storageService.saveSettings({ darkMode: value, refreshInterval });
  };

  /**
   * 设置自动刷新间隔
   * @param minutes - 刷新间隔（分钟）
   */
  const setRefreshInterval = async (minutes: number) => {
    setRefreshIntervalState(minutes);
    await storageService.saveSettings({ darkMode, refreshInterval: minutes });
  };

  // 提供上下文值
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
