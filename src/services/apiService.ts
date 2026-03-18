import axios from 'axios';
import { Account, QuotaInfo } from '../models/account';

const DEFAULT_API_URL = 'http://v2api.aicodee.com/chaxun';

// API 服务 - 用于查询账户额度
export const apiService = {
  // 查询 API 额度
  async fetchQuota(account: Account): Promise<QuotaInfo> {
    try {
      const baseUrl = account.apiUrl || DEFAULT_API_URL;
      
      console.log('API Request:', `${baseUrl}/query`);
      console.log('Username:', account.name);
      
      const response = await axios.post(
        `${baseUrl}/query`,
        {
          username: account.name,
          token: account.apiKey,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
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
