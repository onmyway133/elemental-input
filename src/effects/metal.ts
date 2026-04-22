import type { EffectDefinition } from './types';

export const metal: EffectDefinition = {
  spawnRate: 0.4,
  additive: true,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * r(), y: h * (0.2 + r() * 0.6),
      vx: 0, vy: 0,
      life: 0, max: 20 + r() * 15, size: 1 + r() * 2,
    };
  },

  drawParticle(ctx, p, t) {
    const a = (1 - Math.abs(t * 2 - 1)) * 0.9;

    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    // cross glint
    ctx.strokeStyle = `rgba(255,255,255,${a * 0.6})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(p.x - p.size * 3, p.y); ctx.lineTo(p.x + p.size * 3, p.y);
    ctx.moveTo(p.x, p.y - p.size * 3); ctx.lineTo(p.x, p.y + p.size * 3);
    ctx.stroke();
  },
};
