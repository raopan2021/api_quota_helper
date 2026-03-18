import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  int _refreshInterval = 5;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final provider = context.read<ThemeProvider>();
    setState(() {
      _refreshInterval = provider.refreshInterval;
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();

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
              value: themeProvider.isDarkMode,
              onChanged: (value) => themeProvider.setDarkMode(value),
            ),
          ),
          const Divider(),
          
          // 定时刷新设置
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('定时刷新', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
          ListTile(
            leading: const Icon(Icons.timer),
            title: const Text('自动刷新间隔'),
            subtitle: Text('${_refreshInterval} 分钟'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showRefreshIntervalDialog(),
          ),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('说明'),
            subtitle: const Text('关闭应用后定时刷新将停止'),
          ),
          const Divider(),
          
          // 关于
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('关于', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
          const ListTile(
            leading: Icon(Icons.info),
            title: Text('软件作者'),
            subtitle: Text('API Quota Helper'),
          ),
          const ListTile(
            leading: Icon(Icons.code),
            title: Text('GitHub'),
            subtitle: Text('https://github.com/raopan2021/api_quota_helper'),
          ),
          const ListTile(
            leading: Icon(Icons.history),
            title: Text('版本'),
            subtitle: Text('1.0.0'),
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

  void _showRefreshIntervalDialog() {
    final intervals = [1, 3, 5, 10, 15, 30, 60];
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('选择刷新间隔'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: intervals.map((interval) {
            return RadioListTile<int>(
              title: Text('$interval 分钟'),
              value: interval,
              groupValue: _refreshInterval,
              onChanged: (value) {
                if (value != null) {
                  setState(() => _refreshInterval = value);
                  context.read<ThemeProvider>().setRefreshInterval(value);
                  Navigator.pop(context);
                }
              },
            );
          }).toList(),
        ),
      ),
    );
  }
}
