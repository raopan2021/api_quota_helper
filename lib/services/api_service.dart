import 'package:dio/dio.dart';
import '../models/account.dart';

/// API 服务 - 用于查询账户额度
class ApiService {
  final Dio _dio = Dio();

  /// 查询 API 额度
  Future<Map<String, dynamic>> fetchQuota(ApiAccount account) async {
    try {
      // 使用用户配置的接口地址
      final baseUrl = account.apiUrl.isNotEmpty 
          ? account.apiUrl 
          : 'http://v2api.aicodee.com/chaxun';
      
      final response = await _dio.post(
        '$baseUrl/query',
        options: Options(
          headers: {'Content-Type': 'application/json'},
        ),
        data: {
          'username': account.name,
          'token': account.apiKey,
        },
      );
      
      final data = response.data;
      
      // 解析返回数据
      if (data['success'] == true && data['data'] != null) {
        final d = data['data'];
        return {
          'subscription': d['plan_name'] ?? 'Unknown',  // 套餐名称
          'daysRemaining': d['days_remaining']?.toString() ?? '0',  // 剩余天数
          'endTime': d['end_time'] ?? '-',  // 到期时间
          'used': d['amount_used']?.toString() ?? '0',  // 已用额度
          'limit': d['amount']?.toString() ?? '0',  // 总额度
          'remaining': ((double.tryParse(d['amount']?.toString() ?? '0') ?? 0) - 
                       (double.tryParse(d['amount_used']?.toString() ?? '0') ?? 0)).toString(),  // 剩余额度
          'percent': _calculatePercent(d['amount_used'], d['amount']),  // 已用百分比
          'nextResetTime': d['next_reset_time'] ?? '-',  // 下次刷新时间
        };
      } else {
        return {
          'error': data['message'] ?? '查询失败',
        };
      }
    } catch (e) {
      return _parseError(e);
    }
  }

  /// 计算已用百分比
  String _calculatePercent(dynamic used, dynamic total) {
    final usedVal = double.tryParse(used?.toString() ?? '0') ?? 0;
    final totalVal = double.tryParse(total?.toString() ?? '0') ?? 0;
    if (totalVal <= 0) return '0';
    return (usedVal / totalVal * 100).toStringAsFixed(1);
  }

  /// 解析错误信息
  Map<String, dynamic> _parseError(dynamic e) {
    if (e is DioException) {
      return {
        'error': e.response?.statusMessage ?? e.message ?? 'Unknown error',
        'statusCode': e.response?.statusCode,
      };
    }
    return {'error': e.toString()};
  }
}
