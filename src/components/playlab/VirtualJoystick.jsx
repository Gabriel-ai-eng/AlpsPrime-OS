import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Floating virtual joystick (mobile). Reports normalized (dx, dy) in [-1, 1].
 * Auto-hides when not touched.
 */
export default function VirtualJoystick({ onMove }) {
  const baseRef = useRef(null);
  const [active, setActive] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const radius = 40;

  const handleStart = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleMove = (e) => {
    if (!active || !baseRef.current) return;
    e.preventDefault();
    const t = e.touches?.[0] || e;
    const rect = baseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = t.clientX - cx;
    let dy = t.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }
    setKnob({ x: dx, y: dy });
    onMove?.({ dx: dx / radius, dy: dy / radius });
  };

  const handleEnd = () => {
    setActive(false);
    setKnob({ x: 0, y: 0 });
    onMove?.({ dx: 0, dy: 0 });
  };

  useEffect(() => {
    if (!active) return;
    const move = (e) => handleMove(e);
    const end = () => handleEnd();
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    return () => {
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div
      ref={baseRef}
      onTouchStart={handleStart}
      onMouseDown={handleStart}
      className={cn(
        'fixed bottom-8 left-8 w-28 h-28 rounded-full border-2 border-gold/40 bg-background/30 backdrop-blur-sm select-none touch-none transition-opacity z-50',
        active ? 'opacity-100' : 'opacity-50'
      )}
      style={{ touchAction: 'none' }}
    >
      <div
        className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-gold/80 border-2 border-gold shadow-lg pointer-events-none"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}