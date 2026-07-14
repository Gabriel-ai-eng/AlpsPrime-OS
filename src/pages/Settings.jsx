import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChevronLeft, ChevronDown, ChevronRight, Sun, Moon, Monitor, Palette,
  ShieldCheck, Trash2, AlertTriangle, BarChart3, Coffee,
  Bell, Mail, FlaskConical, Info, Eraser, Download, Loader2,
  LifeBuoy, LogOut, PanelBottom, RectangleHorizontal, Languages,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { signOut } from '@/lib/auth';
import { useLiquidGlass } from '@/lib/useLiquidGlass';
import {
  applyTheme, getThemePref, resolveTheme,
} from '@/lib/theme';
import {
  getPrefs, setPref, getWeeklyUsage, formatDuration,
} from '@/lib/appPrefs';
import InstallShortcutCard from '@/components/settings/InstallShortcutCard';
import AdminBroadcastSection from '@/components/settings/AdminBroadcastSection';

const APP_VERSION = '1.0.0 · Beta';

const SUB_APPS = [
  { id: 'sexta',  nome: 'Sexta-feira',   prefKey: 'notif_sexta',  dados: ['Conversas e mensagens com a IA', 'Suas preferências de uso'] },
  { id: 'armor',  nome: 'Projeto Armor', prefKey: 'notif_armor',  dados: ['Progresso e pontuação no jogo'] },
];

const CHANGELOG = [
  {
    versao: 'Beta',
    itens: [
      'Nova Central de Configurações no estilo das grandes plataformas',
      'Tema Claro / Escuro / Automático',
      'Barra de navegação flutuante ou fixa, à sua escolha',
      'Bem-estar digital: tempo de uso e lembretes de pausa',
      'Controle de notificações por sub-app, Não Perturbe e resumo agendado',
    ],
  },
];

/* ── Blocos reutilizáveis ── */

function Group({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 ml-1">{label}</p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, sub, children, danger }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors"
      >
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', danger ? 'bg-destructive/10' : 'bg-gold/10')}>
          <Icon className={cn('w-4 h-4', danger ? 'text-destructive' : 'text-gold')} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', danger ? 'text-destructive' : 'text-foreground')}>{label}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
        </div>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform flex-shrink-0', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn('w-11 h-6 rounded-full relative flex-shrink-0 transition-colors', checked ? 'bg-gold' : 'bg-muted')}
      aria-pressed={checked}
    >
      <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

function ToggleLine({ label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

function ActionRow({ icon: Icon, label, sub, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors"
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', danger ? 'bg-destructive/10' : 'bg-gold/10')}>
        <Icon className={cn('w-4 h-4', danger ? 'text-destructive' : 'text-gold')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', danger ? 'text-destructive' : 'text-foreground')}>{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}

/* ── Página ── */

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setMode } = useLiquidGlass();
  const { lang, setLang, t } = useLang();

  const LANGS = [
    { id: 'pt', label: 'Português' },
    { id: 'en', label: 'English' },
  ];
  // Palavra de confirmação para apagar a conta, no idioma atual.
  const DELETE_WORD = lang === 'en' ? 'DELETE' : 'EXCLUIR';

  const [themePref, setThemePref] = useState(getThemePref());
  const [prefs, setPrefs] = useState(getPrefs());

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [clearing, setClearing] = useState(false);

  const week = getWeeklyUsage();
  const totalSemana = week.reduce((s, d) => s + d.seconds, 0);
  const maxDia = Math.max(60, ...week.map((d) => d.seconds));

  const onTheme = (id) => {
    setThemePref(id);
    const resolved = applyTheme(id);
    if (setMode) setMode(resolved);
    if (id !== 'auto') base44.auth.updateMe({ liquid_glass_mode: id }).catch(() => null);
  };

  const updatePref = (key, value) => {
    setPrefs(setPref(key, value));
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await base44.functions.invoke('deleteMyAccount', {});
      toast.success(t('Conta excluída. Até breve.'));
      setTimeout(() => signOut(), 1200);
    } catch {
      toast.error(t('Erro ao excluir conta. Tente novamente.'));
      setDeletingAccount(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      sessionStorage.clear();
      toast.success(t('Cache limpo. Recarregando…'));
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error(t('Não foi possível limpar o cache.'));
      setClearing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  const THEMES = [
    { id: 'light', label: t('Claro'), icon: Sun },
    { id: 'dark', label: t('Escuro'), icon: Moon },
    { id: 'auto', label: t('Automático'), icon: Monitor },
  ];

  const NAV_STYLES = [
    { id: 'floating', label: t('Flutuante'), icon: RectangleHorizontal },
    { id: 'fixed', label: t('Fixa'), icon: PanelBottom },
  ];
  const navStyle = prefs.navbar_style || 'floating';

  return (
    <div className="settings-page min-h-full bg-background text-foreground">
      <div className="px-6 lg:px-8 pt-6 pb-2 bg-transparent">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 mb-7 text-sm font-normal text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{t('Voltar ao início')}</span>
          </button>
          <h1 className="m-0 font-light text-foreground uppercase" style={{
            fontSize: 'clamp(16px, 4vw, 36px)',
            letterSpacing: 'clamp(2px, 1.5vw, 8px)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
          }}>
            {t('Configurações')}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 space-y-7 pb-16">

        {/* IDIOMAS */}
        <Group label={t('Idiomas')}>
          <Row icon={Languages} label={t('Idioma do aplicativo')} sub={LANGS.find((l) => l.id === lang)?.label}>
            <div className="grid grid-cols-2 gap-2">
              {LANGS.map((l) => {
                const ativo = lang === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setLang(l.id)}
                    className={cn(
                      'flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all',
                      ativo ? 'border-gold/50 bg-gold/10 text-gold' : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">{t('Escolha o idioma do Alps OS')}</p>
          </Row>
        </Group>

        {/* APARÊNCIA */}
        <Group label={t('Aparência & personalização')}>
          <Row icon={Palette} label={t('Tema')} sub={THEMES.find((th) => th.id === themePref)?.label}>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => {
                const ativo = themePref === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onTheme(t.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
                      ativo ? 'border-gold/50 bg-gold/10 text-gold' : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <t.icon className="w-5 h-5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
            {themePref === 'auto' && (
              <p className="text-xs text-muted-foreground mt-3">
                {t('Seguindo o sistema — agora em modo {mode}.', { mode: resolveTheme('auto') === 'dark' ? t('escuro') : t('claro') })}
              </p>
            )}
          </Row>

          <Row icon={PanelBottom} label={t('Barra de navegação')} sub={NAV_STYLES.find((n) => n.id === navStyle)?.label}>
            <div className="grid grid-cols-2 gap-2">
              {NAV_STYLES.map((n) => {
                const ativo = navStyle === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => updatePref('navbar_style', n.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
                      ativo ? 'border-gold/50 bg-gold/10 text-gold' : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <n.icon className="w-5 h-5" />
                    {n.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {navStyle === 'fixed'
                ? t('A barra fica acoplada à base da tela. Ao rolar para baixo, ela desce e some — como a flutuante.')
                : t('A barra flutua acima do conteúdo e some ao rolar a tela para baixo.')}
            </p>
          </Row>

        </Group>

        {/* PRIVACIDADE & DADOS */}
        <Group label={t('Privacidade & dados')}>
          <Row icon={ShieldCheck} label={t('O que cada sub-app acessa')} sub={t('Transparência de dados por serviço')}>
            <div className="space-y-3 pt-1">
              {SUB_APPS.map((app) => (
                <div key={app.id} className="rounded-xl border border-border bg-background p-3.5">
                  <p className="text-sm font-medium text-foreground mb-1.5">{app.nome}</p>
                  <ul className="space-y-1">
                    {app.dados.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                        {t(d)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t('Seus dados ficam dentro do ecossistema privado da Alps e não são vendidos a terceiros.')}
              </p>
            </div>
          </Row>

          <Row icon={Trash2} label={t('Apagar minha conta')} sub={t('Exclusão permanente dos seus dados')} danger>
            <div className="pt-1">
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-background border border-border rounded-xl p-3 mb-3">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {t('Apagar a conta remove seu perfil e dados do Alps OS. Isso ')}<strong>{t('não cancela')}</strong>{t(' sua compra na Hotmart — com o mesmo e-mail você poderá entrar novamente no futuro.')}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!showDeleteConfirm ? (
                  <Button
                    key="del-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    className="w-full justify-start h-11 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-3" /> {t('Excluir conta permanentemente')}
                  </Button>
                ) : (
                  <motion.div
                    key="del-confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3 text-destructive text-sm">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        {t('Ação irreversível. Digite ')}<strong>{DELETE_WORD}</strong>{t(' para confirmar.')}
                      </p>
                    </div>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={t('Digite {word}', { word: DELETE_WORD })}
                      className="bg-background border-destructive/30 focus-visible:ring-destructive/50 text-center font-mono"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>
                        {t('Cancelar')}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 font-semibold"
                        disabled={deleteConfirmText !== DELETE_WORD || deletingAccount}
                        onClick={handleDeleteAccount}
                      >
                        {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Confirmar')}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Row>
        </Group>

        {/* BEM-ESTAR DIGITAL */}
        <Group label={t('Bem-estar digital')}>
          <Row icon={BarChart3} label={t('Tempo de uso')} sub={totalSemana ? t('{d} nos últimos 7 dias', { d: formatDuration(totalSemana) }) : t('Coletando dados…')}>
            <div className="pt-1">
              {totalSemana > 0 ? (
                <>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {week.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div
                          className="w-full rounded-md bg-gold/80"
                          style={{ height: `${Math.max(4, (d.seconds / maxDia) * 100)}%` }}
                          title={formatDuration(d.seconds)}
                        />
                        <span className="text-[10px] text-muted-foreground">{d.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {t('Total na semana: ')}<strong className="text-foreground">{formatDuration(totalSemana)}</strong>
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('Continue usando o Alps OS que seu tempo de uso aparecerá aqui em um gráfico semanal.')}
                </p>
              )}
            </div>
          </Row>

          <Row icon={Coffee} label={t('Lembretes de pausa')} sub={prefs.pause_enabled ? t('A cada {n} min', { n: prefs.pause_minutes }) : t('Desativado')}>
            <div className="pt-1">
              <ToggleLine
                label={t('Ativar lembretes de pausa')}
                sub={t('Avisamos quando você passar muito tempo seguido no app.')}
                checked={prefs.pause_enabled}
                onChange={(v) => updatePref('pause_enabled', v)}
              />
              {prefs.pause_enabled && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[30, 60, 90, 120].map((m) => (
                    <button
                      key={m}
                      onClick={() => updatePref('pause_minutes', m)}
                      className={cn(
                        'py-2 rounded-lg text-xs font-medium border transition-all',
                        prefs.pause_minutes === m ? 'border-gold/50 bg-gold/10 text-gold' : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {m}min
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Row>
        </Group>

        {/* NOTIFICAÇÕES */}
        <Group label={t('Notificações')}>
          <Row icon={Bell} label={t('Por sub-app')} sub={t('Escolha de quais serviços receber')}>
            <div className="pt-1 divide-y divide-border">
              {SUB_APPS.map((app) => (
                <ToggleLine
                  key={app.id}
                  label={app.nome}
                  checked={prefs[app.prefKey]}
                  onChange={(v) => updatePref(app.prefKey, v)}
                />
              ))}
            </div>
          </Row>

          <Row icon={Moon} label={t('Não perturbe')} sub={prefs.dnd_enabled ? `${prefs.dnd_from} – ${prefs.dnd_to}` : t('Desativado')}>
            <div className="pt-1">
              <ToggleLine
                label={t('Silenciar num horário')}
                sub={t('Nenhuma notificação durante o período escolhido.')}
                checked={prefs.dnd_enabled}
                onChange={(v) => updatePref('dnd_enabled', v)}
              />
              {prefs.dnd_enabled && (
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-xs text-muted-foreground">{t('Das')}</label>
                  <Input type="time" value={prefs.dnd_from} onChange={(e) => updatePref('dnd_from', e.target.value)} className="bg-background w-32" />
                  <label className="text-xs text-muted-foreground">{t('às')}</label>
                  <Input type="time" value={prefs.dnd_to} onChange={(e) => updatePref('dnd_to', e.target.value)} className="bg-background w-32" />
                </div>
              )}
            </div>
          </Row>

          <Row icon={Mail} label={t('Resumo agendado')} sub={prefs.digest_enabled ? t('Todo dia às {h}', { h: prefs.digest_at }) : t('Desativado')}>
            <div className="pt-1">
              <ToggleLine
                label={t('Juntar notificações')}
                sub={t('Em vez de avisos a todo momento, entregamos um resumo no horário definido.')}
                checked={prefs.digest_enabled}
                onChange={(v) => updatePref('digest_enabled', v)}
              />
              {prefs.digest_enabled && (
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-xs text-muted-foreground">{t('Entregar às')}</label>
                  <Input type="time" value={prefs.digest_at} onChange={(e) => updatePref('digest_at', e.target.value)} className="bg-background w-32" />
                </div>
              )}
            </div>
          </Row>
        </Group>

        {/* SISTEMA & SOBRE */}
        <Group label={t('Sistema & sobre')}>
          <Row icon={FlaskConical} label={t('Recursos beta')} sub={prefs.beta_features ? t('Ativados') : t('Desativados')}>
            <div className="pt-1">
              <ToggleLine
                label={t('Ativar funcionalidades experimentais')}
                sub={t('Receba recursos novos antes de todo mundo. Podem conter instabilidades.')}
                checked={prefs.beta_features}
                onChange={(v) => updatePref('beta_features', v)}
              />
            </div>
          </Row>

          <div id="install" className="scroll-mt-24">
            <Row icon={Download} label={t('Instalar como app')} sub={t('Adicione o Alps OS à sua tela inicial')}>
              <div className="pt-1">
                <InstallShortcutCard />
              </div>
            </Row>
          </div>

          <Row icon={Info} label={t('Sobre & novidades')} sub={t('Versão {v}', { v: APP_VERSION })}>
            <div className="pt-1 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t('O que há de novo')}</p>
                {CHANGELOG.map((c) => (
                  <div key={c.versao} className="rounded-xl border border-border bg-background p-3.5">
                    <p className="text-sm font-medium text-foreground mb-2">{c.versao}</p>
                    <ul className="space-y-1.5">
                      {c.itens.map((it) => (
                        <li key={it} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                          {t(it)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <a href="https://alpsprime.com.br/termos-de-uso" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{t('Termos de Uso')}</a>
                <a href="https://alpsprime.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{t('Política de Privacidade')}</a>
              </div>
              <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} Alps OS</p>
            </div>
          </Row>

          <Row icon={Eraser} label={t('Limpar cache')} sub={t('Libera espaço local do app')}>
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-3">
                {t('Remove arquivos temporários guardados no dispositivo. Suas preferências e sua conta não são afetadas.')}
              </p>
              <Button
                onClick={handleClearCache}
                disabled={clearing}
                variant="outline"
                className="w-full h-11 justify-start"
              >
                {clearing ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Eraser className="w-4 h-4 mr-3" />}
                {t('Limpar cache agora')}
              </Button>
            </div>
          </Row>
        </Group>

        {/* CONTA */}
        <Group label={t('Conta')}>
          <ActionRow
            icon={LifeBuoy}
            label={t('Suporte')}
            sub={t('Fale com a nossa equipe')}
            onClick={() => navigate('/suporte')}
          />
          <ActionRow
            icon={LogOut}
            label={t('Sair')}
            sub={t('Encerrar a sessão neste dispositivo')}
            danger
            onClick={() => signOut(window.location.origin)}
          />
        </Group>

        {/* ADMIN (somente administradores) */}
        {user?.role === 'admin' && (
          <Group label={t('Administração')}>
            <div className="p-4">
              <AdminBroadcastSection />
            </div>
          </Group>
        )}

      </div>
    </div>
  );
}
