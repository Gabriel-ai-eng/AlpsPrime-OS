import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, mapSupabaseUser } from '@/api/supabaseClient';
import { signOut as supabaseSignOut } from '@/lib/auth';
import { me as fetchProfile } from '@/api/entitiesAdapter';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const applySession = async (session) => {
    const base = mapSupabaseUser(session?.user);
    setUser(base);
    setIsAuthenticated(!!base);
    setIsLoadingAuth(false);
    setAuthChecked(true);

    // Carrega o perfil completo da tabela `usuarios` (foto, capa, bio, etc.)
    // e mescla, para esses dados não sumirem ao recarregar a página.
    if (base) {
      try {
        const profile = await fetchProfile();
        if (profile) {
          setUser((prev) => ({ ...prev, ...profile }));

          // Sincroniza (1x) os campos visuais com o metadata da sessão, para que
          // nas próximas vezes a foto/capa apareçam INSTANTÂNEO, sem esperar o banco.
          const meta = session?.user?.user_metadata || {};
          const campos = ['profile_picture_url', 'profile_banner_url', 'username', 'full_name'];
          const dados = {};
          campos.forEach((k) => { if (profile[k] && profile[k] !== meta[k]) dados[k] = profile[k]; });
          if (Object.keys(dados).length) {
            supabase.auth.updateUser({ data: dados }).catch(() => {});
          }
        }
      } catch (e) {
        console.error('[auth] não consegui carregar o perfil de usuarios:', e?.message);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) applySession(data?.session);
    });

    // Reage a login/logout/refresh de token em tempo real.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) applySession(session);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    const { data } = await supabase.auth.getSession();
    applySession(data?.session);
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    supabaseSignOut(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => {
    if (typeof window !== 'undefined') window.location.assign('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      // Mantidos por compatibilidade com componentes existentes:
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: { public_settings: {} },
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: checkUserAuth,
      refetchUser: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    if (typeof console !== 'undefined') {
      console.warn('useAuth foi chamado fora de um AuthProvider — usando estado padrão.');
    }
    return {
      user: null,
      isAuthenticated: false,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      authChecked: true,
      logout: () => {},
      navigateToLogin: () => {},
      checkUserAuth: () => {},
      checkAppState: () => {},
      refetchUser: () => {},
    };
  }
  return context;
};
