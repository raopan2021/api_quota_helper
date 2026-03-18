// 暗黑模式主题配置
export const theme = {
  light: {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    border: '#eeeeee',
    primary: '#007AFF',
    error: '#ff3b30',
    success: '#34c759',
    warning: '#ff9500',
  },
  dark: {
    background: '#000000',
    card: '#1c1c1e',
    text: '#ffffff',
    textSecondary: '#999999',
    border: '#333333',
    primary: '#0a84ff',
    error: '#ff453a',
    success: '#30d158',
    warning: '#ff9f0a',
  },
};

// 获取当前主题颜色
export const getThemeColors = (darkMode: boolean) => {
  return darkMode ? theme.dark : theme.light;
};
