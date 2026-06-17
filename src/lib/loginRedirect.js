import { appParams } from '@/lib/app-params';

// Login hospedado CENTRAL do Base44. Independente do subdomínio do app ou de
// domínio próprio (ex.: sextaai.com). O redirectToLogin do SDK aponta para
// `${appBaseUrl}/login`, que em domínio próprio/subdomínio errado só recarrega o
// app (cai no Welcome). Aqui usamos o endpoint central com `app_id`, que é a forma
// que o SDK documenta para fluxos de login customizados (getLoginUrl).
const BASE44_LOGIN_HOST = 'https://base44.app';
// Fallback do app_id (ver CLAUDE.md) caso a env/param não estejam disponíveis.
const APP_ID_FALLBACK = '69e44004c1822ff0840cc105';

/**
 * Redireciona para o login hospedado do Base44 e volta para `nextPath` após o login.
 * @param {string} nextPath caminho de retorno após autenticar (ex.: '/feed')
 */
export function redirectToBase44Login(nextPath = '/feed') {
  if (typeof window === 'undefined') return;
  const fromUrl = new URL(nextPath, window.location.origin).toString();
  const appId = appParams.appId || APP_ID_FALLBACK;
  window.location.href =
    `${BASE44_LOGIN_HOST}/login?from_url=${encodeURIComponent(fromUrl)}&app_id=${appId}`;
}
