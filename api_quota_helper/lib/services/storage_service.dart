import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/account.dart';

class StorageService {
  static const String _accountsKey = 'api_accounts';
  static const String _settingsKey = 'app_settings';

  // 保存账户列表
  Future<bool> saveAccounts(List<ApiAccount> accounts) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonList = accounts.map((a) => a.toJson()).toList();
    return prefs.setString(_accountsKey, jsonEncode(jsonList));
  }

  // 加载账户列表
  Future<List<ApiAccount>> loadAccounts() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_accountsKey);
    if (jsonStr == null) return [];
    
    final List<dynamic> jsonList = jsonDecode(jsonStr);
    return jsonList.map((json) => ApiAccount.fromJson(json)).toList();
  }

  // 添加账户
  Future<bool> addAccount(ApiAccount account) async {
    final accounts = await loadAccounts();
    accounts.add(account);
    return saveAccounts(accounts);
  }

  // 删除账户
  Future<bool> deleteAccount(String id) async {
    final accounts = await loadAccounts();
    accounts.removeWhere((a) => a.id == id);
    return saveAccounts(accounts);
  }

  // 更新账户
  Future<bool> updateAccount(ApiAccount account) async {
    final accounts = await loadAccounts();
    final index = accounts.indexWhere((a) => a.id == account.id);
    if (index != -1) {
      accounts[index] = account;
      return saveAccounts(accounts);
    }
    return false;
  }

  // 保存设置
  Future<bool> saveSettings(Map<String, dynamic> settings) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.setString(_settingsKey, jsonEncode(settings));
  }

  // 加载设置
  Future<Map<String, dynamic>> loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_settingsKey);
    if (jsonStr == null) return {};
    return jsonDecode(jsonStr);
  }
}
