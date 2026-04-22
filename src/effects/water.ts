import type { EffectDefinition } from './types';

export const water: EffectDefinition = {
  spawnRate: 1.5,
  additive: false,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * r(), y: h * 0.3 + r() * h * 0.2,
      vx: (r() - 0.5) * 0.5, vy: 0.6 + r() * 1.0,
      life: 0, max: 50 + r() * 20, size: 1.2 + r() * 1.6,
    };
  },

  drawParticle(ctx, p, t, _w, h) {
    p.vy += 0.04;
    const a = (1 - t) * 0.8;

    ctx.fillStyle = `rgba(140,200,255,${a})`;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.size * 0.6, p.size * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    if (p.y > h - 2) {
      // splash arc then remove
      ctx.strokeStyle = `rgba(140,200,255,${a * 0.6})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(p.x, h - 2, p.size * 2, 0, Math.PI, true);
      ctx.stroke();
      return false;
    }
  },
};
