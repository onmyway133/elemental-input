import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import './EffectTextField.css';
import type { EffectType, Particle } from './effects/types';
import { getEffect, DEFAULT_WORD_MAP } from './effects/registry';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EffectTextFieldProps {
  /** Map of trigger word → effect name. Merged on top of the built-in defaults. */
  wordEffects?: Record<string, EffectType>;
  /** When true (default), the 13 built-in magic words are auto-mapped. */
  enableDefaultEffects?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Radius (px) of the mouse force field. Default 310. */
  forceFieldRadius?: number;
  /** Push strength of the force field. Default 90. */
  forceFieldStrength?: number;
  /** Particle spawn density multiplier. Default 0.3. */
  particleDensity?: number;
  /** Blur words inside the force field. Default true. */
  enableJitter?: boolean;
}

// ─── Internal emitter state ───────────────────────────────────────────────────

interface Emitter {
  el: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  fx: string;
  particles: Particle[];
  w: number;
  h: number;
  rect: DOMRect;
}

// ─── Text parser ──────────────────────────────────────────────────────────────

interface Segment {
  text: string;
  fx: string | null;
  key: string;
}

function parseSegments(text: string, wordMap: Record<string, string>): Segment[] {
  const words = Object.keys(wordMap);
  if (!words.length) return [{ text, fx: null, key: '0' }];

  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

  const out: Segment[] = [];
  let lastIdx = 0;
  let k = 0;

  text.replace(re, (m, _g, idx) => {
    if (idx > lastIdx) out.push({ text: text.slice(lastIdx, idx), fx: null, key: String(k++) });
    out.push({ text: m, fx: wordMap[m.toLowerCase()], key: String(k++) });
    lastIdx = idx + m.length;
    return m;
  });

  if (lastIdx < text.length) out.push({ text: text.slice(lastIdx), fx: null, key: String(k++) });
  return out;
}

// ─── Particle helpers ─────────────────────────────────────────────────────────

function spawnParticles(emitter: Emitter, dt: number, density: number) {
  const def = getEffect(emitter.fx);
  if (!def) return;
  const spawn = def.spawnRate * density * dt * 60;
  for (let i = 0; i < spawn; i++) {
    if (Math.random() > spawn - Math.floor(spawn) && i === Math.floor(spawn)) break;
    emitter.particles.push(def.newParticle(emitter.w, emitter.h));
  }
}

function renderParticles(emitter: Emitter, dt: number) {
  const def = getEffect(emitter.fx);
  if (!def) return;

  const { ctx, particles, w, h } = emitter;
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = def.additive ? 'lighter' : 'source-over';

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life += dt * 60;
    if (p.life >= p.max) { particles.splice(i, 1); continue; }

    p.x += p.vx;
    p.y += p.vy;

    const t = p.life / p.max;
    const keep = def.drawParticle(ctx, p, t, w, h);
    if (keep === false) particles.splice(i, 1);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EffectTextField({
  wordEffects,
  enableDefaultEffects = true,
  value,
  defaultValue = '',
  onChange,
  placeholder,
  className,
  style,
  forceFieldRadius   = 310,
  forceFieldStrength = 90,
  particleDensity    = 0.3,
  enableJitter       = true,
}: EffectTextFieldProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const text = isControlled ? (value as string) : internalValue;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef   = useRef<HTMLDivElement>(null);
  const emittersRef = useRef<Emitter[]>([]);
  const rafRef      = useRef<number>(0);
  const lastTRef    = useRef(performance.now());
  const mouseRef    = useRef({ x: -9999, y: -9999, down: false, shift: false, active: false });
  const lastMoveRef = useRef(0);

  // Merge word map
  const wordMap = useMemo<Record<string, string>>(
    () => ({
      ...(enableDefaultEffects ? DEFAULT_WORD_MAP : {}),
      ...(wordEffects ?? {}),
    }),
    [enableDefaultEffects, wordEffects],
  );

  const segments = useMemo(() => parseSegments(text, wordMap), [text, wordMap]);

  // ── Input handler ──────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      if (!isControlled) setInternalValue(v);
      onChange?.(v);
    },
    [isControlled, onChange],
  );

  // ── Sync scroll (textarea drives, mirror follows) ─────────────────────────

  const syncScroll = useCallback(() => {
    if (textareaRef.current && mirrorRef.current) {
      mirrorRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // ── Attach canvas emitters after every render ─────────────────────────────

  useEffect(() => {
    if (!mirrorRef.current) return;
    const list: Emitter[] = [];

    mirrorRef.current.querySelectorAll<HTMLElement>('.etf-word').forEach((el) => {
      const canvas = el.querySelector('canvas');
      const layer  = el.querySelector<HTMLElement>('.etf-layer');
      if (!canvas || !layer) return;

      const fx   = el.dataset.fx!;
      const rect = layer.getBoundingClientRect();
      const dpr  = Math.min(2, window.devicePixelRatio || 1);
      canvas.width  = Math.max(20, rect.width * dpr);
      canvas.height = Math.max(20, rect.height * dpr);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      list.push({ el, canvas, ctx, fx, particles: [], w: rect.width, h: rect.height, rect });
    });

    emittersRef.current = list;
  }, [segments]);

  // ── Resize: refresh canvas dimensions ────────────────────────────────────

  useEffect(() => {
    const refresh = () => {
      for (const e of emittersRef.current) {
        const layer = e.el.querySelector<HTMLElement>('.etf-layer');
        if (!layer) continue;
        const rect = layer.getBoundingClientRect();
        const dpr  = Math.min(2, window.devicePixelRatio || 1);
        if (Math.abs(rect.width - e.w) > 0.5 || Math.abs(rect.height - e.h) > 0.5) {
          e.canvas.width  = Math.max(20, rect.width * dpr);
          e.canvas.height = Math.max(20, rect.height * dpr);
          e.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          e.w = rect.width;
          e.h = rect.height;
        }
        e.rect = rect;
      }
    };
    window.addEventListener('resize', refresh);
    return () => window.removeEventListener('resize', refresh);
  }, []);

  // ── Mouse events ──────────────────────────────────────────────────────────

  useEffect(() => {
    const onMove = (ev: MouseEvent) => {
      mouseRef.current.x = ev.clientX;
      mouseRef.current.y = ev.clientY;
      mouseRef.current.active = true;
      lastMoveRef.current = performance.now();
    };
    const onDown = () => { mouseRef.current.down = true; };
    const onUp   = () => { mouseRef.current.down = false; };
    const onKey  = (e: KeyboardEvent) => { mouseRef.current.shift = e.shiftKey; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('keydown',   onKey);
    window.addEventListener('keyup',     onKey);

    const idle = setInterval(() => {
      if (performance.now() - lastMoveRef.current > 1500) {
        mouseRef.current.active = false;
      }
    }, 300);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('keydown',   onKey);
      window.removeEventListener('keyup',     onKey);
      clearInterval(idle);
    };
  }, []);

  // ── RAF animation loop ────────────────────────────────────────────────────

  useEffect(() => {
    const applyForceField = () => {
      const { x: mx, y: my, shift, down, active } = mouseRef.current;
      const r   = forceFieldRadius   * (shift ? 1.8 : 1) * (down ? 1.3 : 1);
      const str = forceFieldStrength * (shift ? 1.8 : 1) * (down ? 1.4 : 1);

      for (const e of emittersRef.current) {
        const b  = e.el.getBoundingClientRect();
        const cx = b.left + b.width  / 2;
        const cy = b.top  + b.height / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.hypot(dx, dy);

        if (dist < r && active) {
          const falloff = 1 - dist / r;
          const f       = falloff * falloff;
          const ang     = Math.atan2(dy, dx);
          const tx      = Math.cos(ang) * str * f;
          const ty      = Math.sin(ang) * str * f;
          const rot     = (dx > 0 ? 1 : -1) * falloff * 4;
          e.el.style.transform = `translate(${tx}px,${ty}px) rotate(${rot}deg)`;
          if (enableJitter) e.el.style.filter = `blur(${falloff * 0.3}px)`;
        } else {
          e.el.style.transform = '';
          e.el.style.filter    = '';
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTRef.current) / 1000);
      lastTRef.current = now;

      for (const e of emittersRef.current) {
        if (e.rect.bottom < 0 || e.rect.top > window.innerHeight) continue;
        spawnParticles(e, dt, particleDensity);
        renderParticles(e, dt);
      }

      applyForceField();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [forceFieldRadius, forceFieldStrength, particleDensity, enableJitter]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={`etf-root${className ? ` ${className}` : ''}`} style={style}>
      {/* Mirror: visual display — pointer-events disabled so typing goes to textarea */}
      <div className="etf-mirror" ref={mirrorRef} aria-hidden="true">
        {text
          ? segments.map((seg) =>
              seg.fx ? (
                <span key={seg.key} className="etf-word" data-fx={seg.fx}>
                  <span className="etf-layer">
                    <canvas />
                  </span>
                  <span className="etf-text">{seg.text}</span>
                </span>
              ) : (
                <span key={seg.key} className="etf-plain">{seg.text}</span>
              ),
            )
          : placeholder && <span className="etf-placeholder">{placeholder}</span>}
      </div>

      {/* Textarea: real input — transparent text, only caret is visible */}
      <textarea
        ref={textareaRef}
        className="etf-textarea"
        value={text}
        onChange={handleChange}
        onScroll={syncScroll}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}
