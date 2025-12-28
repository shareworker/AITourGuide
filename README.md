# 🎯 AI Tour Guide

一个基于 AI 的智能导游应用，使用视觉识别和语音交互技术，为用户提供实时的景点讲解和旅游建议。

An AI-powered tour guide mobile application that uses computer vision and voice interaction to provide real-time commentary about landmarks and personalized travel recommendations.

---

## ✨ 核心功能 / Key Features

### 📷 视觉识别 / Camera Vision
- 拍摄景点照片，获取 AI 生成的详细讲解
- 支持多种 LLM 视觉模型（Moonshot Vision, GPT-4o, Qwen, DeepSeek）
- 自动压缩图片以优化 API 成本
- 基于 GPS 位置提供上下文相关信息

### 💬 智能对话 / Chat Interface
- 与 AI 导游进行自然对话
- 获取个性化旅游建议和推荐
- 保持对话上下文，支持连续提问
- 多轮对话历史记录

### 🎤 语音交互 / Voice Interaction
**语音输入（Speech-to-Text）**:
- 百度语音识别（推荐）- 支持普通话、英语
- 实时录音指示器
- 自动填充识别文字

**语音播报（Text-to-Speech）**:
- 百度 TTS - 多种中文和英文发音人
- 腾讯云 TTS - 高质量语音合成
- Expo Speech - 系统内置 TTS（默认）
- 支持语速、音高调节
- 多语言支持（中文、英文、日文、韩文等）

### 📍 位置感知 / Location Awareness
- 基于 GPS 自动获取当前位置
- 提供位置相关的上下文信息
- 反向地理编码（地点名称）

### 🌍 多语言支持 / Multi-language
- 支持中文、英文、日文、韩文等多种语言
- AI 回复语言自动匹配 TTS 语言设置
- 灵活的语言配置

---

## 🛠️ 技术栈 / Tech Stack

### 前端框架 / Frontend
- **React Native** (Expo SDK 54)
- **TypeScript**
- **React Navigation** - 底部导航栏
- **AsyncStorage** - 本地数据持久化

### AI 服务 / AI Services
**LLM 视觉模型**:
- Moonshot AI (Kimi) - 推荐，中文优化
- OpenAI GPT-4o - 最强视觉理解
- Qwen (通义千问) - 阿里云服务
- DeepSeek - 性价比高

**语音服务**:
- 百度语音 - TTS + STT
- 腾讯云 - TTS
- Expo Speech - 系统 TTS

### 核心依赖 / Core Dependencies
```json
{
  "expo": "~54.0.30",
  "expo-camera": "^17.0.10",
  "expo-location": "^19.0.8",
  "expo-av": "^16.0.8",
  "expo-speech": "^14.0.8",
  "@react-native-async-storage/async-storage": "2.2.0",
  "crypto-js": "^4.2.0"
}
```

---

## 📦 安装 / Installation

### 环境要求 / Prerequisites
- Node.js 18+ 
- npm 或 yarn
- Expo Go App（用于物理设备测试）
- Android Studio 或 Xcode（用于模拟器）

### 1. 克隆项目 / Clone Repository
```bash
cd AITourGuide/ai-tour-guide
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
- **iOS 模拟器**: 按 `i`
- **Android 模拟器**: 按 `a`
- **物理设备**: 使用 Expo Go 扫描二维码

---

## ⚙️ 配置 / Configuration

### 首次启动配置 / Initial Setup

应用首次启动时会显示配置向导，需要配置以下内容：

### 1. LLM 服务配置 / LLM Service Configuration

选择并配置一个 LLM 提供商：

#### Moonshot AI (Kimi) - 推荐中国用户
```
模型: moonshot-v1-8k-vision-preview
Base URL: https://api.moonshot.cn/v1
获取 API Key: https://platform.moonshot.cn
特点: 中文优化，视觉能力强，价格实惠
```

#### OpenAI
```
模型: gpt-4o
Base URL: https://api.openai.com/v1
获取 API Key: https://platform.openai.com
特点: 最强大的视觉理解能力
```

#### Qwen (通义千问)
```
模型: qwen-vl-max
Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1
获取 API Key: https://dashscope.aliyun.com
特点: 阿里云服务，中文优化
```

#### DeepSeek
```
模型: deepseek-chat
Base URL: https://api.deepseek.com/v1
获取 API Key: https://platform.deepseek.com
特点: 性价比高
```

### 2. 语音服务配置 / Voice Service Configuration

在 **Settings → Edit Voice Settings** 中配置：

#### 百度语音服务（推荐）
```
获取密钥: https://ai.baidu.com
免费额度: 每日 50,000 次调用（TTS + STT 共享）
```

**配置步骤**:
1. 注册百度智能云账号
2. 创建"语音技术"应用
3. 获取 API Key 和 Secret Key
4. 在应用中选择 "Baidu" 提供商
5. 输入 API Key 和 Secret Key

**支持功能**:
- 语音合成 (TTS): 多种中文和英文发音人
  - 中文: 0=度小美(女), 1=度小宇(男), 3=度逍遥(男), 4=度丫丫(女)
  - 英文: 0=度小美, 1=度小宇
- 语音识别 (STT): 普通话、英语识别

#### 腾讯云语音服务
```
获取密钥: https://console.cloud.tencent.com
免费额度: 前 3 个月免费
```

**配置步骤**:
1. 注册腾讯云账号
2. 开通"语音合成"服务
3. 获取 SecretId 和 SecretKey
4. 在应用中选择 "Tencent" 提供商
5. 输入 SecretId 和 SecretKey

**支持功能**:
- 语音合成 (TTS): 高质量语音合成

#### Expo Speech（默认）
```
无需配置，开箱即用
使用系统内置 TTS 引擎
音质较为机械
```

### 语音设置选项
- **Provider**: 选择 TTS 提供商
- **Language**: 选择语言（中文/英文/日文等）
- **Voice Type**: 选择发音人
- **Speaking Rate**: 语速 (0.5x - 2.0x)
- **Pitch**: 音高调节

---

## 📱 使用说明 / Usage Guide

### 相机模式 / Camera Mode

1. **授予权限**: 首次使用时授予相机和位置权限
2. **拍摄景点**: 将相机对准景点、建筑或风景
3. **获取讲解**: 点击 **"What is this?"** 按钮
4. **收听播报**: AI 会生成讲解并自动播报

**拍照技巧**:
- 确保景点在画面中清晰可见
- 避免过度曝光或过暗
- 尽量包含标志性特征

### 聊天模式 / Chat Mode

#### 文字输入
1. 在输入框中输入问题
2. 点击发送按钮 ➤
3. 等待 AI 回复
4. 收听语音播报（如果启用）

#### 语音输入
1. 点击麦克风图标 🎤 开始录音
2. 清晰地说话（例如："这是什么地方？"）
3. 再次点击停止录音 ⏹
4. 识别的文字会自动填入输入框
5. 点击发送按钮

**语音输入技巧**:
- 在安静环境中录音
- 清晰地说话
- 录音时长建议 2-5 秒
- 说完后立即停止录音

### 设置 / Settings

- **Edit API Configuration**: 修改 LLM 服务配置
- **Edit Voice Settings**: 配置语音服务
- **Test Voice**: 测试当前语音配置

---

## 📁 项目结构 / Project Structure

```
ai-tour-guide/
├── src/
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
├── tsconfig.json            # TypeScript 配置
└── README.md                # 项目文档
```

---

## 🔑 所需权限 / Required Permissions

- **相机 / Camera**: 拍摄景点照片
- **麦克风 / Microphone**: 语音输入
- **位置 / Location**: 提供位置上下文信息

---

## 💡 使用技巧 / Tips

### 节省 API 费用
- 图片会自动压缩以优化成本
- 对话历史仅保留最近 3 条以减少 token 消耗
- 语音合成文本会自动截断至 1024 字符
- 选择性价比高的 LLM 提供商（如 DeepSeek）

### 提高识别准确度
- 拍摄清晰的照片
- 在光线充足的环境下拍摄
- 包含景点的标志性特征
- 提供清晰的语音输入

### 优化语音体验
- 使用云 TTS 服务获得更自然的语音
- 根据内容语言选择合适的发音人
- 调整语速以适应个人偏好

---

## 🐛 常见问题 / Troubleshooting

### 语音识别结果为空
**可能原因**:
- 麦克风权限未授予
- 录音时长太短（< 1 秒）
- 百度 API 配置错误
- 网络连接问题

**解决方案**:
1. 检查麦克风权限是否授予
2. 确保录音时长足够（至少 1-2 秒）
3. 验证百度 API Key 和 Secret Key
4. 检查网络连接
5. 查看控制台日志中的错误信息

### 语音播报失败
**可能原因**:
- TTS 提供商配置错误
- API Key 无效或过期
- 网络连接问题
- 免费额度用完

**解决方案**:
1. 检查 TTS 提供商配置
2. 验证 API Key 是否正确
3. 检查网络连接
4. 查看 API 余额或免费额度
5. 尝试切换到其他 TTS 提供商

### LLM 响应错误
**可能原因**:
- API Key 无效
- Base URL 错误
- 模型名称不匹配
- API 余额不足
- 网络超时

**解决方案**:
1. 验证 API Key 是否有效
2. 检查 Base URL 是否正确
3. 确认模型名称是否匹配
4. 查看 API 余额是否充足
5. 检查网络连接
6. 查看控制台错误日志

### 相机无法打开
**可能原因**:
- 相机权限未授予
- 设备相机故障
- 应用崩溃

**解决方案**:
1. 检查相机权限
2. 重启应用
3. 检查设备相机是否正常工作
4. 重启设备

### 应用启动失败
**可能原因**:
- 依赖未安装
- Node 版本不兼容
- Expo 版本问题

**解决方案**:
1. 运行 `npm install` 重新安装依赖
2. 检查 Node.js 版本（需要 18+）
3. 清除缓存: `npx expo start -c`
4. 删除 `node_modules` 和 `package-lock.json`，重新安装

---

## 🚀 未来计划 / Future Plans

- [ ] 支持更多 TTS 提供商 (Azure, Google Cloud)
- [ ] 实时语音对话（流式 STT）
- [ ] 离线模式支持
- [ ] 多人协同导游
- [ ] 旅游路线规划
- [ ] 景点收藏和笔记
- [ ] 转换为 Web 应用（PWA）
- [ ] 打包为独立 APK/IPA

---

## 📊 API 配额参考 / API Quota Reference

### 百度语音
- **免费额度**: 每日 50,000 次（TTS + STT 共享）
- **超出后**: 需要付费或等待次日重置

### 腾讯云语音
- **免费额度**: 前 3 个月免费
- **超出后**: 按量计费

### LLM 服务
- **Moonshot**: 新用户赠送额度，后续按 token 计费
- **OpenAI**: 按 token 计费，需要信用卡
- **Qwen**: 新用户赠送额度，后续按量计费
- **DeepSeek**: 价格较低，按 token 计费

---

## 🔒 隐私和安全 / Privacy & Security

- API Key 存储在本地设备，不会上传到服务器
- 图片仅发送到配置的 LLM 服务商
- 语音数据仅发送到配置的语音服务商
- 不收集用户个人信息
- 建议不要在公共设备上保存 API Key

---

## 📄 许可证 / License

MIT License

---

## 🤝 贡献 / Contributing

欢迎提交 Issue 和 Pull Request！

如果你发现 bug 或有功能建议，请：
1. 在 GitHub Issues 中提交问题
2. 详细描述问题或建议
3. 提供复现步骤（如果是 bug）

---

## 📧 联系方式 / Contact

如有问题或建议，请提交 Issue。

---

**Enjoy your AI-powered tour! 🌍✨**
