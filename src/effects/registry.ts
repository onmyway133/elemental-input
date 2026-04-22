import type { EffectDefinition } from './types';
import { fire }     from './fire';
import { smoke }    from './smoke';
import { metal }    from './metal';
import { wind }     from './wind';
import { water }    from './water';
import { ice }      from './ice';
import { shadow }   from './shadow';
import { gold }     from './gold';
import { electric } from './electric';
import { neon }     from './neon';
import { blood }    from './blood';
import { voidFx }   from './void';
import { aurora }   from './aurora';

const REGISTRY: Record<string, EffectDefinition> = {
  fire, smoke, metal, wind, water, ice,
  shadow, gold, electric, neon, blood,
  void: voidFx,
  aurora,
};

export function getEffect(name: string): EffectDefinition | undefined {
  return REGISTRY[name];
}

/** Register a custom effect at runtime. */
export function registerEffect(name: string, def: EffectDefinition): void {
  REGISTRY[name] = def;
}

export const DEFAULT_WORD_MAP: Record<string, string> = {
  fire: 'fire', smoke: 'smoke', metal: 'metal', wind: 'wind',
  water: 'water', ice: 'ice', shadow: 'shadow', gold: 'gold',
  electric: 'electric', neon: 'neon', blood: 'blood', void: 'void', aurora: 'aurora',
};
