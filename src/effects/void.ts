import type { EffectDefinition } from './types';

export const voidFx: EffectDefinition = {
  spawnRate: 0.5,
  additive: false,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * r(), y: h * r(),
      vx: 0, vy: 0,
      life: 0, max: 50 + r() * 40, size: 2 + r() * 4,
    };
  },

  drawParticle(ctx, p, t) {
    p.vx += (Math.random() - 0.5) * 0.02;
    p.vy += (Math.random() - 0.5) * 0.02;

    const a = (1 - Math.abs(t * 2 - 1)) * 0.5;
    const s = p.size * (1 - t * 0.3);

    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 3);
    g.addColorStop(0,   `rgba(60,0,90,${a})`);
    g.addColorStop(0.5, `rgba(20,0,40,${a * 0.6})`);
    g.addColorStop(1,   'rgba(0,0,0,0)');

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, s * 3, 0, Math.PI * 2);
    ctx.fill();
  },
};
