import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _isDarkMode = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isDarkMode = prefs.getBool('darkMode') ?? false;
    });
  }

  Future<void> _toggleDarkMode(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('darkMode', value);
    setState(() {
      _isDarkMode = value;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('设置'),
      ),
      body: ListView(
        children: [
          // 主题设置
          ListTile(
            leading: const Icon(Icons.dark_mode),
            title: const Text('暗黑模式'),
            trailing: Switch(
              value: _isDarkMode,
              onChanged: _toggleDarkMode,
            ),
          ),
          const Divider(),
          
          // 关于
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('关于', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
          ListTile(
            leading: const Icon(Icons.info),
            title: const Text('软件作者'),
            subtitle: const Text('API Quota Helper'),
          ),
          ListTile(
            leading: const Icon(Icons.code),
            title: const Text('GitHub'),
            subtitle: const Text('https://github.com/raopan2021/api_quota_helper'),
            onTap: () {
              // 可以添加打开链接功能
            },
          ),
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('版本'),
            subtitle: const Text('1.0.0'),
          ),
          const Divider(),
          
          // 使用说明
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('使用说明', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
          const ListTile(
            leading: Icon(Icons.help_outline),
            title: Text('如何使用'),
            subtitle: Text('1. 点击 + 添加账户\n2. 输入用户名、API Key 和接口地址\n3. 返回主页查看额度\n4. 可添加桌面小组件'),
          ),
        ],
      ),
    );
  }
}
