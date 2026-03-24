# OpenClaw Skills 指南

> 更新时间：2025-03-18

## 什么是 Skills？

OpenClaw Skills（技能）是一种**模块化、可复用**的能力扩展系统，基于 [AgentSkills](https://agentskills.io) 规范。每个 Skill 就是一个文件夹，包含一个 `SKILL.md` 文件，告诉 AI 代理何时、如何使用特定工具或执行特定工作流。

**简单理解**：Skills = 给 AI 装备的各种"技能包"，让它能帮你完成特定任务（查天气、播音乐、管笔记等）。

---

## Skills 存放位置

OpenClaw 从以下位置加载技能，按优先级排序：

| 优先级 | 位置 | 说明 |
|--------|------|------|
| 1 (最高) | `<workspace>/skills` | 工作区专属技能 |
| 2 | `~/.openclaw/skills` | 本地/管理的技能（全局共享） |
| 3 (最低) | npm 包内置 | OpenClaw 捆绑的默认技能 |

> 注意：如果同名技能冲突，优先级高的会覆盖低的。

---

## 如何使用 Skills

### 1. 列出已安装的技能

```bash
openclaw skills list
openclaw skills list --eligible   # 只显示符合条件的
openclaw skills info <skill-name> # 查看详情
openclaw skills check             # 检查依赖
```

### 2. 通过 ClawHub 安装新技能

```bash
# 安装
npx clawhub@latest install <skill-slug>

# 搜索
clawhub search "关键词"

# 更新
clawhub update --all
```

### 3. 配置技能

在 `~/.openclaw/openclaw.json` 中：

```json5
{
  skills: {
    entries: {
      "skill-name": {
        enabled: true,
        apiKey: { source: "env", provider: "default", id: "API_KEY" },
        env: { "API_KEY": "xxx" }
      }
    }
  }
}
```

---

## 常用 Skills 推荐

以下是已内置的 55 个技能，按功能分类整理：

### 📱 通讯与消息

| 技能名 | 描述 | 依赖 |
|--------|------|------|
| **discord** | 通过 message 工具发送 Discord 消息 | 需要配置 channels.discord.token |
| **slack** | 控制 Slack（反应、Pin 消息等） | 需要配置 channels.slack |
| **bluebubbles** | iMessage/短信发送和管理 | 需要 BlueBubbles 配置 |
| **imsg** | macOS 原生 iMessage/SMS CLI | macOS 专用 |
| **signal** | Signal 消息（需配置通道） | - |
| **telegram** | Telegram 消息（需配置通道） | - |
| **whatsapp** | WhatsApp 消息（需配置通道） | - |

### 🎵 音乐与媒体

| 技能名 | 描述 | 依赖 |
|--------|------|------|
| **spotify-player** 🎵 | 终端 Spotify 播放控制 (spogo) | spogo 或 spotify_player |
| **sonoscli** 🔊 | Sonos 音箱控制 | `sonos` CLI |
| **openai-whisper** 🎤 | 本地语音转文字 (Whisper) | `whisper` CLI |
| **openai-whisper-api** 🌐 | OpenAI Whisper API 转录 | OPENAI_API_KEY |
| **sherpa-onnx-tts** 🔉 | 本地离线 TTS | SHERPA_ONNX 环境变量 |
| **sag** 🔊 | ElevenLabs TTS（语音合成） | ELEVENLABS_API_KEY |
| **songsee** 🌊 | 音频频谱可视化 | `songsee` CLI |

### 🌐 生活与工具

| 技能名 | 描述 | 依赖 |
|--------|------|------|
| **weather** ☔ | 天气查询 (wttr.in/Open-Meteo) | `curl` |
| **gog** 🎮 | Google Workspace CLI (Gmail/Calendar/Drive) | `gog` CLI |
| **himalaya** 📧 | 终端邮件管理 (IMAP/SMTP) | `himalaya` CLI |
| **goplaces** 📍 | Google Places API 查询 | `goplaces` + GOOGLE_PLACES_API_KEY |
| **ordercli** 🛵 | 外卖订单查询 (Foodora) | `ordercli` CLI |
| **blogwatcher** 📰 | RSS/博客监控更新 | `blogwatcher` CLI |

### 📝 笔记与任务管理

| 技能名 | 描述 | 平台 | 依赖 |
|--------|------|------|------|
| **apple-notes** 📝 | Apple Notes 管理 | macOS | `memo` CLI |
| **apple-reminders** ⏰ | Apple 提醒事项 | macOS | `remindctl` CLI |
| **bear-notes** 🐻 | Bear 笔记管理 | macOS | grizzly CLI |
| **things-mac** ✅ | Things 3 任务管理 | macOS | `things` CLI |
| **obsidian** 💎 | Obsidian  vaults 操作 | 全平台 | `obsidian-cli` |
| **notion** 📝 | Notion API 操作 | 全平台 | NOTION_API_KEY |
| **trello** 📋 | Trello 看板管理 | 全平台 | TRELLO_API_KEY + TRELLO_TOKEN |

### 🏠 智能家居

| 技能名 | 描述 | 依赖 |
|--------|------|------|
| **openhue** 💡 | Philips Hue 灯光控制 | `openhue` CLI |
| **sonoscli** 🔊 | Sonos 音箱控制 | `sonos` CLI |
| **eightctl** 🛌 | Eight Sleep 智能床控制 | `eightctl` CLI |
| **blucli** 🫐 | BluOS 音频设备控制 | `blu` CLI |

### 💻 开发者工具

| 技能名 | 描述 | 依赖 |
|--------|------|------|
| **github** 🐙 | GitHub 操作 (issues/PRs/CI) | `gh` CLI |
| **gh-issues** | 自动修复 GitHub Issues | `gh` + `git` + `curl` |
| **gemini** ✨ | Gemini CLI 问答/生成 | `gemini` CLI |
| **coding-agent** 🧩 | 委托 Codex/Claude Code/Pi 编码 | `claude`/`codex`/`opencode`/`pi` |
| **oracle** 🧿 | Oracle CLI 最佳实践 | `oracle` CLI |
| **mcporter** 📦 | MCP 服务器/工具调用 | `mcporter` CLI |
| **session-logs** 📜 | 搜索历史会话日志 | `jq` + `rg` |
| **model-usage** 📊 | 模型使用费用统计 | `codexbar` (macOS) |

### 🔐 安全与系统

| 技能名 | 描述 | 依赖 |
|--------|------|------|
| **healthcheck** | 主机安全加固与审计 | OpenClaw 安全工具 |
| **node-connect** | 移动端节点连接诊断 | OpenClaw 节点配对 |
| **1password** 🔐 | 1Password CLI 操作 | `op` CLI |
| **peekaboo** 👀 | macOS UI 自动化捕获 | macOS 专用 |

### 🖼️ 图像与视频

| 技能名 | 描述 | 依赖 |
|--------|------|------|
| **nano-banana-pro** 🍌 | Gemini 3 Pro 图像生成 | `uv` + GEMINI_API_KEY |
| **openai-image-gen** 🎨 | OpenAI 图像批量生成 | OPENAI_API_KEY |
| **video-frames** 🎬 | 视频帧提取 | `ffmpeg` |
| **camsnap** 📸 | RTSP/ONVIF 摄像头捕获 | `camsnap` CLI |
| **gifgrep** 🧲 | GIF 搜索与下载 | `gifgrep` CLI |

### 📄 文档处理

| 技能名 | 描述 | 依赖 |
|--------|------|------|
| **nano-pdf** 📄 | PDF 自然语言编辑 | `nano-pdf` CLI |
| **xurl** 🐦 | X (Twitter) API 操作 | `xurl` CLI |
| **wacli** 📱 | WhatsApp 消息发送/搜索 | `wacli` CLI |

### 🔧 OpenClaw 专用

| 技能名 | 描述 | 依赖 |
|--------|------|------|
| **clawhub** | ClawHub CLI（搜索/安装/发布技能） | `clawhub` CLI |
| **skill-creator** | 创建/编辑/审计 AgentSkills | - |
| **canvas** | HTML 内容显示到连接节点 | OpenClaw 节点 |
| **voice-call** 📞 | 语音通话启动 | voice-call 插件 |
| **tmux** 🧵 | tmux 会话远程控制 | `tmux` |

---

## Skills 技能触发机制

每个 Skill 的 `description`（描述）决定了何时被触发。例如：

- **weather** 描述包含 "weather"、"temperature"、"forecast"，当用户问天气时自动触发
- **skill-creator** 描述包含 "create a skill"、"improve this skill"，当用户提到创建技能时触发

**触发条件**：
1. 用户请求匹配 description 关键词
2. 依赖条件满足（环境变量、二进制文件、配置文件等）
3. 技能已启用

---

## 安装新技能示例

```bash
# 全局安装 ClawHub
npm i -g clawhub

# 搜索技能
clawhub search spotify

# 安装到当前目录
clawhub install spotify-player

# 或者安装到指定目录
clawhub install spotify-player --dir ./my-skills

# 更新所有技能
clawhub update --all
```

---

## 创建自定义 Skill

1. 使用 skill-creator 技能引导创建
2. 或者手动创建目录结构：
   ```
   my-skill/
   ├── SKILL.md        # 必需：元数据 + 说明
   ├── scripts/        # 可选：可执行脚本
   ├── references/     # 可选：参考文档
   └── assets/         # 可选：资源文件
   ```

3. SKILL.md 格式：
   ```markdown
   ---
   name: my-skill
   description: 技能描述（触发关键词）
   metadata: { "openclaw": { "emoji": "🎯", "requires": { "bins": ["命令"] } } }
   ---
   
   # 使用说明
   ...
   ```

---

## 参考链接

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [ClawHub 技能市场](https://clawhub.com)
- [AgentSkills 规范](https://agentskills.io)

---

*此文档由 OpenClaw 自动生成*
