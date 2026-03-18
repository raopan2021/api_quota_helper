/**
 * API 额度查询应用 - 主入口文件
 * 作者: raopan2021
 * 功能: 查询 API 账户的额度使用情况
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddAccountScreen } from './src/screens/AddAccountScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

/**
 * 主屏幕包装器 - 添加导航栏按钮
 * 用于在首页设置导航栏的显示选项
 */
const HomeScreenWithNav = ({ navigation }) => {
  const { darkMode, refreshQuota } = useApp();
  
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <React.Fragment>
          <StatusBar style={darkMode ? 'light' : 'dark'} />
        </React.Fragment>
      ),
    });
  }, [navigation, darkMode]);
  
  return <HomeScreen />;
};

/**
 * 主应用组件
 * 配置导航主题（亮色/暗色）和路由
 */
const MainApp: React.FC = () => {
  const { darkMode } = useApp();
  
  // 根据暗黑模式设置导航主题颜色
  const navigationTheme = darkMode ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#0a84ff',
      background: '#000000',
      card: '#1c1c1e',
      text: '#ffffff',
      border: '#333333',
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#007AFF',
      background: '#f5f5f5',
      card: '#ffffff',
      text: '#000000',
      border: '#eeeeee',
    },
  };
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: darkMode ? '#1c1c1e' : '#ffffff',
          },
          headerTintColor: '#007AFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'API 额度查询',
            headerRight: () => (
              <React.Fragment>
                <StatusBar style={darkMode ? 'light' : 'dark'} />
              </React.Fragment>
            ),
          })}
        />
        <Stack.Screen
          name="AddAccount"
          component={AddAccountScreen}
          options={({ route }) => ({
            title: route.params?.editId ? '编辑账户' : '添加账户',
          })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '设置',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * 应用根组件
 * 提供安全区域和全局状态
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}

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
  daysRemaining: string;        // 剩余天数
  endTime: string;              // 到期时间
  used: string;                 // 已使用额度
  limit: string;               // 总额度
  remaining: string;           // 剩余额度
  percent: string;             // 已使用百分比
  nextResetTime: string;       // 下次重置时间
  error?: string;              // 错误信息（如果有）
}
