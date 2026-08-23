/**
 * Pawlytics Doggo Illustrations
 * Cute, personality-driven SVG dog illustrations for empty states,
 * loading screens, and brand personality touches.
 * Inspired by Untitled Goose Game / Waddle-oo style — simple, expressive, charming.
 */

/** Sitting doggo — used for empty states ("No reports yet") */
export function DoggoSitting({ size = 120, className = "" }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true">
      {/* Body */}
      <ellipse cx="60" cy="78" rx="28" ry="22" fill="#1a2744" />
      {/* Head */}
      <circle cx="60" cy="48" r="20" fill="#1a2744" />
      {/* Left ear (floppy) */}
      <ellipse cx="43" cy="35" rx="8" ry="14" fill="#1a2744" transform="rotate(-15 43 35)" />
      {/* Right ear (perky) */}
      <ellipse cx="77" cy="33" rx="7" ry="13" fill="#1a2744" transform="rotate(10 77 33)" />
      {/* Snout */}
      <ellipse cx="60" cy="55" rx="10" ry="7" fill="#2a3d5e" />
      {/* Nose */}
      <ellipse cx="60" cy="52" rx="4" ry="3" fill="#10b981" />
      {/* Left eye */}
      <circle cx="52" cy="45" r="3" fill="white" />
      <circle cx="53" cy="44.5" r="1.5" fill="#0a0a0a" />
      {/* Right eye */}
      <circle cx="68" cy="45" r="3" fill="white" />
      <circle cx="69" cy="44.5" r="1.5" fill="#0a0a0a" />
      {/* Tongue */}
      <ellipse cx="62" cy="59" rx="3" ry="4" fill="#f472b6" />
      {/* Front paws */}
      <ellipse cx="48" cy="96" rx="7" ry="5" fill="#1a2744" />
      <ellipse cx="72" cy="96" rx="7" ry="5" fill="#1a2744" />
      {/* Tail (wagging) */}
      <path d="M88 72 Q98 58 92 48" stroke="#1a2744" strokeWidth="5" strokeLinecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate" values="-5 88 72;5 88 72;-5 88 72" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/** Walking doggo — used for loading states */
export function DoggoWalking({ size = 100, className = "" }) {
  return (
    <svg viewBox="0 0 140 100" width={size * 1.4} height={size} className={className} aria-hidden="true">
      {/* Body */}
      <ellipse cx="70" cy="55" rx="35" ry="20" fill="#1a2744" />
      {/* Head */}
      <circle cx="105" cy="38" r="16" fill="#1a2744" />
      {/* Ear */}
      <ellipse cx="97" cy="25" rx="6" ry="11" fill="#1a2744" transform="rotate(-10 97 25)" />
      {/* Snout */}
      <ellipse cx="115" cy="42" rx="8" ry="5.5" fill="#2a3d5e" />
      {/* Nose */}
      <ellipse cx="118" cy="40" rx="3" ry="2.5" fill="#10b981" />
      {/* Eye */}
      <circle cx="108" cy="35" r="2.5" fill="white" />
      <circle cx="109" cy="34.5" r="1.2" fill="#0a0a0a" />
      {/* Legs with walking animation */}
      <line x1="50" y1="72" x2="46" y2="90" stroke="#1a2744" strokeWidth="5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="-10 50 72;10 50 72;-10 50 72" dur="0.5s" repeatCount="indefinite" />
      </line>
      <line x1="62" y1="72" x2="66" y2="90" stroke="#1a2744" strokeWidth="5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="10 62 72;-10 62 72;10 62 72" dur="0.5s" repeatCount="indefinite" />
      </line>
      <line x1="78" y1="72" x2="74" y2="90" stroke="#1a2744" strokeWidth="5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="10 78 72;-10 78 72;10 78 72" dur="0.5s" repeatCount="indefinite" />
      </line>
      <line x1="90" y1="72" x2="94" y2="90" stroke="#1a2744" strokeWidth="5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="-10 90 72;10 90 72;-10 90 72" dur="0.5s" repeatCount="indefinite" />
      </line>
      {/* Tail */}
      <path d="M36 48 Q24 35 30 26" stroke="#1a2744" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate" values="-8 36 48;8 36 48;-8 36 48" dur="0.6s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/** Paw print pattern — decorative background element */
export function PawPrint({ size = 24, className = "", color = "currentColor" }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill={color} aria-hidden="true">
      <ellipse cx="9" cy="13" rx="2.2" ry="2.6" />
      <ellipse cx="14" cy="9.5" rx="2.4" ry="2.8" />
      <ellipse cx="20" cy="9.5" rx="2.4" ry="2.8" />
      <ellipse cx="25" cy="13" rx="2.2" ry="2.6" />
      <path d="M17 15c-5 0-9 3-9 7 0 2.5 2.5 3.5 5 3.5h8c2.5 0 5-1 5-3.5 0-4-4-7-9-7z" />
    </svg>
  );
}

/** Sleeping doggo — used for "all clear" / no incidents states */
export function DoggoSleeping({ size = 120, className = "" }) {
  return (
    <svg viewBox="0 0 140 90" width={size * 1.17} height={size * 0.75} className={className} aria-hidden="true">
      {/* Body (lying down) */}
      <ellipse cx="70" cy="62" rx="40" ry="18" fill="#1a2744" />
      {/* Head (resting) */}
      <circle cx="108" cy="52" r="16" fill="#1a2744" />
      {/* Ear */}
      <ellipse cx="118" cy="42" rx="6" ry="10" fill="#2a3d5e" transform="rotate(20 118 42)" />
      {/* Closed eyes (sleeping) */}
      <path d="M102 49 Q105 47 108 49" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M112 48 Q115 46 118 48" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="122" cy="54" rx="3" ry="2" fill="#10b981" />
      {/* Z's */}
      <text x="125" y="35" fill="#10b981" fontSize="10" fontFamily="'Geist Mono', monospace" fontWeight="600" opacity="0.7">
        z
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate" values="0 0;-2 -4;0 0" dur="2s" repeatCount="indefinite" />
      </text>
      <text x="132" y="28" fill="#10b981" fontSize="13" fontFamily="'Geist Mono', monospace" fontWeight="600" opacity="0.5">
        Z
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.5s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate" values="0 0;-3 -5;0 0" dur="2.5s" repeatCount="indefinite" />
      </text>
      {/* Front paws */}
      <ellipse cx="105" cy="76" rx="6" ry="4" fill="#1a2744" />
      {/* Tail */}
      <path d="M30 58 Q22 52 26 44" stroke="#1a2744" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
