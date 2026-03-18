/**
 * 首页组件
 * 显示账户列表和额度信息
 * 作者: raopan2021
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getThemeColors } from '../theme';

/**
 * 首页屏幕组件
 * 主页面，显示账户列表、额度信息和账户管理功能
 */
export const HomeScreen: React.FC = () => {
  // 从上下文获取状态和方法
  const {
    accounts,
    selectedAccount,
    isLoading,
    refreshInterval,
    refreshQuota,
    selectAccount,
    deleteAccount,
    darkMode,
  } = useApp();
  
  const colorScheme = useColorScheme();
  const colors = getThemeColors(darkMode);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 定时刷新功能
   * 根据设置的间隔自动刷新额度
   */
  useEffect(() => {
    if (refreshInterval > 0 && selectedAccount) {
      timerRef.current = setInterval(() => {
        refreshQuota();
      }, refreshInterval * 60 * 1000);
    }
    
    // 清理定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [refreshInterval, selectedAccount]);

  // 没有账户时显示空状态
  if (accounts.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyIcon}>💰</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>暂无账户</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>点击 + 添加 API 账户</Text>
      </View>
    );
  }

  // 获取当前选中账户的额度信息
  const quota = selectedAccount?.quotaInfo;
  const percent = parseFloat(quota?.percent || '0');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={isLoading} 
          onRefresh={refreshQuota}
          tintColor={colors.primary}
        />
      }
    >
      {/* 账户选择器 - 当有多个账户时显示 */}
      {accounts.length > 1 && (
        <View style={[styles.accountSelector, { backgroundColor: colors.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {accounts.map(account => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountChip,
                  selectedAccount?.id === account.id && { backgroundColor: colors.primary },
                ]}
                onPress={() => selectAccount(account)}
              >
                <Text
                  style={[
                    styles.accountChipText,
                    selectedAccount?.id === account.id && styles.accountChipTextActive,
                  ]}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 额度卡片 - 显示主要额度信息 */}
      <View style={[styles.quotaCard, { backgroundColor: colors.card }]}>
        {/* 订阅套餐名称 */}
        <Text style={[styles.subscription, { color: colors.text }]}>
          {quota?.subscription || '未设置'}
        </Text>
        
        {/* 剩余天数 */}
        <Text style={[styles.daysRemaining, { color: colors.primary }]}>
          {quota?.daysRemaining || '0'} 天
        </Text>
        <Text style={[styles.daysLabel, { color: colors.textSecondary }]}>剩余时间</Text>

        {/* 环形进度条 - 显示已使用百分比 */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressCircle, { borderColor: colors.border }]}>
            <Text style={[styles.progressPercent, { color: colors.text }]}>
              {quota?.percent || '0'}%
            </Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>已使用</Text>
          </View>
        </View>

        {/* 加载状态 */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : quota && !quota.error ? (
          // 额度详情
          <View style={styles.quotaDetails}>
            <Text style={[styles.quotaText, { color: colors.text }]}>
              剩余: ${quota.remaining}
            </Text>
            <Text style={[styles.quotaSubtext, { color: colors.textSecondary }]}>
              总额: ${quota.limit}
            </Text>
          </View>
        ) : null}
      </View>

      {/* 错误提示 - 当查询失败时显示 */}
      {quota?.error && (
        <View style={[styles.errorCard, { backgroundColor: '#fff0f0' }]}>
          <Text style={[styles.errorTitle, { color: colors.error }]}>查询失败</Text>
          <Text style={[styles.errorText, { color: colors.error }]}>{quota.error}</Text>
        </View>
      )}

      {/* 详细信息 - 当查询成功时显示 */}
      {quota && !quota.error && (
        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.detailTitle, { color: colors.text }]}>详细信息</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>套餐名称</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{quota.subscription}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>到期时间</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{quota.endTime}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>已用额度</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>${quota.used}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>剩余额度</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>${quota.remaining}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>额度刷新时间</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{quota.nextResetTime}</Text>
          </View>
        </View>
      )}

      {/* 账户列表 - 显示所有已添加的账户 */}
      <View style={[styles.accountList, { backgroundColor: colors.card }]}>
        <Text style={[styles.accountListTitle, { color: colors.text }]}>已添加的账户</Text>
        {accounts.map(account => (
          <View key={account.id} style={[styles.accountItem, { borderBottomColor: colors.border }]}>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
              <Text style={[styles.accountUrl, { color: colors.textSecondary }]}>{account.apiUrl}</Text>
            </View>
            <View style={styles.accountActions}>
              {/* 编辑按钮 */}
              <TouchableOpacity
                onPress={() => {
                  // TODO: 导航到编辑页面
                }}
                style={styles.actionButton}
              >
                <Text style={[styles.actionText, { color: colors.primary }]}>编辑</Text>
              </TouchableOpacity>
              {/* 删除按钮 */}
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    '删除账户',
                    '确定要删除这个账户吗？',
                    [
                      { text: '取消', style: 'cancel' },
                      { text: '删除', style: 'destructive', onPress: () => deleteAccount(account.id) },
                    ]
                  );
                }}
                style={[styles.actionButton]}
              >
                <Text style={[styles.actionText, { color: colors.error }]}>删除</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 空状态样式
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
  },
  // 账户选择器样式
  accountSelector: {
    padding: 16,
  },
  accountChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  accountChipText: {
    color: '#666',
  },
  accountChipTextActive: {
    color: '#fff',
  },
  // 额度卡片样式
  quotaCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  subscription: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  daysRemaining: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  daysLabel: {
    fontSize: 14,
    marginBottom: 24,
  },
  // 进度条样式
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
  },
  quotaDetails: {
    alignItems: 'center',
  },
  quotaText: {
    fontSize: 18,
  },
  quotaSubtext: {
    fontSize: 14,
  },
  // 错误卡片样式
  errorCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {},
  // 详情卡片样式
  detailCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: {},
  detailValue: {
    fontWeight: '500',
  },
  // 账户列表样式
  accountList: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  accountListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountUrl: {
    fontSize: 12,
    marginTop: 2,
  },
  accountActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  actionText: {},
});
