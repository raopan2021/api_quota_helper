# ApiQuotaHelper

一个简洁的 API 额度监控应用，支持多账号管理、实时用量查询和到期提醒。

## 功能特性

- **多账号管理** - 添加、编辑、删除多个 API 账号，每个账号独立存储 Token
- **实时额度查询** - 一键查询各账号的套餐信息、用量统计、剩余天数
- **用量可视化** - 图表展示已用额度比例，直观了解消耗情况
- **到期提醒** - 自动检测临近到期的账号并推送通知
- **定时刷新** - 支持设置自动刷新间隔（默认 5 分钟）
- **深色模式** - 支持浅色/深色主题切换

## 隐私说明

所有账号数据（用户名、Token）仅存储在本地设备，不会传输到任何第三方服务器。

## License

MIT

## 安卓端

### 技术栈

| 分类 | 技术 |
|------|------|
| UI | Jetpack Compose + Material 3 |
| 数据存储 | DataStore Preferences |
| 网络 | HttpURLConnection |
| 架构 | MVVM + Repository |
| 序列化 | Kotlinx Serialization |
| 构建 | Gradle (Kotlin DSL) |

### 截图

<div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start;">
  <img style="flex: 1;" alt="截图" src="./截图/1.jpg">
  <img style="flex: 1;" alt="截图" src="./截图/2.jpg">
  <img style="flex: 1;" alt="截图" src="./截图/3.jpg">
  <img style="flex: 1;" alt="截图" src="./截图/4.jpg">
</div>

### 环境要求

- Android Studio Jellyfish (2024.1) 或更高
- JDK 17+
- Android SDK 35
- arm64-v8a 设备或模拟器

### 构建步骤

```bash
cd android
./gradlew assembleRelease   # Release 构建
./gradlew assembleDebug     # Debug 构建
```

构建产物位于 `android/app/build/outputs/apk/release/` 或 `.../debug/`

### 签名配置

Release 构建需要签名密钥。在 `android/app/` 目录下放置 `api_quota_helper.jks` 签名文件，或通过环境变量配置：

```bash
export KEY_STORE_PASSWORD=your_keystore_password
export KEY_ALIAS=your_key_alias
export KEY_PASSWORD=your_key_password
```

### CI/CD

项目使用 GitHub Actions 自动构建 Android Release APK。

#### 触发条件

- master 分支有代码推送时自动构建
- 可通过 GitHub Web 界面手动触发

#### 工作流说明

1. `extract-version` - 从 `build.gradle.kts` 提取版本号
2. `check-tag` - 检查是否已存在对应 Tag，避免重复发布
3. `build` - 构建 Release APK 并上传 Artifact
4. `create-tag` - 创建并推送 Git Tag
5. `release` - 创建 GitHub Release

#### Tag 管理

```bash
# 查看远程 Tag
git ls-remote --tags origin

# 删除指定版本的所有 Tag（如 v1.2.*）
git tag | grep 'v1.2' | while read tag; do
  git push origin ":refs/tags/$tag"
  git tag -d "$tag"
done
```
