# 🎯 AI Tour Guide

一个基于 AI 的智能导游应用，使用视觉识别和语音交互技术，为用户提供实时的景点讲解和旅游建议。

An AI-powered tour guide mobile application that uses computer vision and voice interaction to provide real-time commentary about landmarks and personalized travel recommendations.

## ✨ 核心功能 / Key Features

- 📷 **视觉识别 / Camera Vision**: 拍摄景点照片，获取 AI 生成的详细讲解
- 💬 **智能对话 / Chat Interface**: 与 AI 导游对话，获取个性化旅游建议
- 🎤 **语音交互 / Voice Interaction**: 
  - 语音输入（Speech-to-Text）- 百度语音识别
  - 语音播报（Text-to-Speech）- 支持百度、腾讯云、Expo Speech
- 📍 **位置感知 / Location Awareness**: 基于 GPS 提供位置相关的上下文信息
- 🌍 **多语言支持 / Multi-language**: 支持中文、英文、日文、韩文等多种语言

## 🛠️ 技术栈 / Tech Stack

### 前端框架 / Frontend
- **React Native** (Expo SDK 54)
- **TypeScript**
- **React Navigation** - 底部导航栏

### AI 服务 / AI Services
- **LLM 视觉模型**: Moonshot Vision (推荐) / OpenAI GPT-4o / Qwen / DeepSeek
- **语音合成 (TTS)**: 百度 TTS / 腾讯云 TTS / Expo Speech
- **语音识别 (STT)**: 百度语音识别

### 核心依赖 / Core Dependencies
- `expo-camera` - 相机功能
- `expo-location` - GPS 定位
- `expo-av` - 音频播放
- `expo-speech` - 基础语音合成
- `@react-native-async-storage/async-storage` - 本地存储
- `crypto-js` - 加密签名（腾讯云 API）

## 📦 安装 / Installation

### 1. 克隆项目 / Clone Repository
```bash
git clone <repository-url>
cd ai-tour-guide
```

### 2. 安装依赖 / Install Dependencies
```bash
npm install
```

### 3. 启动开发服务器 / Start Development Server
```bash
npx expo start
```

### 4. 运行应用 / Run App
- **iOS**: 按 `i` 或在 iOS 模拟器中打开
- **Android**: 按 `a` 或在 Android 模拟器中打开
- **物理设备**: 使用 Expo Go 扫描二维码

## ⚙️ 配置 / Configuration

### 首次启动配置 / Initial Setup

应用首次启动时会显示配置向导，需要配置以下内容：

#### 1. LLM 服务配置 / LLM Service Configuration

选择并配置一个 LLM 提供商：

**Moonshot AI (Kimi)** - 推荐中国用户使用
- 模型: `moonshot-v1-8k-vision-preview`
- Base URL: `https://api.moonshot.cn/v1`
- 获取 API Key: [platform.moonshot.cn](https://platform.moonshot.cn)
- 特点: 中文优化，视觉能力强

**OpenAI**
- 模型: `gpt-4o`
- Base URL: `https://api.openai.com/v1`
- 获取 API Key: [platform.openai.com](https://platform.openai.com)
- 特点: 最强大的视觉理解能力

**Qwen (通义千问)**
- 模型: `qwen-vl-max`
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- 获取 API Key: [dashscope.aliyun.com](https://dashscope.aliyun.com)
- 特点: 阿里云服务，中文优化

**DeepSeek**
- 模型: `deepseek-chat`
- Base URL: `https://api.deepseek.com/v1`
- 获取 API Key: [platform.deepseek.com](https://platform.deepseek.com)
- 特点: 性价比高

#### 2. 语音服务配置 / Voice Service Configuration

在 **Settings → Edit Voice Settings** 中配置：

**百度语音服务** (推荐 / Recommended)
- 获取 API Key 和 Secret Key: [ai.baidu.com](https://ai.baidu.com)
- 免费额度: 每日 50,000 次调用（TTS + STT 共享）
- 支持功能:
  - 语音合成 (TTS): 多种中文和英文发音人
  - 语音识别 (STT): 普通话、英语识别
- 配置步骤:
  1. 注册百度智能云账号
  2. 创建语音技术应用
  3. 获取 API Key 和 Secret Key
  4. 在应用中选择 "Baidu" 提供商
  5. 输入 API Key 和 Secret Key

**腾讯云语音服务**
- 获取密钥: [console.cloud.tencent.com](https://console.cloud.tencent.com)
- 免费额度: 前 3 个月免费
- 支持功能: 语音合成 (TTS)
- 配置步骤:
  1. 注册腾讯云账号
  2. 开通语音合成服务
  3. 获取 SecretId 和 SecretKey
  4. 在应用中选择 "Tencent" 提供商
  5. 输入 SecretId 和 SecretKey

**Expo Speech** (默认)
- 无需配置，开箱即用
- 使用系统内置 TTS 引擎
- 音质较为机械

### 语音设置选项 / Voice Settings Options

- **Provider**: 选择 TTS 提供商 (Expo Speech / Baidu / Tencent)
- **Language**: 选择语言 (中文 / 英文 / 日文等)
- **Voice Type**: 选择发音人
  - 百度中文: 0=度小美(女), 1=度小宇(男), 3=度逍遥(男), 4=度丫丫(女)
  - 百度英文: 0=度小美, 1=度小宇
- **Speaking Rate**: 语速 (0.5x - 2.0x)
- **Pitch**: 音高调节

## 📱 使用说明 / Usage Guide

### 相机模式 / Camera Mode

1. **授予权限**: 首次使用时授予相机和位置权限
2. **拍摄景点**: 将相机对准景点、建筑或风景
3. **获取讲解**: 点击 "What is this?" 按钮
4. **收听播报**: AI 会生成讲解并自动播报

### 聊天模式 / Chat Mode

1. **文字输入**: 在输入框中输入问题
2. **语音输入**: 
   - 点击麦克风图标 🎤 开始录音
   - 说话（例如："这是什么地方？"）
   - 再次点击停止录音 ⏹
   - 识别的文字会自动填入输入框
3. **发送消息**: 点击发送按钮 ➤
4. **收听回复**: AI 回复会自动播报（如果启用了语音）

### 设置 / Settings

- **Edit API Configuration**: 修改 LLM 服务配置
- **Edit Voice Settings**: 配置语音服务
- **Test Voice**: 测试当前语音配置

## 📁 项目结构 / Project Structure

```
ai-tour-guide/
├── src/
│   ├── components/          # 可复用组件 (暂未使用)
│   ├── contexts/            # React Context
│   │   └── TourContext.tsx  # 全局状态管理
│   ├── screens/             # 主要页面
│   │   ├── CameraScreen.tsx # 相机页面
│   │   └── ChatScreen.tsx   # 聊天页面
│   ├── services/            # 业务逻辑服务
│   │   ├── AudioService.ts  # 音频服务 (TTS/STT/录音)
│   │   ├── LLMService.ts    # LLM API 调用
│   │   ├── LocationService.ts # GPS 定位
│   │   └── StorageService.ts  # 本地存储
│   └── types/               # TypeScript 类型定义
│       └── index.ts
├── assets/                  # 应用资源 (图标、启动页)
├── App.tsx                  # 主应用入口
├── app.json                 # Expo 配置
├── package.json             # 依赖配置
└── tsconfig.json            # TypeScript 配置
```

## 🔑 所需权限 / Required Permissions

- **相机 / Camera**: 拍摄景点照片
- **麦克风 / Microphone**: 语音输入
- **位置 / Location**: 提供位置上下文信息

## 💡 使用技巧 / Tips

### 拍照技巧
- 确保景点在画面中清晰可见
- 避免过度曝光或过暗
- 尽量包含标志性特征

### 语音输入技巧
- 在安静环境中录音
- 清晰地说话
- 录音时长建议 2-5 秒
- 说完后立即停止录音

### 节省 API 费用
- 图片会自动压缩以优化成本
- 对话历史仅保留最近 3 条以减少 token 消耗
- 语音合成文本会自动截断至 1024 字符

## 🐛 常见问题 / Troubleshooting

### 语音识别结果为空
- 检查麦克风权限是否授予
- 确保录音时长足够（至少 1-2 秒）
- 检查百度 API 配置是否正确
- 查看控制台日志中的错误信息

### 语音播报失败
- 检查 TTS 提供商配置
- 验证 API Key 是否正确
- 检查网络连接
- 查看免费额度是否用完

### LLM 响应错误
- 验证 API Key 是否有效
- 检查 Base URL 是否正确
- 确认模型名称是否匹配
- 查看 API 余额是否充足

### 相机无法打开
- 检查相机权限
- 重启应用
- 检查设备相机是否正常工作

## 🚀 未来计划 / Future Plans

- [ ] 支持更多 TTS 提供商 (Azure, Google Cloud)
- [ ] 实时语音对话（流式 STT）
- [ ] 离线模式支持
- [ ] 多人协同导游
- [ ] 旅游路线规划
- [ ] 景点收藏和笔记
- [ ] 打包为独立 APK/IPA

## 📄 许可证 / License

MIT License

## 🤝 贡献 / Contributing

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式 / Contact

如有问题或建议，请提交 Issue。

---

**Enjoy your AI-powered tour! 🌍✨**
