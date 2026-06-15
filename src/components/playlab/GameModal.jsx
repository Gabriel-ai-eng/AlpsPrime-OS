import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import GameCanvas from './GameCanvas';
import VirtualJoystick from './VirtualJoystick';
import ActionButtons from './ActionButtons';

/**
 * Fullscreen modal that hosts the PlayLab game.
 * Wires up keyboard + virtual joystick + A/B buttons into a single inputRef
 * that the GameCanvas reads on every frame.
 */
export default function GameModal({ world, character, onClose }) {
  const inputRef = useRef({ dx: 0, dy: 0, jump: false, interact: false });
  const [sessionStart] = useState(() => Date.now());

  // Keyboard
  useEffect(() => {
    const keys = new Set();
    const updateFromKeys = () => {
      let dx = 0;
      let dy = 0;
      if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) dx -= 1;
      if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) dx += 1;
      if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) dy -= 1;
      if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) dy += 1;
      inputRef.current.dx = dx;
      inputRef.current.dy = dy;
    };
    const down = (e) => {
      keys.add(e.key);
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        inputRef.current.jump = true;
        e.preventDefault();
      }
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        inputRef.current.interact = true;
      }
      updateFromKeys();
    };
    const up = (e) => {
      keys.delete(e.key);
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        inputRef.current.jump = false;
      }
      updateFromKeys();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // On close, log session
  useEffect(() => {
    return () => {
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      if (duration > 2 && world?.id) {
        base44.entities.PlaylabSession.create({
          world_id: world.id,
          player_email: 'self',
          duration_seconds: duration,
        }).catch(() => {});
        base44.entities.PlaylabWorld.update(world.id, {
          plays_count: (world.plays_count || 0) + 1,
        }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInteract = (obj) => {
    const messages = {
      fridge: 'Você comeu algo. +5 energia',
      computer: 'Conectando ao feed da Sexta-feira...',
      bed: 'Zzz... bons sonhos.',
      tv: 'Pixels animados na TV.',
      mailbox: 'Caixa vazia por enquanto.',
      portal: 'O portal está adormecido.',
      bench: 'Você descansou um pouco.',
      tree: 'Folhas balançam ao vento.',
      mushroom: 'Cogumelo brilhante!',
      hologram: 'O holograma piscou em você.',
    };
    toast.success(messages[obj.type] || `${obj.label} ativado!`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black flex flex-col"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gold/20 bg-background/80 backdrop-blur-sm">
          <div className="text-xs font-mono text-gold uppercase tracking-widest">
            {world?.name}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-gold/30 bg-background/50 hover:bg-gold/10 flex items-center justify-center"
            aria-label="Sair do jogo"
          >
            <X className="w-4 h-4 text-gold" />
          </button>
        </div>

        {/* Game viewport */}
        <div className="flex-1 relative">
          <GameCanvas world={world} character={character} inputRef={inputRef} onInteract={handleInteract} />
        </div>

        <VirtualJoystick onMove={({ dx, dy }) => { inputRef.current.dx = dx; inputRef.current.dy = dy; }} />
        <ActionButtons
          onJump={() => { inputRef.current.jump = true; setTimeout(() => { inputRef.current.jump = false; }, 100); }}
          onInteract={() => { inputRef.current.interact = true; }}
        />
      </motion.div>
    </AnimatePresence>
  );
}