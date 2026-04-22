import type { EffectDefinition } from './types';

export const shadow: EffectDefinition = {
  spawnRate: 0.6,
  additive: false,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * r(), y: h * (0.2 + r() * 0.6),
      vx: (r() - 0.5) * 0.3, vy: (r() - 0.5) * 0.3,
      life: 0, max: 70 + r() * 40, size: 8 + r() * 14,
    };
  },

  drawParticle(ctx, p, t) {
    p.vx += (Math.random() - 0.5) * 0.05;
    p.vy += (Math.random() - 0.5) * 0.05;

    const a = (t < 0.2 ? t / 0.2 : 1 - t) * 0.55;
    const s = p.size * (1 + t * 0.6);

    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
    ctx.fill();
  },
};
