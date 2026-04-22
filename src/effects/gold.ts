import type { EffectDefinition } from './types';

export const gold: EffectDefinition = {
  spawnRate: 0.8,
  additive: true,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * r(), y: h * r(),
      vx: (r() - 0.5) * 0.2, vy: (r() - 0.5) * 0.2,
      life: 0, max: 60 + r() * 40, size: 1.2 + r() * 1.8,
    };
  },

  drawParticle(ctx, p, t) {
    const a = (1 - Math.abs(t * 2 - 1)) * 0.9;
    ctx.fillStyle = `rgba(255,220,120,${a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  },
};
