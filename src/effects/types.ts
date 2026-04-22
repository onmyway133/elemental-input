export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  len?: number;  // wind: streak length
  tx?: number;   // electric: arc target x
  ty?: number;   // electric: arc target y
}

export interface EffectDefinition {
  /** Particles per second at density = 1. */
  spawnRate: number;
  /** Use additive ('lighter') blend mode on canvas. */
  additive: boolean;
  /** Create a new particle for this effect. */
  newParticle(w: number, h: number): Particle;
  /**
   * Draw one particle tick. May mutate p.vx / p.vy for physics.
   * Return `false` to remove the particle before its life expires.
   */
  drawParticle(
    ctx: CanvasRenderingContext2D,
    p: Particle,
    t: number,  // normalised life 0..1
    w: number,
    h: number,
  ): boolean | void;
}

export type BuiltinEffect =
  | 'fire' | 'smoke' | 'metal' | 'wind' | 'water' | 'ice'
  | 'shadow' | 'gold' | 'electric' | 'neon' | 'blood' | 'void' | 'aurora';

/** Union of built-in names + any custom string, with autocomplete for built-ins. */
export type EffectType = BuiltinEffect | (string & {});
