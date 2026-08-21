export default function Logo({ size = 36, onDark = false, showText = true, className = "" }) {
  const boxClass = onDark ? "bg-white/10 border border-white/15" : "bg-[#1a2744]";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`rounded-lg flex items-center justify-center ${boxClass}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 32 32"
          width={size * 0.62}
          height={size * 0.62}
          fill="#ffffff"
          aria-hidden="true"
        >
          <ellipse cx="9" cy="13" rx="2.2" ry="2.6" />
          <ellipse cx="14" cy="9.5" rx="2.4" ry="2.8" />
          <ellipse cx="20" cy="9.5" rx="2.4" ry="2.8" />
          <ellipse cx="25" cy="13" rx="2.2" ry="2.6" />
          <path d="M17 15c-5 0-9 3-9 7 0 2.5 2.5 3.5 5 3.5h8c2.5 0 5-1 5-3.5 0-4-4-7-9-7z" />
        </svg>
      </div>
      {showText && (
        <span
          className="font-bold font-display tracking-tight"
          style={{ fontSize: size * 0.46 }}
        >
          Pawlytics
        </span>
      )}
    </div>
  );
}