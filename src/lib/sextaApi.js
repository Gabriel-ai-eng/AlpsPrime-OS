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
