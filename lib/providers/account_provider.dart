import 'package:flutter/foundation.dart';
import '../models/account.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AccountProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();
  
  List<ApiAccount> _accounts = [];
  bool _isLoading = false;
  String? _error;
  ApiAccount? _selectedAccount;

  List<ApiAccount> get accounts => _accounts;
  bool get isLoading => _isLoading;
  String? get error => _error;
  ApiAccount? get selectedAccount => _selectedAccount;

  AccountProvider() {
    loadAccounts();
  }

  // 加载账户列表
  Future<void> loadAccounts() async {
    _accounts = await _storageService.loadAccounts();
    if (_accounts.isNotEmpty && _selectedAccount == null) {
      _selectedAccount = _accounts.first;
    }
    notifyListeners();
  }

  // 添加账户
  Future<bool> addAccount({
    required String name,
    required String apiKey,
    required String provider,
  }) async {
    final account = ApiAccount(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      apiKey: apiKey,
      provider: provider,
    );
    
    final success = await _storageService.addAccount(account);
    if (success) {
      _accounts.add(account);
      if (_selectedAccount == null) {
        _selectedAccount = account;
      }
      notifyListeners();
    }
    return success;
  }

  // 删除账户
  Future<bool> deleteAccount(String id) async {
    final success = await _storageService.deleteAccount(id);
    if (success) {
      _accounts.removeWhere((a) => a.id == id);
      if (_selectedAccount?.id == id) {
        _selectedAccount = _accounts.isNotEmpty ? _accounts.first : null;
      }
      notifyListeners();
    }
    return success;
  }

  // 选择账户
  void selectAccount(ApiAccount account) {
    _selectedAccount = account;
    notifyListeners();
  }

  // 刷新选中账户的额度
  Future<void> refreshQuota() async {
    if (_selectedAccount == null) return;
    
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final quotaData = await _apiService.fetchQuota(_selectedAccount!);
      
      if (quotaData.containsKey('error')) {
        _error = quotaData['error'];
      } else {
        final updatedAccount = ApiAccount(
          id: _selectedAccount!.id,
          name: _selectedAccount!.name,
          apiKey: _selectedAccount!.apiKey,
          provider: _selectedAccount!.provider,
          lastRefresh: DateTime.now(),
          quotaInfo: quotaData,
        );
        
        await _storageService.updateAccount(updatedAccount);
        
        final index = _accounts.indexWhere((a) => a.id == updatedAccount.id);
        if (index != -1) {
          _accounts[index] = updatedAccount;
          _selectedAccount = updatedAccount;
        }
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 刷新所有账户
  Future<void> refreshAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    for (int i = 0; i < _accounts.length; i++) {
      try {
        final quotaData = await _apiService.fetchQuota(_accounts[i]);
        if (!quotaData.containsKey('error')) {
          _accounts[i] = ApiAccount(
            id: _accounts[i].id,
            name: _accounts[i].name,
            apiKey: _accounts[i].apiKey,
            provider: _accounts[i].provider,
            lastRefresh: DateTime.now(),
            quotaInfo: quotaData,
          );
        }
      } catch (e) {
        // Continue with other accounts
      }
    }

    await _storageService.saveAccounts(_accounts);
    _isLoading = false;
    notifyListeners();
  }
}
