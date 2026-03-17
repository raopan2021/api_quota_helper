// API 账户模型
class ApiAccount {
  final String id;
  final String name;        // 用户名
  final String apiKey;      // API Key
  final String provider;    // 暂时保留兼容
  final String apiUrl;      // API 接口地址
  final DateTime? lastRefresh;
  final Map<String, dynamic>? quotaInfo;

  ApiAccount({
    required this.id,
    required this.name,
    required this.apiKey,
    required this.provider,
    this.apiUrl = 'http://v2api.aicodee.com/chaxun',
    this.lastRefresh,
    this.quotaInfo,
  });

  // 解析 API 响应数据
  factory ApiAccount.fromApiResponse(String id, String name, String apiKey, String provider, String apiUrl, Map<String, dynamic> data) {
    return ApiAccount(
      id: id,
      name: name,
      apiKey: apiKey,
      provider: provider,
      apiUrl: apiUrl,
      lastRefresh: DateTime.now(),
      quotaInfo: data,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'apiKey': apiKey,
    'provider': provider,
    'apiUrl': apiUrl,
    'lastRefresh': lastRefresh?.toIso8601String(),
    'quotaInfo': quotaInfo,
  };

  factory ApiAccount.fromJson(Map<String, dynamic> json) {
    return ApiAccount(
      id: json['id'],
      name: json['name'],
      apiKey: json['apiKey'],
      provider: json['provider'] ?? 'custom',
      apiUrl: json['apiUrl'] ?? 'http://v2api.aicodee.com/chaxun',
      lastRefresh: json['lastRefresh'] != null ? DateTime.parse(json['lastRefresh']) : null,
      quotaInfo: json['quotaInfo'],
    );
  }

  // 复制并修改
  ApiAccount copyWith({
    String? name,
    String? apiKey,
    String? apiUrl,
    Map<String, dynamic>? quotaInfo,
  }) {
    return ApiAccount(
      id: id,
      name: name ?? this.name,
      apiKey: apiKey ?? this.apiKey,
      provider: provider,
      apiUrl: apiUrl ?? this.apiUrl,
      lastRefresh: lastRefresh,
      quotaInfo: quotaInfo ?? this.quotaInfo,
    );
  }
}
