interface RetroMarqueeProps {
  items: string[]
}

/** The legendary scrolling marquee — duplicated track for seamless loop. */
export function RetroMarquee({ items }: RetroMarqueeProps) {
  const line = items.join('  ★  ')
  return (
    <div
      className="bevel-out overflow-hidden bg-[#241308] py-1.5"
      role="marquee"
      aria-label={`Scrolling text: ${items.join(', ')}`}
    >
      <div className="retro-marquee-track font-vt text-base tracking-wider text-amber-300">
        <span className="px-4">{`${line}  ★  `}</span>
        <span className="px-4" aria-hidden="true">{`${line}  ★  `}</span>
      </div>
    </div>
  )
}
