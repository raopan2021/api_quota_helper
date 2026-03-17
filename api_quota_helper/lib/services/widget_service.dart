import 'package:home_widget/home_widget.dart';
import '../models/account.dart';

class WidgetService {
  static const String appGroupId = 'group.com.apiapp.quota_helper';
  static const String androidWidgetName = 'QuotaWidgetProvider';

  // 更新桌面小组件数据
  Future<void> updateWidget(ApiAccount? account) async {
    if (account?.quotaInfo == null) {
      await HomeWidget.saveWidgetData<String>('quota_name', '未设置');
      await HomeWidget.saveWidgetData<String>('quota_percent', '0');
      await HomeWidget.saveWidgetData<String>('quota_used', '0');
      await HomeWidget.saveWidgetData<String>('quota_limit', '0');
      await HomeWidget.saveWidgetData<String>('quota_remaining', '0');
      await HomeWidget.saveWidgetData<String>('quota_reset', '--');
    } else {
      final info = account!.quotaInfo!;
      await HomeWidget.saveWidgetData<String>('quota_name', info['subscription']?.toString() ?? 'Unknown');
      await HomeWidget.saveWidgetData<String>('quota_percent', info['percent']?.toString() ?? '0');
      await HomeWidget.saveWidgetData<String>('quota_used', info['used']?.toString() ?? '0');
      await HomeWidget.saveWidgetData<String>('quota_limit', info['limit']?.toString() ?? '0');
      await HomeWidget.saveWidgetData<String>('quota_remaining', info['remaining']?.toString() ?? '0');
      await HomeWidget.saveWidgetData<String>('quota_reset', _formatResetTime(info['resetTime']));
    }
    
    // 通知组件更新
    await HomeWidget.updateWidget(
      androidName: androidWidgetName,
    );
  }

  String _formatResetTime(dynamic resetTime) {
    if (resetTime == null) return '无';
    try {
      final dt = DateTime.parse(resetTime.toString());
      final now = DateTime.now();
      final diff = dt.difference(now);
      
      if (diff.isNegative) return '已过期';
      
      if (diff.inDays > 0) {
        return '${diff.inDays}天';
      } else if (diff.inHours > 0) {
        return '${diff.inHours}小时';
      } else if (diff.inMinutes > 0) {
        return '${diff.inMinutes}分钟';
      } else {
        return '即将刷新';
      }
    } catch (e) {
      return resetTime.toString();
    }
  }

  // 注册组件回调
  Future<void> registerCallback(Function(Uri?) callback) async {
    await HomeWidget.widgetClicked.listen(callback);
  }
}
