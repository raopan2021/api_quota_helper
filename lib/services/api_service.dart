import 'package:dio/dio.dart';
import '../models/account.dart';

class ApiService {
  final Dio _dio = Dio();

  // 查询 API 额度
  Future<Map<String, dynamic>> fetchQuota(ApiAccount account) async {
    try {
      switch (account.provider.toLowerCase()) {
        case 'openai':
          return await _fetchOpenAI(account.apiKey);
        case 'anthropic':
          return await _fetchAnthropic(account.apiKey);
        case 'google':
        case 'gemini':
          return await _fetchGoogle(account.apiKey);
        case 'moonshot':
        case '月之暗面':
          return await _fetchMoonshot(account.apiKey);
        default:
          return await _fetchDefault(account.apiKey, account.provider);
      }
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  // OpenAI API 查询
  Future<Map<String, dynamic>> _fetchOpenAI(String apiKey) async {
    try {
      final response = await _dio.get(
        'https://api.openai.com/v1/usage',
        options: Options(
          headers: {'Authorization': 'Bearer $apiKey'},
        ),
        queryParameters: {
          'date': DateTime.now().toIso8601String().split('T')[0],
        },
      );
      
      final data = response.data;
      return {
        'subscription': data['subscription']?['plan']['title'] ?? 'Unknown',
        'limit': data['subscription']?['hard_limit_usd'] ?? 0,
        'used': data['total_usage'] ?? 0,
        'remaining': ((data['subscription']?['hard_limit_usd'] ?? 0) - (data['total_usage'] ?? 0) / 100),
        'resetTime': data['expires_at'],
        'percent': ((data['total_usage'] ?? 0) / ((data['subscription']?['hard_limit_usd'] ?? 100) * 100) * 100).toStringAsFixed(1),
      };
    } catch (e) {
      return _parseError(e);
    }
  }

  // Anthropic API 查询
  Future<Map<String, dynamic>> _fetchAnthropic(String apiKey) async {
    try {
      final response = await _dio.get(
        'https://api.anthropic.com/v1/users/credit_summary',
        options: Options(
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
        ),
      );
      
      final data = response.data;
      return {
        'subscription': 'Anthropic',
        'limit': data['credits_total'] ?? 0,
        'used': data['credits_used'] ?? 0,
        'remaining': data['credits_remaining'] ?? 0,
        'resetTime': null,
        'percent': ((data['credits_used'] ?? 0) / (data['credits_total'] ?? 1) * 100).toStringAsFixed(1),
      };
    } catch (e) {
      return _parseError(e);
    }
  }

  // Google/Gemini API 查询
  Future<Map<String, dynamic>> _fetchGoogle(String apiKey) async {
    try {
      final response = await _dio.get(
        'https://aiplatform.googleapis.com/v1/projects',
        options: Options(
          headers: {'Authorization': 'Bearer $apiKey'},
        ),
      );
      
      return {
        'subscription': 'Google AI',
        'limit': 'Unknown',
        'used': 'Unknown',
        'remaining': 'Unknown',
        'resetTime': null,
        'percent': '0',
      };
    } catch (e) {
      return _parseError(e);
    }
  }

  // 月之暗面 API 查询
  Future<Map<String, dynamic>> _fetchMoonshot(String apiKey) async {
    try {
      final response = await _dio.get(
        'https://api.moonshot.cn/v1/user/info',
        options: Options(
          headers: {'Authorization': 'Bearer $apiKey'},
        ),
      );
      
      final data = response.data;
      return {
        'subscription': data['subscription']?['plan_id'] ?? 'Free',
        'limit': data['subscription']?['quota_limit'] ?? 0,
        'used': data['subscription']?['quota_used'] ?? 0,
        'remaining': data['subscription']?['quota_remaining'] ?? 0,
        'resetTime': data['subscription']?['expire_time'],
        'percent': ((data['subscription']?['quota_used'] ?? 0) / (data['subscription']?['quota_limit'] ?? 1) * 100).toStringAsFixed(1),
      };
    } catch (e) {
      return _parseError(e);
    }
  }

  // 默认处理
  Future<Map<String, dynamic>> _fetchDefault(String apiKey, String provider) async {
    return {
      'subscription': provider,
      'limit': 0,
      'used': 0,
      'remaining': 0,
      'resetTime': null,
      'percent': '0',
      'error': 'Unsupported provider: $provider',
    };
  }

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
