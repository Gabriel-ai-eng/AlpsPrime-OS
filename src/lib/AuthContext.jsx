import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, mapSupabaseUser } from '@/api/supabaseClient';
import { signOut as supabaseSignOut } from '@/lib/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const applySession = (session) => {
    const u = mapSupabaseUser(session?.user);
    setUser(u);
    setIsAuthenticated(!!u);
    setIsLoadingAuth(false);
    setAuthChecked(true);
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
