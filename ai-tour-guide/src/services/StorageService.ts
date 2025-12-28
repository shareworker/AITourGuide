import AsyncStorage from '@react-native-async-storage/async-storage';
import { LLMConfig, VoiceConfig } from '../types';

const STORAGE_KEY = '@ai_tour_guide_config';
const VOICE_STORAGE_KEY = '@ai_tour_guide_voice_config';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async saveConfig(config: LLMConfig): Promise<void> {
    try {
      const jsonValue = JSON.stringify(config);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving config:', e);
      throw e;
    }
  }

  async getConfig(): Promise<LLMConfig | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error getting config:', e);
      return null;
    }
  }

  async clearConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing config:', e);
    }
  }

  async saveVoiceConfig(config: VoiceConfig): Promise<void> {
    try {
      const jsonValue = JSON.stringify(config);
      await AsyncStorage.setItem(VOICE_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving voice config:', e);
      throw e;
    }
  }

  async getVoiceConfig(): Promise<VoiceConfig | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(VOICE_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error getting voice config:', e);
      return null;
    }
  }

  async clearVoiceConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(VOICE_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing voice config:', e);
    }
  }
}

export default StorageService.getInstance();
