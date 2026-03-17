import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/account_provider.dart';

class AddAccountPage extends StatefulWidget {
  final String? editId;
  
  const AddAccountPage({super.key, this.editId});

  @override
  State<AddAccountPage> createState() => _AddAccountPageState();
}

class _AddAccountPageState extends State<AddAccountPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _apiKeyController = TextEditingController();
  final _apiUrlController = TextEditingController(text: 'http://v2api.aicodee.com/chaxun');
  bool _isLoading = false;
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    if (widget.editId != null) {
      _isEditing = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _loadEditData();
      });
    }
  }

  void _loadEditData() {
    final provider = context.read<AccountProvider>();
    final account = provider.accounts.firstWhere(
      (a) => a.id == widget.editId,
      orElse: () => throw Exception('Account not found'),
    );
    _nameController.text = account.name;
    _apiKeyController.text = account.apiKey;
    _apiUrlController.text = account.apiUrl;
    setState(() {});
  }

  @override
  void dispose() {
    _nameController.dispose();
    _apiKeyController.dispose();
    _apiUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? '编辑账户' : '添加账户'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 用户名
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: '用户名',
                hintText: '请输入用户名',
                prefixIcon: Icon(Icons.person_outline),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '请输入用户名';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            
            // API Key
            TextFormField(
              controller: _apiKeyController,
              decoration: const InputDecoration(
                labelText: 'API Key',
                hintText: '请输入 API Key',
                prefixIcon: Icon(Icons.key),
              ),
              obscureText: true,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '请输入 API Key';
                }
                if (value.length < 10) {
                  return 'API Key 长度不对';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            
            // API 接口地址
            TextFormField(
              controller: _apiUrlController,
              decoration: const InputDecoration(
                labelText: 'API 接口地址',
                hintText: '例如: http://v2api.aicodee.com/chaxun',
                prefixIcon: Icon(Icons.link),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '请输入 API 接口地址';
                }
                return null;
              },
            ),
            const SizedBox(height: 8),
            
            // 提示
            Card(
              color: Colors.blue[50],
              child: const Padding(
                padding: EdgeInsets.all(12),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blue),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'API Key 仅保存在本地，不会上传到任何服务器',
                        style: TextStyle(color: Colors.blue),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // 添加/保存按钮
            FilledButton.icon(
              onPressed: _isLoading ? null : _saveAccount,
              icon: _isLoading 
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Icon(_isEditing ? Icons.save : Icons.add),
              label: Text(_isLoading ? '保存中...' : (_isEditing ? '保存修改' : '添加账户')),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _saveAccount() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      final provider = context.read<AccountProvider>();
      
      if (_isEditing) {
        // 编辑模式
        await provider.updateAccount(
          id: widget.editId!,
          name: _nameController.text.trim(),
          apiKey: _apiKeyController.text.trim(),
          apiUrl: _apiUrlController.text.trim(),
        );
      } else {
        // 添加模式
        await provider.addAccount(
          name: _nameController.text.trim(),
          apiKey: _apiKeyController.text.trim(),
          apiUrl: _apiUrlController.text.trim(),
        );
      }
      
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_isEditing ? '修改成功' : '添加成功')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
}
