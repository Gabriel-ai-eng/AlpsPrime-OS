import { base44 } from '@/api/base44Client';

/**
 * Upload de imagem (foto de perfil / capa) para o Supabase Storage.
 * Em vez de subir direto do navegador (que exige regras de permissão no
 * Storage), enviamos a imagem para a função do servidor `uploadFile`, que
 * grava com a service key — só precisa do bucket existir.
 *
 * Também reduz a imagem antes de enviar (mais rápido e evita limite de tamanho).
 */

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    r.readAsDataURL(file);
  });
}

async function downscale(file, maxDim, quality = 0.85) {
  const dataUrl = await readAsDataURL(file);
  if (!/^image\//.test(file.type || '')) return { dataUrl, type: file.type || 'application/octet-stream' };
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Imagem inválida.'));
      i.src = dataUrl;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    // Se já é pequena, não precisa reprocessar.
    if (scale === 1 && dataUrl.length < 1_200_000) return { dataUrl, type: file.type };
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return { dataUrl: canvas.toDataURL('image/jpeg', quality), type: 'image/jpeg' };
  } catch {
    return { dataUrl, type: file.type || 'image/jpeg' };
  }
}

/**
 * Sobe a imagem e retorna { url, debug }. Em caso de falha, lança um Error
 * com `.debug` anexado (usado pelo rastreador na tela de Perfil).
 */
export async function uploadProfileImage(file, folder = 'uploads') {
  const debug = {
    arquivo: file?.name || '(sem nome)',
    tipo: file?.type || '?',
    tamanhoOriginalKB: file ? Math.round(file.size / 1024) : 0,
    payloadKB: 0,
    serverOk: null,
    bucket: null,
    erro: null,
    statusHttp: null,
  };

  if (!file) {
    debug.erro = 'Nenhum arquivo selecionado.';
    const e = new Error(debug.erro); e.debug = debug; throw e;
  }

  const { dataUrl, type } = await downscale(file, folder === 'banners' ? 1600 : 1024);
  debug.payloadKB = Math.round((dataUrl.length * 0.75) / 1024);

  try {
    const res = await base44.functions.invoke('uploadFile', {
      file_base64: dataUrl,
      content_type: type || 'image/jpeg',
      file_name: file.name || `img-${Date.now()}`,
      folder,
    });
    const url = res?.data?.url;
    if (!url) throw new Error('O servidor não retornou a URL da imagem.');
    debug.serverOk = true;
    debug.bucket = res?.data?.bucket || null;
    return { url, debug };
  } catch (err) {
    debug.serverOk = false;
    debug.erro = err?.message || 'Falha no upload.';
    debug.statusHttp = err?.status || null;
    const e = new Error(debug.erro);
    e.debug = debug;
    throw e;
  }
}

// Compatibilidade: retorna só a URL.
export async function uploadToSupabase(file, folder = 'uploads') {
  const { url } = await uploadProfileImage(file, folder);
  return url;
}
