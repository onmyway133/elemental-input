import type { EffectDefinition } from './types';

export const electric: EffectDefinition = {
  spawnRate: 1.2,
  additive: true,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * (0.1 + r() * 0.8), y: h * (0.2 + r() * 0.6),
      vx: 0, vy: 0,
      life: 0, max: 5 + r() * 6, size: 1 + r() * 2,
      tx: w * r(), ty: h * (0.2 + r() * 0.6),
    };
  },

  drawParticle(ctx, p, t) {
    const a = (1 - t) * 0.9;
    ctx.strokeStyle = `rgba(180,220,255,${a})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);

    const steps = 6;
    for (let s = 1; s <= steps; s++) {
      const nx = p.x + ((p.tx ?? 0) - p.x) * (s / steps) + (Math.random() - 0.5) * 6;
      const ny = p.y + ((p.ty ?? 0) - p.y) * (s / steps) + (Math.random() - 0.5) * 6;
      ctx.lineTo(nx, ny);
    }

    ctx.stroke();
  },
};
