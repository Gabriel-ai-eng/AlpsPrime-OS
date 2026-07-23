import { base44 } from '@/api/base44Client';

/**
 * Cérebro da Sexta-feira via OpenRouter — roda no servidor (api/fn/sextaChat),
 * a chave da API nunca chega no navegador.
 * @param {Array<{role: string, content: string}>} mensagens
 * @returns {Promise<string>}
 */
export async function chamarCerebroSexta(mensagens) {
  const response = await base44.functions.invoke('sextaChat', { mensagens });
  if (response?.data?.error) throw new Error(response.data.error);
  return response?.data?.resposta || '';
}

/**
 * Voz da Sexta-feira via Google Cloud Text-to-Speech — roda no servidor
 * (api/fn/sextaTts), a chave da API nunca chega no navegador.
 * @param {string} texto
 * @returns {Promise<string>} data URL (audio/mp3 em base64) pronto pra tocar num <audio>.
 */
export async function sintetizarVozSexta(texto) {
  const response = await base44.functions.invoke('sextaTts', { texto });
  if (response?.data?.error) throw new Error(response.data.error);
  const base64 = response?.data?.audio_base64;
  if (!base64) throw new Error('Sem áudio na resposta do TTS.');
  return `data:audio/mp3;base64,${base64}`;
}
