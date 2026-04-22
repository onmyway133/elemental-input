import type { EffectDefinition } from './types';

export const fire: EffectDefinition = {
  spawnRate: 3.0,
  additive: true,

  newParticle(w, h) {
    const r = Math.random;
    return {
      x: w * (0.15 + r() * 0.7), y: h * 0.78,
      vx: (r() - 0.5) * 0.4,    vy: -0.8 - r() * 1.2,
      life: 0, max: 40 + r() * 30, size: 6 + r() * 10,
    };
  },

  drawParticle(ctx, p, t) {
    p.vy -= 0.02;
    p.vx += (Math.random() - 0.5) * 0.06;

    const hue = 30 - t * 20;
    const a   = (1 - t) * 0.7;
    const s   = p.size * (1 - t * 0.6);

    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
    g.addColorStop(0,   `hsla(${hue},100%,70%,${a})`);
    g.addColorStop(0.5, `hsla(${hue - 10},100%,50%,${a * 0.5})`);
    g.addColorStop(1,   `hsla(${hue - 20},100%,40%,0)`);

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
    ctx.fill();
  },
};
