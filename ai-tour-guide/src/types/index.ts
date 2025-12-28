export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUri?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  placeName?: string;
}

export interface LLMConfig {
  provider: 'openai' | 'moonshot' | 'qwen' | 'deepseek';
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export interface VoiceConfig {
  enabled: boolean;
  provider: 'expo-speech' | 'tencent' | 'baidu'; // TTS provider
  language: string; // e.g., 'zh-CN', 'en-US', 'ja-JP'
  voice: string; // e.g., 'zh-CN-XiaoxiaoNeural' for expo, '1001' for Tencent, '0' for Baidu
  rate: number; // 0.5 - 2.0
  pitch?: number; // Optional pitch adjustment
  // Tencent Cloud specific
  tencentSecretId?: string;
  tencentSecretKey?: string;
  // Baidu specific
  baiduApiKey?: string;
  baiduSecretKey?: string;
}

export interface TourContextState {
  messages: Message[];
  currentLocation: Location | null;
  isRecording: boolean;
  isProcessing: boolean;
}
