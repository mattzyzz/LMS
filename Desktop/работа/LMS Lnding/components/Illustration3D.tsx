export function Illustration3D() {
  return (
    <svg
      viewBox="0 0 320 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        {/* Red bag gradient */}
        <linearGradient id="bagFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF4A3B" />
          <stop offset="100%" stopColor="#C8150A" />
        </linearGradient>
        <linearGradient id="bagSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A10D02" />
          <stop offset="100%" stopColor="#8A0A00" />
        </linearGradient>
        <linearGradient id="bagTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B5B" />
          <stop offset="100%" stopColor="#E83020" />
        </linearGradient>

        {/* Purple cylinder */}
        <linearGradient id="cylTop" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="cylBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="40%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>
        <linearGradient id="cylCap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="50%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>

        {/* Column gradient */}
        <linearGradient id="colGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.055" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Shadow */}
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF3124" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#EF3124" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cylShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>

        {/* Highlight shine */}
        <linearGradient id="shineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ─── BACKGROUND COLUMNS ─────────────────────────── */}
      {/* Left column */}
      <rect x="38" y="44" width="18" height="210" fill="url(#colGrad)" rx="2" />
      <rect x="33" y="38" width="28" height="10" fill="white" fillOpacity="0.045" rx="2" />
      <rect x="33" y="250" width="28" height="8" fill="white" fillOpacity="0.04" rx="2" />
      {/* Fluting lines */}
      <line x1="43" y1="48" x2="43" y2="250" stroke="white" strokeOpacity="0.025" strokeWidth="1" />
      <line x1="49" y1="48" x2="49" y2="250" stroke="white" strokeOpacity="0.025" strokeWidth="1" />

      {/* Center-left column */}
      <rect x="112" y="30" width="22" height="230" fill="url(#colGrad)" rx="2" />
      <rect x="106" y="22" width="34" height="12" fill="white" fillOpacity="0.05" rx="2" />
      <rect x="106" y="256" width="34" height="9" fill="white" fillOpacity="0.045" rx="2" />
      <line x1="119" y1="34" x2="119" y2="256" stroke="white" strokeOpacity="0.028" strokeWidth="1" />
      <line x1="127" y1="34" x2="127" y2="256" stroke="white" strokeOpacity="0.028" strokeWidth="1" />

      {/* Right column */}
      <rect x="268" y="44" width="18" height="210" fill="url(#colGrad)" rx="2" />
      <rect x="263" y="38" width="28" height="10" fill="white" fillOpacity="0.035" rx="2" />
      <rect x="263" y="250" width="28" height="8" fill="white" fillOpacity="0.03" rx="2" />

      {/* ─── PURPLE CYLINDER ────────────────────────────── */}
      {/* Shadow */}
      <ellipse cx="96" cy="262" rx="38" ry="10" fill="url(#cylShadow)" />

      {/* Body */}
      <rect x="68" y="140" width="56" height="122" fill="url(#cylBody)" rx="2" />
      {/* Highlight band */}
      <rect x="68" y="140" width="14" height="122" fill="white" fillOpacity="0.07" />

      {/* Bottom ellipse */}
      <ellipse cx="96" cy="262" rx="28" ry="10" fill="#4C1D95" />

      {/* Middle label band */}
      <rect x="68" y="185" width="56" height="28" fill="white" fillOpacity="0.06" />
      <rect x="72" y="189" width="30" height="3" rx="1.5" fill="white" fillOpacity="0.2" />
      <rect x="72" y="196" width="20" height="2" rx="1" fill="white" fillOpacity="0.12" />
      <rect x="72" y="202" width="24" height="2" rx="1" fill="white" fillOpacity="0.12" />

      {/* Top ellipse */}
      <ellipse cx="96" cy="140" rx="28" ry="10" fill="url(#cylTop)" />

      {/* Cap (lid) */}
      <ellipse cx="96" cy="132" rx="22" ry="7.5" fill="url(#cylCap)" />
      <rect x="74" y="119" width="44" height="13" rx="3" fill="#DDD6FE" />
      <ellipse cx="96" cy="119" rx="22" ry="7.5" fill="#F5F3FF" />

      {/* Cylinder shine */}
      <rect x="68" y="140" width="10" height="80" fill="url(#shineGrad)" opacity="0.5" />

      {/* ─── RED BAG ────────────────────────────────────── */}
      {/* Shadow */}
      <ellipse cx="206" cy="272" rx="62" ry="14" fill="url(#shadowGrad)" />

      {/* Bag side face (3D right face) */}
      <path d="M246 126 L270 140 L270 266 L246 258 Z" fill="url(#bagSide)" />

      {/* Bag front face */}
      <rect x="162" y="126" width="84" height="132" rx="4" fill="url(#bagFront)" />

      {/* Bag top fold */}
      <path d="M162 126 L246 126 L246 146 L162 146 Z" fill="url(#bagTop)" />
      {/* Top fold crease shadow */}
      <line x1="162" y1="146" x2="246" y2="146" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />

      {/* Top fold right corner */}
      <path d="M246 126 L270 140 L270 160 L246 146 Z" fill="#9A0A00" />

      {/* Bag shine */}
      <rect x="166" y="130" width="28" height="55" rx="4" fill="url(#shineGrad)" opacity="0.6" />

      {/* Bag logo text */}
      <text x="204" y="210" textAnchor="middle" fill="white" fillOpacity="0.22" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="2">
        АЛЬФА
      </text>
      <text x="204" y="224" textAnchor="middle" fill="white" fillOpacity="0.16" fontSize="9" fontFamily="system-ui, sans-serif" letterSpacing="3">
        КУРС
      </text>

      {/* Handles */}
      <path
        d="M182 126 Q182 96 204 96 Q226 96 226 126"
        stroke="#8A1A14"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M182 126 Q182 96 204 96 Q226 96 226 126"
        stroke="#CC2E22"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Handle highlight */}
      <path
        d="M184 124 Q184 100 204 100 Q220 100 224 122"
        stroke="rgba(255,160,150,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ─── SPARKLES ───────────────────────────────────── */}
      <circle cx="258" cy="72" r="3" fill="white" fillOpacity="0.55" filter="url(#glow)" />
      <circle cx="268" cy="88" r="1.5" fill="white" fillOpacity="0.35" />
      <circle cx="252" cy="100" r="2" fill="white" fillOpacity="0.25" />
      <circle cx="145" cy="80" r="2.5" fill="#C084FC" fillOpacity="0.5" filter="url(#glow)" />
      <circle cx="135" cy="95" r="1.5" fill="#C084FC" fillOpacity="0.3" />
      <circle cx="52" cy="140" r="1.5" fill="white" fillOpacity="0.2" />

      {/* Star sparkle top-right */}
      <path d="M278 58 L280 54 L282 58 L286 60 L282 62 L280 66 L278 62 L274 60 Z"
        fill="white" fillOpacity="0.6" />

      {/* Small star left */}
      <path d="M58 200 L59.5 196.5 L61 200 L64.5 201.5 L61 203 L59.5 206.5 L58 203 L54.5 201.5 Z"
        fill="white" fillOpacity="0.3" />
    </svg>
  )
}
