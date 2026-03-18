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
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const DEFAULT_API_URL = 'http://v2api.aicodee.com/chaxun';

export const AddAccountScreen: React.FC = () => {
  const { accounts, addAccount, updateAccount } = useApp();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const editId = route.params?.editId;
  
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!editId;

  useEffect(() => {
    if (editId) {
      const account = accounts.find(a => a.id === editId);
      if (account) {
        setName(account.name);
        setApiKey(account.apiKey);
        setApiUrl(account.apiUrl);
      }
    }
  }, [editId, accounts]);

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
      navigation.goBack();
    } catch (error) {
      Alert.alert('错误', '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* 用户名 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>用户名</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="请输入用户名"
              placeholderTextColor="#999"
            />
          </View>

          {/* API Key */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="请输入 API Key"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* API 接口地址 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>API 接口地址</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="例如: http://v2api.aicodee.com/chaxun"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* 提示 */}
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              💡 API Key 仅保存在本地，不会上传到任何服务器
            </Text>
          </View>

          {/* 保存按钮 */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
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
    backgroundColor: '#fff',
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
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  tip: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  tipText: {
    color: '#1976d2',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
