/**
 * Cliente para a Gemini Live API (WebSocket bidirecional).
 * Captura áudio PCM 16kHz mono do microfone, envia para o Gemini,
 * e toca áudio PCM 24kHz mono recebido em tempo real.
 */

const WS_URL =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

const MODEL = 'models/gemini-2.5-flash-preview-native-audio-dialog';

const SYSTEM_INSTRUCTION =
  'Você é a Sexta Feira, uma assistente de inteligência artificial da ALPS. Você é inteligente, simpática, objetiva e fala português brasileiro de forma natural. Sempre responda de forma clara e útil.';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export class GeminiLiveClient {
  constructor({ token, onStatusChange, onTranscript, onError }) {
    this.token = token;
    this.onStatusChange = onStatusChange || (() => {});
    this.onTranscript = onTranscript || (() => {});
    this.onError = onError || (() => {});

    this.ws = null;
    this.audioContext = null;
    this.micStream = null;
    this.micSource = null;
    this.processor = null;
    this.playbackContext = null;
    this.playbackQueue = [];
    this.nextPlayTime = 0;
    this.isPlaying = false;
    this.muted = false;
    this.closed = false;
  }

  async connect() {
    this.onStatusChange('connecting');

    const url = `${WS_URL}?key=${encodeURIComponent(this.token)}`;
    this.ws = new WebSocket(url);

    await new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(new Error('WebSocket connection error'));
      setTimeout(() => reject(new Error('WebSocket timeout')), 10000);
    });

    // Send setup message
    this.ws.send(
      JSON.stringify({
        setup: {
          model: MODEL,
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
              languageCode: 'pt-BR',
            },
          },
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      })
    );

    this.ws.onmessage = (ev) => this._handleMessage(ev);
    this.ws.onerror = () => this.onError('Erro de conexão');
    this.ws.onclose = () => {
      if (!this.closed) this.onStatusChange('disconnected');
    };

    await this._initAudio();
    this.onStatusChange('listening');

    // Kickstart greeting — ask the model to greet the user.
    this.ws.send(
      JSON.stringify({
        clientContent: {
          turns: [
            {
              role: 'user',
              parts: [
                {
                  text:
                    'Cumprimente o usuário brevemente se apresentando como Sexta Feira e pergunte como pode ajudar. Seja calorosa e natural.',
                },
              ],
            },
          ],
          turnComplete: true,
        },
      })
    );
  }

  async _initAudio() {
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioCtx({ sampleRate: INPUT_SAMPLE_RATE });
    this.playbackContext = new AudioCtx({ sampleRate: OUTPUT_SAMPLE_RATE });

    this.micSource = this.audioContext.createMediaStreamSource(this.micStream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (this.muted || this.ws?.readyState !== WebSocket.OPEN || this.isPlaying) return;
      const input = e.inputBuffer.getChannelData(0);
      const pcm16 = this._floatTo16BitPCM(input);
      const b64 = this._arrayBufferToBase64(pcm16.buffer);
      this.ws.send(
        JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: b64 }],
          },
        })
      );
    };

    this.micSource.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  async _handleMessage(ev) {
    try {
      // Gemini sends Blob in browsers — convert to text first
      const raw = ev.data instanceof Blob ? await ev.data.text() : ev.data;
      const data = JSON.parse(raw);
      console.log('[Gemini Live]', data);

      if (data.setupComplete) {
        console.log('[Gemini Live] Setup complete');
        return;
      }

      if (data.error) {
        console.error('[Gemini Live] Server error:', data.error);
        this.onError(data.error.message || 'Erro do servidor');
        return;
      }

      if (data.serverContent) {
        const sc = data.serverContent;

        // Audio chunks
        if (sc.modelTurn?.parts) {
          for (const part of sc.modelTurn.parts) {
            if (part.inlineData?.mimeType?.startsWith('audio/')) {
              this.onStatusChange('speaking');
              this._playAudioChunk(part.inlineData.data);
            }
            if (part.text) {
              this.onTranscript({ role: 'assistant', text: part.text });
            }
          }
        }

        if (sc.inputTranscription?.text) {
          this.onTranscript({ role: 'user', text: sc.inputTranscription.text });
        }
        if (sc.outputTranscription?.text) {
          this.onTranscript({ role: 'assistant', text: sc.outputTranscription.text });
        }

        if (sc.turnComplete) {
          // After AI finishes speaking, return to listening
          setTimeout(() => {
            this.isPlaying = false;
            if (!this.closed) this.onStatusChange('listening');
          }, 200);
        }

        if (sc.interrupted) {
          this.playbackQueue = [];
          this.nextPlayTime = 0;
        }
      }
    } catch (err) {
      console.error('Parse error:', err);
    }
  }

  _playAudioChunk(base64Data) {
    const bytes = this._base64ToArrayBuffer(base64Data);
    const pcm16 = new Int16Array(bytes);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
    }

    const buffer = this.playbackContext.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE);
    buffer.copyToChannel(float32, 0);

    const source = this.playbackContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.playbackContext.destination);

    const now = this.playbackContext.currentTime;
    const startAt = Math.max(now, this.nextPlayTime);
    source.start(startAt);
    this.nextPlayTime = startAt + buffer.duration;
    this.isPlaying = true;
  }

  setMuted(muted) {
    this.muted = muted;
  }

  sendText(text) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true,
        },
      })
    );
  }

  close() {
    this.closed = true;
    try { this.processor?.disconnect(); } catch {}
    try { this.micSource?.disconnect(); } catch {}
    try { this.micStream?.getTracks().forEach((t) => t.stop()); } catch {}
    try { this.audioContext?.close(); } catch {}
    try { this.playbackContext?.close(); } catch {}
    try { this.ws?.close(); } catch {}
    this.onStatusChange('closed');
  }

  // ---- helpers ----
  _floatTo16BitPCM(input) {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  _base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
}