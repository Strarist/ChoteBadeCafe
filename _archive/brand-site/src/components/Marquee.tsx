export function Marquee({
  text,
  tone = "clay",
}: {
  text: string
  tone?: "clay" | "ink"
}) {
  const bg = tone === "clay" ? "bg-clay" : "bg-ink-deep"
  const copies = Array.from({ length: 10 }, (_, i) => i)

  const Row = ({ prefix }: { prefix: string }) => (
    <div className="marquee-track flex shrink-0 items-center whitespace-nowrap">
      {copies.map((i) => (
        <span
          key={`${prefix}-${i}`}
          className="inline-flex shrink-0 items-center gap-6 pr-6 md:gap-8 md:pr-8"
        >
          <span className="font-display text-[1.35rem] italic leading-none tracking-[-0.01em] text-cream md:text-[1.7rem]">
            {text}
          </span>
          <span className="text-[0.95rem] text-[#c9a24b] md:text-[1.05rem]">✳</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className={`${bg} relative overflow-hidden py-[0.95rem] select-none`} aria-hidden>
      <div className="marquee-rail flex w-max">
        <Row prefix="a" />
        <Row prefix="b" />
      </div>
    </div>
  )
}
