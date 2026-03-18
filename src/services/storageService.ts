import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account } from '../models/account';

const ACCOUNTS_KEY = 'api_accounts';
const SETTINGS_KEY = 'app_settings';

// 存储服务 - 本地保存账户数据
export const storageService = {
  // 保存账户列表
  async saveAccounts(accounts: Account[]): Promise<void> {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  },

  // 加载账户列表
  async loadAccounts(): Promise<Account[]> {
    const jsonStr = await AsyncStorage.getItem(ACCOUNTS_KEY);
    if (!jsonStr) return [];
    return JSON.parse(jsonStr);
  },

  // 添加账户
  async addAccount(account: Account): Promise<void> {
    const accounts = await this.loadAccounts();
    accounts.push(account);
    await this.saveAccounts(accounts);
  },

  // 删除账户
  async deleteAccount(id: string): Promise<void> {
    const accounts = await this.loadAccounts();
    const filtered = accounts.filter(a => a.id !== id);
    await this.saveAccounts(filtered);
  },

  // 更新账户
  async updateAccount(account: Account): Promise<void> {
    const accounts = await this.loadAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index !== -1) {
      accounts[index] = account;
      await this.saveAccounts(accounts);
    }
  },

  // 保存设置
  async saveSettings(settings: object): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // 加载设置
  async loadSettings(): Promise<{ darkMode?: boolean; refreshInterval?: number }> {
    const jsonStr = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!jsonStr) return { darkMode: false, refreshInterval: 5 };
    return JSON.parse(jsonStr);
  },
};
