import React, { useRef, useEffect, useState } from 'react';
import { buildTilemap, getTemplate } from '@/lib/playlabTemplates';

/**
 * Lightweight 2D canvas game engine for PlayLab.
 * Renders a tile-based world with a controllable character (gravity + jump + collision).
 *
 * Props:
 *   - world: PlaylabWorld entity
 *   - character: PlaylabCharacter entity (colors + optional sprite_url)
 *   - input: { dx, dy, jump, interact } — refs/getters provided by parent
 *   - onInteract: (objectLabel) => void
 */
export default function GameCanvas({ world, character, inputRef, onInteract }) {
  const canvasRef = useRef(null);
  const [interactHint, setInteractHint] = useState(null);
  const tpl = getTemplate(world?.template);
  const { grid, cols, rows, tile } = buildTilemap(world?.template);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const W = cols * tile;
    const H = rows * tile;
    canvas.width = W;
    canvas.height = H;

    // Player physics
    const player = {
      x: 2 * tile,
      y: (rows - 3) * tile,
      w: 24,
      h: 28,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
    };

    // Optional sprite image
    let spriteImg = null;
    if (character?.sprite_url) {
      spriteImg = new Image();
      spriteImg.crossOrigin = 'anonymous';
      spriteImg.src = character.sprite_url;
    }

    const gravity = 0.6;
    const moveSpeed = 3;
    const jumpVel = -10;

    let raf;
    let lastInteractAt = 0;

    const isSolid = (cx, cy) => {
      if (cy < 0 || cy >= rows || cx < 0 || cx >= cols) return true;
      return grid[cy][cx] === 1;
    };

    const collide = (px, py, pw, ph) => {
      const left = Math.floor(px / tile);
      const right = Math.floor((px + pw - 1) / tile);
      const top = Math.floor(py / tile);
      const bottom = Math.floor((py + ph - 1) / tile);
      for (let cy = top; cy <= bottom; cy++) {
        for (let cx = left; cx <= right; cx++) {
          if (isSolid(cx, cy)) return true;
        }
      }
      return false;
    };

    const findNearbyObject = () => {
      const cx = (player.x + player.w / 2) / tile;
      const cy = (player.y + player.h / 2) / tile;
      for (const o of (world?.objects?.length ? world.objects : tpl.objects)) {
        if (Math.abs(o.x - cx) < 1.2 && Math.abs(o.y - cy) < 2) return o;
      }
      return null;
    };

    const drawCharacter = () => {
      const px = Math.floor(player.x);
      const py = Math.floor(player.y);

      if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
        ctx.drawImage(spriteImg, px - 4, py - 8, 32, 36);
        return;
      }
      // Procedural pixel character using character colors
      const c = character || {};
      const skin = c.skin_color || '#F5C7A1';
      const hair = c.hair_color || '#3B2A1E';
      const shirt = c.shirt_color || '#C9A24F';
      const pants = c.pants_color || '#2A2A3A';

      // Head
      ctx.fillStyle = skin;
      ctx.fillRect(px + 6, py, 12, 10);
      // Hair
      ctx.fillStyle = hair;
      ctx.fillRect(px + 6, py, 12, 3);
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(px + 9, py + 5, 2, 2);
      ctx.fillRect(px + 13, py + 5, 2, 2);
      // Shirt
      ctx.fillStyle = shirt;
      ctx.fillRect(px + 4, py + 10, 16, 10);
      // Pants
      ctx.fillStyle = pants;
      ctx.fillRect(px + 4, py + 20, 7, 8);
      ctx.fillRect(px + 13, py + 20, 7, 8);

      // Accessory
      if (c.accessory === 'hat') {
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(px + 4, py - 3, 16, 4);
      } else if (c.accessory === 'glasses') {
        ctx.fillStyle = '#000';
        ctx.fillRect(px + 8, py + 4, 4, 3);
        ctx.fillRect(px + 12, py + 4, 4, 3);
      } else if (c.accessory === 'cape') {
        ctx.fillStyle = '#6a0dad';
        ctx.fillRect(px + 2, py + 10, 2, 16);
        ctx.fillRect(px + 20, py + 10, 2, 16);
      } else if (c.accessory === 'backpack') {
        ctx.fillStyle = '#444';
        ctx.fillRect(px + 1, py + 12, 4, 10);
      }
    };

    const drawObject = (o) => {
      const ox = o.x * tile;
      const oy = o.y * tile - 4;
      const map = {
        fridge: { c: '#dde2eb', emoji: '🧊' },
        computer: { c: '#3a3a55', emoji: '💻' },
        bed: { c: '#a85a85', emoji: '🛏️' },
        tv: { c: '#1a1a2a', emoji: '📺' },
        mailbox: { c: '#2e7d32', emoji: '📮' },
        portal: { c: '#9b59b6', emoji: '🌀' },
        bench: { c: '#8b6f47', emoji: '🪑' },
        tree: { c: '#1f4528', emoji: '🌲' },
        mushroom: { c: '#d63031', emoji: '🍄' },
        hologram: { c: '#ff2bd6', emoji: '✨' },
      };
      const m = map[o.type] || { c: '#888', emoji: '📦' };
      ctx.fillStyle = m.c;
      ctx.fillRect(ox + 4, oy + 4, 24, 28);
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.emoji, ox + 16, oy + 26);
    };

    const tick = () => {
      const input = inputRef.current || { dx: 0, dy: 0, jump: false, interact: false };

      // Horizontal
      player.vx = input.dx * moveSpeed;
      if (input.dx !== 0) player.facing = input.dx > 0 ? 1 : -1;

      // Jump
      if ((input.jump || input.dy < -0.5) && player.onGround) {
        player.vy = jumpVel;
        player.onGround = false;
      }

      // Apply X
      const nx = player.x + player.vx;
      if (!collide(nx, player.y, player.w, player.h)) player.x = nx;

      // Gravity
      player.vy += gravity;
      if (player.vy > 12) player.vy = 12;
      const ny = player.y + player.vy;
      if (!collide(player.x, ny, player.w, player.h)) {
        player.y = ny;
        player.onGround = false;
      } else {
        if (player.vy > 0) player.onGround = true;
        player.vy = 0;
      }

      // Bounds
      if (player.x < 0) player.x = 0;
      if (player.x > W - player.w) player.x = W - player.w;
      if (player.y > H) {
        player.x = 2 * tile;
        player.y = (rows - 3) * tile;
      }

      // Interact
      const nearby = findNearbyObject();
      setInteractHint(nearby ? nearby.label : null);
      if (input.interact && nearby && Date.now() - lastInteractAt > 400) {
        lastInteractAt = Date.now();
        onInteract?.(nearby);
        if (inputRef.current) inputRef.current.interact = false;
      }

      // ---- Render ----
      ctx.fillStyle = tpl.palette.bg;
      ctx.fillRect(0, 0, W, H);

      // Tiles
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const t = grid[y][x];
          if (t === 1) {
            ctx.fillStyle = y === rows - 1 ? tpl.palette.floor : tpl.palette.wall;
            ctx.fillRect(x * tile, y * tile, tile, tile);
            // pixel highlight
            ctx.fillStyle = tpl.palette.accent;
            ctx.fillRect(x * tile, y * tile, tile, 2);
          }
        }
      }

      // Objects
      for (const o of (world?.objects?.length ? world.objects : tpl.objects)) {
        drawObject(o);
      }

      drawCharacter();

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world?.id, world?.template, character?.sprite_url, character?.skin_color, character?.hair_color, character?.shirt_color, character?.pants_color, character?.accessory]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{
          imageRendering: 'pixelated',
          width: 'min(100vw, 100vh * 2)',
          height: 'auto',
        }}
      />
      {interactHint && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-background/80 border border-gold/40 text-xs text-gold font-mono pointer-events-none">
          B • {interactHint}
        </div>
      )}
    </div>
  );
}