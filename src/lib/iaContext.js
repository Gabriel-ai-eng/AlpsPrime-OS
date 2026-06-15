/**
 * Detects when the user is asking for a task that requires "unlocking
 * Sexta-feira 1.0" — i.e. things outside the app's current capabilities.
 */
const BLOCK_PATTERNS = [
  /agend(a|ar|amento)/i,
  /lembre[mt]e/i,
  /calend[áa]rio/i,
  /(faz|faça|fazer).*ligaç[ãa]o/i,
  /lig(ar|a) p(ra|ara)/i,
  /(mand|envi|manda|envia)(ar|e|a).*(sms|mensagem.*celular|whats(app)?.*celular)/i,
  /abrir? (o )?(app|aplicativo|youtube|spotify|instagram|tiktok)/i,
  /toc(ar|a) (m[uú]sica|som)/i,
  /alarme/i,
  /tirar foto/i,
  /salvar contato/i,
];

export function isBlockedTask(text) {
  if (!text) return false;
  return BLOCK_PATTERNS.some((re) => re.test(text));
}

export function buildContext(user) {
  const now = new Date();
  return {
    user_name: user?.full_name || 'amigo(a)',
    hour: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    last_session: now.toISOString(),
  };
}