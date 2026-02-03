const CityBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900" />
      
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 60 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: Math.random() * 3 + "s",
              animationDuration: Math.random() * 2 + 2 + "s",
            }}
          />
        ))}
      </div>

      {/* Colorful glow orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute top-40 right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl" />

      {/* City skyline */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-80"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="buildingGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f0a1e" />
          </linearGradient>
          <linearGradient id="buildingGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        
        {/* Background buildings (darker, further) */}
        <g fill="url(#buildingGrad2)" opacity="0.6">
          <rect x="50" y="180" width="60" height="140" />
          <rect x="120" y="140" width="45" height="180" />
          <rect x="180" y="160" width="70" height="160" />
          <rect x="270" y="120" width="50" height="200" />
          <rect x="340" y="150" width="80" height="170" />
          <rect x="450" y="100" width="55" height="220" />
          <rect x="520" y="130" width="65" height="190" />
          <rect x="600" y="90" width="70" height="230" />
          <rect x="700" y="140" width="50" height="180" />
          <rect x="770" y="110" width="80" height="210" />
          <rect x="880" y="150" width="55" height="170" />
          <rect x="950" y="80" width="75" height="240" />
          <rect x="1050" y="130" width="60" height="190" />
          <rect x="1130" y="100" width="85" height="220" />
          <rect x="1240" y="140" width="50" height="180" />
          <rect x="1310" y="120" width="70" height="200" />
        </g>
        
        {/* Foreground buildings (closer, darker) */}
        <g fill="url(#buildingGrad1)">
          <rect x="0" y="220" width="80" height="100" />
          <rect x="90" y="200" width="50" height="120" />
          <rect x="160" y="240" width="90" height="80" />
          <rect x="280" y="190" width="60" height="130" />
          <rect x="360" y="230" width="100" height="90" />
          <rect x="490" y="180" width="70" height="140" />
          <rect x="580" y="210" width="55" height="110" />
          <rect x="660" y="190" width="85" height="130" />
          <rect x="780" y="220" width="60" height="100" />
          <rect x="860" y="200" width="90" height="120" />
          <rect x="980" y="230" width="50" height="90" />
          <rect x="1050" y="190" width="75" height="130" />
          <rect x="1150" y="210" width="65" height="110" />
          <rect x="1240" y="230" width="100" height="90" />
          <rect x="1370" y="200" width="70" height="120" />
        </g>
        
        {/* Building windows (lit up) */}
        <g fill="#fbbf24" opacity="0.8">
          {/* Random windows on buildings */}
          <rect x="60" y="230" width="4" height="6" />
          <rect x="70" y="250" width="4" height="6" />
          <rect x="130" y="160" width="4" height="6" />
          <rect x="140" y="180" width="4" height="6" />
          <rect x="200" y="180" width="4" height="6" />
          <rect x="220" y="200" width="4" height="6" />
          <rect x="290" y="140" width="4" height="6" />
          <rect x="300" y="160" width="4" height="6" />
          <rect x="370" y="170" width="4" height="6" />
          <rect x="390" y="190" width="4" height="6" />
          <rect x="470" y="120" width="4" height="6" />
          <rect x="480" y="150" width="4" height="6" />
          <rect x="540" y="150" width="4" height="6" />
          <rect x="560" y="170" width="4" height="6" />
          <rect x="620" y="110" width="4" height="6" />
          <rect x="640" y="140" width="4" height="6" />
          <rect x="720" y="160" width="4" height="6" />
          <rect x="800" y="130" width="4" height="6" />
          <rect x="820" y="160" width="4" height="6" />
          <rect x="900" y="170" width="4" height="6" />
          <rect x="970" y="100" width="4" height="6" />
          <rect x="990" y="130" width="4" height="6" />
          <rect x="1070" y="150" width="4" height="6" />
          <rect x="1160" y="120" width="4" height="6" />
          <rect x="1180" y="150" width="4" height="6" />
          <rect x="1260" y="160" width="4" height="6" />
          <rect x="1330" y="140" width="4" height="6" />
        </g>
        
        {/* Cyan/blue windows */}
        <g fill="#22d3ee" opacity="0.6">
          <rect x="100" y="220" width="4" height="6" />
          <rect x="315" y="200" width="4" height="6" />
          <rect x="510" y="200" width="4" height="6" />
          <rect x="690" y="210" width="4" height="6" />
          <rect x="870" y="220" width="4" height="6" />
          <rect x="1100" y="210" width="4" height="6" />
          <rect x="1280" y="250" width="4" height="6" />
        </g>

        {/* Pink/magenta windows */}
        <g fill="#f472b6" opacity="0.7">
          <rect x="170" y="260" width="4" height="6" />
          <rect x="420" y="250" width="4" height="6" />
          <rect x="610" y="230" width="4" height="6" />
          <rect x="790" y="240" width="4" height="6" />
          <rect x="1010" y="250" width="4" height="6" />
          <rect x="1220" y="260" width="4" height="6" />
        </g>
      </svg>

      {/* Ground reflection/glow */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-purple-900/30 to-transparent" />
    </div>
  );
};

export default CityBackground;
