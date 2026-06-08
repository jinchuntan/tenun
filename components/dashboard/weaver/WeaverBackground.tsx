/**
 * Branded, calm background for the Weaver dashboard.
 *
 * Three layers, all decorative (aria-hidden, pointer-events-none) and clipped
 * so they never cause horizontal overflow:
 *   1. warm ivory base (set by the shell)
 *   2. two low-opacity radial glows — muted gold (top-right) + soft navy
 *      (bottom-left), in the Tenun palette
 *   3. a faint tiled "woven thread" SVG pattern (~6–9% opacity) evoking
 *      career paths being woven together
 *
 * Pure CSS/inline SVG — no images, no animation, no external libraries.
 */
export function WeaverBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Radial brand glows — kept very soft so cards stay readable. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            // muted gold glow, top-right
            "radial-gradient(55rem 38rem at 90% 6%, rgba(212,160,23,0.16), transparent 60%)",
            // soft navy glow, bottom-left
            "radial-gradient(52rem 42rem at 6% 94%, rgba(10,22,40,0.10), transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Woven-thread pattern — interlacing curves tiled at low opacity. */}
      <svg
        className="absolute inset-0 h-full w-full text-[#0a1628] opacity-[0.06] sm:opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="weaver-thread"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            {/* Two seamless S-curves (one horizontal, one vertical) cross to
                form a continuous woven mesh when tiled. */}
            <path
              d="M0,80 C53,30 107,130 160,80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <path
              d="M80,0 C30,53 130,107 80,160"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#weaver-thread)" />
      </svg>
    </div>
  );
}
