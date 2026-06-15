import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { AnimatePresence, motion } from 'framer-motion';

const LOTTIE_URL = 'https://media.base44.com/files/public/69e44004c1822ff0840cc105/b6a72ca11_paperplane.json';

export default function PaperPlaneAnimation({ origin, onDone }) {
  const [show, setShow] = useState(true);
  const [animData, setAnimData] = useState(null);

  useEffect(() => {
    fetch(LOTTIE_URL)
      .then((r) => r.json())
      .then(setAnimData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onDone?.();
    }, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!animData) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed z-[400] pointer-events-none"
          style={{
            left: origin.x - 70,
            top: origin.y - 70,
            width: 140,
            height: 140,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, y: -100, x: origin.x > window.innerWidth / 2 ? -80 : 80 }}
          exit={{ opacity: 0, scale: 0.4 }}
          transition={{ duration: 1.8, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <Lottie
            animationData={animData}
            loop={false}
            autoplay
            style={{ width: 140, height: 140 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}