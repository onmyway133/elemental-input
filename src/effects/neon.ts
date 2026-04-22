import type { EffectDefinition } from './types';

export const neon: EffectDefinition = {
  spawnRate: 1.0,
  additive: true,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * r(), y: h * (0.1 + r() * 0.8),
      vx: (r() - 0.5) * 0.15, vy: (r() - 0.5) * 0.15,
      life: 0, max: 30 + r() * 20, size: 1 + r() * 2,
    };
  },

  drawParticle(ctx, p, t) {
    const a   = (1 - Math.abs(t * 2 - 1)) * 0.85;
    const hue = 260 + (p.x / (ctx.canvas.width || 1)) * 120; // purple → cyan

    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
    g.addColorStop(0, `hsla(${hue},100%,75%,${a})`);
    g.addColorStop(1, `hsla(${hue},100%,60%,0)`);

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
    ctx.fill();
  },
};
