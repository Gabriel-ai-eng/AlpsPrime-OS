/**
 * Web Speech API helpers — synthesis (TTS) and recognition (STT).
 * Voice quality varies per device; we pick the best pt-BR voice available.
 */

let cachedVoices = null;

function loadVoices() {
  return new Promise((resolve) => {
    if (cachedVoices) return resolve(cachedVoices);
    const v = window.speechSynthesis?.getVoices?.() || [];
    if (v.length) {
      cachedVoices = v;
      return resolve(v);
    }
    const onChange = () => {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      window.speechSynthesis.removeEventListener('voiceschanged', onChange);
      resolve(cachedVoices);
    };
    window.speechSynthesis?.addEventListener?.('voiceschanged', onChange);
    setTimeout(() => resolve(window.speechSynthesis?.getVoices?.() || []), 1500);
  });
}

const VOICE_PROFILE = {
  female_soft:   { gender: 'female', rate: 0.95, pitch: 1.05 },
  female_lively: { gender: 'female', rate: 1.1,  pitch: 1.15 },
  male_calm:     { gender: 'male',   rate: 0.9,  pitch: 0.95 },
  male_firm:     { gender: 'male',   rate: 1.0,  pitch: 0.85 },
};

function pickVoice(voices, profile) {
  const ptBr = voices.filter((v) => /pt[-_]?BR/i.test(v.lang));
  const pt = ptBr.length ? ptBr : voices.filter((v) => /^pt/i.test(v.lang));
  if (!pt.length) return voices[0] || null;

  const wantFemale = profile.gender === 'female';
  // Heuristics for gender by name
  const femaleNames = /(luciana|luiza|maria|fernanda|joana|francisca|helena|paulina|raquel|samantha|google.*female|female)/i;
  const maleNames = /(felipe|paulo|ricardo|daniel|joão|antonio|google.*male|male)/i;

  const matched = pt.find((v) =>
    wantFemale ? femaleNames.test(v.name) : maleNames.test(v.name)
  );
  if (matched) return matched;

  // Prefer "Google" or "Microsoft" enhanced voices
  const enhanced = pt.find((v) => /google|microsoft|enhanced|premium/i.test(v.name));
  return enhanced || pt[0];
}

export async function speak(text, voiceKey = 'female_soft', { onEnd } = {}) {
  if (!('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = await loadVoices();
  const profile = VOICE_PROFILE[voiceKey] || VOICE_PROFILE.female_soft;
  const voice = pickVoice(voices, profile);

  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = 'pt-BR';
  u.rate = profile.rate;
  u.pitch = profile.pitch;
  u.onend = () => onEnd?.();
  synth.speak(u);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function startRecognition({ onResult, onEnd, onError } = {}) {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Rec) {
    onError?.('not_supported');
    return null;
  }
  const r = new Rec();
  r.lang = 'pt-BR';
  r.interimResults = false;
  r.continuous = false;
  r.onresult = (e) => {
    const text = Array.from(e.results).map((res) => res[0]?.transcript || '').join(' ').trim();
    onResult?.(text);
  };
  r.onerror = (e) => onError?.(e.error);
  r.onend = () => onEnd?.();
  r.start();
  return r;
}