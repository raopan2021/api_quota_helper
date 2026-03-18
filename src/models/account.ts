/**
 * 账户数据模型
 * 定义账户和额度信息的数据结构
 * 作者: raopan2021
 */

/**
 * 账户数据模型
 * 用于定义账户信息的类型
 */
export interface Account {
  id: string;                    // 账户唯一标识符
  name: string;                 // 用户名
  apiKey: string;               // API 密钥
  apiUrl: string;               // API 接口地址
  lastRefresh?: string;         // 上次刷新时间
  quotaInfo?: QuotaInfo;        // 额度信息
}

/**
 * 额度信息数据模型
 * 用于定义 API 额度查询返回的数据结构
 */
export interface QuotaInfo {
  subscription: string;        // 订阅套餐名称
  daysRemaining: string;      // 剩余天数
  endTime: string;            // 到期时间
  used: string;               // 已使用额度
  limit: string;             // 总额度
  remaining: string;         // 剩余额度
  percent: string;           // 已使用百分比
  nextResetTime: string;     // 下次重置时间
  error?: string;            // 错误信息（如果有）
}
