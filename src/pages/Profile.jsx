import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  User, Mail, Shield, Crown, Camera,
  Edit3, Check, X, Globe, MapPin, Eye, EyeOff, Trophy, Lock, Loader2, PenLine
} from 'lucide-react';
import { usePostCounts } from '@/lib/usePostCounts';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getConversationKey } from '@/lib/chatUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import BioLinks from '@/components/profile/BioLinks';
import BioLinksEditor from '@/components/profile/BioLinksEditor';
import { ProfileTranslationProvider, ProfileTranslateButton, Translated } from '@/components/profile/ProfileTranslator';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import UnlimitedAura from '@/components/common/UnlimitedAura';
import PlanHighlightTag from '@/components/common/PlanHighlightTag';
import AuraTooltipBadge from '@/components/common/AuraTooltipBadge';
import ShareProfileButton from '@/components/profile/ShareProfileButton';
import { useProfileVisitTracker } from '@/lib/useProfileVisitTracker';

export default function Profile() {
  const { user: authUser, setUser } = useAuth();
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
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [form, setForm] = useState({
    username: user?.username || user?.full_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });

  if (loadingViewed) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-center bg-background">
        <User className="w-10 h-10 text-muted-foreground mb-3" />
        <h2 className="font-display text-xl mb-1">Usuário não encontrado</h2>
        <p className="text-sm text-muted-foreground">Este perfil não existe ou foi removido.</p>
      </div>
    );
  }

  const readOnly = isViewingOther;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ profile_picture_url: file_url });
    toast.success('Foto atualizada!');
    setUploadingAvatar(false);
    window.location.reload();
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ profile_banner_url: file_url });
    toast.success('Banner atualizado!');
    setUploadingBanner(false);
    window.location.reload();
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      username: form.username,
      bio: form.bio,
      location: form.location,
      website: form.website,
    });
    setSaving(false);
    setEditing(false);
    toast.success('Perfil atualizado com sucesso!');
    setTimeout(() => window.location.reload(), 800);
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || user?.full_name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
    });
    setEditing(false);
  };

  const primaryName = user?.username || user?.full_name || 'Usuário';
  const isUnlimitedProfile = user.plan === 'unlimited';

  return (
    <ProfileTranslationProvider profileEmail={user.email} isUnlimited={isUnlimitedProfile}>
    <div className="min-h-full overflow-x-hidden bg-background text-foreground pb-10">
      
      {/* Banner */}
      <div className="relative h-36 lg:h-48 bg-gradient-to-br from-gold/20 via-gold/5 to-transparent overflow-hidden">
        {user.profile_banner_url && (
          <img src={user.profile_banner_url} alt="Banner" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        {!readOnly && (
          <>
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-3 right-3 flex items-center gap-1.5 text-xs bg-background/70 backdrop-blur-sm border border-border hover:border-gold/40 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-all shadow-sm"
            >
              {uploadingBanner ? <span className="w-3 h-3 border border-t-gold rounded-full animate-spin" /> : <Camera className="w-3 h-3" />}
              Alterar capa
            </button>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-6">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-12 mb-6 relative z-10">
          <div className="relative">
            <UnlimitedAura plan={user.plan} size="lg">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center overflow-hidden ring-4 ring-background shadow-xl">
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={primaryName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-background" />
                )}
              </div>
            </UnlimitedAura>
            {!readOnly && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gold flex items-center justify-center border-2 border-background hover:bg-gold-dark transition-colors"
                >
                  {uploadingAvatar ? <span className="w-3 h-3 border border-t-background rounded-full animate-spin" /> : <Camera className="w-3 h-3 text-background" />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <ShareProfileButton profileEmail={user.email} displayName={primaryName} />
            
            {readOnly && authUser && (
              <Button
                size="sm"
                onClick={() => {
                  const key = getConversationKey(authUser.email, user.email);
                  navigate(`/chat-dm?c=${encodeURIComponent(key)}`);
                }}
                className="h-8 gap-1.5 bg-gold hover:bg-gold-dark text-background"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Mensagem
              </Button>
            )}

            {!readOnly && (
              editing ? (
                <>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 gap-1.5 border-border">
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 gap-1.5 bg-gold hover:bg-gold-dark text-background">
                    <Check className="w-3.5 h-3.5" /> {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 gap-1.5 border-border hover:border-gold/40">
                  <Edit3 className="w-3.5 h-3.5" /> Editar perfil
                </Button>
              )
            )}
          </div>
        </div>

        {/* NOME E PLANO DO USUÁRIO */}
        <div className="mb-6">
          {editing && !readOnly ? (
             <div className="mb-3">
               <label className="text-xs text-muted-foreground mb-1 block font-medium flex items-center gap-1">
                 <PenLine className="w-3 h-3" /> Nome Principal (Como as pessoas te verão)
               </label>
               <Input
                 value={form.username}
                 onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                 placeholder="Seu nome"
                 className="bg-background border-border focus-visible:ring-gold/50 font-semibold text-lg"
               />
             </div>
          ) : (
            <h1 className="font-display text-2xl tracking-tight inline-flex items-center gap-2 flex-wrap text-foreground">
              {primaryName}
              <VerifiedBadge plan={user.plan} size={20} />
              <PlanHighlightTag plan={user.plan} />
              {!readOnly && user.plan !== 'unlimited' && <AuraTooltipBadge />}
            </h1>
          )}
        </div>

        <div className="space-y-6 pb-10">
          
          {isUnlimitedProfile && (
            <div className="flex justify-end">
              <ProfileTranslateButton />
            </div>
          )}

          {/* Identity card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            
            <div className="space-y-5">
              
              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Biografia</label>
                {editing && !readOnly ? (
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                    maxLength={200}
                    className="resize-none bg-background border-border focus-visible:ring-gold/50"
                  />
                ) : user.bio ? (
                  <Translated id="bio" as="p" className="text-sm text-foreground/90 leading-relaxed font-medium">
                    {user.bio}
                  </Translated>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed"><span className="italic">Nenhuma biografia adicionada.</span></p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {/* Location */}
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 block flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Localização</label>
                  {editing && !readOnly ? (
                    <Input
                      value={form.location}
                      onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="Cidade, País"
                      className="bg-background border-border focus-visible:ring-gold/50 h-9"
                    />
                  ) : (
                    <p className="text-sm text-foreground font-medium">
                      {user.location ? user.location : <span className="italic text-muted-foreground">Não informada</span>}
                    </p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 block flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Links</label>
                  {editing && !readOnly ? (
                    <Input
                      value={form.website}
                      onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))}
                      placeholder="https://seusite.com"
                      className="bg-background border-border focus-visible:ring-gold/50 h-9"
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {user.website
                        ? <a href={user.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold hover:text-gold-light transition-colors">{user.website.replace(/^https?:\/\//, '')}</a>
                        : <span className="italic text-muted-foreground">Nenhum link</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {readOnly && (user.plan === 'pro' || user.plan === 'unlimited') && (
            <p className="text-[11px] text-muted-foreground text-center px-4">
              <Eye className="w-3 h-3 inline-block mr-1 -mt-0.5 text-gold/70" />
              Sua identidade está protegida ao visualizar este perfil.
            </p>
          )}

        </div>
      </div>
    </div>
    </ProfileTranslationProvider>
  );
}
