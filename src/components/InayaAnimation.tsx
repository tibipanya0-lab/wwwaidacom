/**
 * InayaAnimation.tsx
 * Interaktív Three.js animáció – arany/fekete AI asszisztens avatar
 *
 * Állapotok:
 *   idle      – lebeg, arany körök lassan forognak
 *   searching – előredől, scanner beam söpör, fénysugarak lőnek ki
 *   results   – arany gömb jelenik meg, rajta a keresett termékek orbiting szövegként
 *
 * Használat:
 *   <InayaAnimation state="idle" className="w-full h-96" />
 *   <InayaAnimation state="results" products={["Nike Air Max", "Adidas Ultra"]} style={{ height: 480 }} />
 */

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AnimationState = "idle" | "searching" | "results";

interface Props {
  state?: AnimationState;
  products?: string[];
  className?: string;
  style?: React.CSSProperties;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  gold: "#FFD700",
  darkGold: "#B8860B",
  deepGold: "#8B6914",
  skin: "#4A2005",
  cloth: "#080812",
  hairColor: "#080008",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useLerp(ref: React.MutableRefObject<number>, target: number, speed = 0.05) {
  useFrame(() => {
    ref.current += (target - ref.current) * speed;
  });
}

// ─── AvatarHead ───────────────────────────────────────────────────────────────

function AvatarHead({ state }: { state: AnimationState }) {
  const eye1Ref = useRef<THREE.Mesh>(null);
  const eye2Ref = useRef<THREE.Mesh>(null);
  const pendantRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef(0.9);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const targetGlow =
      state === "searching" ? 2.2 : state === "results" ? 1.7 : 0.9;
    glowRef.current += (targetGlow - glowRef.current) * 0.04;

    [eye1Ref, eye2Ref].forEach((r) => {
      if (!r.current) return;
      (r.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        glowRef.current + Math.sin(t * 3) * 0.1;
    });

    if (pendantRef.current) pendantRef.current.rotation.y += delta * 0.8;

    if (crownRef.current) {
      const m = crownRef.current.material as THREE.MeshStandardMaterial;
      const base = state === "searching" ? 0.8 : state === "results" ? 0.6 : 0.35;
      m.emissiveIntensity = base + Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Head */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial color={C.skin} roughness={0.85} />
      </mesh>

      {/* Hair top */}
      <mesh position={[0, 2.14, 0]}>
        <sphereGeometry args={[0.395, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={C.hairColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Hair bun */}
      <mesh position={[0, 2.64, -0.14]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={C.hairColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Crown / headband */}
      <mesh ref={crownRef} position={[0, 2.22, 0]} rotation={[0.25, 0, 0]}>
        <torusGeometry args={[0.415, 0.026, 8, 48]} />
        <meshStandardMaterial
          color={C.gold} metalness={1} roughness={0.1}
          emissive={C.darkGold} emissiveIntensity={0.35}
        />
      </mesh>

      {/* Crown spikes */}
      {([-0.22, 0, 0.22] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 2.56, 0.29]} rotation={[-0.3, 0, 0]}>
          <coneGeometry args={[0.036, 0.16, 6]} />
          <meshStandardMaterial color={C.gold} metalness={1} roughness={0.1} emissive={C.gold} emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Neck */}
      <mesh position={[0, 1.78, 0]}>
        <cylinderGeometry args={[0.11, 0.14, 0.29, 16]} />
        <meshStandardMaterial color={C.skin} roughness={0.85} />
      </mesh>

      {/* Necklace */}
      <mesh position={[0, 1.6, 0]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.27, 0.022, 8, 32]} />
        <meshStandardMaterial color={C.gold} metalness={1} roughness={0.1} emissive={C.darkGold} emissiveIntensity={0.5} />
      </mesh>

      {/* Pendant gem */}
      <mesh ref={pendantRef} position={[0, 1.42, 0.22]}>
        <octahedronGeometry args={[0.075]} />
        <meshStandardMaterial color={C.gold} metalness={1} roughness={0.05} emissive={C.gold} emissiveIntensity={0.7} />
      </mesh>

      {/* Eyes */}
      <mesh ref={eye1Ref} position={[-0.13, 2.1, 0.335]}>
        <sphereGeometry args={[0.056, 8, 8]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.9} />
      </mesh>
      <mesh ref={eye2Ref} position={[0.13, 2.1, 0.335]}>
        <sphereGeometry args={[0.056, 8, 8]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.9} />
      </mesh>

      {/* Earrings */}
      {([-0.4, 0.4] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 2.0, 0.14]}>
          <sphereGeometry args={[0.052, 8, 8]} />
          <meshStandardMaterial color={C.gold} metalness={1} roughness={0.05} emissive={C.gold} emissiveIntensity={0.75} />
        </mesh>
      ))}
    </group>
  );
}

// ─── AvatarBody ───────────────────────────────────────────────────────────────

function AvatarBody() {
  return (
    <group>
      {/* Shoulders */}
      {([-0.62, 0.62] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.57, 0]}>
          <sphereGeometry args={[0.24, 16, 16]} />
          <meshStandardMaterial color={C.cloth} metalness={0.3} roughness={0.7} emissive="#080820" emissiveIntensity={0.1} />
        </mesh>
      ))}

      {/* Torso */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.3, 0.43, 0.9, 16]} />
        <meshStandardMaterial color={C.cloth} metalness={0.3} roughness={0.7} emissive="#08082a" emissiveIntensity={0.12} />
      </mesh>

      {/* Dress gold trim */}
      <mesh position={[0, 1.48, 0]}>
        <torusGeometry args={[0.315, 0.019, 6, 32]} />
        <meshStandardMaterial color={C.gold} metalness={1} roughness={0.1} emissive={C.darkGold} emissiveIntensity={0.4} />
      </mesh>

      {/* Arms */}
      {([[-0.79, 1.3, 0.05, 0.19], [0.79, 1.3, 0.05, -0.19]] as number[][]).map((cfg, i) => (
        <mesh key={i} position={[cfg[0], cfg[1], cfg[2]]} rotation={[0, 0, cfg[3]]}>
          <cylinderGeometry args={[0.1, 0.09, 0.56, 12]} />
          <meshStandardMaterial color={C.skin} roughness={0.85} />
        </mesh>
      ))}

      {/* Arm cuffs */}
      {([[-0.9, 1.1, 0.05, 0.19], [0.9, 1.1, 0.05, -0.19]] as number[][]).map((cfg, i) => (
        <mesh key={i} position={[cfg[0], cfg[1], cfg[2]]} rotation={[0, 0, cfg[3]]}>
          <torusGeometry args={[0.107, 0.026, 8, 24]} />
          <meshStandardMaterial color={C.gold} metalness={1} roughness={0.1} emissive={C.darkGold} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─── OrbitalRings ─────────────────────────────────────────────────────────────

function OrbitalRings({ state }: { state: AnimationState }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const speedRef = useRef(0.3);

  const configs = useMemo(
    () => [
      { r: 2.05, tube: 0.032, color: C.gold,     rx: 0,    rz: 0    },
      { r: 2.35, tube: 0.026, color: C.darkGold,  rx: 1.05, rz: 0.52 },
      { r: 2.65, tube: 0.021, color: C.deepGold,  rx: 2.1,  rz: 1.05 },
    ],
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const target =
      state === "searching" ? 2.4 : state === "results" ? 1.1 : 0.3;
    speedRef.current += (target - speedRef.current) * 0.035;

    refs.current.forEach((ring, i) => {
      if (!ring) return;
      const dir = i % 2 === 0 ? 1 : -1;
      ring.rotation.y += speedRef.current * delta * dir;
      ring.rotation.x += speedRef.current * delta * 0.7 * dir;
      const m = ring.material as THREE.MeshStandardMaterial;
      const pulse = Math.sin(t * 1.8 + i * 2.1) * 0.12;
      m.emissiveIntensity = 0.3 + pulse + (speedRef.current - 0.3) * 0.12;
      m.opacity = 0.75 + pulse * 0.5;
    });
  });

  return (
    <>
      {configs.map((cfg, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          rotation={[cfg.rx, 0, cfg.rz]}
          position={[0, 1.5, 0]}
        >
          <torusGeometry args={[cfg.r, cfg.tube, 8, 64]} />
          <meshStandardMaterial
            color={cfg.color} metalness={1} roughness={0.1}
            emissive={cfg.color} emissiveIntensity={0.32}
            transparent opacity={0.82}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── ScannerEffect ────────────────────────────────────────────────────────────

function ScannerEffect({ state }: { state: AnimationState }) {
  const scannerRef = useRef<THREE.Mesh>(null);
  const streakRefs = useRef<(THREE.Mesh | null)[]>([]);
  const opacityRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const targetOp = state === "searching" ? 0.85 : 0;
    opacityRef.current += (targetOp - opacityRef.current) * 0.05;

    if (scannerRef.current) {
      const m = scannerRef.current.material as THREE.MeshStandardMaterial;
      m.opacity = opacityRef.current;
      scannerRef.current.rotation.y = t * 2.8;
      scannerRef.current.position.y = 1.5 + Math.sin(t * 1.6) * 0.9;
    }

    streakRefs.current.forEach((s, i) => {
      if (!s) return;
      const m = s.material as THREE.MeshStandardMaterial;
      m.opacity = opacityRef.current * (0.35 + Math.sin(t * 5 + i * 1.1) * 0.35);
      s.rotation.y = (i / 6) * Math.PI * 2 + t * 0.9;
    });
  });

  return (
    <>
      {/* Main scanner ring */}
      <mesh ref={scannerRef} position={[0, 1.5, 0]}>
        <torusGeometry args={[2.9, 0.065, 6, 64]} />
        <meshStandardMaterial
          color={C.gold} emissive={C.gold} emissiveIntensity={1.8}
          transparent opacity={0} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Radial light streaks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { streakRefs.current[i] = el; }}
          position={[0, 1.5, 0]}
          rotation={[0, (i / 6) * Math.PI * 2, 0]}
        >
          <boxGeometry args={[0.018, 0.04, 3.2]} />
          <meshStandardMaterial
            color={C.gold} emissive={C.gold} emissiveIntensity={2.5}
            transparent opacity={0} depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── ResultsOrb ───────────────────────────────────────────────────────────────

function ResultsOrb({
  state,
  products,
}: {
  state: AnimationState;
  products: string[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0);

  const labels = products.length > 0
    ? products.slice(0, 6)
    : ["AI Keresés", "Termékek", "Legjobb ár", "Inaya.hu", "Találatok", "Boltok"];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const target = state === "results" ? 1 : 0;
    scaleRef.current += (target - scaleRef.current) * 0.04;
    const s = scaleRef.current;

    if (groupRef.current) groupRef.current.scale.setScalar(s);

    if (orbRef.current) {
      orbRef.current.rotation.y = t * 0.45;
      orbRef.current.rotation.z = Math.sin(t * 0.4) * 0.08;
      const m = orbRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.5 + Math.sin(t * 1.8) * 0.15;
    }

    if (orbitRef.current) orbitRef.current.rotation.y = t * 0.38;

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 1.2;
      const m = ringRef.current.material as THREE.MeshStandardMaterial;
      m.opacity = s * 0.6;
    }
  });

  return (
    <group ref={groupRef} position={[0, 3.85, 0]}>
      {/* Main orb */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.78, 32, 32]} />
        <meshStandardMaterial
          color={C.deepGold} metalness={1} roughness={0.05}
          emissive={C.gold} emissiveIntensity={0.5}
        />
      </mesh>

      {/* Equatorial ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.018, 6, 64]} />
        <meshStandardMaterial
          color={C.gold} emissive={C.gold} emissiveIntensity={0.8}
          transparent opacity={0} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Polar ring */}
      <mesh>
        <torusGeometry args={[1.2, 0.012, 6, 64]} />
        <meshStandardMaterial
          color={C.darkGold} emissive={C.darkGold} emissiveIntensity={0.5}
          transparent opacity={0.5} depthWrite={false}
        />
      </mesh>

      {/* Orbiting product labels */}
      <group ref={orbitRef}>
        {labels.map((label, i) => {
          const angle = (i / labels.length) * Math.PI * 2;
          const r = 2.05;
          const y = Math.sin(i * 0.95) * 0.55;
          return (
            <Text
              key={`${label}-${i}`}
              position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}
              fontSize={0.17}
              color={C.gold}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.006}
              outlineColor={C.deepGold}
              fillOpacity={1}
            >
              {label}
            </Text>
          );
        })}
      </group>
    </group>
  );
}

// ─── GroundGlow ───────────────────────────────────────────────────────────────

function GroundGlow({ state }: { state: AnimationState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const intensityRef = useRef(0.08);

  useFrame(({ clock }) => {
    const target =
      state === "searching" ? 0.18 : state === "results" ? 0.14 : 0.07;
    intensityRef.current += (target - intensityRef.current) * 0.04;
    if (meshRef.current) {
      const m = meshRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = intensityRef.current;
      m.opacity = 0.12 + intensityRef.current * 0.8;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <circleGeometry args={[3.8, 64]} />
      <meshStandardMaterial
        color={C.gold} emissive={C.gold} emissiveIntensity={0.08}
        transparent opacity={0.12} depthWrite={false}
      />
    </mesh>
  );
}

// ─── DynamicLighting ──────────────────────────────────────────────────────────

function DynamicLighting({ state }: { state: AnimationState }) {
  const keyRef = useRef<THREE.PointLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const intensityRef = useRef(2);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const targetInt =
      state === "searching" ? 3.5 : state === "results" ? 2.8 : 2.0;
    intensityRef.current += (targetInt - intensityRef.current) * 0.04;

    if (keyRef.current) {
      keyRef.current.intensity = intensityRef.current;
      keyRef.current.position.x = 2 + Math.sin(t * 0.5) * 0.6;
      keyRef.current.position.z = 3 + Math.cos(t * 0.35) * 0.6;
    }
    if (fillRef.current) {
      fillRef.current.intensity = state === "searching" ? 1.2 : 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#111122" />
      <pointLight ref={keyRef} position={[2, 5, 3]} color="#FFD700" distance={18} />
      <pointLight ref={fillRef} position={[-3, 2, 2]} color="#4455ff" intensity={0.5} distance={12} />
      <pointLight position={[0, 4, -3]} color="#FFD700" intensity={0.9} distance={9} />
    </>
  );
}

// ─── Figure with Float ────────────────────────────────────────────────────────

function Figure({ state }: { state: AnimationState }) {
  const groupRef = useRef<THREE.Group>(null);
  const tiltRef = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const tgt = state === "searching" ? 0.14 : 0;
    tiltRef.current += (tgt - tiltRef.current) * 0.04;
    groupRef.current.rotation.x = tiltRef.current;
    groupRef.current.rotation.y = Math.sin(Date.now() * 0.00028) * 0.09;
  });

  return (
    <Float speed={1.1} rotationIntensity={0} floatIntensity={0.28}>
      <group ref={groupRef}>
        <AvatarHead state={state} />
        <AvatarBody />
      </group>
    </Float>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function Scene({
  state,
  products,
}: {
  state: AnimationState;
  products: string[];
}) {
  const sparkleSpeed = state === "searching" ? 0.9 : state === "results" ? 0.5 : 0.18;
  const sparkleCount = state === "results" ? 180 : 110;

  return (
    <>
      <DynamicLighting state={state} />

      <Figure state={state} />
      <OrbitalRings state={state} />

      <Sparkles
        count={sparkleCount}
        scale={7.5}
        size={1.6}
        speed={sparkleSpeed}
        color={C.gold}
        opacity={0.55}
        noise={0.35}
      />

      <ScannerEffect state={state} />
      <ResultsOrb state={state} products={products} />
      <GroundGlow state={state} />
    </>
  );
}

// ─── InayaAnimation (export) ──────────────────────────────────────────────────

export default function InayaAnimation({
  state = "idle",
  products = [],
  className,
  style,
}: Props) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(180deg, #030308 0%, #06060f 60%, #0a0a05 100%)",
        borderRadius: "1.25rem",
        overflow: "hidden",
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 1.85, 5.6], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
        }}
        dpr={[1, 2]}
      >
        <Scene state={state} products={products} />
      </Canvas>
    </div>
  );
}
