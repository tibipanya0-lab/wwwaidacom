const LuxuryBackground = () => {
  // Generate random skyscrapers
  const skyscrapers = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    width: Math.random() * 60 + 30,
    height: Math.random() * 250 + 100,
    left: i * 4 + Math.random() * 2,
    windows: Math.floor(Math.random() * 8 + 4),
  }));

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Subtle dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />
      
      {/* Gold accent glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-yellow-600/8 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[80px]" />
      
      {/* Animated gold particles */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              background: `linear-gradient(135deg, #fbbf24, #f59e0b)`,
              top: Math.random() * 60 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: Math.random() * 4 + "s",
              animationDuration: Math.random() * 3 + 2 + "s",
              boxShadow: "0 0 6px #fbbf24",
            }}
          />
        ))}
      </div>

      {/* Diagonal gold lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="goldLines" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="60" stroke="#d4af37" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#goldLines)" />
      </svg>

      {/* City skyline with skyscrapers */}
      <div className="absolute bottom-0 left-0 right-0 h-[400px]">
        {/* Skyline glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-500/10 to-transparent" />
        
        {/* Skyscrapers */}
        <svg className="absolute bottom-0 left-0 right-0 h-full w-full" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          
          {skyscrapers.map((building) => (
            <g key={building.id}>
              {/* Building body */}
              <rect
                x={`${building.left}%`}
                y={400 - building.height}
                width={building.width}
                height={building.height}
                fill="url(#buildingGradient)"
                stroke="#2a2a2a"
                strokeWidth="1"
              />
              {/* Antenna/spire for taller buildings */}
              {building.height > 200 && (
                <rect
                  x={`${building.left + 1.2}%`}
                  y={400 - building.height - 30}
                  width="3"
                  height="30"
                  fill="#1a1a1a"
                />
              )}
              {/* Windows */}
              {Array.from({ length: building.windows }).map((_, row) =>
                Array.from({ length: 3 }).map((_, col) => (
                  <rect
                    key={`${building.id}-${row}-${col}`}
                    x={`${building.left + 0.3 + col * 1.2}%`}
                    y={400 - building.height + 15 + row * 25}
                    width="8"
                    height="12"
                    fill={Math.random() > 0.4 ? "url(#windowGlow)" : "#111"}
                    opacity={Math.random() * 0.5 + 0.5}
                  />
                ))
              )}
              {/* Gold accent line on top */}
              <rect
                x={`${building.left}%`}
                y={400 - building.height}
                width={building.width}
                height="2"
                fill="#d4af37"
                opacity="0.6"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Gold border glow at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-amber-500/60 to-transparent" />
        <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-amber-500/60 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-amber-500/60 to-transparent" />
        <div className="absolute top-4 right-4 w-px h-16 bg-gradient-to-b from-amber-500/60 to-transparent" />
      </div>
    </div>
  );
};

export default LuxuryBackground;
