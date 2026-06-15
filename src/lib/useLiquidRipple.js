import { useCallback, useRef } from 'react';

/**
 * useLiquidRipple — attaches a premium liquid ripple effect to any DOM element.
 *
 * Usage:
 *   const { ref, onPointerDown } = useLiquidRipple();
 *   <button ref={ref} onPointerDown={onPointerDown} ...>
 *
 * Options:
 *   color   — rgba string for the ripple (default: translucent white)
 *   scale   — final scale of ripple circle (default: 3.5)
 *   duration — ms (default: 550)
 */
export function useLiquidRipple({
  color = 'rgba(255,255,255,0.12)',
  scale = 3.5,
  duration = 550,
} = {}) {
  const ref = useRef(null);

  const onPointerDown = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 1.2;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        left: ${x - size / 2}px;
        top:  ${y - size / 2}px;
        width:  ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        transform: scale(0);
        pointer-events: none;
        animation: liquidRipple ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        z-index: 0;
      `;

      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), duration + 60);
    },
    [color, scale, duration]
  );

  return { ref, onPointerDown };
}

// Inject the keyframe once
if (typeof document !== 'undefined') {
  const styleId = '__liquid-ripple-style';
  if (!document.getElementById(styleId)) {
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = `
      @keyframes liquidRipple {
        0%   { transform: scale(0);   opacity: 1; }
        60%  { transform: scale(3.5); opacity: 0.4; }
        100% { transform: scale(3.5); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }
}