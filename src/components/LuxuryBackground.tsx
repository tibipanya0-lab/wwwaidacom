const LuxuryBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Subtle dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-black" />
      
      {/* Gold accent glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-yellow-600/8 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[80px]" />
      
      {/* Animated gold particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              background: `linear-gradient(135deg, #fbbf24, #f59e0b)`,
              top: Math.random() * 100 + "%",
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
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="goldLines" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="60" stroke="#d4af37" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#goldLines)" />
      </svg>

      {/* Gold border glow at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      {/* Subtle corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-amber-500/60 to-transparent" />
        <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-amber-500/60 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-amber-500/60 to-transparent" />
        <div className="absolute top-4 right-4 w-px h-16 bg-gradient-to-b from-amber-500/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="absolute bottom-4 left-4 w-16 h-px bg-gradient-to-r from-amber-500/60 to-transparent" />
        <div className="absolute bottom-4 left-4 w-px h-16 bg-gradient-to-t from-amber-500/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32">
        <div className="absolute bottom-4 right-4 w-16 h-px bg-gradient-to-l from-amber-500/60 to-transparent" />
        <div className="absolute bottom-4 right-4 w-px h-16 bg-gradient-to-t from-amber-500/60 to-transparent" />
      </div>

      {/* Central diamond pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02]">
        <div className="w-[800px] h-[800px] border border-amber-500 rotate-45" />
        <div className="absolute w-[600px] h-[600px] border border-amber-400 rotate-45" />
        <div className="absolute w-[400px] h-[400px] border border-amber-300 rotate-45" />
      </div>
    </div>
  );
};

export default LuxuryBackground;
