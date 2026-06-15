import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera as CamIcon, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Opens the front camera, lets the user snap one frame, uploads it and returns
 * the file_url via onCapture. Closes itself on cancel.
 */
export default function IACameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        toast.error('Não consegui acessar a câmera.');
        onClose();
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snap = async () => {
    if (!videoRef.current || busy) return;
    setBusy(true);
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onCapture?.(file_url);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[260] bg-black flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-background/10 backdrop-blur-sm">
          <span className="text-white text-sm">Mostre como você está</span>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <video ref={videoRef} playsInline muted className="max-w-full max-h-full object-contain transform -scale-x-100" />
        </div>
        <div className="p-6 flex justify-center bg-background/10 backdrop-blur-sm">
          <button
            onClick={snap}
            disabled={busy}
            className="w-16 h-16 rounded-full bg-gold hover:bg-gold-dark text-background flex items-center justify-center shadow-2xl shadow-gold/40 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <CamIcon className="w-6 h-6" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}