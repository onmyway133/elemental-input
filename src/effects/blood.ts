import type { EffectDefinition } from './types';

export const blood: EffectDefinition = {
  spawnRate: 1.8,
  additive: false,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * (0.2 + r() * 0.6), y: h * 0.7,
      vx: (r() - 0.5) * 0.5, vy: 0.8 + r() * 1.4,
      life: 0, max: 40 + r() * 20, size: 1.5 + r() * 2.5,
    };
  },

  drawParticle(ctx, p, t, _w, h) {
    p.vy += 0.06;

    if (p.y > h) return false;

    const a = (1 - t) * 0.9;
    ctx.fillStyle = `rgba(180,20,20,${a})`;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
  },
};
