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
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getConversationKey } from '@/lib/chatUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProfileTranslationProvider, Translated } from '@/components/profile/ProfileTranslator';
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
      <div className="min-h-full flex items-center justify-center bg-black">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-center bg-black">
        <User className="w-10 h-10 text-zinc-600 mb-3" />
        <h2 className="font-display text-xl mb-1 text-white">Usuário não encontrado</h2>
        <p className="text-sm text-zinc-400">Este perfil não existe ou foi removido.</p>
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
    toast.success('Foto updated!');
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
      bio: form.bio
    });
    setSaving(false);
    setEditing(false);
    toast.success('Perfil atualizado com sucesso!');
    setTimeout(() => window.location.reload(), 800);
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || user?.full_name || '',
      bio: user?.bio || ''
    });
    setEditing(false);
  };

  const primaryName = user?.username || user?.full_name || 'Usuário';

  return (
    <ProfileTranslationProvider profileEmail={user.email} isUnlimited={true}>
    <div className="min-h-full overflow-x-hidden bg-black text-white pb-10">

      {/* Banner em tom preto/cinza-escuro */}
      <div className="relative h-36 lg:h-48 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black overflow-hidden border-b border-white/5">
        {user.profile_banner_url && (
          <img src={user.profile_banner_url} alt="Banner" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        {!readOnly && (
          <>
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-3 right-3 flex items-center gap-1.5 text-xs bg-black/70 backdrop-blur-sm border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-all shadow-sm"
            >
              {uploadingBanner ? <span className="w-3 h-3 border border-t-white rounded-full animate-spin" /> : <Camera className="w-3 h-3" />}
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
            {/* Círculo da foto em preto fosco premium */}
            <div className="w-24 h-24 rounded-full bg-black p-1 flex items-center justify-center shadow-xl relative overflow-hidden ring-4 ring-black">
              <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden relative">
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={primaryName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-zinc-600 absolute inset-0 m-auto" />
                )}
              </div>
            </div>
            {!readOnly && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-black flex items-center justify-center border-2 border-black hover:bg-zinc-900 transition-colors"
                >
                  {uploadingAvatar ? <span className="w-3 h-3 border border-t-zinc-300 rounded-full animate-spin" /> : <Camera className="w-3.5 h-3.5 text-zinc-300" />}
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
                className="h-8 gap-1.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white rounded-xl"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Mensagem
              </Button>
            )}

            {!readOnly && (
              editing ? (
                <>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 gap-1.5 border-white/10 bg-black text-white hover:bg-zinc-900 rounded-xl">
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 gap-1.5 bg-white hover:bg-zinc-200 text-black rounded-xl font-medium">
                    <Check className="w-3.5 h-3.5" /> {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 gap-1.5 border-white/10 bg-black hover:bg-zinc-900 text-white rounded-xl">
                  <Edit3 className="w-3.5 h-3.5" /> Editar perfil
                </Button>
              )
            )}
          </div>
        </div>

        {/* NOME DO USUÁRIO COM FONTE OPEN SANS E SEM SELO */}
        <div className="mb-6">
          {editing && !readOnly ? (
             <div className="mb-3">
               <label className="text-xs text-zinc-400 mb-1 block font-medium flex items-center gap-1">
                 <PenLine className="w-3 h-3" /> Nome Principal
               </label>
               <Input
                 value={form.username}
                 onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                 placeholder="Seu nome"
                 className="bg-black border-white/10 focus-visible:ring-zinc-800 font-semibold text-lg text-white"
                 style={{ fontFamily: "'Open Sans', sans-serif" }}
               />
             </div>
          ) : (
            <h1 className="text-2xl tracking-tight text-white font-semibold" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              {primaryName}
            </h1>
          )}
        </div>

        <div className="space-y-6 pb-10">
          {/* Caixa de Biografia em Preto Puro combinando com o design */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-black border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 block">Biografia</label>
                {editing && !readOnly ? (
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                    maxLength={200}
                    className="resize-none bg-black border-white/10 focus-visible:ring-zinc-800 text-white"
                  />
                ) : user.bio ? (
                  <Translated id="bio" as="p" className="text-sm text-zinc-200 leading-relaxed font-medium">
                    {user.bio}
                  </Translated>
                ) : (
                  <p className="text-sm text-zinc-500 leading-relaxed"><span className="italic">Nenhuma biografia adicionada.</span></p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
    </ProfileTranslationProvider>
  );
}
