import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import CryptoJS from 'crypto-js';
import { VoiceConfig } from '../types';

class AudioService {
  private static instance: AudioService;
  private recording: Audio.Recording | null = null;
  private currentSound: Audio.Sound | null = null;
  private baiduAccessToken: string | null = null;
  private baiduTokenExpiry: number = 0;
  private voiceConfig: VoiceConfig = {
    enabled: true,
    provider: 'expo-speech',
    language: 'zh-CN',
    voice: 'zh-CN-XiaoxiaoNeural',
    rate: 1.0,
  };

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }

  async startRecording(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Audio permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);

      this.recording = recording;
      console.log('[AudioService] Recording started');
    } catch (error) {
      console.error('[AudioService] Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recording) {
      console.warn('[AudioService] No active recording to stop');
      return null;
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      
      console.log('[AudioService] Recording stopped, URI:', uri);
      
      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('[AudioService] Recording file info:', fileInfo);
      }
      
      return uri;
    } catch (error) {
      console.error('[AudioService] Failed to stop recording:', error);
      this.recording = null;
      return null;
    }
  }

  async recognizeSpeech(audioUri: string): Promise<string> {
    if (!this.voiceConfig.baiduApiKey || !this.voiceConfig.baiduSecretKey) {
      throw new Error('Baidu credentials not configured for speech recognition');
    }

    console.log('[AudioService] Starting speech recognition');

    const accessToken = await this.getBaiduAccessToken();

    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64' as any,
    });

    const audioInfo = await FileSystem.getInfoAsync(audioUri);
    const audioSize = audioInfo.exists ? audioInfo.size : 0;

    const languageCode = this.voiceConfig.language.startsWith('zh') ? 'zh' : 'en';
    const devPid = languageCode === 'zh' ? 1537 : 1737;

    const requestBody = {
      format: 'wav',
      rate: 16000,
      channel: 1,
      cuid: 'ai-tour-guide',
      token: accessToken,
      dev_pid: devPid,
      speech: audioBase64,
      len: audioSize,
    };

    const response = await fetch('http://vop.baidu.com/server_api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.err_no !== 0) {
      console.error('[AudioService] Speech recognition error:', data);
      throw new Error(`Speech recognition failed: ${data.err_msg}`);
    }

    if (!data.result || data.result.length === 0) {
      throw new Error('No speech recognized');
    }

    const recognizedText = data.result[0];
    console.log('[AudioService] Recognized text:', recognizedText);

    return recognizedText;
  }

  setVoiceConfig(config: VoiceConfig): void {
    this.voiceConfig = config;
  }

  async speak(text: string): Promise<void> {
    if (!this.voiceConfig.enabled) {
      return;
    }

    try {
      if (this.voiceConfig.provider === 'tencent') {
        await this.speakWithTencent(text);
      } else if (this.voiceConfig.provider === 'baidu') {
        await this.speakWithBaidu(text);
      } else {
        await this.speakWithExpoSpeech(text);
      }
    } catch (error) {
      console.error('[AudioService] TTS error, falling back to expo-speech:', error);
      await this.speakWithExpoSpeech(text);
    }
  }

  private async speakWithTencent(text: string): Promise<void> {
    if (!this.voiceConfig.tencentSecretId || !this.voiceConfig.tencentSecretKey) {
      throw new Error('Tencent Cloud credentials not configured');
    }

    console.log('[AudioService] Using Tencent Cloud TTS');

    const voiceType = parseInt(this.voiceConfig.voice) || 1001;
    const speed = this.voiceConfig.rate;
    const volume = 5;

    const payload = {
      Text: text,
      SessionId: `session-${Date.now()}`,
      VoiceType: voiceType,
      Speed: speed,
      Volume: volume,
      Codec: 'mp3',
      SampleRate: 16000,
    };

    const headers = this.generateTencentHeaders(payload);

    const response = await fetch('https://tts.tencentcloudapi.com', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AudioService] Tencent TTS error:', errorText);
      throw new Error(`Tencent TTS failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.Response || !data.Response.Audio) {
      throw new Error('No audio data in response');
    }

    const base64Audio = data.Response.Audio;
    const fileUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
    
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (this.currentSound) {
      await this.currentSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true }
    );
    
    this.currentSound = sound;
    
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
      }
    });

    console.log('[AudioService] Tencent TTS playback started');
  }

  private generateTencentHeaders(payload: any): Record<string, string> {
    const secretId = this.voiceConfig.tencentSecretId!;
    const secretKey = this.voiceConfig.tencentSecretKey!;
    const service = 'tts';
    const host = 'tts.tencentcloudapi.com';
    const action = 'TextToVoice';
    const version = '2019-08-23';
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().split('T')[0];

    const canonicalRequest = [
      'POST',
      '/',
      '',
      `content-type:application/json\nhost:${host}\n`,
      'content-type;host',
      CryptoJS.SHA256(JSON.stringify(payload)).toString(),
    ].join('\n');

    const credentialScope = `${date}/${service}/tc3_request`;
    const hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString();
    
    const stringToSign = [
      'TC3-HMAC-SHA256',
      timestamp,
      credentialScope,
      hashedCanonicalRequest,
    ].join('\n');

    const secretDate = CryptoJS.HmacSHA256(date, `TC3${secretKey}`);
    const secretService = CryptoJS.HmacSHA256(service, secretDate);
    const secretSigning = CryptoJS.HmacSHA256('tc3_request', secretService);
    const signature = CryptoJS.HmacSHA256(stringToSign, secretSigning).toString();

    const authorization = [
      `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}`,
      `SignedHeaders=content-type;host`,
      `Signature=${signature}`,
    ].join(', ');

    return {
      'Authorization': authorization,
      'Host': host,
      'X-TC-Action': action,
      'X-TC-Version': version,
      'X-TC-Timestamp': timestamp.toString(),
      'X-TC-Region': 'ap-guangzhou',
    };
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async getBaiduAccessToken(): Promise<string> {
    if (this.baiduAccessToken && Date.now() < this.baiduTokenExpiry) {
      return this.baiduAccessToken;
    }

    if (!this.voiceConfig.baiduApiKey || !this.voiceConfig.baiduSecretKey) {
      throw new Error('Baidu credentials not configured');
    }

    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.voiceConfig.baiduApiKey}&client_secret=${this.voiceConfig.baiduSecretKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data.error_description || data.error || `HTTP ${response.status}`;
      console.error('[AudioService] Baidu token error:', data);
      throw new Error(`Failed to get Baidu access token: ${errorMsg}`);
    }
    
    if (!data.access_token) {
      console.error('[AudioService] Baidu token response:', data);
      throw new Error('No access_token in response');
    }

    this.baiduAccessToken = data.access_token;
    this.baiduTokenExpiry = Date.now() + (data.expires_in || 2592000) * 1000;

    console.log('[AudioService] Baidu access token acquired');
    return this.baiduAccessToken;
  }

  private async speakWithBaidu(text: string): Promise<void> {
    console.log('[AudioService] Using Baidu TTS');
    console.log('[AudioService] Text to speak:', text);
    console.log('[AudioService] Text length:', text.length);

    if (!text || text.trim().length === 0) {
      console.warn('[AudioService] Empty text, skipping TTS');
      return;
    }

    if (text.length > 1024) {
      console.warn('[AudioService] Text too long, truncating to 1024 chars');
      text = text.substring(0, 1024);
    }

    const accessToken = await this.getBaiduAccessToken();
    const voiceType = parseInt(this.voiceConfig.voice) || 0;
    const speed = Math.round(this.voiceConfig.rate * 5);
    const pitch = Math.round((this.voiceConfig.pitch || 1.0) * 5);
    
    const languageCode = this.voiceConfig.language.startsWith('zh') ? 'zh' : 'en';

    const params = new URLSearchParams({
      tex: text,
      tok: accessToken,
      cuid: 'ai-tour-guide',
      ctp: '1',
      lan: languageCode,
      spd: speed.toString(),
      pit: pitch.toString(),
      vol: '5',
      per: voiceType.toString(),
      aue: '3',
    });

    const url = `https://tsn.baidu.com/text2audio`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Baidu TTS failed: ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type');
    
    if (!contentType || !contentType.startsWith('audio')) {
      const errorText = await response.text();
      console.error('[AudioService] Baidu TTS error:', errorText);
      throw new Error('Baidu TTS returned error instead of audio');
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = this.arrayBufferToBase64(arrayBuffer);

    const fileUri = `${FileSystem.cacheDirectory}tts_baidu_${Date.now()}.mp3`;
    
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (this.currentSound) {
      await this.currentSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true }
    );
    
    this.currentSound = sound;
    
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
      }
    });

    console.log('[AudioService] Baidu TTS playback started');
  }

  private async speakWithExpoSpeech(text: string): Promise<void> {
    console.log(`[AudioService] Using expo-speech with language: ${this.voiceConfig.language}, rate: ${this.voiceConfig.rate}`);
    
    const availableVoices = await Speech.getAvailableVoicesAsync();
    let selectedVoice: string | undefined;
    const languagePrefix = this.voiceConfig.language.split('-')[0];
    
    const matchingVoices = availableVoices.filter(v => 
      v.language.startsWith(languagePrefix) || v.language.startsWith(this.voiceConfig.language)
    );
    
    if (matchingVoices.length > 0) {
      const preferredVoice = matchingVoices.find(v => 
        v.quality === Speech.VoiceQuality.Enhanced
      ) || matchingVoices[0];
      
      selectedVoice = preferredVoice.identifier;
      console.log(`[AudioService] Using voice: ${preferredVoice.name}`);
    }

    await Speech.speak(text, {
      language: this.voiceConfig.language,
      pitch: this.voiceConfig.pitch || 1.0,
      rate: this.voiceConfig.rate,
      voice: selectedVoice,
    });
  }

  async stopSpeaking(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      Speech.stop();
    } catch (error) {
      console.error('[AudioService] Error stopping speech:', error);
    }
  }

  isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  }
}

export default AudioService.getInstance();
