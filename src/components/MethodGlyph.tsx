import type { MethodId } from '../content/types'
import type { ReactNode } from 'react'

// Tiny plot thumbnails of the data shape each method expects. They are decorative:
// the method label always carries the meaning.

type Point = readonly [number, number]

const dots = (points: readonly Point[]) =>
  points.map(([cx, cy]) => <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={1.7} />)

const axes = <path className="glyph-axis" d="M3 3V25H37" />

function Mean({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <path className="glyph-line" d={`M${x1} ${y}H${x2}`} />
}

const glyphs: Record<MethodId, ReactNode> = {
  'independent-t': (
    <>
      {axes}
      {dots([[10, 19], [13, 21], [11, 16], [14, 18]])}
      <Mean x1={7} x2={17} y={18.5} />
      {dots([[25, 10], [28, 12], [26, 7], [29, 9]])}
      <Mean x1={22} x2={32} y={9.5} />
    </>
  ),
  'paired-t': (
    <>
      {axes}
      <path className="glyph-thin" d="M10 20L30 12M10 16L30 7M10 22.5L30 17M10 12L30 9" />
      {dots([[10, 20], [30, 12], [10, 16], [30, 7], [10, 22.5], [30, 17], [10, 12], [30, 9]])}
    </>
  ),
  'one-way-anova': (
    <>
      {axes}
      {dots([[8, 19], [11, 21], [9, 16]])}
      <Mean x1={6} x2={13} y={18.5} />
      {dots([[19, 12], [22, 14], [20, 9]])}
      <Mean x1={17} x2={24} y={11.5} />
      {dots([[30, 16], [33, 18], [31, 13]])}
      <Mean x1={28} x2={35} y={15.5} />
    </>
  ),
  'pearson-correlation': (
    <>
      {axes}
      {dots([[7, 21], [10, 18], [12, 21], [15, 15], [18, 17], [21, 12], [23, 15], [26, 9], [29, 11], [32, 6], [34, 9]])}
    </>
  ),
  'simple-linear-regression': (
    <>
      {axes}
      {dots([[8, 20], [12, 19], [16, 15], [20, 15], [25, 10], [29, 10], [33, 6]])}
      <path className="glyph-line" d="M6 21.5L36 5" />
    </>
  ),
  'chi-square-independence': (
    <>
      {[0, 1, 2].flatMap((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={6 + col * 10}
            y={3 + row * 7.5}
            width={9}
            height={6.5}
            rx={1}
            style={{ fillOpacity: [0.25, 0.7, 0.4, 0.85, 0.3, 0.55, 0.45, 0.2, 0.75][row * 3 + col] }}
          />
        )),
      )}
    </>
  ),
  'binary-logistic-regression': (
    <>
      {axes}
      {dots([[7, 21], [11, 21], [15, 21], [21, 21], [17, 6], [24, 6], [29, 6], [34, 6]])}
      <path className="glyph-line" d="M5 20C15 20 18 7 36 7" />
    </>
  ),
  'none-fits': <rect className="glyph-dashed" x={5} y={4} width={30} height={20} rx={3} />,
}

export function MethodGlyph({ id }: { id: MethodId }) {
  return (
    <svg className="glyph" viewBox="0 0 40 28" aria-hidden="true" focusable="false">
      {glyphs[id]}
    </svg>
  )
}
