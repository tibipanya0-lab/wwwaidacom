import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";

interface BuildingProps {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  simplified?: boolean;
}

const Building = ({ position, width, height, depth, simplified = false }: BuildingProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate random window pattern - simplified for mobile
  const windowTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const canvasSize = simplified ? 32 : 64;
    canvas.width = canvasSize;
    canvas.height = canvasSize * 2;
    const ctx = canvas.getContext("2d")!;
    
    // Building base color
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvasSize, canvasSize * 2);
    
    // Windows - fewer on mobile
    const windowWidth = simplified ? 6 : 8;
    const windowHeight = simplified ? 8 : 10;
    const cols = simplified ? 3 : 5;
    const rows = simplified ? 6 : 10;
    const gapX = (canvasSize - cols * windowWidth) / (cols + 1);
    const gapY = (canvasSize * 2 - rows * windowHeight) / (rows + 1);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isLit = Math.random() > (simplified ? 0.5 : 0.4);
        if (isLit) {
          const brightness = Math.random() * 0.5 + 0.5;
          ctx.fillStyle = `rgba(251, 191, 36, ${brightness})`;
        } else {
          ctx.fillStyle = "#111111";
        }
        const x = gapX + col * (windowWidth + gapX);
        const y = gapY + row * (windowHeight + gapY);
        ctx.fillRect(x, y, windowWidth, windowHeight);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, height / 20);
    return texture;
  }, [height, simplified]);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        map={windowTexture}
        emissive="#d4af37"
        emissiveIntensity={0.05}
        metalness={0.8}
        roughness={0.2}
      />
      {/* Top accent - skip on mobile for performance */}
      {!simplified && (
        <mesh position={[0, height / 2 + 0.1, 0]}>
          <boxGeometry args={[width + 0.2, 0.2, depth + 0.2]} />
          <meshStandardMaterial color="#d4af37" emissive="#fbbf24" emissiveIntensity={0.3} />
        </mesh>
      )}
      {/* Antenna for tall buildings - skip on mobile */}
      {!simplified && height > 25 && (
        <mesh position={[0, height / 2 + 3, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 6, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      )}
    </mesh>
  );
};

interface CityBuildingsProps {
  isMobile: boolean;
}

const CityBuildings = ({ isMobile }: CityBuildingsProps) => {
  const buildings = useMemo(() => {
    const result: BuildingProps[] = [];
    
    if (isMobile) {
      // Mobile: fewer, smaller buildings
      for (let i = 0; i < 6; i++) {
        const height = Math.random() * 20 + 8;
        result.push({
          position: [-15 + i * 6, height / 2 - 15, -20 - Math.random() * 10],
          width: 2 + Math.random() * 1.5,
          height,
          depth: 2 + Math.random() * 1.5,
          simplified: true,
        });
      }
      // Background layer - minimal
      for (let i = 0; i < 5; i++) {
        const height = Math.random() * 25 + 12;
        result.push({
          position: [-12 + i * 6, height / 2 - 15, -30 - Math.random() * 5],
          width: 2.5 + Math.random() * 1.5,
          height,
          depth: 2.5 + Math.random() * 1.5,
          simplified: true,
        });
      }
    } else {
      // Desktop: full city
      // Left side buildings
      for (let i = 0; i < 12; i++) {
        const height = Math.random() * 30 + 10;
        result.push({
          position: [-25 + i * 4, height / 2 - 15, -15 - Math.random() * 20],
          width: 2 + Math.random() * 2,
          height,
          depth: 2 + Math.random() * 2,
        });
      }
      
      // Right side buildings
      for (let i = 0; i < 12; i++) {
        const height = Math.random() * 35 + 15;
        result.push({
          position: [-25 + i * 4, height / 2 - 15, -25 - Math.random() * 15],
          width: 2.5 + Math.random() * 2,
          height,
          depth: 2.5 + Math.random() * 2,
        });
      }
      
      // Background layer
      for (let i = 0; i < 15; i++) {
        const height = Math.random() * 40 + 20;
        result.push({
          position: [-30 + i * 4, height / 2 - 15, -40 - Math.random() * 10],
          width: 3 + Math.random() * 2,
          height,
          depth: 3 + Math.random() * 2,
        });
      }
    }
    
    return result;
  }, [isMobile]);

  return (
    <group>
      {buildings.map((building, i) => (
        <Building key={i} {...building} />
      ))}
    </group>
  );
};

interface FloatingParticlesProps {
  isMobile: boolean;
}

const FloatingParticles = ({ isMobile }: FloatingParticlesProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = isMobile ? 30 : 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 40 - 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 20;
    }
    return pos;
  }, [particleCount]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.2 : 0.15}
        color="#fbbf24"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

interface SceneProps {
  isMobile: boolean;
}

const Scene = ({ isMobile }: SceneProps) => {
  return (
    <>
      {/* Lighting - simplified on mobile */}
      <ambientLight intensity={isMobile ? 0.15 : 0.1} />
      <directionalLight position={[10, 20, 5]} intensity={0.3} color="#fbbf24" />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#f59e0b" distance={50} />
      {!isMobile && (
        <>
          <pointLight position={[-20, 5, -20]} intensity={0.3} color="#fbbf24" distance={30} />
          <pointLight position={[20, 5, -20]} intensity={0.3} color="#d4af37" distance={30} />
        </>
      )}
      
      {/* Fog for depth */}
      <fog attach="fog" args={["#000000", isMobile ? 20 : 30, isMobile ? 60 : 80]} />
      
      {/* Stars in background - fewer on mobile */}
      <Stars 
        radius={100} 
        depth={50} 
        count={isMobile ? 300 : 1000} 
        factor={isMobile ? 2 : 3} 
        saturation={0} 
        fade 
        speed={0.5} 
      />
      
      {/* City */}
      <CityBuildings isMobile={isMobile} />
      
      {/* Floating particles */}
      <FloatingParticles isMobile={isMobile} />
      
      {/* Ground plane with reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, -25]}>
        <planeGeometry args={[100, 60]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Gold horizon glow - skip Float animation on mobile */}
      {isMobile ? (
        <mesh position={[0, -10, -50]}>
          <sphereGeometry args={[30, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.03} side={THREE.BackSide} />
        </mesh>
      ) : (
        <Float speed={0.5} floatIntensity={0.5}>
          <mesh position={[0, -10, -50]}>
            <sphereGeometry args={[30, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.03} side={THREE.BackSide} />
          </mesh>
        </Float>
      )}
    </>
  );
};

// Light mode background component
const LightModeBackground = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <div className="absolute inset-0 -z-10">
      {/* Clean light gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-white to-gray-50" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(45 30% 70% / 0.3) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Gold accent circles */}
      <div className={`absolute top-0 left-1/4 rounded-full blur-[150px] pointer-events-none bg-amber-300/20 ${isMobile ? 'w-[250px] h-[250px]' : 'w-[500px] h-[500px]'}`} />
      <div className={`absolute bottom-1/4 right-1/4 rounded-full blur-[120px] pointer-events-none bg-yellow-300/15 ${isMobile ? 'w-[200px] h-[200px]' : 'w-[400px] h-[400px]'}`} />
      <div className={`absolute top-1/3 right-1/3 rounded-full blur-[100px] pointer-events-none bg-amber-200/20 ${isMobile ? 'w-[150px] h-[150px]' : 'w-[300px] h-[300px]'}`} />
      
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      
      {/* Corner accents - hidden on mobile */}
      {!isMobile && (
        <>
          <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
            <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-amber-400/40 to-transparent" />
            <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-amber-400/40 to-transparent" />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
            <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-amber-400/40 to-transparent" />
            <div className="absolute top-4 right-4 w-px h-16 bg-gradient-to-b from-amber-400/40 to-transparent" />
          </div>
        </>
      )}
    </div>
  );
};

// Dark mode background with 3D scene
const DarkModeBackground = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <div className="absolute inset-0 -z-10">
      {/* Dark base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />
      
      {/* 3D Canvas - lower DPR on mobile */}
      <Canvas
        camera={{ position: [0, 5, isMobile ? 30 : 25], fov: isMobile ? 50 : 60 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: !isMobile, alpha: true }}
        dpr={isMobile ? 1 : [1, 2]}
      >
        <Scene isMobile={isMobile} />
      </Canvas>
      
      {/* Gold accents overlay - smaller on mobile */}
      <div className={`absolute top-0 left-1/4 rounded-full blur-[120px] pointer-events-none bg-amber-500/5 ${isMobile ? 'w-[300px] h-[300px]' : 'w-[600px] h-[600px]'}`} />
      <div className={`absolute bottom-1/3 right-1/4 rounded-full blur-[100px] pointer-events-none bg-yellow-600/5 ${isMobile ? 'w-[250px] h-[250px]' : 'w-[500px] h-[500px]'}`} />
      
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      {/* Corner accents - hidden on mobile */}
      {!isMobile && (
        <>
          <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
            <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-amber-500/60 to-transparent" />
            <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-amber-500/60 to-transparent" />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
            <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-amber-500/60 to-transparent" />
            <div className="absolute top-4 right-4 w-px h-16 bg-gradient-to-b from-amber-500/60 to-transparent" />
          </div>
        </>
      )}
    </div>
  );
};

const CityScene3D = () => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  // Render light or dark background based on theme
  if (theme === "light") {
    return <LightModeBackground isMobile={isMobile} />;
  }
  
  return <DarkModeBackground isMobile={isMobile} />;
};

export default CityScene3D;
