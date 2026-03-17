import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/account_provider.dart';

class AddAccountPage extends StatefulWidget {
  const AddAccountPage({super.key});

  @override
  State<AddAccountPage> createState() => _AddAccountPageState();
}

class _AddAccountPageState extends State<AddAccountPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _apiKeyController = TextEditingController();
  String _selectedProvider = 'openai';
  bool _isLoading = false;

  final List<Map<String, String>> _providers = [
    {'value': 'openai', 'label': 'OpenAI'},
    {'value': 'anthropic', 'label': 'Anthropic (Claude)'},
    {'value': 'google', 'label': 'Google AI (Gemini)'},
    {'value': 'moonshot', 'label': '月之暗面 (Moonshot)'},
    {'value': 'custom', 'label': '自定义'},
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _apiKeyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('添加账户'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 账户名称
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: '账户名称',
                hintText: '例如: 我的 OpenAI',
                prefixIcon: Icon(Icons.label_outline),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '请输入账户名称';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            
            // API Provider 选择
            DropdownButtonFormField<String>(
              value: _selectedProvider,
              decoration: const InputDecoration(
                labelText: 'API 提供商',
                prefixIcon: Icon(Icons.cloud_outlined),
              ),
              items: _providers.map((p) {
                return DropdownMenuItem(
                  value: p['value'],
                  child: Text(p['label']!),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedProvider = value!;
                });
              },
            ),
            const SizedBox(height: 16),
            
            // API Key
            TextFormField(
              controller: _apiKeyController,
              decoration: const InputDecoration(
                labelText: 'API Key',
                hintText: '请输入您的 API Key',
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
            const SizedBox(height: 8),
            
            // 提示
            Card(
              color: Colors.blue[50],
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blue[700]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'API Key 仅保存在本地，不会上传到任何服务器',
                        style: TextStyle(color: Colors.blue[700]),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // 添加按钮
            FilledButton.icon(
              onPressed: _isLoading ? null : _addAccount,
              icon: _isLoading 
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.add),
              label: Text(_isLoading ? '添加中...' : '添加账户'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _addAccount() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      final success = await context.read<AccountProvider>().addAccount(
        name: _nameController.text.trim(),
        apiKey: _apiKeyController.text.trim(),
        provider: _selectedProvider,
      );
      
      if (success && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('账户添加成功')),
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
