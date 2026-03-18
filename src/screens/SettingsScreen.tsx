import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { useApp } from '../context/AppContext';

const REFRESH_INTERVALS = [1, 3, 5, 10, 15, 30, 60];

export const SettingsScreen: React.FC = () => {
  const { darkMode, refreshInterval, setDarkMode, setRefreshInterval } = useApp();
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* 主题设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>外观</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>暗黑模式</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </View>
      </View>

      {/* 定时刷新设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>定时刷新</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowIntervalPicker(true)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>自动刷新间隔</Text>
            <Text style={styles.settingValue}>{refreshInterval} 分钟</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>说明</Text>
            <Text style={styles.settingDescription}>关闭应用后定时刷新将停止</Text>
          </View>
        </View>
      </View>

      {/* 关于 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>软件作者</Text>
          <Text style={styles.settingValue}>raopan2021</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>GitHub</Text>
          <Text style={styles.settingValue}>raopan2021</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>版本</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>ICP备案</Text>
          <Text style={styles.settingValue}>京ICP备12345678号</Text>
        </View>
      </View>

      {/* 使用说明 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>使用说明</Text>
        <View style={styles.helpItem}>
          <Text style={styles.helpText}>1. 点击 + 添加账户</Text>
          <Text style={styles.helpText}>2. 输入用户名、API Key 和接口地址</Text>
          <Text style={styles.helpText}>3. 返回主页查看额度</Text>
        </View>
      </View>

      {/* 刷新间隔选择器 */}
      <Modal
        visible={showIntervalPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIntervalPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择刷新间隔</Text>
            {REFRESH_INTERVALS.map(interval => (
              <TouchableOpacity
                key={interval}
                style={[
                  styles.intervalOption,
                  refreshInterval === interval && styles.intervalOptionActive,
                ]}
                onPress={() => {
                  setRefreshInterval(interval);
                  setShowIntervalPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.intervalText,
                    refreshInterval === interval && styles.intervalTextActive,
                  ]}
                >
                  {interval} 分钟
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowIntervalPicker(false)}
            >
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
  },
  helpItem: {
    paddingVertical: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  intervalOption: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  intervalOptionActive: {},
  intervalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  intervalTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
