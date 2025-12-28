import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TourProvider } from './src/contexts/TourContext';
import CameraScreen from './src/screens/CameraScreen';
import ChatScreen from './src/screens/ChatScreen';
import LLMService from './src/services/LLMService';
import AudioService from './src/services/AudioService';
import StorageService from './src/services/StorageService';
import { LLMConfig, VoiceConfig } from './src/types';

const Tab = createBottomTabNavigator();

function SetupScreen({ onComplete, initialConfig, onCancel }: { 
  onComplete: () => void; 
  initialConfig?: LLMConfig | null;
  onCancel?: () => void;
}) {
  const [provider, setProvider] = useState<LLMConfig['provider']>(initialConfig?.provider || 'moonshot');
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || '');
  const [baseURL, setBaseURL] = useState(initialConfig?.baseURL || 'https://api.moonshot.cn/v1');
  const [modelName, setModelName] = useState(initialConfig?.model || '');

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your API Key');
      return;
    }

    const config: LLMConfig = {
      provider,
      apiKey: apiKey.trim(),
      baseURL: baseURL.trim() || undefined,
      model: modelName.trim() || undefined,
    };

    try {
      await StorageService.saveConfig(config);
      LLMService.initialize(config);
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to save configuration');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.setupContainer}
      >
      <Text style={styles.setupTitle}>AI Tour Guide Setup</Text>
      
      <Text style={styles.setupLabel}>Provider:</Text>
      <View style={styles.providerButtons}>
        {(['moonshot', 'openai', 'qwen', 'deepseek'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.providerButton, provider === p && styles.providerButtonActive]}
            onPress={() => {
              setProvider(p);
              const urls = {
                moonshot: 'https://api.moonshot.cn/v1',
                openai: 'https://api.openai.com/v1',
                qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
                deepseek: 'https://api.deepseek.com/v1',
              };
              setBaseURL(urls[p]);
            }}
          >
            <Text style={[styles.providerButtonText, provider === p && styles.providerButtonTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.setupLabel}>API Key:</Text>
      <TextInput
        style={styles.setupInput}
        value={apiKey}
        onChangeText={setApiKey}
        placeholder="Enter your API key"
        autoCapitalize="none"
        secureTextEntry={true}
      />

      <Text style={styles.setupLabel}>Base URL:</Text>
      <TextInput
        style={styles.setupInput}
        value={baseURL}
        onChangeText={setBaseURL}
        placeholder="API base URL"
        autoCapitalize="none"
      />

      <Text style={styles.setupLabel}>Model Name (Optional):</Text>
      <TextInput
        style={styles.setupInput}
        value={modelName}
        onChangeText={setModelName}
        placeholder="e.g. moonshot-v1-8k-vision-preview"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.setupButton} onPress={handleSave}>
        <Text style={styles.setupButtonText}>Save Configuration</Text>
      </TouchableOpacity>

      {onCancel && (
        <TouchableOpacity style={[styles.setupButton, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.setupButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsScreen({ onEdit, onEditVoice }: { onEdit: () => void; onEditVoice: () => void }) {
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig | null>(null);

  useEffect(() => {
    loadConfig();
    loadVoiceConfig();
  }, []);

  const loadConfig = async () => {
    const savedConfig = await StorageService.getConfig();
    setConfig(savedConfig);
  };

  const loadVoiceConfig = async () => {
    const savedVoiceConfig = await StorageService.getVoiceConfig();
    setVoiceConfig(savedVoiceConfig);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>LLM Settings</Text>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Provider: <Text style={styles.settingsValue}>{config?.provider}</Text></Text>
          <Text style={styles.settingsLabel}>Model: <Text style={styles.settingsValue}>{config?.model || 'Default'}</Text></Text>
          <Text style={styles.settingsLabel}>API Key: <Text style={styles.settingsValue}>••••••••</Text></Text>
          <Text style={styles.settingsLabel}>Base URL: <Text style={styles.settingsValue}>{config?.baseURL}</Text></Text>
        </View>
        
        <TouchableOpacity style={styles.setupButton} onPress={onEdit}>
          <Text style={styles.setupButtonText}>Edit LLM Settings</Text>
        </TouchableOpacity>

        <Text style={[styles.settingsTitle, { marginTop: 20 }]}>Voice Settings</Text>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Provider: <Text style={styles.settingsValue}>{voiceConfig?.provider === 'tencent' ? 'Tencent Cloud' : voiceConfig?.provider === 'baidu' ? 'Baidu' : 'Expo Speech'}</Text></Text>
          <Text style={styles.settingsLabel}>Status: <Text style={styles.settingsValue}>{voiceConfig?.enabled ? 'Enabled' : 'Disabled'}</Text></Text>
          <Text style={styles.settingsLabel}>Language: <Text style={styles.settingsValue}>{voiceConfig?.language || 'zh-CN'}</Text></Text>
          <Text style={styles.settingsLabel}>Voice: <Text style={styles.settingsValue}>{voiceConfig?.voice || 'Default'}</Text></Text>
          <Text style={styles.settingsLabel}>Speaking Rate: <Text style={styles.settingsValue}>{voiceConfig?.rate || 1.0}x</Text></Text>
        </View>
        
        <TouchableOpacity style={styles.setupButton} onPress={onEditVoice}>
          <Text style={styles.setupButtonText}>Edit Voice Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function VoiceSettingsScreen({ onComplete, initialConfig, onCancel }: {
  onComplete: () => void;
  initialConfig?: VoiceConfig | null;
  onCancel?: () => void;
}) {
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? true);
  const [provider, setProvider] = useState<'expo-speech' | 'tencent' | 'baidu'>(initialConfig?.provider || 'expo-speech');
  const [language, setLanguage] = useState(initialConfig?.language || 'zh-CN');
  const [voice, setVoice] = useState(initialConfig?.voice || '0');
  const [rate, setRate] = useState(initialConfig?.rate || 1.0);
  const [tencentSecretId, setTencentSecretId] = useState(initialConfig?.tencentSecretId || '');
  const [tencentSecretKey, setTencentSecretKey] = useState(initialConfig?.tencentSecretKey || '');
  const [baiduApiKey, setBaiduApiKey] = useState(initialConfig?.baiduApiKey || '');
  const [baiduSecretKey, setBaiduSecretKey] = useState(initialConfig?.baiduSecretKey || '');

  const languages = [
    { code: 'zh-CN', name: '中文 (Chinese)', defaultVoice: 'zh-CN-XiaoxiaoNeural' },
    { code: 'en-US', name: 'English', defaultVoice: 'en-US-JennyNeural' },
    { code: 'ja-JP', name: '日本語 (Japanese)', defaultVoice: 'ja-JP-NanamiNeural' },
    { code: 'ko-KR', name: '한국어 (Korean)', defaultVoice: 'ko-KR-SunHiNeural' },
    { code: 'es-ES', name: 'Español (Spanish)', defaultVoice: 'es-ES-ElviraNeural' },
    { code: 'fr-FR', name: 'Français (French)', defaultVoice: 'fr-FR-DeniseNeural' },
    { code: 'de-DE', name: 'Deutsch (German)', defaultVoice: 'de-DE-KatjaNeural' },
  ];

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    const lang = languages.find(l => l.code === langCode);
    if (lang) {
      setVoice(lang.defaultVoice);
    }
  };

  const handleSave = async () => {
    const config: VoiceConfig = {
      enabled,
      provider,
      language,
      voice,
      rate,
      tencentSecretId: provider === 'tencent' ? tencentSecretId : undefined,
      tencentSecretKey: provider === 'tencent' ? tencentSecretKey : undefined,
      baiduApiKey: provider === 'baidu' ? baiduApiKey : undefined,
      baiduSecretKey: provider === 'baidu' ? baiduSecretKey : undefined,
    };

    try {
      await StorageService.saveVoiceConfig(config);
      AudioService.setVoiceConfig(config);
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to save voice configuration');
    }
  };

  const handleTest = async () => {
    const testText = language === 'zh-CN' 
      ? '你好，我是你的AI导游助手。'
      : language === 'ja-JP'
      ? 'こんにちは、私はあなたのAIツアーガイドです。'
      : language === 'ko-KR'
      ? '안녕하세요, 저는 당신의 AI 투어 가이드입니다.'
      : 'Hello, I am your AI tour guide assistant.';
    
    const tempConfig: VoiceConfig = { 
      enabled: true, 
      provider, 
      language, 
      voice, 
      rate,
      tencentSecretId: provider === 'tencent' ? tencentSecretId : undefined,
      tencentSecretKey: provider === 'tencent' ? tencentSecretKey : undefined,
      baiduApiKey: provider === 'baidu' ? baiduApiKey : undefined,
      baiduSecretKey: provider === 'baidu' ? baiduSecretKey : undefined,
    };
    AudioService.setVoiceConfig(tempConfig);
    await AudioService.speak(testText);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.setupContainer}>
        <Text style={styles.setupTitle}>Voice Settings</Text>

        <Text style={styles.setupLabel}>Provider:</Text>
        <View style={styles.providerButtons}>
          <TouchableOpacity
            style={[styles.providerButton, provider === 'expo-speech' && styles.providerButtonActive]}
            onPress={() => setProvider('expo-speech')}
          >
            <Text style={[styles.providerButtonText, provider === 'expo-speech' && styles.providerButtonTextActive]}>Expo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.providerButton, provider === 'tencent' && styles.providerButtonActive]}
            onPress={() => setProvider('tencent')}
          >
            <Text style={[styles.providerButtonText, provider === 'tencent' && styles.providerButtonTextActive]}>Tencent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.providerButton, provider === 'baidu' && styles.providerButtonActive]}
            onPress={() => setProvider('baidu')}
          >
            <Text style={[styles.providerButtonText, provider === 'baidu' && styles.providerButtonTextActive]}>Baidu</Text>
          </TouchableOpacity>
        </View>

        {provider === 'tencent' && (
          <>
            <Text style={styles.setupLabel}>Tencent SecretId:</Text>
            <TextInput
              style={styles.setupInput}
              value={tencentSecretId}
              onChangeText={setTencentSecretId}
              placeholder="输入腾讯云 SecretId"
              autoCapitalize="none"
            />

            <Text style={styles.setupLabel}>Tencent SecretKey:</Text>
            <TextInput
              style={styles.setupInput}
              value={tencentSecretKey}
              onChangeText={setTencentSecretKey}
              placeholder="输入腾讯云 SecretKey"
              autoCapitalize="none"
              secureTextEntry={true}
            />

            <Text style={styles.setupLabel}>Voice Type (音色编号):</Text>
            <TextInput
              style={styles.setupInput}
              value={voice}
              onChangeText={setVoice}
              placeholder="例如: 1001 (智瑜), 1002 (智聆)"
              keyboardType="numeric"
            />
          </>
        )}

        {provider === 'baidu' && (
          <>
            <Text style={styles.setupLabel}>Baidu API Key:</Text>
            <TextInput
              style={styles.setupInput}
              value={baiduApiKey}
              onChangeText={setBaiduApiKey}
              placeholder="输入百度 API Key"
              autoCapitalize="none"
            />

            <Text style={styles.setupLabel}>Baidu Secret Key:</Text>
            <TextInput
              style={styles.setupInput}
              value={baiduSecretKey}
              onChangeText={setBaiduSecretKey}
              placeholder="输入百度 Secret Key"
              autoCapitalize="none"
              secureTextEntry={true}
            />

            <Text style={styles.setupLabel}>Voice Type (发音人选择):</Text>
            <Text style={[styles.setupLabel, { fontSize: 12, color: '#666', marginTop: -8 }]}>
              中文: 0=度小美(女), 1=度小宇(男), 3=度逍遥(男), 4=度丫丫(女)
            </Text>
            <Text style={[styles.setupLabel, { fontSize: 12, color: '#666', marginTop: -8 }]}>
              英文: 0=度小美, 1=度小宇
            </Text>
            <TextInput
              style={styles.setupInput}
              value={voice}
              onChangeText={setVoice}
              placeholder="输入发音人编号 (0-4)"
              keyboardType="numeric"
            />
          </>
        )}

        <View style={styles.providerButtons}>
          <TouchableOpacity
            style={[styles.providerButton, enabled && styles.providerButtonActive]}
            onPress={() => setEnabled(true)}
          >
            <Text style={[styles.providerButtonText, enabled && styles.providerButtonTextActive]}>Enabled</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.providerButton, !enabled && styles.providerButtonActive]}
            onPress={() => setEnabled(false)}
          >
            <Text style={[styles.providerButtonText, !enabled && styles.providerButtonTextActive]}>Disabled</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.setupLabel}>Language:</Text>
        <View style={styles.languageList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.languageButton, language === lang.code && styles.languageButtonActive]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={[styles.languageButtonText, language === lang.code && styles.languageButtonTextActive]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.setupLabel}>Speaking Rate: {rate.toFixed(1)}x</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>0.5x</Text>
          <View style={styles.slider}>
            <TouchableOpacity
              style={[styles.sliderTrack, { width: `${(rate - 0.5) / 1.5 * 100}%` }]}
              onPress={(e) => {
                const width = e.nativeEvent.locationX;
                const newRate = 0.5 + (width / 300) * 1.5;
                setRate(Math.max(0.5, Math.min(2.0, newRate)));
              }}
            >
              <View style={styles.sliderThumb} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sliderLabel}>2.0x</Text>
        </View>

        <TouchableOpacity style={[styles.setupButton, { backgroundColor: '#4CAF50' }]} onPress={handleTest}>
          <Text style={styles.setupButtonText}>🔊 Test Voice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.setupButton} onPress={handleSave}>
          <Text style={styles.setupButtonText}>Save Voice Settings</Text>
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity style={[styles.setupButton, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.setupButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConfig, setCurrentConfig] = useState<LLMConfig | null>(null);
  const [currentVoiceConfig, setCurrentVoiceConfig] = useState<VoiceConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingVoice, setIsEditingVoice] = useState(false);

  const handleSetupComplete = () => {
    setIsEditing(false);
    checkConfiguration();
  };

  const handleVoiceSetupComplete = () => {
    setIsEditingVoice(false);
    checkConfiguration();
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const config = await StorageService.getConfig();
      if (config) {
        setCurrentConfig(config);
        LLMService.initialize(config);
        setIsConfigured(true);
      }

      const voiceConfig = await StorageService.getVoiceConfig();
      if (voiceConfig) {
        setCurrentVoiceConfig(voiceConfig);
        AudioService.setVoiceConfig(voiceConfig);
      } else {
        const defaultVoiceConfig: VoiceConfig = {
          enabled: true,
          provider: 'expo-speech',
          language: 'zh-CN',
          voice: 'zh-CN-XiaoxiaoNeural',
          rate: 1.0,
        };
        AudioService.setVoiceConfig(defaultVoiceConfig);
      }
    } catch (error) {
      console.error('Failed to load config', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!isConfigured || isEditing) {
    return (
      <SetupScreen 
        onComplete={handleSetupComplete} 
        initialConfig={currentConfig}
        onCancel={isEditing ? () => setIsEditing(false) : undefined}
      />
    );
  }

  if (isEditingVoice) {
    return (
      <VoiceSettingsScreen
        onComplete={handleVoiceSetupComplete}
        initialConfig={currentVoiceConfig}
        onCancel={() => setIsEditingVoice(false)}
      />
    );
  }

  return (
    <TourProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: '#666',
          }}
        >
          <Tab.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              tabBarLabel: 'Guide',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📷</Text>,
            }}
          />
          <Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              tabBarLabel: 'Chat',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💬</Text>,
            }}
          />
          <Tab.Screen 
            name="Settings" 
            options={{ tabBarLabel: 'Settings', headerShown: false }}
          >
            {() => (
              <SettingsScreen 
                onEdit={() => setIsEditing(true)}
                onEditVoice={() => setIsEditingVoice(true)}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </TourProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  setupContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  setupLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  providerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    marginHorizontal: -5,
  },
  providerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    margin: 5,
  },
  providerButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  providerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  providerButtonTextActive: {
    color: '#fff',
  },
  setupInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  setupButton: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
    marginTop: 10,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  settingsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  settingsValue: {
    fontWeight: 'normal',
    color: '#666',
  },
  languageList: {
    marginTop: 10,
    marginBottom: 10,
  },
  languageButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  languageButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  languageButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
    width: 40,
  },
  slider: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#2196F3',
    borderRadius: 3,
    position: 'relative',
  },
  sliderThumb: {
    position: 'absolute',
    right: -10,
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
});
