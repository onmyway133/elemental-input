import type { EffectDefinition } from './types';

export const aurora: EffectDefinition = {
  spawnRate: 1.0,
  additive: true,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * r(), y: h * (0.1 + r() * 0.5),
      vx: (r() - 0.5) * 0.4, vy: (r() - 0.5) * 0.2,
      life: 0, max: 80 + r() * 60, size: 4 + r() * 8,
    };
  },

  drawParticle(ctx, p, t) {
    p.vx += (Math.random() - 0.5) * 0.03;

    const a   = (t < 0.3 ? t / 0.3 : 1 - t) * 0.4;
    const s   = p.size * (1 + t * 0.5);
    const hue = 120 + (p.x / (ctx.canvas.width || 1)) * 140;

    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
    g.addColorStop(0, `hsla(${hue},80%,65%,${a})`);
    g.addColorStop(1, `hsla(${hue + 30},80%,55%,0)`);

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
    ctx.fill();
  },
};
