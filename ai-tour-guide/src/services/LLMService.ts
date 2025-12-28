import { LLMConfig, Location } from '../types';
import StorageService from './StorageService';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

class LLMService {
  private static instance: LLMService;
  private config: LLMConfig | null = null;

  private constructor() {}

  static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  initialize(config: LLMConfig) {
    this.config = config;
  }

  private async callAPI(messages: ChatMessage[], maxTokens: number = 500): Promise<string> {
    if (!this.config) {
      throw new Error('LLMService not initialized');
    }

    const baseURL = this.config.baseURL || this.getDefaultBaseURL(this.config.provider);
    const model = this.config.model || this.getDefaultModel(this.config.provider);

    console.log(`[LLMService] Calling ${this.config.provider} API at ${baseURL}`);
    console.log(`[LLMService] Model: ${model}`);
    
    // Log messages without huge base64 strings
    const logMessages = messages.map(m => ({
      ...m,
      content: Array.isArray(m.content) 
        ? m.content.map(c => c.type === 'image_url' ? { type: 'image_url', image_url: { url: 'DATA_REDACTED' } } : c)
        : m.content
    }));
    console.log(`[LLMService] Messages:`, JSON.stringify(logMessages, null, 2));

    try {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LLMService] API Error (${response.status}):`, errorText);
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log(`[LLMService] API Success`);
      return data.choices[0]?.message?.content || 'No response from AI';
    } catch (error) {
      console.error(`[LLMService] Request failed:`, error);
      throw error;
    }
  }

  private getDefaultBaseURL(provider: LLMConfig['provider']): string {
    const urls = {
      openai: 'https://api.openai.com/v1',
      moonshot: 'https://api.moonshot.cn/v1',
      qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      deepseek: 'https://api.deepseek.com/v1',
    };
    return urls[provider];
  }

  private getDefaultModel(provider: LLMConfig['provider']): string {
    const models = {
      openai: 'gpt-4o',
      moonshot: 'moonshot-v1-8k-vision-preview',
      qwen: 'qwen-vl-max',
      deepseek: 'deepseek-chat',
    };
    return models[provider];
  }

  private async getLanguageInstruction(): Promise<string> {
    try {
      const voiceConfig = await StorageService.getVoiceConfig();
      if (!voiceConfig || !voiceConfig.language) {
        return 'Please respond in Chinese (中文).';
      }

      const languageMap: Record<string, string> = {
        'zh-CN': 'Please respond in Chinese (中文).',
        'zh-TW': 'Please respond in Traditional Chinese (繁體中文).',
        'en-US': 'Please respond in English.',
        'ja-JP': 'Please respond in Japanese (日本語).',
        'ko-KR': 'Please respond in Korean (한국어).',
        'es-ES': 'Please respond in Spanish (Español).',
        'fr-FR': 'Please respond in French (Français).',
        'de-DE': 'Please respond in German (Deutsch).',
      };

      return languageMap[voiceConfig.language] || 'Please respond in Chinese (中文).';
    } catch (error) {
      console.error('[LLMService] Failed to get language instruction:', error);
      return 'Please respond in Chinese (中文).';
    }
  }

  async analyzeImage(
    imageBase64: string,
    location: Location | null,
    conversationHistory: string[]
  ): Promise<string> {
    const languageInstruction = await this.getLanguageInstruction();
    const systemPrompt = `You are a knowledgeable and friendly tour guide. Provide engaging, informative commentary about landmarks, buildings, and scenery. Keep responses concise but interesting. ${languageInstruction}`;

    const contextInfo = location
      ? `Current location: ${location.placeName || `${location.latitude}, ${location.longitude}`}`
      : '';

    const historyContext =
      conversationHistory.length > 0
        ? `Recent conversation:\n${conversationHistory.slice(-3).join('\n')}`
        : '';

    const userPrompt = `${contextInfo}\n${historyContext}\n\nWhat can you tell me about what you see in this image?`;

    // Moonshot (Kimi) Vision API requirements: 
    // 1. Put image_url before text content
    // 2. Some vision models prefer no system message, merging it into user message for better compatibility
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
          { type: 'text', text: `${systemPrompt}\n\n${userPrompt}` },
        ],
      },
    ];

    return this.callAPI(messages, 500);
  }

  async chat(
    message: string,
    location: Location | null,
    conversationHistory: string[]
  ): Promise<string> {
    const languageInstruction = await this.getLanguageInstruction();
    const systemPrompt = `You are a knowledgeable and friendly tour guide. Answer questions about locations, provide recommendations, and help travelers plan their visits. ${languageInstruction}`;

    const contextInfo = location
      ? `Current location: ${location.placeName || `${location.latitude}, ${location.longitude}`}`
      : '';

    const messages: ChatMessage[] = [
      { role: 'system', content: `${systemPrompt}\n${contextInfo}` },
    ];

    conversationHistory.slice(-6).forEach((msg, idx) => {
      messages.push({
        role: idx % 2 === 0 ? 'user' : 'assistant',
        content: msg,
      });
    });

    messages.push({ role: 'user', content: message });

    return this.callAPI(messages, 500);
  }
}

export default LLMService.getInstance();
