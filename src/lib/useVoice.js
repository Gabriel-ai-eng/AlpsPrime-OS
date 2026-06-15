import { useState, useRef, useCallback } from 'react';

// Web Speech API hook — recognition + synthesis
export function useVoice({ onTranscript, onEnd }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
    'speechSynthesis' in window;

  const startListening = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (onTranscript) onTranscript(transcript);
    };
    rec.onend = () => {
      setIsListening(false);
      if (onEnd) onEnd();
    };
    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
  }, [supported, onTranscript, onEnd]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (!supported) return;
    synthRef.current?.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 1.05;
    utter.pitch = 1.0;
    utter.volume = 1;

    // prefer a Portuguese female voice if available
    const voices = synthRef.current?.getVoices() || [];
    const ptVoice = voices.find(v => v.lang.startsWith('pt') && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utter.voice = ptVoice;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utter);
  }, [supported]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isListening, isSpeaking, supported, startListening, stopListening, speak, stopSpeaking };
}