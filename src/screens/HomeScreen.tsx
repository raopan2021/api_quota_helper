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
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

export const HomeScreen: React.FC = () => {
  const {
    accounts,
    selectedAccount,
    isLoading,
    refreshInterval,
    refreshQuota,
    selectAccount,
    deleteAccount,
  } = useApp();
  
  const navigation = useNavigation<any>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 定时刷新
  useEffect(() => {
    if (refreshInterval > 0 && selectedAccount) {
      timerRef.current = setInterval(() => {
        refreshQuota();
      }, refreshInterval * 60 * 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [refreshInterval, selectedAccount]);

  if (accounts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💰</Text>
        <Text style={styles.emptyTitle}>暂无账户</Text>
        <Text style={styles.emptySubtitle}>点击 + 添加 API 账户</Text>
      </View>
    );
  }

  const quota = selectedAccount?.quotaInfo;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refreshQuota} />
      }
    >
      {/* 账户选择器 */}
      {accounts.length > 1 && (
        <View style={styles.accountSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {accounts.map(account => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountChip,
                  selectedAccount?.id === account.id && styles.accountChipActive,
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

      {/* 额度卡片 */}
      <View style={styles.quotaCard}>
        <Text style={styles.subscription}>
          {quota?.subscription || '未设置'}
        </Text>
        
        <Text style={styles.daysRemaining}>
          {quota?.daysRemaining || '0'} 天
        </Text>
        <Text style={styles.daysLabel}>剩余时间</Text>

        {/* 环形进度条 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercent}>
              {quota?.percent || '0'}%
            </Text>
            <Text style={styles.progressLabel}>已使用</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : quota && !quota.error ? (
          <View style={styles.quotaDetails}>
            <Text style={styles.quotaText}>
              剩余: ${quota.remaining}
            </Text>
            <Text style={styles.quotaSubtext}>
              总额: ${quota.limit}
            </Text>
          </View>
        ) : null}
      </View>

      {/* 错误提示 */}
      {quota?.error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>查询失败</Text>
          <Text style={styles.errorText}>{quota.error}</Text>
        </View>
      )}

      {/* 详细信息 */}
      {quota && !quota.error && (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>详细信息</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>套餐名称</Text>
            <Text style={styles.detailValue}>{quota.subscription}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>到期时间</Text>
            <Text style={styles.detailValue}>{quota.endTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>已用额度</Text>
            <Text style={styles.detailValue}>${quota.used}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>剩余额度</Text>
            <Text style={styles.detailValue}>${quota.remaining}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>额度刷新时间</Text>
            <Text style={styles.detailValue}>{quota.nextResetTime}</Text>
          </View>
        </View>
      )}

      {/* 账户列表 */}
      <View style={styles.accountList}>
        <Text style={styles.accountListTitle}>已添加的账户</Text>
        {accounts.map(account => (
          <View key={account.id} style={styles.accountItem}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountUrl}>{account.apiUrl}</Text>
            </View>
            <View style={styles.accountActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddAccount', { editId: account.id })}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>编辑</Text>
              </TouchableOpacity>
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
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={[styles.actionText, styles.deleteText]}>删除</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
  accountSelector: {
    padding: 16,
    backgroundColor: '#fff',
  },
  accountChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  accountChipActive: {
    backgroundColor: '#007AFF',
  },
  accountChipText: {
    color: '#666',
  },
  accountChipTextActive: {
    color: '#fff',
  },
  quotaCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#fff',
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
    color: '#007AFF',
  },
  daysLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
  },
  quotaDetails: {
    alignItems: 'center',
  },
  quotaText: {
    fontSize: 18,
  },
  quotaSubtext: {
    fontSize: 14,
    color: '#999',
  },
  errorCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff0f0',
    borderRadius: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 8,
  },
  errorText: {
    color: '#ff3b30',
  },
  detailCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
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
    borderBottomColor: '#eee',
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '500',
  },
  accountList: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
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
    borderBottomColor: '#eee',
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
    color: '#999',
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
  actionText: {
    color: '#007AFF',
  },
  deleteButton: {},
  deleteText: {
    color: '#ff3b30',
  },
});
