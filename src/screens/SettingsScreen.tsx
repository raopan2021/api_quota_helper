import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
  useColorScheme,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getThemeColors } from '../theme';

const REFRESH_INTERVALS = [1, 3, 5, 10, 15, 30, 60];

export const SettingsScreen: React.FC = () => {
  const { darkMode, refreshInterval, setDarkMode, setRefreshInterval } = useApp();
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const colors = getThemeColors(darkMode);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 主题设置 */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>外观</Text>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>暗黑模式</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#ddd', true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* 定时刷新设置 */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>定时刷新</Text>
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={() => setShowIntervalPicker(true)}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>自动刷新间隔</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{refreshInterval} 分钟</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>说明</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>关闭应用后定时刷新将停止</Text>
          </View>
        </View>
      </View>

      {/* 关于 */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>关于</Text>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>软件作者</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>raopan2021</Text>
        </View>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>GitHub</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>raopan2021</Text>
        </View>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>版本</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>1.0.0</Text>
        </View>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>ICP备案</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>京ICP备12345678号</Text>
        </View>
      </View>

      {/* 使用说明 */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>使用说明</Text>
        <View style={styles.helpItem}>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>1. 点击 + 添加账户</Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>2. 输入用户名、API Key 和接口地址</Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>3. 返回主页查看额度</Text>
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
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>选择刷新间隔</Text>
            {REFRESH_INTERVALS.map(interval => (
              <TouchableOpacity
                key={interval}
                style={[
                  styles.intervalOption,
                  { borderBottomColor: colors.border },
                  refreshInterval === interval && { backgroundColor: colors.primary + '20' },
                ]}
                onPress={() => {
                  setRefreshInterval(interval);
                  setShowIntervalPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.intervalText,
                    { color: colors.text },
                    refreshInterval === interval && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {interval} 分钟
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.background }]}
              onPress={() => setShowIntervalPicker(false)}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>取消</Text>
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
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    marginTop: 2,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
  },
  helpItem: {
    paddingVertical: 12,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  },
  intervalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
