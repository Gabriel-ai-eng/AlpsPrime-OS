import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send } from 'lucide-react';

export default function PaperPlaneAnimation({ origin, onDone }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onDone?.();
    }, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  const toRight = origin?.x > window.innerWidth / 2;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed z-[400] pointer-events-none"
          style={{
            left: (origin?.x ?? window.innerWidth / 2) - 24,
            top: (origin?.y ?? window.innerHeight / 2) - 24,
          }}
          initial={{ opacity: 1, scale: 0.8, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0.8, 1.2, 0.6],
            x: toRight ? -120 : 120,
            y: -160,
            rotate: toRight ? -30 : 30,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Send className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}