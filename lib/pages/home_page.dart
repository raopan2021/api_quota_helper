import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/account_provider.dart';
import '../services/widget_service.dart';
import 'add_account_page.dart';
import 'settings_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final WidgetService _widgetService = WidgetService();

  @override
  void initState() {
    super.initState();
    // 启动时刷新额度
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AccountProvider>().refreshQuota();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('API 额度查询'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SettingsPage()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<AccountProvider>().refreshAll();
            },
          ),
        ],
      ),
      body: Consumer<AccountProvider>(
        builder: (context, provider, child) {
          if (provider.accounts.isEmpty) {
            return _buildEmptyState();
          }
          return _buildQuotaView(provider);
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AddAccountPage()),
        ),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.account_balance_wallet_outlined, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text('暂无账户', style: TextStyle(fontSize: 18, color: Colors.grey[600])),
          const SizedBox(height: 8),
          Text('点击 + 添加 API 账户', style: TextStyle(color: Colors.grey[500])),
        ],
      ),
    );
  }

  Widget _buildQuotaView(AccountProvider provider) {
    final account = provider.selectedAccount;
    final info = account?.quotaInfo;

    return RefreshIndicator(
      onRefresh: () async {
        await provider.refreshQuota();
        await _widgetService.updateWidget(account);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 账户切换
          if (provider.accounts.length > 1) ...[
            _buildAccountSelector(provider),
            const SizedBox(height: 16),
          ],
          
          // 额度卡片
          _buildQuotaCard(info, provider.isLoading),
          
          const SizedBox(height: 16),
          
          // 详细信息
          if (info != null && !info.containsKey('error')) ...[
            _buildDetailCard(info),
          ],
          
          const SizedBox(height: 16),
          
          // 账户管理
          _buildAccountList(provider),
        ],
      ),
    );
  }

  Widget _buildAccountSelector(AccountProvider provider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: DropdownButton<String>(
          value: provider.selectedAccount?.id,
          isExpanded: true,
          underline: const SizedBox(),
          items: provider.accounts.map((account) {
            return DropdownMenuItem(
              value: account.id,
              child: Text(account.name),
            );
          }).toList(),
          onChanged: (id) {
            if (id != null) {
              final account = provider.accounts.firstWhere((a) => a.id == id);
              provider.selectAccount(account);
              _widgetService.updateWidget(account);
            }
          },
        ),
      ),
    );
  }

  Widget _buildQuotaCard(Map<String, dynamic>? info, bool isLoading) {
    final percent = double.tryParse(info?['percent']?.toString() ?? '0') ?? 0;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // 套餐名称
            Text(
              info?['subscription']?.toString() ?? '未设置',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            
            // 剩余天数
            if (info != null && info.containsKey('daysRemaining'))
              Text(
                '${info['daysRemaining']} 天',
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.blue),
              ),
            const Text('剩余时间', style: TextStyle(color: Colors.grey)),
            
            const SizedBox(height: 24),
            
            // 环形进度条
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 150,
                  height: 150,
                  child: CircularProgressIndicator(
                    value: percent / 100,
                    strokeWidth: 12,
                    backgroundColor: Colors.grey[200],
                    valueColor: AlwaysStoppedAnimation(
                      percent > 80 ? Colors.red : (percent > 50 ? Colors.orange : Colors.green),
                    ),
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${percent.toStringAsFixed(1)}%',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '已使用',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            if (isLoading)
              const CircularProgressIndicator()
            else if (info != null)
              Column(
                children: [
                  Text(
                    '剩余: \$${_formatAmount(info['remaining'])}',
                    style: const TextStyle(fontSize: 18),
                  ),
                  Text(
                    '总额: \$${_formatAmount(info['limit'])}',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailCard(Map<String, dynamic> info) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('详细信息', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _buildDetailRow('套餐名称', info['subscription']?.toString() ?? '-'),
            _buildDetailRow('剩余天数', '${info['daysRemaining']?.toString() ?? '-'} 天'),
            _buildDetailRow('到期时间', info['endTime']?.toString() ?? '-'),
            _buildDetailRow('已用额度', '\$${_formatAmount(info['used'])}'),
            _buildDetailRow('剩余额度', '\$${_formatAmount(info['remaining'])}'),
            _buildDetailRow('总额度', '\$${_formatAmount(info['limit'])}'),
            _buildDetailRow('已用百分比', '${info['percent']?.toString() ?? '0'}%'),
            _buildDetailRow('额度刷新时间', info['nextResetTime']?.toString() ?? '-'),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildAccountList(AccountProvider provider) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('已添加的账户', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          ...provider.accounts.map((account) {
            final isSelected = account.id == provider.selectedAccount?.id;
            return ListTile(
              leading: CircleAvatar(
                backgroundColor: isSelected ? Theme.of(context).primaryColor : Colors.grey[300],
                child: Text(account.name[0].toUpperCase()),
              ),
              title: Text(account.name),
              subtitle: Text(account.apiUrl),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit),
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => AddAccountPage(editId: account.id),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () => _confirmDelete(provider, account.id),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  void _confirmDelete(AccountProvider provider, String id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('删除账户'),
        content: const Text('确定要删除这个账户吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () {
              provider.deleteAccount(id);
              Navigator.pop(context);
            },
            child: const Text('删除', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  String _formatAmount(dynamic amount) {
    if (amount == null) return '0.00';
    if (amount is num) {
      return amount.toStringAsFixed(2);
    }
    return amount.toString();
  }
}
