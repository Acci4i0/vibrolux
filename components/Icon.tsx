/**
 * The site's icons: one drawing each, on the same 14 × 14 grid and with the same 1.4px line at any size.
 * The arrow is drawn once; ← and ↗ are the same arrow turned (with the CSS `rotate` property, so a component can still
 * move or turn it with `transform`). Colour = currentColor; 14px unless the CSS sizes it.
 */

const PATHS = {
  arrow: 'M1 7h12M8 2l5 5-5 5',
  plus: 'M7 1v12M1 7h12',
  minus: 'M1 7h12',
  chevron: 'M2 5l5 5 5-5',
};
const TURNED = { 'arrow-left': ['arrow', 180], 'arrow-out': ['arrow', -45] } as const;

export type IconName = keyof typeof PATHS | keyof typeof TURNED;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const [shape, turn] = name in TURNED ? TURNED[name as keyof typeof TURNED] : [name as keyof typeof PATHS, 0];
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      style={turn ? { rotate: `${turn}deg` } : undefined}
      aria-hidden
    >
      <path d={PATHS[shape]} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
