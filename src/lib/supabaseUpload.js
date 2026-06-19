const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET;

/**
 * Faz upload de um arquivo para o Supabase Storage e retorna a URL pública.
 * @param {File} file - O arquivo a ser enviado
 * @param {string} folder - Pasta dentro do bucket (ex: 'avatars', 'banners')
 * @returns {Promise<string>} URL pública do arquivo
 */
export async function uploadToSupabase(file, folder = 'uploads') {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: file,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Falha no upload para o Supabase');
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
  return publicUrl;
}