import type { EffectDefinition } from './types';

export const smoke: EffectDefinition = {
  spawnRate: 1.6,
  additive: false,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * (0.15 + r() * 0.7), y: h * 0.5,
      vx: (r() - 0.5) * 0.3,    vy: -0.4 - r() * 0.6,
      life: 0, max: 80 + r() * 60, size: 10 + r() * 14,
    };
  },

  drawParticle(ctx, p, t) {
    p.vx += (Math.random() - 0.5) * 0.04;
    p.vy -= 0.002;

    const a = (t < 0.2 ? t / 0.2 : 1 - t) * 0.25;
    const s = p.size * (1 + t * 1.2);

    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
    g.addColorStop(0, `rgba(200,200,200,${a})`);
    g.addColorStop(1, 'rgba(200,200,200,0)');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
    ctx.fill();
  },
};
