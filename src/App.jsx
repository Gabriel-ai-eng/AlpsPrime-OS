import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppShell from '@/components/layout/AppShell';
import Welcome from '@/pages/Welcome';
import Chat from '@/pages/Chat';
import ChatHistory from '@/pages/ChatHistory';
import ImageGen from '@/pages/ImageGen';
import Plans from '@/pages/Plans';
import Profile from '@/pages/Profile';
import Feed from '@/pages/Feed';
import Search from '@/pages/Search';
import DirectMessages from '@/pages/DirectMessages';
import Verified from '@/pages/Verified';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import AIRouteGuard from '@/components/AIRouteGuard';
import HotmartGate from '@/components/access/HotmartGate';
import { LOGO_URL } from '@/lib/branding';
import Todos from '@/pages/Todos';
import Categorias from '@/pages/Categorias';

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
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/chat" element={<AIRouteGuard><Chat /></AIRouteGuard>} />
        <Route path="/history" element={<ChatHistory />} />
        <Route path="/image" element={<ImageGen />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:email" element={<Profile />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/search" element={<Search />} />
        <Route path="/chat-dm" element={<DirectMessages />} />
        <Route path="/verified" element={<Verified />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </HotmartGate>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster theme="dark" position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;