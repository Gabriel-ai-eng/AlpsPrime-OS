import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppShell from '@/components/layout/AppShell';
import Welcome from '@/pages/Welcome';
import ImageGen from '@/pages/ImageGen';
import Profile from '@/pages/Profile';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import Verified from '@/pages/Verified';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import HotmartGate from '@/components/access/HotmartGate';
import { LOGO_URL } from '@/lib/branding';
import Todos from '@/pages/Todos';
import Categorias from '@/pages/Categorias';
import Suporte from '@/pages/Suporte';

// Import da nova página de Favoritos
import Favoritos from '@/pages/Favoritos';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="Sexta-feira" className="w-12 h-12 rounded-xl shadow-xl shadow-gold/20 object-cover" />
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') return <Welcome />;
  }

  if (!isAuthenticated && !isLoadingAuth) {
    return <Welcome />;
  }

  // Fluxo único de acesso pela Hotmart: usuários logados são verificados pelo HotmartGate
  // (checkMyAccess → AuthorizedAccess). Quem não comprou vê a tela "Acesso restrito".
  return (
    <HotmartGate userEmail={user?.email}>
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
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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