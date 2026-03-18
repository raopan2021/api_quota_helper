/**
 * API 服务模块
 * 用于与 API 服务端通信，查询账户额度信息
 * 作者: raopan2021
 */

import axios from 'axios';
import { Account, QuotaInfo } from '../models/account';

// 默认 API 地址
const DEFAULT_API_URL = 'http://v2api.aicodee.com/chaxun';

/**
 * API 服务 - 用于查询账户额度
 * 提供查询 API 配额信息的功能
 */
export const apiService = {
  /**
   * 查询 API 额度
   * @param account - 账户信息
   * @returns 额度信息对象
   */
  async fetchQuota(account: Account): Promise<QuotaInfo> {
    try {
      // 获取 API 地址，默认使用配置地址
      const baseUrl = account.apiUrl || DEFAULT_API_URL;
      
      console.log('API Request:', `${baseUrl}/query`);
      console.log('Username:', account.name);
      
      // 发送 POST 请求查询额度
      const response = await axios.post(
        `${baseUrl}/query`,
        {
          username: account.name,
          token: account.apiKey,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,  // 30秒超时
        }
      );
      
      console.log('API Response:', response.data);
      
      const data = response.data;
      
      // 解析返回数据
      if (data.success === true && data.data) {
        const d = data.data;
        const used = parseFloat(d.amount_used) || 0;
        const limit = parseFloat(d.amount) || 0;
        
        return {
          subscription: d.plan_name || 'Unknown',
          daysRemaining: d.days_remaining?.toString() || '0',
          endTime: d.end_time || '-',
          used: d.amount_used?.toString() || '0',
          limit: d.amount?.toString() || '0',
          remaining: (limit - used).toFixed(2),
          percent: limit > 0 ? ((used / limit) * 100).toFixed(1) : '0',
          nextResetTime: d.next_reset_time || '-',
        };
      } else {
        // API 返回失败
        return {
          subscription: '',
          daysRemaining: '0',
          endTime: '-',
          used: '0',
          limit: '0',
          remaining: '0',
          percent: '0',
          nextResetTime: '-',
          error: data.message || '查询失败',
        };
      }
    } catch (error: any) {
      console.error('API Error:', error.message);
      
      // 解析错误信息
      let errorMsg = '未知错误';
      if (error.code === 'ECONNABORTED') {
        errorMsg = '请求超时，请检查网络';
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg = '网络连接失败，请检查网络或接口地址';
      } else if (error.response) {
        errorMsg = `服务器错误: ${error.response.status}`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      return {
        subscription: '',
        daysRemaining: '0',
        endTime: '-',
        used: '0',
        limit: '0',
        remaining: '0',
        percent: '0',
        nextResetTime: '-',
        error: errorMsg,
      };
    }
  },
};
