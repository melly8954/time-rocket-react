// src/components/ui/Planet.jsx
const Planet = ({ className, type = 1, size = 100, position, rotation = true }) => {
  const planetTypes = {
    1: (
      <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
        <defs>
          <radialGradient id="planet1Gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#9C54A5" />
            <stop offset="100%" stopColor="#4C2C69" />
          </radialGradient>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#planet1Gradient)" filter="url(#glow1)" />
        <path d="M30 100 Q 50 50, 100 50 Q 130 50, 170 100 Q 150 150, 100 150 Q 50 150, 30 100" 
              fill="rgba(255,255,255,0.1)" />
        <path d="M40 80 Q 70 60, 110 70 Q 150 80, 160 110 Q 140 130, 90 130 Q 50 110, 40 80" 
              fill="rgba(255,255,255,0.05)" />
      </svg>
    ),
    2: (
      <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
        <defs>
          <radialGradient id="planet2Gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#47BFFF" />
            <stop offset="100%" stopColor="#1A56DB" />
          </radialGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#planet2Gradient)" filter="url(#glow2)" />
        <ellipse cx="100" cy="100" rx="95" ry="25" fill="transparent" stroke="rgba(255,255,255,0.2)" 
                 strokeWidth="1" />
        <circle cx="60" cy="80" r="15" fill="rgba(255,255,255,0.2)" />
        <circle cx="130" cy="70" r="10" fill="rgba(255,255,255,0.15)" />
        <circle cx="100" cy="130" r="20" fill="rgba(255,255,255,0.1)" />
      </svg>
    ),
    3: (
      <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
        <defs>
          <radialGradient id="planet3Gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>
          <filter id="glow3">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#planet3Gradient)" filter="url(#glow3)" />
        <path d="M50 70 Q 100 50, 150 70 Q 170 100, 150 130 Q 100 150, 50 130 Q 30 100, 50 70" 
              fill="rgba(255,255,255,0.1)" />
        <circle cx="70" cy="80" r="15" fill="rgba(0,0,0,0.2)" />
        <circle cx="130" cy="90" r="25" fill="rgba(0,0,0,0.15)" />
      </svg>
    )
  };
  
  const style = {
    ...position,
    animation: rotation ? 'planetRotate 120s linear infinite' : 'none'
  };

  return (
    <div style={style} className={`planet ${className}`}>
      {planetTypes[type]}
    </div>
  );
};

export default Planet;