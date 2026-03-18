// 账户数据模型
export interface Account {
  id: string;
  name: string;
  apiKey: string;
  apiUrl: string;
  lastRefresh?: string;
  quotaInfo?: QuotaInfo;
}

export interface QuotaInfo {
  subscription: string;
  daysRemaining: string;
  endTime: string;
  used: string;
  limit: string;
  remaining: string;
  percent: string;
  nextResetTime: string;
  error?: string;
}
