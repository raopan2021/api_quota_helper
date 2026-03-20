# API Quota Helper

查看和管理 API 额度的 Android 应用

## 功能特性

- ✅ 多账户管理（添加、编辑、删除）
- ✅ 实时额度查询
- ✅ 自动重试机制（失败自动重试3次）
- ✅ 暗黑模式支持
- ✅ 本地数据持久化
- ✅ 详细的网络日志（JSON 格式化）
- ✅ 精美的卡片式 UI（颜色指示额度状态）
- ✅ 流畅的页面切换动画

## 技术栈

| 技术 | 说明 |
|------|------|
| Kotlin | Android 主语言 |
| Jetpack Compose | 现代 UI 框架 |
| Material3 | 设计系统 |
| ViewModel + StateFlow | 状态管理 |
| DataStore | 本地持久化 |
| Coroutines | 异步编程 |

## 快速开始

### 环境要求

- JDK 17+
- Android SDK 35
- Gradle 8.7

### 构建

```bash
# Debug 版本
./gradlew assembleDebug

# Release 版本（需要签名配置）
./gradlew assembleRelease
```

### 安装

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 项目结构

```
app/src/main/kotlin/com/apiapp/api_quota_helper/
├── MainActivity.kt         # 应用入口，管理页面切换
├── MainScreen.kt          # 主页面，展示账户卡片列表
├── MainViewModel.kt       # 主页面状态管理
├── SettingsScreen.kt      # 设置页面
├── SettingsViewModel.kt   # 设置状态管理
├── data/
│   ├── model/Models.kt   # 数据模型
│   ├── repository/       # 数据仓库层
│   └── service/          # 业务服务（API、日志）
└── ui/
    ├── theme/            # Compose 主题配置
    └── widget/           # 桌面小组件
```

## API 配置

应用使用 `http://v2api.aicodee.com/chaxun/query` 接口。

请求格式：
```json
{
  "username": "用户名",
  "token": "API密钥"
}
```

响应格式：
```json
{
  "success": true,
  "data": {
    "plan_name": "套餐名称",
    "days_remaining": 剩余天数,
    "amount": 总额度,
    "amount_used": 已用额度,
    "remaining": 剩余额度,
    "next_reset_time": "下次重置时间",
    "status": "状态"
  }
}
```

## 开发指南

详见 [前端开发者入门指南](docs/前端开发者入门指南.md)

## 版本历史

- v1.0.32: 优化 APK 大小（15MB → 2.6MB）
- v1.0.31: 优化卡片布局
- v1.0.30: 日志卡片单独复制删除
- v1.0.29: JSON 格式化展示
- v1.0.28: 倒计时防抖动
- v1.0.27: 刷新状态优化
- v1.0.26: 重试机制
- v1.0.25: 日志卡片改版
- v1.0.24: 华丽动画
- v1.0.21: 页面动画
- v1.0.18: 统一版本号

## 许可证

MIT License
