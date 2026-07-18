import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Sempre no bundle inicial: casca do app, tela de entrada e o Home (destino
// principal). As demais páginas carregam SOB DEMANDA (React.lazy) — o JS
// inicial fica bem menor e a tela de loading some mais rápido.
import AppShell from '@/components/layout/AppShell';
import Welcome from '@/pages/Welcome';
import Home from '@/pages/Home';
import HotmartGate from '@/components/access/HotmartGate';
import { LOGO_URL } from '@/lib/branding';

const ImageGen = lazy(() => import('@/pages/ImageGen'));
const Profile = lazy(() => import('@/pages/Profile'));
const Search = lazy(() => import('@/pages/Search'));
const Verified = lazy(() => import('@/pages/Verified'));
const Settings = lazy(() => import('@/pages/Settings'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Todos = lazy(() => import('@/pages/Todos'));
const Categorias = lazy(() => import('@/pages/Categorias'));
const Suporte = lazy(() => import('@/pages/Suporte'));
const TermosDeUso = lazy(() => import('@/pages/TermosDeUso'));
const Privacidade = lazy(() => import('@/pages/Privacidade'));
const Pagamento = lazy(() => import('@/pages/Pagamento'));
const Favoritos = lazy(() => import('@/pages/Favoritos'));

// Assim que o navegador fica OCIOSO (app já desenhado), baixa em segundo plano
// o código de todas as seções acima. O bundle inicial continua pequeno, mas ao
// tocar em qualquer seção (Suporte, Configurações, Perfil…) o código já está
// no aparelho e a tela abre na hora, sem o spinner de carregamento.
// (O import() repetido aponta para o mesmo chunk do lazy() — é baixado 1x só.)
const preCarregarSecoes = () => {
  [
    () => import('@/pages/Suporte'),
    () => import('@/pages/Settings'),
    () => import('@/pages/Profile'),
    () => import('@/pages/Search'),
    () => import('@/pages/Notifications'),
    () => import('@/pages/Favoritos'),
    () => import('@/pages/Categorias'),
    () => import('@/pages/Todos'),
    () => import('@/pages/ImageGen'),
    () => import('@/pages/Verified'),
    () => import('@/pages/TermosDeUso'),
    () => import('@/pages/Privacidade'),
    () => import('@/pages/Pagamento'),
  ].forEach((carregar) => { carregar().catch(() => {}); });
};

// Fallback das rotas preguiçosas: mesmo spinner da tela de carregamento.
const RouteFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated, user } = useAuth();

  // Dispara o pré-carregamento das seções num momento ocioso, para não
  // competir com o carregamento inicial do app.
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(preCarregarSecoes, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(preCarregarSecoes, 2500); // Safari: sem requestIdleCallback
    return () => clearTimeout(id);
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="Sexta-feira" className="w-12 h-12 rounded-xl shadow-xl shadow-gold/20 object-cover" />
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
        {/* Assinatura no rodapé, no estilo discreto da Meta ("from Meta"). */}
        <div className="absolute inset-x-0 bottom-9 flex items-center justify-center">
          <span className="text-[11px] tracking-wide text-muted-foreground/70">
            By <span className="font-semibold text-muted-foreground">Alps Prime</span>
          </span>
        </div>
      </div>
    );
  }

  // Páginas institucionais públicas: acessíveis com ou sem login. Para o
  // visitante não autenticado, qualquer outro caminho cai na tela de Welcome.
  const rotasPublicas = (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/termos-de-uso" element={<TermosDeUso />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="*" element={<Welcome />} />
      </Routes>
    </Suspense>
  );

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') return rotasPublicas;
  }

  if (!isAuthenticated && !isLoadingAuth) {
    return rotasPublicas;
  }

  // Fluxo único de acesso pela Hotmart: usuários logados são verificados pelo HotmartGate
  // (checkMyAccess → AuthorizedAccess). Quem não comprou vê a tela "Acesso restrito".
  return (
    <HotmartGate userEmail={user?.email}>
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        {/* Caminhos de entrada/cadastro (e retornos de link de e-mail do Supabase):
            usuários já autenticados que caírem aqui vão direto pro /home, em vez
            de ver um 404. */}
        <Route path="/login" element={<Navigate to="/home" replace />} />
        <Route path="/entrar" element={<Navigate to="/home" replace />} />
        <Route path="/signup" element={<Navigate to="/home" replace />} />
        <Route path="/cadastro" element={<Navigate to="/home" replace />} />
        <Route path="/auth" element={<Navigate to="/home" replace />} />
        <Route path="/callback" element={<Navigate to="/home" replace />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/categorias" element={<Categorias />} />
        
        {/* Nova rota de Favoritos substituindo as rotas de Chat */}
        <Route path="/favoritos" element={<Favoritos />} />

        <Route path="/image" element={<ImageGen />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:email" element={<Profile />} />
        <Route path="/home" element={<Home />} />
        {/* Compatibilidade: links antigos /feed (PWA, bookmarks) vão para /home */}
        <Route path="/feed" element={<Navigate to="/home" replace />} />
        <Route path="/search" element={<Search />} />
        <Route path="/verified" element={<Verified />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/suporte" element={<Suporte />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      {/* Seções institucionais (também acessíveis sem login, ver rotasPublicas). */}
      <Route path="/termos-de-uso" element={<TermosDeUso />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/pagamento" element={<Pagamento />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
    </HotmartGate>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster theme="dark" position="top-right" />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;