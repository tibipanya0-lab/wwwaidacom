import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

interface BuildingProps {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
}

const Building = ({ position, width, height, depth }: BuildingProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate random window pattern
  const windowTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    
    // Building base color
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 64, 128);
    
    // Windows
    const windowWidth = 8;
    const windowHeight = 10;
    const cols = 5;
    const rows = 10;
    const gapX = (64 - cols * windowWidth) / (cols + 1);
    const gapY = (128 - rows * windowHeight) / (rows + 1);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isLit = Math.random() > 0.4;
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
  }, [height]);

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
      {/* Top accent */}
      <mesh position={[0, height / 2 + 0.1, 0]}>
        <boxGeometry args={[width + 0.2, 0.2, depth + 0.2]} />
        <meshStandardMaterial color="#d4af37" emissive="#fbbf24" emissiveIntensity={0.3} />
      </mesh>
      {/* Antenna for tall buildings */}
      {height > 25 && (
        <mesh position={[0, height / 2 + 3, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 6, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      )}
    </mesh>
  );
};

const CityBuildings = () => {
  const buildings = useMemo(() => {
    const result: BuildingProps[] = [];
    
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
    
    return result;
  }, []);

  return (
    <group>
      {buildings.map((building, i) => (
        <Building key={i} {...building} />
      ))}
    </group>
  );
};

const FloatingParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 40 - 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 20;
    }
    return pos;
  }, []);

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
        size={0.15}
        color="#fbbf24"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

const Scene = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 20, 5]} intensity={0.3} color="#fbbf24" />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#f59e0b" distance={50} />
      <pointLight position={[-20, 5, -20]} intensity={0.3} color="#fbbf24" distance={30} />
      <pointLight position={[20, 5, -20]} intensity={0.3} color="#d4af37" distance={30} />
      
      {/* Fog for depth */}
      <fog attach="fog" args={["#000000", 30, 80]} />
      
      {/* Stars in background */}
      <Stars radius={100} depth={50} count={1000} factor={3} saturation={0} fade speed={0.5} />
      
      {/* City */}
      <CityBuildings />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Ground plane with reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, -25]}>
        <planeGeometry args={[100, 60]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Gold horizon glow */}
      <Float speed={0.5} floatIntensity={0.5}>
        <mesh position={[0, -10, -50]}>
          <sphereGeometry args={[30, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.03} side={THREE.BackSide} />
        </mesh>
      </Float>
    </>
  );
};

const CityScene3D = () => {
  return (
    <div className="absolute inset-0 -z-10">
      {/* Dark base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 5, 25], fov: 60 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      
      {/* Gold accents overlay */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
        <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-amber-500/60 to-transparent" />
        <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-amber-500/60 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
        <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-amber-500/60 to-transparent" />
        <div className="absolute top-4 right-4 w-px h-16 bg-gradient-to-b from-amber-500/60 to-transparent" />
      </div>
    </div>
  );
};

export default CityScene3D;
