import type { EffectDefinition } from './types';

export const wind: EffectDefinition = {
  spawnRate: 2.0,
  additive: false,

  newParticle(_w, h) {
    const r = Math.random;
    return {
      x: -10, y: h * (0.2 + r() * 0.6),
      vx: 3 + r() * 4, vy: (r() - 0.5) * 0.4,
      life: 0, max: 60 + r() * 30, size: 0.6 + r() * 0.8,
      len: 20 + r() * 40,
    };
  },

  drawParticle(ctx, p, t, w) {
    if (p.x > w + 40) return false;

    const a = (1 - Math.abs(t * 2 - 1)) * 0.5;
    ctx.strokeStyle = `rgba(207,227,234,${a})`;
    ctx.lineWidth = p.size;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - (p.len ?? 30), p.y - p.vy * 2);
    ctx.stroke();
  },
};
