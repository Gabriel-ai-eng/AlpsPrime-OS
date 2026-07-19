import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  User, Camera, Edit3, Check, X, Loader2, PenLine, 
  MessageCircle, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadProfileImage } from '@/lib/supabaseUpload';
import { getConversationKey } from '@/lib/chatUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProfileTranslationProvider, Translated } from '@/components/profile/ProfileTranslator';
import ShareProfileButton from '@/components/profile/ShareProfileButton';
import { useProfileVisitTracker } from '@/lib/useProfileVisitTracker';
import CachedImage from '@/components/CachedImage';
import { useT } from '@/lib/i18n';

export default function Profile() {
  const t = useT();
  const { user: authUser, refetchUser } = useAuth();
  const { email: paramEmail } = useParams();
  const navigate = useNavigate();
  const decodedParamEmail = paramEmail ? decodeURIComponent(paramEmail) : null;
  const isViewingOther = decodedParamEmail && decodedParamEmail !== authUser?.email;

  const [viewedUser, setViewedUser] = useState(isViewingOther ? null : authUser);
  const [loadingViewed, setLoadingViewed] = useState(isViewingOther);

  useEffect(() => {
    if (!isViewingOther) {
      setViewedUser(authUser);
      setLoadingViewed(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingViewed(true);
      try {
        const res = await base44.functions.invoke('getPublicProfile', { email: decodedParamEmail });
        if (!cancelled) {
          setViewedUser(res?.data?.profile || null);
        }
      } catch (e) {
        if (!cancelled) setViewedUser(null);
      } finally {
        if (!cancelled) setLoadingViewed(false);
      }
    })();
    return () => { cancelled = true; };
  }, [decodedParamEmail, isViewingOther, authUser]);

  const user = viewedUser;

  useProfileVisitTracker({
    profileEmail: isViewingOther ? decodedParamEmail : null,
    visitorEmail: authUser?.email,
    visitorIsGhost: authUser?.ghost_mode === true,
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [avatarFullscreen, setAvatarFullscreen] = useState(false);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [form, setForm] = useState({
    username: user?.username || user?.full_name || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || user.full_name || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  if (loadingViewed) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-center bg-background">
        <User className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-foreground" style={{ fontFamily: "'Open Sans', sans-serif" }}>{t('Usuário não encontrado')}</h2>
        <p className="text-sm text-muted-foreground">{t('Este perfil não existe ou foi removido.')}</p>
      </div>
    );
  }

  const readOnly = isViewingOther;

  // Sobe a imagem e salva no perfil.
  const uploadAndSave = async (file, folder, campo, setUploading, inputRef) => {
    setUploading(true);
    try {
      const { url } = await uploadProfileImage(file, folder);
      await base44.auth.updateMe({ [campo]: url });
      await refetchUser();
      const updated = await base44.auth.me();
      setViewedUser(updated);
      toast.success(folder === 'banners' ? t('Capa atualizada!') : t('Foto atualizada!'));
    } catch (err) {
      console.error('upload error:', err);
      toast.error(folder === 'banners' ? t('Erro ao atualizar capa.') : t('Erro ao atualizar foto.'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadAndSave(file, 'avatars', 'profile_picture_url', setUploadingAvatar, avatarInputRef);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadAndSave(file, 'banners', 'profile_banner_url', setUploadingBanner, bannerInputRef);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ username: form.username, bio: form.bio });
      await refetchUser();
      const updated = await base44.auth.me();
      setViewedUser(updated);
      toast.success(t('Perfil atualizado com sucesso!'));
      setEditing(false);
    } catch (err) {
      toast.error(t('Erro ao salvar perfil.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || user?.full_name || '',
      bio: user?.bio || ''
    });
    setEditing(false);
  };

  const primaryName = user?.username || user?.full_name || t('Usuário');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <ProfileTranslationProvider profileEmail={user.email} isUnlimited={true}>
    <div className="min-h-full overflow-x-hidden bg-background text-foreground pb-10">

      {/* --- BANNER --- */}
      <div className="relative h-40 lg:h-56 bg-gradient-to-br from-gold/20 via-muted to-background overflow-hidden border-b border-border">
        {user.profile_banner_url && (
          <CachedImage src={user.profile_banner_url} cacheKey={`banner_${user.email}`} alt="Banner" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent" />
        {!readOnly && (
          <>
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-4 right-4 flex items-center gap-1.5 text-xs bg-card/70 backdrop-blur-md border border-border hover:border-gold/40 text-foreground/80 hover:text-foreground px-3 py-2 rounded-xl transition-all shadow-sm"
            >
              {uploadingBanner ? <span className="w-3 h-3 border border-t-foreground rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
              <span className="hidden sm:inline">{t('Alterar capa')}</span>
            </button>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </>
        )}
      </div>

      <motion.div 
        variants={containerVariants} initial="hidden" animate="show"
        className="max-w-4xl mx-auto px-5 lg:px-8 -mt-16 sm:-mt-20 relative z-10"
      >
        {/* --- IDENTITY LAYER --- */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end gap-5 mb-4">
          {/* Avatar Clickable */}
          <div className="relative w-fit shrink-0">
            <div
              onClick={() => user.profile_picture_url && setAvatarFullscreen(true)}
              className={cn(
                "w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-background flex items-center justify-center shadow-2xl relative overflow-hidden ring-[6px] ring-background z-10",
                user.profile_picture_url && "cursor-zoom-in group"
              )}
            >
              <div className="w-full h-full rounded-full bg-muted overflow-hidden relative">
                {user.profile_picture_url ? (
                  <CachedImage src={user.profile_picture_url} cacheKey={`avatar_${user.email}`} alt={primaryName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground absolute inset-0 m-auto" />
                )}
              </div>
            </div>
            {!readOnly && (
              <>
                {/* Badge de câmera sempre visível (descobrível no celular, sem hover) */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-card/90 backdrop-blur-md border border-border hover:border-gold/40 text-foreground/80 hover:text-foreground shadow-md transition-all active:scale-90"
                  title={t('Alterar foto')}
                >
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 pb-2">
            {editing && !readOnly ? (
               <div className="mb-3 max-w-sm">
                 <label className="text-xs text-muted-foreground mb-1.5 font-medium flex items-center gap-1.5">
                   <PenLine className="w-3.5 h-3.5" /> {t('Nome Principal')}
                 </label>
                 <Input
                   value={form.username}
                   onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                   placeholder={t('Seu nome')}
                   className="bg-muted border-border focus-visible:ring-gold/40 text-lg text-foreground rounded-xl h-12 px-4"
                   style={{ fontFamily: "'Open Sans', sans-serif" }}
                 />
               </div>
            ) : (
              <h1 className="text-3xl sm:text-4xl tracking-tight text-foreground font-bold" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {primaryName}
              </h1>
            )}

            {!editing && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium">
                <span className="text-foreground/80">@{user?.username || user?.full_name?.toLowerCase().replace(/\s/g, '') || 'usuario'}</span>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  {t('Online')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 opacity-70" />
                  {t('Entrou em Março de 2026')}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* --- ACTION BUTTONS --- */}
        <motion.div variants={itemVariants} className="flex flex-row flex-wrap items-center gap-3 w-full border-b border-border pb-5 mb-5">

          <ShareProfileButton profileEmail={user.email} displayName={primaryName} />

          {readOnly && authUser && (
            <Button
              size="sm"
              onClick={() => {
                const key = getConversationKey(authUser.email, user.email);
                navigate(`/chat-dm?c=${encodeURIComponent(key)}`);
              }}
              className="h-8 gap-1.5 bg-foreground hover:bg-foreground/90 text-background"
            >
              <MessageCircle className="w-3.5 h-3.5" /> {t('Mensagem')}
            </Button>
          )}

          {!readOnly && (
            editing ? (
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleCancel} className="h-8 gap-1.5 border-border bg-muted text-foreground hover:bg-muted/70">
                  <X className="w-3.5 h-3.5" /> {t('Cancelar')}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 gap-1.5 bg-foreground hover:bg-foreground/90 text-background">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {saving ? t('Salvando...') : t('Salvar')}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="h-8 gap-1.5 border-border hover:border-gold/40 hover:text-gold">
                <Edit3 className="w-3.5 h-3.5" /> {t('Editar Perfil')}
              </Button>
            )
          )}
        </motion.div>

        {/* --- SECTION: BIO --- */}
        <motion.div variants={itemVariants} className="w-full">
          <div className="bg-card border border-border rounded-3xl p-6 backdrop-blur-md">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              {t('Biografia')}
            </h2>
            {editing && !readOnly ? (
              <Textarea
                value={form.bio}
                onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder={t('Conte um pouco sobre você...')}
                rows={4}
                maxLength={200}
                className="resize-none bg-muted border-border focus-visible:ring-gold/40 text-foreground rounded-xl p-4"
              />
            ) : user.bio ? (
              <Translated id="bio" as="p" className="text-[15px] text-foreground/80 leading-relaxed">
                {user.bio}
              </Translated>
            ) : (
              <p className="text-[15px] text-muted-foreground leading-relaxed italic">{t('Nenhuma biografia adicionada.')}</p>
            )}
          </div>
        </motion.div>

      </motion.div>

      {/* --- FOTO EM TELA CHEIA --- */}
      <AnimatePresence>
        {avatarFullscreen && user.profile_picture_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setAvatarFullscreen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setAvatarFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={t('Fechar')}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              src={user.profile_picture_url}
              alt={primaryName}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl cursor-default"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ProfileTranslationProvider>
  );
}