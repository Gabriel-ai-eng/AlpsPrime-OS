import { base44 } from '@/api/base44Client';

/**
 * Envia um prompt para o Google Gemini 2.5 Flash e retorna a resposta como string.
 * Usa a backend function `askGemini` (que chama a API oficial do Google com GEMINI_API_KEY).
 *
 * @param {string} prompt - Texto a ser enviado para o modelo.
 * @returns {Promise<string>} Resposta do Gemini em texto puro.
 */
export async function askGemini(prompt) {
  const response = await base44.functions.invoke('askGemini', { prompt });
  if (response?.data?.error) {
    throw new Error(response.data.error);
  }
  const text = response?.data?.text;
  if (!text || !text.trim()) {
    throw new Error('Resposta vazia do modelo');
  }
  return text;
}

/**
 * Gera uma imagem usando o DALL-E 3 da OpenAI.
 *
 * @param {string} prompt - Descrição da imagem.
 * @param {object} [options] - { size, quality, style }
 * @returns {Promise<{url: string, revised_prompt: string}>}
 */
export async function generateDalle(prompt, options = {}) {
  const response = await base44.functions.invoke('generateDalle', { prompt, ...options });
  if (response?.data?.error) {
    throw new Error(response.data.error);
  }
  return { url: response?.data?.url, revised_prompt: response?.data?.revised_prompt };
}

/**
 * Faz upload de uma imagem (via URL) para o Supabase Storage e retorna a URL pública.
 *
 * @param {string} imageUrl - URL da imagem gerada.
 * @param {string} [fileName] - Nome base opcional para o arquivo.
 * @returns {Promise<string>} URL pública no Supabase.
 */
export async function uploadImageToSupabase(imageUrl, fileName) {
  const response = await base44.functions.invoke('uploadImageToSupabase', {
    image_url: imageUrl,
    file_name: fileName,
  });
  if (response?.data?.error) {
    throw new Error(response.data.error);
  }
  return response?.data?.url || imageUrl;
}