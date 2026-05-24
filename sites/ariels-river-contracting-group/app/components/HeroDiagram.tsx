export function HeroDiagram() {
  return (
    <svg
      viewBox="0 0 600 460"
      role="img"
      aria-label="Service execution system diagram showing five capability lanes: pest control, language access, staffing, janitorial, and emergency relief."
      className="w-full h-auto"
    >
      <defs>
        <pattern id="dotgrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="#0B1F33" opacity="0.10" />
        </pattern>
      </defs>
      <rect width="600" height="460" fill="#F7F5EF" />
      <rect width="600" height="460" fill="url(#dotgrid)" />

      {/* Spine */}
      <line x1="300" y1="40" x2="300" y2="420" stroke="#0B1F33" strokeOpacity="0.35" strokeWidth="1" />
      <line x1="80" y1="230" x2="520" y2="230" stroke="#1FA6C9" strokeOpacity="0.55" strokeWidth="1" />

      {/* Gold connecting ribbon */}
      <path d="M180 105 C 240 105, 240 230, 300 230" stroke="#C9A227" strokeWidth="1.5" fill="none" strokeOpacity="0.9" />
      <path d="M420 355 C 360 355, 360 230, 300 230" stroke="#C9A227" strokeWidth="1.5" fill="none" strokeOpacity="0.9" />

      {/* Modules */}
      <g>
        {/* 561710 Pest */}
        <rect x="80" y="80" width="160" height="80" fill="#F7F5EF" stroke="#0B1F33" strokeWidth="1.25" />
        <text x="92" y="106" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#5A6068" letterSpacing="1.4">01 / 561710</text>
        <text x="92" y="130" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" fill="#0B1F33">Pest Control</text>
        <text x="92" y="148" fontFamily="Inter, sans-serif" fontSize="11" fill="#2B2F33">Extermination</text>
        <circle cx="232" cy="88" r="3" fill="#B4232A" />

        {/* 541930 Translation */}
        <rect x="360" y="80" width="160" height="80" fill="#F7F5EF" stroke="#0B1F33" strokeWidth="1.25" />
        <text x="372" y="106" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#5A6068" letterSpacing="1.4">02 / 541930</text>
        <text x="372" y="130" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" fill="#0B1F33">Language Access</text>
        <text x="372" y="148" fontFamily="Inter, sans-serif" fontSize="11" fill="#2B2F33">ASL · CART · Translation</text>

        {/* 561312/561320 Staffing — center hub */}
        <rect x="220" y="200" width="160" height="60" fill="#0B1F33" />
        <text x="232" y="222" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#C9A227" letterSpacing="1.4">03 / 561312·561320</text>
        <text x="232" y="244" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" fill="#F7F5EF">Staffing & Support</text>

        {/* 561720 Janitorial */}
        <rect x="80" y="300" width="160" height="80" fill="#F7F5EF" stroke="#0B1F33" strokeWidth="1.25" />
        <text x="92" y="326" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#5A6068" letterSpacing="1.4">04 / 561720</text>
        <text x="92" y="350" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" fill="#0B1F33">Janitorial</text>
        <text x="92" y="368" fontFamily="Inter, sans-serif" fontSize="11" fill="#2B2F33">Facility Support</text>
        <circle cx="232" cy="308" r="3" fill="#B4232A" />

        {/* 624230 Emergency */}
        <rect x="360" y="300" width="160" height="80" fill="#F7F5EF" stroke="#0B1F33" strokeWidth="1.25" />
        <text x="372" y="326" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#5A6068" letterSpacing="1.4">05 / 624230</text>
        <text x="372" y="350" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" fill="#0B1F33">Emergency Relief</text>
        <text x="372" y="368" fontFamily="Inter, sans-serif" fontSize="11" fill="#2B2F33">Rapid mobilization</text>
        <circle cx="512" cy="308" r="3" fill="#B4232A" />
      </g>

      {/* Vendor-readiness badges (bottom) */}
      <g transform="translate(80,410)">
        <rect width="92" height="22" fill="#F7F5EF" stroke="#0B1F33" strokeWidth="1" />
        <text x="46" y="15" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#0B1F33" letterSpacing="1.4">SDVOSB</text>
        <line x1="0" y1="22" x2="92" y2="22" stroke="#B4232A" strokeWidth="0.8" />
      </g>
      <g transform="translate(184,410)">
        <rect width="92" height="22" fill="#F7F5EF" stroke="#0B1F33" strokeWidth="1" />
        <text x="46" y="15" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#0B1F33" letterSpacing="1.4">HUBZONE</text>
        <line x1="0" y1="22" x2="92" y2="22" stroke="#B4232A" strokeWidth="0.8" />
      </g>
      <g transform="translate(288,410)">
        <rect width="92" height="22" fill="#F7F5EF" stroke="#0B1F33" strokeWidth="1" />
        <text x="46" y="15" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#0B1F33" letterSpacing="1.4">MBE · DBE</text>
        <line x1="0" y1="22" x2="92" y2="22" stroke="#B4232A" strokeWidth="0.8" />
      </g>
      <g transform="translate(392,410)">
        <rect width="92" height="22" fill="#F7F5EF" stroke="#0B1F33" strokeWidth="1" />
        <text x="46" y="15" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#0B1F33" letterSpacing="1.4">SBE</text>
        <line x1="0" y1="22" x2="92" y2="22" stroke="#B4232A" strokeWidth="0.8" />
      </g>

      {/* Corner data ticks */}
      <text x="40" y="40" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#5A6068" letterSpacing="1.4">EXECUTION · SYSTEM</text>
      <text x="560" y="40" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#5A6068" letterSpacing="1.4">ARCG · v1</text>
    </svg>
  );
}
