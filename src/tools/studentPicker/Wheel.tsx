import { useEffect, useRef, useState } from 'react'
import { PartyPopper, RotateCcw } from 'lucide-react'
import { fireConfetti } from '../../lib/confetti'
import { Button, Toggle } from '../../components/ui'
import { landingRotation } from './groups'

const SLICE_COLORS = ['#fca5a5', '#fdba74', '#fde047', '#86efac', '#7dd3fc', '#c4b5fd', '#f9a8d4', '#5eead4']
const SPIN_MS = 4600

function slicePath(i: number, n: number): string {
  if (n === 1) return 'M0 -100A100 100 0 1 1 -0.01 -100Z'
  const a = 360 / n
  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180
  const x1 = 100 * Math.cos(rad(i * a))
  const y1 = 100 * Math.sin(rad(i * a))
  const x2 = 100 * Math.cos(rad((i + 1) * a))
  const y2 = 100 * Math.sin(rad((i + 1) * a))
  return `M0 0L${x1.toFixed(2)} ${y1.toFixed(2)}A100 100 0 ${a > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z`
}

export function Wheel({ names }: { names: string[] }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [removeWinners, setRemoveWinners] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => void (timer.current && window.clearTimeout(timer.current)), [])

  const active = removeWinners ? names.filter((n) => !picked.includes(n)) : names
  const n = active.length

  function spin() {
    if (spinning || n === 0) return
    const idx = Math.floor(Math.random() * n)
    const jitter = Math.random() - 0.5
    setWinner(null)
    setSpinning(true)
    setRotation((r) => landingRotation(idx, n, r, jitter))
    timer.current = window.setTimeout(() => {
      setSpinning(false)
      setWinner(active[idx])
      if (removeWinners) setPicked((p) => [...p, active[idx]])
      fireConfetti()
    }, SPIN_MS + 80)
  }

  const showLabels = n <= 30
  const fontSize = n <= 8 ? 11 : n <= 14 ? 9 : n <= 22 ? 7 : 5.5
  const clip = (s: string) => (s.length > 14 ? s.slice(0, 13) + '…' : s)

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-square w-full max-w-[300px]">
        {/* pointer */}
        <svg viewBox="0 0 40 40" className="absolute left-1/2 top-[-6px] z-10 h-9 w-9 -translate-x-1/2 drop-shadow">
          <path d="M20 38 L6 6 Q20 -2 34 6 Z" fill="#1c1917" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <svg
          viewBox="-104 -104 208 208"
          className="h-full w-full"
          style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.7, 0.1, 1)` : 'none' }}
          role="img"
          aria-label="Spinning wheel of student names"
        >
          <circle r="103" fill="#1c1917" />
          {n === 0 ? (
            <circle r="100" fill="#e7e5e4" />
          ) : (
            active.map((name, i) => {
              const a = 360 / n
              const mid = -90 + (i + 0.5) * a
              return (
                <g key={name + i}>
                  <path d={slicePath(i, n)} fill={SLICE_COLORS[i % SLICE_COLORS.length]} stroke="#1c1917" strokeWidth={n > 1 ? 1 : 0} />
                  {showLabels && (
                    <text transform={`rotate(${mid}) translate(92 0)`} textAnchor="end" dominantBaseline="central" fontSize={fontSize} fontWeight={800} fill="#1c1917" fontFamily="inherit">
                      {clip(name)}
                    </text>
                  )}
                </g>
              )
            })
          )}
          <circle r="9" fill="#fff" stroke="#1c1917" strokeWidth="2.5" />
        </svg>
      </div>

      <Button variant="primary" className="w-full !py-3 !text-lg" disabled={spinning || n === 0} onClick={spin}>
        {spinning ? 'Spinning…' : n === 0 ? 'Everyone has had a turn!' : 'Spin the wheel!'}
      </Button>

      <div aria-live="polite" className="min-h-[3.5rem]">
        {winner && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-center">
            <PartyPopper size={26} color="#d97706" />
            <span className="break-words text-2xl font-black text-stone-900">{winner}</span>
          </div>
        )}
      </div>

      <Toggle label="Take winners off the wheel" description="So everybody gets a turn before anyone repeats." checked={removeWinners} onChange={(v) => { setRemoveWinners(v); setPicked([]) }} />
      {picked.length > 0 && (
        <Button variant="secondary" className="w-full" icon={<RotateCcw size={16} />} onClick={() => { setPicked([]); setWinner(null) }}>
          Put everyone back ({picked.length})
        </Button>
      )}
    </div>
  )
}
