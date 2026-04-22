import type { EffectDefinition } from './types';

export const ice: EffectDefinition = {
  spawnRate: 0.6,
  additive: true,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * r(), y: h * (0.3 + r() * 0.5),
      vx: (r() - 0.5) * 0.2, vy: -0.1 + r() * 0.2,
      life: 0, max: 40 + r() * 30, size: 1.5 + r() * 2,
    };
  },

  drawParticle(ctx, p, t) {
    const a = (1 - Math.abs(t * 2 - 1)) * 0.9;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.life * 0.02);
    ctx.strokeStyle = `rgba(220,240,255,${a})`;
    ctx.lineWidth = 0.7;

    for (let k = 0; k < 3; k++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(-p.size * 2, 0);
      ctx.lineTo(p.size * 2, 0);
      ctx.stroke();
    }

    ctx.restore();
  },
};
