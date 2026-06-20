import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Lock, Shield, Bell, Heart, MessageCircle,
  UserPlus, Mail, Globe2, KeyRound, Loader2, 
  ChevronRight, Download, Trophy, Sun, Moon, Trash2, AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';

import GhostModeToggle from '@/components/profile/GhostModeToggle';
import ProfileAnalytics from '@/components/profile/ProfileAnalytics';

import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SettingsSection from '@/components/settings/SettingsSection';
import ToggleRow from '@/components/settings/ToggleRow';
import InstallShortcutCard from '@/components/settings/InstallShortcutCard';
import AdminBroadcastSection from '@/components/settings/AdminBroadcastSection';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ----- LÓGICA DO MODO ESCURO -----
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('sf_theme_preference') === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = (setDark) => {
    setIsDarkMode(setDark);
    if (setDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sf_theme_preference', 'dark');
      base44.auth.updateMe({ liquid_glass_mode: 'dark' }).catch(()=>null);
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('sf_theme_preference', 'light');
      base44.auth.updateMe({ liquid_glass_mode: 'light' }).catch(()=>null);
    }
  };

  useEffect(() => {
    if (location.hash === '#install') {
      setTimeout(() => {
        document.getElementById('install')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [location.hash]);

  const [showInRanking, setShowInRanking] = useState(user?.show_in_ranking !== false);
  const [rankingDisplayName, setRankingDisplayName] = useState(user?.ranking_display_name || '');
  const [savingRanking, setSavingRanking] = useState(false);

  // Estados para exclusão de conta
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSaveRanking = async () => {
    setSavingRanking(true);
    try {
      await base44.auth.updateMe({
        show_in_ranking: showInRanking,
        ranking_display_name: rankingDisplayName,
      });
      toast.success('Configurações de ranking salvas!');
    } catch (e) {
      toast.error('Erro ao salvar.');
    } finally {
      setSavingRanking(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await base44.functions.invoke('deleteMyAccount', {});
      toast.success('Conta excluída. Até breve.');
      setTimeout(() => signOut(), 1200);
    } catch (e) {
      toast.error('Erro ao excluir conta. Tente novamente.');
      setDeletingAccount(false);
    }
  };

  const [privateAccount, setPrivateAccount] = useState(user?.private_account === true);
  const [notifLikes, setNotifLikes] = useState(user?.notify_likes !== false);
  const [notifComments, setNotifComments] = useState(user?.notify_comments !== false);
  const [notifFollows, setNotifFollows] = useState(user?.notify_follows !== false);
  const [notifMessages, setNotifMessages] = useState(user?.notify_messages !== false);
  const [notifPush, setNotifPush] = useState(user?.notify_push !== false);
  const [notifEmail, setNotifEmail] = useState(user?.notify_email === true);

  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  const persist = async (patch) => {
    await base44.auth.updateMe(patch);
  };

  const updateField = async (key, value, setter) => {
    setter(value);
    try {
      await persist({ [key]: value });
    } catch (e) {
      toast.error('Não foi possível salvar.');
      setter(!value);
    }
  };

  const handlePasswordChange = () => {
    toast.info('Sua senha é gerenciada pela sua conta de login. Para alterá-la, acesse o provedor de e-mail vinculado.');
  };

  return (
    <div className="min-h-full">
      <div className="px-6 lg:px-8 pt-6 pb-2 bg-transparent transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 mb-9 text-sm font-normal text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            <span>Voltar ao perfil</span>
          </button>
          <div className="flex items-center gap-4">
            <h1 className="m-0 font-light text-foreground uppercase" style={{
              fontSize: 'clamp(16px, 4vw, 36px)',
              letterSpacing: 'clamp(2px, 1.5vw, 8px)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif'
            }}>
              Configurações
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-5 pb-12">
        {/* ADMIN — comunicados para todos os usuários (somente admin) */}
        {user?.role === 'admin' && <AdminBroadcastSection />}

        {/* APPEARANCE */}
        <SettingsSection
          icon={Sun}
          title="Aparência"
          description="Personalize as cores do seu aplicativo."
          delay={0.03}
        >
          <div className="p-5 rounded-2xl border border-border bg-background flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-foreground text-base">
                  {isDarkMode ? 'Modo Escuro ativado' : 'Modo Claro ativado'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  {isDarkMode
                    ? 'Interface em tons de grafite, perfeita para a leitura.'
                    : 'Interface clara com visual moderno e vibrante.'}
                </p>
              </div>
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-700 flex-shrink-0",
                isDarkMode 
                  ? "bg-zinc-800 shadow-zinc-900/50 rotate-0" 
                  : "bg-gradient-to-tr from-amber-100 to-amber-300 shadow-amber-500/30 rotate-[360deg]"
              )}>
                {isDarkMode ? '🌙' : '☀️'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <Button
                onClick={() => toggleTheme(false)}
                variant={!isDarkMode ? "default" : "outline"}
                className={cn(
                  "h-12 rounded-xl font-medium transition-all text-sm",
                  !isDarkMode
                    ? "bg-gold/10 text-gold border border-gold/40 shadow-none hover:bg-gold/20"
                    : "text-muted-foreground border-border hover:bg-muted"
                )}
              >
                <Sun className="w-4 h-4 mr-2" /> Claro
              </Button>

              <Button
                onClick={() => toggleTheme(true)}
                variant={isDarkMode ? "default" : "outline"}
                className={cn(
                  "h-12 rounded-xl font-medium transition-all text-sm",
                  isDarkMode
                    ? "bg-zinc-800 text-white border border-zinc-600 shadow-none hover:bg-zinc-700"
                    : "text-muted-foreground border-border hover:bg-muted"
                )}
              >
                <Moon className="w-4 h-4 mr-2" /> Escuro
              </Button>
            </div>
          </div>
        </SettingsSection>

        {/* GHOST MODE */}
        <GhostModeToggle user={user} />

        {/* ANALYTICS */}
        <ProfileAnalytics user={user} />

        <SettingsSection
          icon={Lock}
          title="Privacidade e Segurança"
          description="Controle quem pode ver seu conteúdo e cuide da sua conta."
          delay={0.05}
        >
          <ToggleRow
            icon={Shield}
            label="Conta privada"
            description="Quando ativada, apenas seguidores aprovados por você poderão ver suas publicações."
            checked={privateAccount}
            onChange={(v) => updateField('private_account', v, setPrivateAccount)}
          />
          <button
            onClick={handlePasswordChange}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-gold/40 hover:bg-gold/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Alterar senha</p>
                <p className="text-xs text-muted-foreground mt-0.5">Gerenciada pelo seu provedor de login.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background">
            <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">E-mail da conta</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted border border-border rounded-full px-2 py-0.5 flex-shrink-0">
              Verificado
            </span>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Bell}
          title="Notificações"
          description="Escolha o que quer receber."
          delay={0.1}
        >
          <ToggleRow
            icon={Heart}
            label="Curtidas"
            description="Quando alguém curtir suas publicações."
            checked={notifLikes}
            onChange={(v) => updateField('notify_likes', v, setNotifLikes)}
          />
          <ToggleRow
            icon={MessageCircle}
            label="Comentários"
            description="Quando alguém comentar nas suas publicações."
            checked={notifComments}
            onChange={(v) => updateField('notify_comments', v, setNotifComments)}
          />
          <ToggleRow
            icon={UserPlus}
            label="Novos seguidores"
            description="Quando alguém começar a te seguir."
            checked={notifFollows}
            onChange={(v) => updateField('notify_follows', v, setNotifFollows)}
          />
          <ToggleRow
            icon={Mail}
            label="Mensagens diretas"
            description="Quando você receber uma DM."
            checked={notifMessages}
            onChange={(v) => updateField('notify_messages', v, setNotifMessages)}
          />
          <div className="h-px bg-border my-2" />
          <ToggleRow
            icon={Globe2}
            label="Notificações push do navegador"
            description="Receba alertas em tempo real mesmo com a aba fechada."
            checked={notifPush}
            onChange={(v) => updateField('notify_push', v, setNotifPush)}
          />
          <ToggleRow
            icon={Mail}
            label="Resumo semanal por e-mail"
            description="Receba os destaques da semana no seu e-mail."
            checked={notifEmail}
            onChange={(v) => updateField('notify_email', v, setNotifEmail)}
          />
        </SettingsSection>

        <div id="install" className="scroll-mt-24">
          <SettingsSection
            icon={Download}
            title="Instalar como app (PWA)"
            description="Tenha a Sexta-feira como um app na sua tela inicial."
            delay={0.13}
          >
            <InstallShortcutCard />
          </SettingsSection>
        </div>

        <SettingsSection
          icon={Trophy}
          title="Ranking & Privacidade"
          description="Controle como você aparece no ranking público."
          delay={0.14}
        >
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
            <div>
              <p className="text-sm font-medium text-foreground">Aparecer no ranking público</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sua pontuação ficará visível para todos os usuários</p>
            </div>
            <button
              onClick={() => setShowInRanking(v => !v)}
              className={cn("w-10 h-6 rounded-full transition-colors relative flex-shrink-0", showInRanking ? "bg-gold" : "bg-muted")}
            >
              <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all", showInRanking ? "left-[18px]" : "left-0.5")} />
            </button>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Nome exibido no ranking</label>
            <Input
              value={rankingDisplayName}
              onChange={(e) => setRankingDisplayName(e.target.value)}
              placeholder={user.full_name || 'Deixe em branco para usar seu nome'}
              className="bg-background text-foreground border-border focus-visible:ring-gold/50"
            />
            <p className="text-xs text-muted-foreground mt-1">Você pode usar um apelido para aparecer no ranking sem revelar seu nome real.</p>
          </div>
          <Button
            onClick={handleSaveRanking}
            disabled={savingRanking}
            className="w-full h-10 bg-gold hover:bg-gold-dark text-background font-semibold"
          >
            {savingRanking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar configurações de ranking'}
          </Button>
        </SettingsSection>

        {/* ZONA DE PERIGO - EXCLUSÃO DE CONTA */}
        <SettingsSection
          icon={AlertTriangle}
          title="Zona de Perigo"
          description="Ações irreversíveis para a sua conta."
          delay={0.16}
        >
          <AnimatePresence mode="wait">
            {!showDeleteConfirm ? (
              <motion.div
                key="delete-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="w-full justify-start h-12 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Excluir conta permanentemente
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="delete-confirm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-4 overflow-hidden"
              >
                <div className="flex items-start gap-3 text-destructive">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Cuidado! Ação irreversível.</p>
                    <p className="opacity-90 leading-relaxed">
                      Ao confirmar, todos os seus dados, publicações, conexões e Cápsulas do Tempo serão apagados para sempre. 
                      Digite <strong>EXCLUIR</strong> na caixa abaixo para confirmar.
                    </p>
                  </div>
                </div>
                
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Digite EXCLUIR"
                  className="bg-background border-destructive/30 focus-visible:ring-destructive/50 placeholder:text-destructive/40 font-mono text-center"
                />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-border hover:bg-muted" 
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 font-semibold"
                    disabled={deleteConfirmText !== 'EXCLUIR' || deletingAccount}
                    onClick={handleDeleteAccount}
                  >
                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Exclusão'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SettingsSection>
      </div>
    </div>
  );
}
