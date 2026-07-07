"use client";

import { useEffect, useRef } from "react";

import styles from "./AnimatedCampfire.module.css";

// FIRE PARTICLE: лимиты количества частиц. Увеличивай осторожно: больше частиц = плотнее огонь, но выше нагрузка.
const maxFlames = 120;
const maxSparks = 60;
const maxSmoke = 40;

// FIRE TUNING: вертикальная точка основания внутри canvas. Больше = пламя выше, меньше = ниже.
const fireBaseOffset = 84;

type Bounds = {
  width: number;
  height: number;
};

type RenderContext = {
  ctx: CanvasRenderingContext2D;
  bounds: Bounds;
  getWind: () => number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function fadeCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  // FIRE PERFORMANCE: прозрачность шлейфа. Меньше alpha = длиннее следы, больше = быстрее очищается canvas.
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// FIRE PARTICLE: основная частица пламени. Здесь настраиваются высота, ширина, скорость и цвет языков огня.
class FlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  life = 1;
  decay: number;

  constructor({ width, height }: Bounds) {
    // FIRE TUNING: точка рождения пламени и разброс по X. Больше разброс = шире основание огня.
    this.x = width / 2 + (Math.random() - 0.5) * 45;
    this.y = height - fireBaseOffset;
    // FIRE TUNING: vx = движение вбок, vy = подъём вверх. Более отрицательный vy делает пламя выше/быстрее.
    this.vx = (Math.random() - 0.5) * 2.6;
    this.vy = -(Math.random() * 2 + 3);
    // FIRE TUNING: baseRadius задаёт размер языков пламени, decay — скорость их исчезновения.
    this.baseRadius = Math.random() * 8 + 8;
    this.radius = this.baseRadius;
    this.decay = Math.random() * 0.005 + 0.011;
  }

  update(wind: number) {
    this.x += this.vx + wind * (1 - this.life) * 2.2;
    this.y += this.vy;
    this.life -= this.decay;
    this.radius = this.baseRadius * (this.life * this.life);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.radius <= 0.5) {
      return;
    }

    const green = Math.floor(220 * Math.pow(this.life, 1.3));
    const blue = Math.floor(60 * Math.pow(this.life, 2.5));
    // FIRE TUNING: width/height задают вытянутость языков пламени.
    const width = this.radius * (1.2 + this.life * 0.28);
    const height = this.radius * (2.1 + this.life * 2.2);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.translate(this.x, this.y);
    ctx.rotate(this.vx * 0.06);
    ctx.scale(width, height);
    // FIRE COLOR: внешний цвет пламени. green/blue уменьшаются по мере угасания частицы.
    ctx.fillStyle = `rgba(255, ${green}, ${blue}, ${this.life * 0.68})`;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();

    // FIRE COLOR: внутреннее жёлтое ядро пламени. Больше alpha = ярче центр.
    ctx.fillStyle = `rgba(255, 235, 112, ${this.life * 0.55})`;
    ctx.beginPath();
    ctx.ellipse(0, -0.18, 0.34, 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// FIRE PARTICLE: регулярные искры от основания костра.
class SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha = 1;
  decay: number;
  wobble: number;
  green: number;

  constructor({ width, height }: Bounds) {
    // FIRE TUNING: точка рождения и разброс искр.
    this.x = width / 2 + (Math.random() - 0.5) * 20;
    this.y = height - fireBaseOffset - 22;
    // FIRE TUNING: vx/vy управляют разлётом и скоростью подъёма искр.
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -(Math.random() * 2 + 1);
    // FIRE TUNING: radius = размер искры, decay = как быстро она гаснет.
    this.radius = Math.random() * 2.5 + 0.5;
    this.decay = Math.random() * 0.001 + 0.003;
    this.wobble = Math.random() * 0.1;
    this.green = Math.floor(140 + Math.random() * 60);
  }

  update(wind: number) {
    // FIRE CURSOR: wind усиливает боковой снос искр при движении курсора.
    this.vx = clamp(this.vx + wind * 0.09, -8, 8);
    this.x += this.vx + Math.sin(this.y * 0.05) * this.wobble;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    // FIRE COLOR: цвет обычных искр.
    ctx.fillStyle = `rgba(255, ${this.green}, 50, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// FIRE PARTICLE: мелкие искры, которые появляются у верхушек угасающего пламени.
class FlameTipSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha = 1;
  decay: number;
  green: number;

  constructor(x: number, y: number, vx: number) {
    this.x = x;
    this.y = y;
    // FIRE TUNING: скорость, размер и затухание верхушечных искр.
    this.vx = vx + (Math.random() - 0.3) * 2;
    this.vy = -(Math.random() * 2 + 1);
    this.radius = Math.random() * 0.4 + 0.3;
    this.decay = Math.random() * 0.01 + 0.1;
    this.green = Math.floor(120 + Math.random() * 20);
  }

  update(wind: number) {
    // FIRE CURSOR: верхушечные искры сильнее реагируют на wind, чем дым.
    this.vx = clamp(this.vx + wind * 0.01, -8, 4);
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) {
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255, ${this.green}, 40, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// FIRE PARTICLE: дым от угасающих языков пламени.
class SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life = 1;
  decay: number;

  constructor(x: number, y: number, vx: number) {
    this.x = x;
    this.y = y;
    // FIRE TUNING: vx/vy задают дрейф и подъём дыма.
    this.vx = vx * 0.6 + (Math.random() - 0.5);
    this.vy = -(Math.random() * 1 + 0.5);
    // FIRE TUNING: radius/decay управляют размером и длительностью жизни дыма.
    this.radius = Math.random() * 3 + 4;
    this.decay = Math.random() * 0.008 + 0.006;
  }

  update(wind: number) {
    // FIRE CURSOR: дым мягко сносится курсорным ветром.
    this.vx = clamp(this.vx + wind * 0.001, -5, 5);
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.radius += 0.24;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.life <= 0) {
      return;
    }

    const density = Math.floor(40 + this.life * 20);

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    // FIRE COLOR: цвет и прозрачность дыма.
    ctx.fillStyle = `rgba(${density}, ${density}, ${density + 5}, ${this.life * 0.1})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// FIRE LAYER: мягкое свечение у основания костра под частицами.
function drawFireBase({ ctx, bounds }: RenderContext) {
  const { width, height } = bounds;
  const y = height - fireBaseOffset + 2;
  const gradient = ctx.createRadialGradient(width / 2, y, 4, width / 2, y, 62);

  // FIRE COLOR: цвета базового свечения у земли.
  gradient.addColorStop(0, "rgba(255, 190, 60, 0.22)");
  gradient.addColorStop(0.38, "rgba(255, 86, 22, 0.11)");
  gradient.addColorStop(1, "rgba(255, 60, 0, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, y, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function AnimatedCampfire() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  // FIRE CANVAS: canvasRef — bitmap, куда каждый кадр рисуются пламя, искры и дым.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!root || !canvas || !ctx) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    if (reduceMotion.matches) {
      return;
    }

    const flames: FlameParticle[] = [];
    const sparks: Array<SparkParticle | FlameTipSpark> = [];
    const smoke: SmokeParticle[] = [];
    const bounds: Bounds = { width: 0, height: 0 };
    const wind = { current: 0, target: 0 };
    let animationFrameId = 0;
    let isVisible = true;

    const resize = () => {
      // FIRE CANVAS: dpr сохраняет резкость canvas на Retina/HiDPI экранах.
      const dpr = window.devicePixelRatio || 1;
      bounds.width = root.clientWidth;
      bounds.height = root.clientHeight;

      canvas.width = Math.floor(bounds.width * dpr);
      canvas.height = Math.floor(bounds.height * dpr);
      canvas.style.width = `${bounds.width}px`;
      canvas.style.height = `${bounds.height}px`;
      // FIRE WARNING: не менять без проверки. setTransform связывает CSS-размер canvas с bitmap-разрешением.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, bounds.width, bounds.height);
    };

    // FIRE CANVAS: ResizeObserver пересчитывает bitmap при изменении размера canvas-слоя.
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    resize();

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? true;
    });
    visibilityObserver.observe(root);

    const pointerScope = root.closest(".split-section") ?? root;

    // FIRE CURSOR: pointermove создаёт wind.target, который сносит пламя, искры и дым.
    const handlePointerMove = (event: Event) => {
      if (coarsePointer.matches) {
        return;
      }

      const pointerEvent = event as PointerEvent;
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      // FIRE CURSOR: 220 и clamp(-2.2, 2.2) задают силу реакции на курсор.
      wind.target = clamp((pointerEvent.clientX - centerX) / 110, -1.1, 1.1);
    };

    const settleWind = () => {
      wind.target = 0;
    };

    pointerScope.addEventListener("pointermove", handlePointerMove);
    pointerScope.addEventListener("pointerleave", settleWind);

    const renderContext: RenderContext = {
      ctx,
      bounds,
      getWind: () => wind.current
    };

    const animate = () => {
      fadeCanvas(ctx, bounds.width, bounds.height);
      // FIRE CURSOR: плавность и затухание курсорного ветра.
      wind.current += (wind.target - wind.current) * 0.01;
      wind.target *= 0;

      if (isVisible && bounds.width > 0 && bounds.height > 0) {
        // FIRE PARTICLE: скорость рождения пламени и искр.
        for (let i = 0; i < 2 && flames.length < maxFlames; i += 1) {
          flames.push(new FlameParticle(bounds));
        }

        if (Math.random() < 0.4 && sparks.length < maxSparks) {
          sparks.push(new SparkParticle(bounds));
        }
      }

      for (let i = smoke.length - 1; i >= 0; i -= 1) {
        smoke[i].update(renderContext.getWind());
        smoke[i].draw(ctx);

        if (smoke[i].life <= 0) {
          smoke.splice(i, 1);
        }
      }

      drawFireBase(renderContext);

      for (let i = flames.length - 1; i >= 0; i -= 1) {
        const flame = flames[i];
        flame.update(renderContext.getWind());
        flame.draw(ctx);

        if (flame.life <= 0.3 || flame.radius <= 6) {
          if (Math.random() < 0.2 && sparks.length < maxSparks) {
            sparks.push(new FlameTipSpark(flame.x, flame.y, flame.vx));
          }

          if (Math.random() < 0.4 && smoke.length < maxSmoke) {
            smoke.push(new SmokeParticle(flame.x, flame.y, flame.vx));
          }
        }

        if (flame.life <= 0 || flame.radius <= 0.5) {
          flames.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        sparks[i].update(renderContext.getWind());
        sparks[i].draw(ctx);

        if (sparks[i].alpha <= 0) {
          sparks.splice(i, 1);
        }
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    // FIRE PERFORMANCE: requestAnimationFrame запускает кадры canvas-анимации.
    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      // FIRE PERFORMANCE: cleanup останавливает анимацию и удаляет слушатели при размонтировании.
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      pointerScope.removeEventListener("pointermove", handlePointerMove);
      pointerScope.removeEventListener("pointerleave", settleWind);
      flames.length = 0;
      sparks.length = 0;
      smoke.length = 0;
    };
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <canvas className={styles.canvas} ref={canvasRef} />
    </div>
  );
}
