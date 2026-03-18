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

const DEFAULT_API_URL = 'http://v2api.aicodee.com/chaxun';

export const AddAccountScreen: React.FC = () => {
  const { accounts, addAccount, updateAccount, darkMode } = useApp();
  const colors = getThemeColors(darkMode);
  
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [isLoading, setIsLoading] = useState(false);

  // 从 navigation 获取参数
  const [editId, setEditId] = React.useState<string | null>(null);
  
  useEffect(() => {
    // 获取 editId 从 route params
  }, []);

  const isEditing = !!editId;

  const handleSave = async () => {
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
        await updateAccount(editId, name.trim(), apiKey.trim(), apiUrl.trim());
      } else {
        await addAccount(name.trim(), apiKey.trim(), apiUrl.trim());
      }
      // 导航返回
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
          {/* 用户名 */}
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

          {/* API Key */}
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
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* API 接口地址 */}
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

          {/* 提示 */}
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
