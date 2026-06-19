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
import BioLinks from '@/components/profile/BioLinks';
import BioLinksEditor from '@/components/profile/BioLinksEditor';
import { ProfileTranslationProvider, Translated } from '@/components/profile/ProfileTranslator';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import ShareProfileButton from '@/components/profile/ShareProfileButton';
import { useProfileVisitTracker } from '@/lib/useProfileVisitTracker';

export default function Profile() {
  const { user: authUser, setUser } = useAuth();
  const { email: paramEmail } = useParams();
  const navigate = useNavigate();
  const decodedParamEmail = paramEmail ? decodeURIComponent(paramEmail) : null;

  const [user, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isViewingOther = decodedParamEmail && decodedParamEmail !== authUser?.email;
  const readOnly = isViewingOther;

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: ''
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const targetEmail = decodedParamEmail || authUser?.email;
        if (!targetEmail) return;

        const res = await base44.rpc('getPublicProfile', { target_email: targetEmail });
        if (res) {
          setProfileUser(res);
          setForm({
            full_name: res.full_name || '',
            username: res.username || '',
            bio: res.bio || ''
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [decodedParamEmail, authUser?.email]);

  useProfileVisitTracker(user?.email);

  const handleSave = async () => {
    try {
      setSaving(true);
      await base44.rpc('syncAccessAndCleanup', {
        profile_updates: {
          full_name: form.full_name,
          username: form.username,
          bio: form.bio
        }
      });
      setProfileUser(prev => ({ ...prev, ...form }));
      if (!isViewingOther) {
        setUser(prev => ({ ...prev, ...form }));
      }
      setEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      const res = await base44.rpc('uploadImageToSupabase', {
        base64_image: base64,
        file_name: `avatar-${Date.now()}.jpg`
      });

      if (res?.url) {
        await base44.rpc('syncAccessAndCleanup', {
          profile_updates: { profile_picture_url: res.url }
        });
        setProfileUser(prev => ({ ...prev, profile_picture_url: res.url }));
        if (!isViewingOther) {
          setUser(prev => ({ ...prev, profile_picture_url: res.url }));
        }
        toast.success('Foto de perfil atualizada!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background gap-4 text-center p-6">
        <User className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Usuário não encontrado</h2>
        <Button onClick={() => navigate('/feed')} variant="outline">Voltar ao Início</Button>
      </div>
    );
  }

  return (
    <ProfileTranslationProvider>
    <div className="min-h-full bg-background pb-12">
      {/* Cover Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-zinc-900 to-black relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,79,0.05),transparent_50%)]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
          
          {/* Avatar e Informações Principais */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            
            {/* Avatar Container */}
            <div className="relative group">
              {/* Círculo alterado de dourado para a cor preta */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-black p-1 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden relative">
                  {user.profile_picture_url ? (
                    <img src={user.profile_picture_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-zinc-600 absolute inset-0 m-auto" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Botão da câmera alterado para fundo preto e ícone cinza mais claro */}
              {!readOnly && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-9 h-9 bg-black border border-white/10 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all outline-none"
                  >
                    <Camera className="w-4 h-4 text-zinc-300" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Nome e Username */}
            <div className="mb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {editing && !readOnly ? (
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="bg-background border-border text-lg font-bold h-9 focus-visible:ring-gold/50"
                    placeholder="Nome Completo"
                  />
                ) : (
                  <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                    <Translated>{user.full_name || 'Usuário'}</Translated>
                    <VerifiedBadge userEmail={user.email} size={18} />
                  </h2>
                )}
              </div>
              
              {editing && !readOnly ? (
                <Input
                  value={form.username}
                  onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                  className="bg-background border-border text-sm text-muted-foreground h-8 mt-1.5 focus-visible:ring-gold/50"
                  placeholder="username"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  @{user.username || 'usuario'}
                </p>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <ShareProfileButton email={user.email} username={user.username} />

            {!readOnly ? (
              editing ? (
                <div className="flex items-center gap-2">
                  <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold-dark text-black gap-1.5 rounded-xl h-10 font-medium">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Salvar</span>
                  </Button>
                  <Button onClick={() => {
                    setForm({
                      full_name: user.full_name || '',
                      username: user.username || '',
                      bio: user.bio || ''
                    });
                    setEditing(false);
                  }} variant="outline" className="rounded-xl border-border h-10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setEditing(true)} variant="outline" className="border-border hover:bg-muted text-foreground gap-1.5 rounded-xl h-10 font-medium">
                  <PenLine className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </Button>
              )
            ) : (
              <Button
                onClick={() => navigate(`/chat-dm?start=${encodeURIComponent(user.email)}`)}
                className="bg-gold hover:bg-gold-dark text-black gap-1.5 rounded-xl h-10 font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Mensagem</span>
              </Button>
            )}
          </div>

        </div>

        {/* Conteúdo Detalhado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Coluna da Bio */}
          <div className="md:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/40 border border-border rounded-2xl p-5 backdrop-blur-sm"
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Biografia
              </h3>
              {editing && !readOnly ? (
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Conte um pouco sobre você..."
                  className="bg-background border-border min-h-[100px] focus-visible:ring-gold/50 resize-none"
                />
              ) : (
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {user.bio ? <Translated>{user.bio}</Translated> : <span className="italic text-muted-foreground">Nenhuma biografia informada.</span>}
                </p>
              )}
            </motion.div>
          </div>
        </div>

      </div>
    </div>
    </ProfileTranslationProvider>
  );
}
