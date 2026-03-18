/**
 * 添加/编辑账户屏幕
 * 用于添加新账户或编辑现有账户信息
 * 作者: raopan2021
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { getThemeColors } from '../theme';

// 默认 API 地址
const DEFAULT_API_URL = 'http://v2api.aicodee.com/chaxun';

/**
 * 添加账户屏幕组件
 * 提供表单用于输入账户信息
 */
export const AddAccountScreen: React.FC = () => {
  // 从上下文获取方法
  const { accounts, addAccount, updateAccount, darkMode } = useApp();
  const colors = getThemeColors(darkMode);
  
  // 表单状态
  const [name, setName] = useState('');              // 用户名
  const [apiKey, setApiKey] = useState('');         // API 密钥
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);  // API 接口地址
  const [isLoading, setIsLoading] = useState(false); // 加载状态

  // 从 navigation 获取参数（用于编辑模式）
  const [editId, setEditId] = React.useState<string | null>(null);
  
  useEffect(() => {
    // TODO: 从 route params 获取 editId
  }, []);

  // 判断是否为编辑模式
  const isEditing = !!editId;

  /**
   * 保存账户
   * 验证表单并调用添加或更新方法
   */
  const handleSave = async () => {
    // 表单验证
    if (!name.trim()) {
      Alert.alert('错误', '请输入用户名');
      return;
    }
    if (!apiKey.trim()) {
      Alert.alert('错误', '请输入 API Key');
      return;
    }
    if (!apiUrl.trim()) {
      Alert.alert('错误', '请输入 API 接口地址');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        // 编辑模式：更新账户
        await updateAccount(editId, name.trim(), apiKey.trim(), apiUrl.trim());
      } else {
        // 添加模式：新增账户
        await addAccount(name.trim(), apiKey.trim(), apiUrl.trim());
      }
      // 保存成功后导航返回
    } catch (error) {
      Alert.alert('错误', '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* 用户名输入框 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>用户名</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={name}
              onChangeText={setName}
              placeholder="请输入用户名"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* API Key 输入框 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>API Key</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="请输入 API Key"
              placeholderTextColor={colors.textSecondary}
              // 隐藏输入内容
              secureTextEntry
              // 不自动大写
              autoCapitalize="none"
            />
          </View>

          {/* API 接口地址输入框 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>API 接口地址</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="例如: http://v2api.aicodee.com/chaxun"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* 提示信息 */}
          <View style={[styles.tip, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.tipText, { color: colors.primary }]}>
              💡 API Key 仅保存在本地，不会上传到任何服务器
            </Text>
          </View>

          {/* 保存按钮 */}
          <TouchableOpacity
            style={[
              styles.button, 
              { backgroundColor: colors.primary },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '保存中...' : (isEditing ? '保存修改' : '添加账户')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  tip: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  tipText: {
    fontSize: 14,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
