// API 账户模型
class ApiAccount {
  final String id;
  final String name;
  final String apiKey;
  final String provider; // openai, anthropic, google 等
  final DateTime? lastRefresh;
  final Map<String, dynamic>? quotaInfo;

  ApiAccount({
    required this.id,
    required this.name,
    required this.apiKey,
    required this.provider,
    this.lastRefresh,
    this.quotaInfo,
  });

  // 解析 API 响应数据
  factory ApiAccount.fromApiResponse(String id, String name, String apiKey, String provider, Map<String, dynamic> data) {
    return ApiAccount(
      id: id,
      name: name,
      apiKey: apiKey,
      provider: provider,
      lastRefresh: DateTime.now(),
      quotaInfo: {
        'subscription': data['subscription']?['title'] ?? 'Free',
        'limit': data['limit'] ?? 0,
        'used': data['usage'] ?? 0,
        'remaining': (data['limit'] ?? 0) - (data['usage'] ?? 0),
        'resetTime': data['reset_time'] ?? data['expires_at'],
        'percent': ((data['usage'] ?? 0) / (data['limit'] ?? 1) * 100).toStringAsFixed(1),
      },
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'apiKey': apiKey,
    'provider': provider,
    'lastRefresh': lastRefresh?.toIso8601String(),
    'quotaInfo': quotaInfo,
  };

  factory ApiAccount.fromJson(Map<String, dynamic> json) {
    return ApiAccount(
      id: json['id'],
      name: json['name'],
      apiKey: json['apiKey'],
      provider: json['provider'],
      lastRefresh: json['lastRefresh'] != null ? DateTime.parse(json['lastRefresh']) : null,
      quotaInfo: json['quotaInfo'],
    );
  }
}
