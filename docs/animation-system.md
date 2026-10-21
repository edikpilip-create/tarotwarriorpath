# Animation system

Цель системы: все движения на сайте должны выглядеть как один язык, а не как набор случайных эффектов. Новые анимации добавляются через `src/lib/animation-presets.ts`, `Reveal` и `FloatingAsset`.

## Базовые файлы

- `src/lib/animation-presets.ts` хранит duration, delay, easing, variants, stagger и reduced-motion настройки.
- `src/components/motion/Reveal.tsx` отвечает за появление контента при попадании в viewport.
- `src/components/motion/FloatingAsset.tsx` отвечает за фоновые плавающие изображения.
- `src/app/globals.css` содержит базовые классы `.motion-reveal` и `.floating-asset`.

## Типы анимаций

- `fadeUp`: основной scroll reveal для заголовков, текстовых блоков, карточек и форм.
- `fadeIn`: мягкое появление без движения, когда layout уже плотный.
- `scaleIn`: редкое появление небольших визуальных объектов. Не использовать `scale(0)`.
- `slideLeft` и `slideRight`: только для парных блоков, где направление помогает понять композицию.
- `staggerChildren`: использовать как правило задержек для групп, а не как отдельный визуальный эффект.
- `slowFloat`: медленное фоновое движение изображений.
- `softPulse`: редкий декоративный пульс для света или акцентных слоев.

## Scroll reveal

Для 70% появлений использовать `Reveal`.

```tsx
import { Reveal } from "@/components/motion/Reveal";

<Reveal as="article" variant="fadeUp" delay={120}>
  ...
</Reveal>
```

Правила:

- по умолчанию `once={true}`;
- задержки держать короткими: 0-280 ms;
- stagger для списков: 64 ms на элемент, максимум 8 элементов;
- не анимировать элементы, с которыми пользователь часто взаимодействует;
- не использовать reveal для контента, который должен быть виден сразу в первом viewport.

## Floating assets

Фоновые изображения добавлять только через `FloatingAsset`.

```tsx
import { FloatingAsset } from "@/components/motion/FloatingAsset";

<FloatingAsset
  src="/media/quote-artifact-left.png"
  size="clamp(140px, 18vw, 260px)"
  position={{ top: "12%", right: "6%" }}
  amplitude={14}
  speed={7600}
  opacity={0.48}
  zIndex={0}
  disableOnMobile
/>
```

Правила:

- объект должен быть декоративным и не перекрывать текст;
- движение только через `transform`;
- opacity задавать явно;
- большие изображения двигать меньше: 8-14 px;
- мелкие декоративные изображения можно двигать до 18-24 px;
- на mobile использовать `disableOnMobile`, если объект не несет смысла.

## Responsive motion

- Desktop: полные анимации, включая floating assets и мягкий stagger.
- Tablet: упрощенные анимации, ниже opacity у floating assets, меньше визуальной плотности.
- Mobile: минимальные анимации; reveal короче и ниже по амплитуде, floating assets без постоянного движения.
- `prefers-reduced-motion`: почти все transform-движение отключено; допустимы только короткие opacity-переходы.

На mobile нельзя просто оставлять desktop-анимации:

- сложный parallax отключать;
- количество плавающих объектов уменьшать;
- большие изображения не двигать сильно;
- sticky storytelling заменять последовательными блоками;
- проверять, что движущиеся слои не создают горизонтальный overflow.

## Что нельзя делать

- Не добавлять новые keyframes под конкретный блок без причины.
- Не использовать `transition: all`.
- Не анимировать `width`, `height`, `margin`, `padding`.
- Не использовать `ease-in` для появления UI.
- Не делать долгие UI-анимации дольше 300 ms.
- Не использовать `scale(0)` для появления.
- Не запускать бесконечные декоративные анимации на mobile.
- Не анимировать элементы, которые пользователь нажимает много раз подряд.

## Как добавить новую анимацию

1. Добавить вариант в `animationVariants`.
2. Использовать существующие `animationDurations` и `animationEasings`, если нет веской причины расширять шкалу.
3. Добавить тест в `src/lib/animation-presets.test.ts`, если меняется контракт пресетов.
4. Использовать вариант через `Reveal` или `FloatingAsset`.
5. Проверить desktop и mobile в браузере.
6. Проверить `prefers-reduced-motion`.
7. Запустить `npm.cmd run build`.
