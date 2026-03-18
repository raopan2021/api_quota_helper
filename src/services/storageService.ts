/**
 * 本地存储服务模块
 * 使用 AsyncStorage 实现数据的本地持久化存储
 * 作者: raopan2021
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account } from '../models/account';

// 存储键名
const ACCOUNTS_KEY = 'api_accounts';      // 账户列表存储键
const SETTINGS_KEY = 'app_settings';      // 应用设置存储键

/**
 * 存储服务 - 本地保存账户数据
 * 提供账户和设置的增删改查功能
 */
export const storageService = {
  /**
   * 保存账户列表到本地存储
   * @param accounts - 账户数组
   */
  async saveAccounts(accounts: Account[]): Promise<void> {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  },

  /**
   * 从本地存储加载账户列表
   * @returns 账户数组
   */
  async loadAccounts(): Promise<Account[]> {
    const jsonStr = await AsyncStorage.getItem(ACCOUNTS_KEY);
    if (!jsonStr) return [];
    return JSON.parse(jsonStr);
  },

  /**
   * 添加新账户到本地存储
   * @param account - 要添加的账户
   */
  async addAccount(account: Account): Promise<void> {
    const accounts = await this.loadAccounts();
    accounts.push(account);
    await this.saveAccounts(accounts);
  },

  /**
   * 从本地存储删除账户
   * @param id - 要删除的账户 ID
   */
  async deleteAccount(id: string): Promise<void> {
    const accounts = await this.loadAccounts();
    const filtered = accounts.filter(a => a.id !== id);
    await this.saveAccounts(filtered);
  },

  /**
   * 更新本地存储中的账户信息
   * @param account - 更新后的账户信息
   */
  async updateAccount(account: Account): Promise<void> {
    const accounts = await this.loadAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index !== -1) {
      accounts[index] = account;
      await this.saveAccounts(accounts);
    }
  },

  /**
   * 保存应用设置到本地存储
   * @param settings - 设置对象
   */
  async saveSettings(settings: object): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  /**
   * 从本地存储加载应用设置
   * @returns 设置对象，包含 darkMode 和 refreshInterval
   */
  async loadSettings(): Promise<{ darkMode?: boolean; refreshInterval?: number }> {
    const jsonStr = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!jsonStr) return { darkMode: false, refreshInterval: 5 };
    return JSON.parse(jsonStr);
  },
};

/**
 * 主题配置
 * 定义亮色和暗色主题的颜色方案
 */
export const theme = {
  // 亮色主题
  light: {
    background: '#f5f5f5',       // 背景色
    card: '#ffffff',            // 卡片背景色
    text: '#000000',           // 主文字颜色
    textSecondary: '#666666',   // 次要文字颜色
    border: '#eeeeee',         // 边框颜色
    primary: '#007AFF',        // 主色调（蓝色）
    error: '#ff3b30',         // 错误色（红色）
    success: '#34c759',       // 成功色（绿色）
    warning: '#ff9500',       // 警告色（橙色）
  },
  // 暗色主题
  dark: {
    background: '#000000',      // 背景色
    card: '#1c1c1e',           // 卡片背景色
    text: '#ffffff',          // 主文字颜色
    textSecondary: '#999999',  // 次要文字颜色
    border: '#333333',        // 边框颜色
    primary: '#0a84ff',       // 主色调（蓝色）
    error: '#ff453a',         // 错误色（红色）
    success: '#30d158',       // 成功色（绿色）
    warning: '#ff9f0a',       // 警告色（橙色）
  },
};

/**
 * 获取当前主题颜色
 * @param darkMode - 是否为暗黑模式
 * @returns 对应主题的颜色对象
 */
export const getThemeColors = (darkMode: boolean) => {
  return darkMode ? theme.dark : theme.light;
};
