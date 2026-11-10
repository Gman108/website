'use client'

import { useMemo } from 'react'

/** Deterministic PRNG so SSR and client render identical starfields/petals. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Fixed full-screen CRT overlay: scanlines + rolling refresh bar,
 * plus a VHS grain layer on top of everything.
 */
export function CrtEffects() {
  return (
    <>
      <div className="vhs-grain" aria-hidden="true" />
      <div className="crt-overlay" aria-hidden="true" />
    </>
  )
}

/**
 * Starfield — twinkling 2005-era shrine stars scattered behind content.
 */
export function Starfield({ count = 60 }: { count?: number }) {
  const stars = useMemo(() => {
    const rand = mulberry32(20070505)
    return Array.from({ length: count }, (_, i) => {
      const size = 1 + rand() * 2.4
      return {
        id: i,
        left: `${rand() * 100}%`,
        top: `${rand() * 100}%`,
        size,
        dur: `${2 + rand() * 4}s`,
        delay: `${rand() * 5}s`,
      }
    })
  }, [count])
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={
            {
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              '--tw-dur': s.dur,
              '--tw-delay': s.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/**
 * Sakura petals drifting down — pure CSS animation, seeded random.
 */
export function SakuraPetals({ count = 14 }: { count?: number }) {
  const petals = useMemo(() => {
    const rand = mulberry32(20071231)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: `${rand() * 100}%`,
      dur: `${9 + rand() * 10}s`,
      delay: `${rand() * 18}s`,
      scale: 0.55 + rand() * 0.9,
    }))
  }, [count])
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={
            {
              '--p-x': p.x,
              '--p-dur': p.dur,
              '--p-delay': p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
