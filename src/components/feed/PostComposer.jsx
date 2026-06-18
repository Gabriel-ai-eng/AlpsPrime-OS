import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Video, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

export default function PostComposer({ user, onPublish, autoFocus, glassEnabled }) {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFileChange = (e, forcedType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 50MB.');
      return;
    }
    setMediaFile(file);
    const localUrl = URL.createObjectURL(file);
    setMediaUrl(localUrl);
    setMediaType(forcedType || (file.type.startsWith('video/') ? 'video' : 'image'));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaUrl('');
    setMediaType('');
  };

  const handleSend = async () => {
    if (!content.trim() && !mediaFile) return;
    setIsPublishing(true);

    try {
      let finalMediaUrl = '';
      if (mediaFile instanceof File) {
        const res = await base44.storage.upload(mediaFile);
        finalMediaUrl = res.url;
      }

      const success = await onPublish({
        content: content.trim(),
        media_url: finalMediaUrl,
        media_type: mediaType,
      });

      if (success) {
        setContent('');
        clearMedia();
      }
    } catch (e) {
      toast.error('Erro ao publicar. Tente novamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full rounded-[30px] p-5 relative",
        glassEnabled
          ? "glass-card-pro bg-background"
          : "bg-card border border-border shadow-sm"
      )}
    >
      <div className="relative flex gap-4">
        <img
          src={user?.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover border border-border bg-background shrink-0"
        />
        <div className="flex-1 min-w-0">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Compartilhe algo com a Sexta..."
            className={cn(
              "w-full bg-transparent border-none resize-none focus:ring-0 p-0 pt-3 min-h-[44px] text-[15px] placeholder:text-muted-foreground outline-none",
              glassEnabled ? "text-foreground" : "text-foreground"
            )}
            rows={Math.max(1, Math.min(12, content.split('\n').length))}
          />

          {mediaUrl && (
            <div className="relative mt-3 rounded-2xl overflow-hidden bg-background border border-border max-w-sm">
              <button
                onClick={clearMedia}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              {mediaType === 'video' ? (
                <video src={mediaUrl} controls className="w-full max-h-[300px] object-cover" />
              ) : (
                <img src={mediaUrl} alt="Upload" className="w-full max-h-[300px] object-cover" />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        {/* Input Oculto e Botão de Imagem */}
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'image')}
        />
        <button
          onClick={() => document.getElementById('image-upload').click()}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0",
            "bg-[#c8a96b] hover:bg-[#b59556] text-white"
          )}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Input Oculto e Botão de Vídeo */}
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'video')}
        />
        <button
          onClick={() => document.getElementById('video-upload').click()}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0",
            "bg-[#c8a96b] hover:bg-[#b59556] text-white"
          )}
        >
          <Video className="w-5 h-5" />
        </button>

        {/* Botão de Publicar */}
        <Button
          onClick={handleSend}
          disabled={(!content.trim() && !mediaFile) || isPublishing}
          className={cn(
            "flex-1 h-12 rounded-[24px] font-medium transition-all text-[15px]",
            content.trim() || mediaFile
              ? "bg-[#c8a96b] hover:bg-[#b59556] text-white shadow-md"
              : "bg-[#eadecc] text-[#a8a29e] cursor-not-allowed"
          )}
        >
          {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar'}
        </Button>
      </div>
    </div>
  );
}
