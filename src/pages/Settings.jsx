import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChevronLeft, ChevronDown, Sun, Moon, Monitor, Palette,
  ShieldCheck, Trash2, AlertTriangle, Clock, BarChart3, Coffee,
  Bell, Mail, FlaskConical, Info, Eraser, Download, Loader2, Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { signOut } from '@/lib/auth';
import { useLiquidGlass } from '@/lib/useLiquidGlass';
import {
  applyTheme, getThemePref, resolveTheme,
  applyAccent, getAccent, ACCENTS,
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
  { id: 'vivart', nome: 'Vivart',        prefKey: 'notif_vivart', dados: ['Imagens e criações que você salva'] },
];

const CHANGELOG = [
  {
    versao: 'Beta',
    itens: [
      'Nova Central de Configurações no estilo das grandes plataformas',
      'Tema Claro / Escuro / Automático e escolha da cor de destaque',
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
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">{children}</div>
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

/* ── Página ── */

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setMode } = useLiquidGlass();

  const [themePref, setThemePref] = useState(getThemePref());
  const [accent, setAccent] = useState(getAccent());
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

  const onAccent = (id) => {
    setAccent(id);
    applyAccent(id);
  };

  const updatePref = (key, value) => {
    setPrefs(setPref(key, value));
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await base44.functions.invoke('deleteMyAccount', {});
      toast.success('Conta excluída. Até breve.');
      setTimeout(() => signOut(), 1200);
    } catch {
      toast.error('Erro ao excluir conta. Tente novamente.');
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
      toast.success('Cache limpo. Recarregando…');
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error('Não foi possível limpar o cache.');
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
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Escuro', icon: Moon },
    { id: 'auto', label: 'Automático', icon: Monitor },
  ];

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="px-6 lg:px-8 pt-6 pb-2 bg-transparent">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 mb-7 text-sm font-normal text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar ao perfil</span>
          </button>
          <h1 className="m-0 font-light text-foreground uppercase" style={{
            fontSize: 'clamp(16px, 4vw, 36px)',
            letterSpacing: 'clamp(2px, 1.5vw, 8px)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
          }}>
            Configurações
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 space-y-7 pb-16">

        {/* APARÊNCIA */}
        <Group label="Aparência & personalização">
          <Row icon={Palette} label="Tema" sub={THEMES.find((t) => t.id === themePref)?.label}>
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
                Seguindo o sistema — agora em modo {resolveTheme('auto') === 'dark' ? 'escuro' : 'claro'}.
              </p>
            )}
          </Row>

          <Row icon={Palette} label="Cor de destaque" sub={ACCENTS[accent]?.label}>
            <div className="flex flex-wrap gap-3 pt-1">
              {Object.entries(ACCENTS).map(([id, a]) => (
                <button
                  key={id}
                  onClick={() => onAccent(id)}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 ring-2 ring-offset-2 ring-offset-card',
                    accent === id ? 'ring-foreground/40' : 'ring-transparent'
                  )}
                  style={{ backgroundColor: a.swatch }}
                  aria-label={a.label}
                >
                  {accent === id && <Check className="w-5 h-5 text-white drop-shadow" />}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              A cor escolhida vale para todo o ecossistema Alps OS.
            </p>
          </Row>
        </Group>

        {/* PRIVACIDADE & DADOS */}
        <Group label="Privacidade & dados">
          <Row icon={ShieldCheck} label="O que cada sub-app acessa" sub="Transparência de dados por serviço">
            <div className="space-y-3 pt-1">
              {SUB_APPS.map((app) => (
                <div key={app.id} className="rounded-xl border border-border bg-background p-3.5">
                  <p className="text-sm font-medium text-foreground mb-1.5">{app.nome}</p>
                  <ul className="space-y-1">
                    {app.dados.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Seus dados ficam dentro do ecossistema privado da Alps e não são vendidos a terceiros.
              </p>
            </div>
          </Row>

          <Row icon={Trash2} label="Apagar minha conta" sub="Exclusão permanente dos seus dados" danger>
            <div className="pt-1">
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-background border border-border rounded-xl p-3 mb-3">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Apagar a conta remove seu perfil e dados do Alps OS. Isso <strong>não cancela</strong> sua
                  compra na Hotmart — com o mesmo e-mail você poderá entrar novamente no futuro.
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
                    <Trash2 className="w-4 h-4 mr-3" /> Excluir conta permanentemente
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
                        Ação irreversível. Digite <strong>EXCLUIR</strong> para confirmar.
                      </p>
                    </div>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Digite EXCLUIR"
                      className="bg-background border-destructive/30 focus-visible:ring-destructive/50 text-center font-mono"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 font-semibold"
                        disabled={deleteConfirmText !== 'EXCLUIR' || deletingAccount}
                        onClick={handleDeleteAccount}
                      >
                        {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Row>
        </Group>

        {/* BEM-ESTAR DIGITAL */}
        <Group label="Bem-estar digital">
          <Row icon={BarChart3} label="Tempo de uso" sub={totalSemana ? `${formatDuration(totalSemana)} nos últimos 7 dias` : 'Coletando dados…'}>
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
                    Total na semana: <strong className="text-foreground">{formatDuration(totalSemana)}</strong>
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Continue usando o Alps OS que seu tempo de uso aparecerá aqui em um gráfico semanal.
                </p>
              )}
            </div>
          </Row>

          <Row icon={Coffee} label="Lembretes de pausa" sub={prefs.pause_enabled ? `A cada ${prefs.pause_minutes} min` : 'Desativado'}>
            <div className="pt-1">
              <ToggleLine
                label="Ativar lembretes de pausa"
                sub="Avisamos quando você passar muito tempo seguido no app."
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
        <Group label="Notificações">
          <Row icon={Bell} label="Por sub-app" sub="Escolha de quais serviços receber">
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

          <Row icon={Moon} label="Não perturbe" sub={prefs.dnd_enabled ? `${prefs.dnd_from} – ${prefs.dnd_to}` : 'Desativado'}>
            <div className="pt-1">
              <ToggleLine
                label="Silenciar num horário"
                sub="Nenhuma notificação durante o período escolhido."
                checked={prefs.dnd_enabled}
                onChange={(v) => updatePref('dnd_enabled', v)}
              />
              {prefs.dnd_enabled && (
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-xs text-muted-foreground">Das</label>
                  <Input type="time" value={prefs.dnd_from} onChange={(e) => updatePref('dnd_from', e.target.value)} className="bg-background w-32" />
                  <label className="text-xs text-muted-foreground">às</label>
                  <Input type="time" value={prefs.dnd_to} onChange={(e) => updatePref('dnd_to', e.target.value)} className="bg-background w-32" />
                </div>
              )}
            </div>
          </Row>

          <Row icon={Mail} label="Resumo agendado" sub={prefs.digest_enabled ? `Todo dia às ${prefs.digest_at}` : 'Desativado'}>
            <div className="pt-1">
              <ToggleLine
                label="Juntar notificações"
                sub="Em vez de avisos a todo momento, entregamos um resumo no horário definido."
                checked={prefs.digest_enabled}
                onChange={(v) => updatePref('digest_enabled', v)}
              />
              {prefs.digest_enabled && (
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-xs text-muted-foreground">Entregar às</label>
                  <Input type="time" value={prefs.digest_at} onChange={(e) => updatePref('digest_at', e.target.value)} className="bg-background w-32" />
                </div>
              )}
            </div>
          </Row>
        </Group>

        {/* SISTEMA & SOBRE */}
        <Group label="Sistema & sobre">
          <Row icon={FlaskConical} label="Recursos beta" sub={prefs.beta_features ? 'Ativados' : 'Desativados'}>
            <div className="pt-1">
              <ToggleLine
                label="Ativar funcionalidades experimentais"
                sub="Receba recursos novos antes de todo mundo. Podem conter instabilidades."
                checked={prefs.beta_features}
                onChange={(v) => updatePref('beta_features', v)}
              />
            </div>
          </Row>

          <div id="install" className="scroll-mt-24">
            <Row icon={Download} label="Instalar como app" sub="Adicione o Alps OS à sua tela inicial">
              <div className="pt-1">
                <InstallShortcutCard />
              </div>
            </Row>
          </div>

          <Row icon={Info} label="Sobre & novidades" sub={`Versão ${APP_VERSION}`}>
            <div className="pt-1 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">O que há de novo</p>
                {CHANGELOG.map((c) => (
                  <div key={c.versao} className="rounded-xl border border-border bg-background p-3.5">
                    <p className="text-sm font-medium text-foreground mb-2">{c.versao}</p>
                    <ul className="space-y-1.5">
                      {c.itens.map((it) => (
                        <li key={it} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <a href="https://alpsprime.com.br/termos-de-uso" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Termos de Uso</a>
                <a href="https://alpsprime.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Política de Privacidade</a>
              </div>
              <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} Alps OS</p>
            </div>
          </Row>

          <Row icon={Eraser} label="Limpar cache" sub="Libera espaço local do app">
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-3">
                Remove arquivos temporários guardados no dispositivo. Suas preferências e sua conta não são afetadas.
              </p>
              <Button
                onClick={handleClearCache}
                disabled={clearing}
                variant="outline"
                className="w-full h-11 justify-start"
              >
                {clearing ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Eraser className="w-4 h-4 mr-3" />}
                Limpar cache agora
              </Button>
            </div>
          </Row>
        </Group>

        {/* ADMIN (somente administradores) */}
        {user?.role === 'admin' && (
          <Group label="Administração">
            <div className="p-4">
              <AdminBroadcastSection />
            </div>
          </Group>
        )}

      </div>
    </div>
  );
}
