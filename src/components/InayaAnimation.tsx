/**
 * InayaAnimation.tsx
 * Interaktív Three.js animáció – stilizált arany AI asszisztens avatar
 *
 * Karakter stílus: meleg olivás bőr, sötét simított haj, arany spirál fülbevaló,
 *   piros ajkak, borostyán/arany szemek, fekete gallér – arany dramatikus megvilágítás
 *
 * Állapotok:
 *   idle      – lebeg, arany körök lassan forognak
 *   searching – előredől, scanner beam söpör, fénysugarak lőnek ki
 *   results   – arany gömb jelenik meg, rajta a keresett termékek
 */

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";

export type AnimationState = "idle" | "searching" | "results";

interface Props {
  state?: AnimationState;
  products?: string[];
  className?: string;
  style?: React.CSSProperties;
}

// ─── Colour palette (matching the reference image) ───────────────────────────

const C = {
  // Skin – warm olive/tan
  skin:        "#C8784A",
  skinLight:   "#D4895A",
  skinShadow:  "#9A5A28",
  // Hair – very dark brown, almost black
  hair:        "#140800",
  hairSheen:   "#2A1000",
  // Gold jewellery
  gold:        "#FFD060",
  darkGold:    "#C49A20",
  deepGold:    "#8B6914",
  // Clothing
  cloth:       "#060610",
  clothAccent: "#0E0E24",
  // Face features
  lipRed:      "#8B1520",
  lipLight:    "#B02030",
  eyeWhite:    "#EEE8DC",
  iris:        "#B06020",
  irisDeep:    "#7A3A10",
  pupil:       "#060204",
  eyeBrow:     "#1A0800",
} as const;

// ─── AvatarFace ───────────────────────────────────────────────────────────────
// Detailed head: proper face features matching the reference image

function AvatarFace({ state }: { state: AnimationState }) {
  const irisL = useRef<THREE.Mesh>(null);
  const irisR = useRef<THREE.Mesh>(null);
  const earringSpinL = useRef<THREE.Group>(null);
  const earringSpinR = useRef<THREE.Group>(null);
  const lipGlowRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Iris subtle glow pulse
    const irisIntensity =
      state === "searching" ? 1.4 + Math.sin(t * 4) * 0.3
      : state === "results"  ? 1.0 + Math.sin(t * 2) * 0.2
      :                        0.35 + Math.sin(t * 1.2) * 0.05;

    [irisL, irisR].forEach((r) => {
      if (!r.current) return;
      const m = r.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity += (irisIntensity - m.emissiveIntensity) * 0.06;
    });

    // Lip subtle glow
    const targetLip = state === "idle" ? 0.15 : 0.05;
    lipGlowRef.current += (targetLip - lipGlowRef.current) * 0.04;

    // Earring slow spin
    if (earringSpinL.current) earringSpinL.current.rotation.y = t * 0.4;
    if (earringSpinR.current) earringSpinR.current.rotation.y = t * 0.4;
  });

  return (
    <group>
      {/* ── Head (slightly oval – face shape) ── */}
      <mesh position={[0, 2.08, 0]} scale={[1, 1.04, 0.92]}>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshStandardMaterial
          color={C.skin} roughness={0.75} metalness={0.05}
        />
      </mesh>

      {/* ── Hair – top cap swept back ── */}
      <mesh position={[0, 2.16, -0.04]} scale={[1.01, 0.96, 0.94]}>
        <sphereGeometry args={[0.425, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshStandardMaterial color={C.hair} roughness={0.85} metalness={0.12} />
      </mesh>

      {/* Hair sides (two sleek panels framing the face) */}
      {([-1, 1] as (-1|1)[]).map((side, i) => (
        <mesh key={i} position={[side * 0.36, 1.98, 0.04]} scale={[0.28, 0.72, 0.22]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color={C.hair} roughness={0.85} metalness={0.12} />
        </mesh>
      ))}

      {/* Hair back flow (goes down to shoulders) */}
      <mesh position={[0, 1.75, -0.32]} scale={[0.72, 1, 0.35]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={C.hair} roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.4, -0.28]} scale={[0.58, 0.9, 0.28]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={C.hair} roughness={0.85} metalness={0.1} />
      </mesh>

      {/* ── Eyebrows – thin dark arcs ── */}
      {/* Left eyebrow */}
      <mesh position={[-0.145, 2.26, 0.36]} rotation={[0, -0.08, 0.22]}>
        <boxGeometry args={[0.155, 0.018, 0.012]} />
        <meshStandardMaterial color={C.eyeBrow} roughness={0.9} />
      </mesh>
      {/* Right eyebrow */}
      <mesh position={[0.145, 2.26, 0.36]} rotation={[0, 0.08, -0.22]}>
        <boxGeometry args={[0.155, 0.018, 0.012]} />
        <meshStandardMaterial color={C.eyeBrow} roughness={0.9} />
      </mesh>

      {/* ── Eyes – 3-layer: white + iris + pupil ── */}
      {/* Left eye */}
      <group position={[-0.145, 2.13, 0.355]}>
        {/* White */}
        <mesh scale={[1.15, 0.85, 0.6]}>
          <sphereGeometry args={[0.068, 16, 16]} />
          <meshStandardMaterial color={C.eyeWhite} roughness={0.5} />
        </mesh>
        {/* Iris */}
        <mesh ref={irisL} position={[0, 0, 0.03]} scale={[0.85, 0.85, 0.5]}>
          <sphereGeometry args={[0.056, 16, 16]} />
          <meshStandardMaterial
            color={C.iris} emissive={C.iris} emissiveIntensity={0.35} roughness={0.3}
          />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, 0.055]} scale={[0.62, 0.62, 0.4]}>
          <sphereGeometry args={[0.052, 12, 12]} />
          <meshStandardMaterial color={C.pupil} roughness={0.2} />
        </mesh>
        {/* Eyelid upper shadow */}
        <mesh position={[0, 0.028, 0.038]} rotation={[0.3, 0, 0]} scale={[1.18, 0.35, 0.4]}>
          <sphereGeometry args={[0.065, 12, 8]} />
          <meshStandardMaterial color={C.skinShadow} roughness={0.9} transparent opacity={0.55} />
        </mesh>
      </group>

      {/* Right eye */}
      <group position={[0.145, 2.13, 0.355]}>
        <mesh scale={[1.15, 0.85, 0.6]}>
          <sphereGeometry args={[0.068, 16, 16]} />
          <meshStandardMaterial color={C.eyeWhite} roughness={0.5} />
        </mesh>
        <mesh ref={irisR} position={[0, 0, 0.03]} scale={[0.85, 0.85, 0.5]}>
          <sphereGeometry args={[0.056, 16, 16]} />
          <meshStandardMaterial
            color={C.iris} emissive={C.iris} emissiveIntensity={0.35} roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0, 0.055]} scale={[0.62, 0.62, 0.4]}>
          <sphereGeometry args={[0.052, 12, 12]} />
          <meshStandardMaterial color={C.pupil} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.028, 0.038]} rotation={[0.3, 0, 0]} scale={[1.18, 0.35, 0.4]}>
          <sphereGeometry args={[0.065, 12, 8]} />
          <meshStandardMaterial color={C.skinShadow} roughness={0.9} transparent opacity={0.55} />
        </mesh>
      </group>

      {/* ── Nose – subtle bump ── */}
      <mesh position={[0, 2.02, 0.39]} scale={[0.55, 0.8, 0.55]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color={C.skin} roughness={0.8} />
      </mesh>
      {/* Nose tip highlight */}
      <mesh position={[0, 1.99, 0.415]} scale={[0.55, 0.45, 0.45]}>
        <sphereGeometry args={[0.038, 10, 10]} />
        <meshStandardMaterial color={C.skinLight} roughness={0.7} />
      </mesh>

      {/* ── Lips ── */}
      {/* Upper lip */}
      <mesh position={[0, 1.93, 0.38]} scale={[1, 0.52, 0.72]}>
        <sphereGeometry args={[0.076, 16, 10]} />
        <meshStandardMaterial color={C.lipRed} roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Lower lip (slightly larger) */}
      <mesh position={[0, 1.896, 0.39]} scale={[1.05, 0.62, 0.75]}>
        <sphereGeometry args={[0.082, 16, 10]} />
        <meshStandardMaterial
          color={C.lipLight} emissive={C.lipRed}
          emissiveIntensity={0.12} roughness={0.45} metalness={0.1}
        />
      </mesh>

      {/* ── Neck ── */}
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.125, 0.155, 0.32, 20]} />
        <meshStandardMaterial color={C.skin} roughness={0.8} metalness={0.04} />
      </mesh>

      {/* ── Black collar ── */}
      <mesh position={[0, 1.58, 0]}>
        <cylinderGeometry args={[0.175, 0.20, 0.14, 20]} />
        <meshStandardMaterial color={C.cloth} metalness={0.4} roughness={0.6} emissive="#050518" emissiveIntensity={0.2} />
      </mesh>
      {/* Collar gold trim top */}
      <mesh position={[0, 1.655, 0]}>
        <torusGeometry args={[0.178, 0.016, 6, 32]} />
        <meshStandardMaterial color={C.gold} metalness={1} roughness={0.08} emissive={C.darkGold} emissiveIntensity={0.5} />
      </mesh>
      {/* Collar gold trim bottom */}
      <mesh position={[0, 1.51, 0]}>
        <torusGeometry args={[0.202, 0.012, 6, 32]} />
        <meshStandardMaterial color={C.gold} metalness={1} roughness={0.08} emissive={C.darkGold} emissiveIntensity={0.4} />
      </mesh>

      {/* ── Gold spiral earrings (both sides) ── */}
      {([-1, 1] as (-1|1)[]).map((side, i) => (
        <group key={i} ref={side === -1 ? earringSpinL : earringSpinR}
          position={[side * 0.43, 2.04, 0.06]}>
          {/* Main spiral ring – large outer */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.095, 0.016, 8, 40]} />
            <meshStandardMaterial color={C.gold} metalness={1} roughness={0.06} emissive={C.gold} emissiveIntensity={0.55} />
          </mesh>
          {/* Inner coil */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
            <torusGeometry args={[0.058, 0.01, 6, 32]} />
            <meshStandardMaterial color={C.gold} metalness={1} roughness={0.06} emissive={C.gold} emissiveIntensity={0.4} />
          </mesh>
          {/* Pendant drop */}
          <mesh position={[0, -0.14, 0]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color={C.gold} metalness={1} roughness={0.05} emissive={C.gold} emissiveIntensity={0.7} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.08, 6]} />
            <meshStandardMaterial color={C.darkGold} metalness={1} roughness={0.1} />
          </mesh>
        </group>
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
        <mesh key={i} position={[x, 1.48, 0]}>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color={C.cloth} metalness={0.35} roughness={0.65} emissive="#060620" emissiveIntensity={0.12} />
        </mesh>
      ))}

      {/* Torso */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.31, 0.44, 0.88, 18]} />
        <meshStandardMaterial color={C.cloth} metalness={0.35} roughness={0.65} emissive="#060620" emissiveIntensity={0.12} />
      </mesh>

      {/* Chest gold accent lines */}
      {[-0.1, 0, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 1.35, 0.29]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.025, 0.22, 0.008]} />
          <meshStandardMaterial color={C.gold} metalness={1} roughness={0.1} emissive={C.darkGold} emissiveIntensity={0.35} />
        </mesh>
      ))}

      {/* Dress gold trim */}
      <mesh position={[0, 1.44, 0]}>
        <torusGeometry args={[0.32, 0.019, 6, 32]} />
        <meshStandardMaterial color={C.gold} metalness={1} roughness={0.1} emissive={C.darkGold} emissiveIntensity={0.4} />
      </mesh>

      {/* Arms – olive skin */}
      {([[-0.80, 1.28, 0.05, 0.19], [0.80, 1.28, 0.05, -0.19]] as number[][]).map((cfg, i) => (
        <mesh key={i} position={[cfg[0], cfg[1], cfg[2]]} rotation={[0, 0, cfg[3]]}>
          <cylinderGeometry args={[0.1, 0.09, 0.56, 14]} />
          <meshStandardMaterial color={C.skin} roughness={0.78} metalness={0.04} />
        </mesh>
      ))}

      {/* Arm gold cuffs */}
      {([[-0.91, 1.08, 0.05, 0.19], [0.91, 1.08, 0.05, -0.19]] as number[][]).map((cfg, i) => (
        <mesh key={i} position={[cfg[0], cfg[1], cfg[2]]} rotation={[0, 0, cfg[3]]}>
          <torusGeometry args={[0.108, 0.026, 8, 24]} />
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
      { r: 2.38, tube: 0.026, color: C.darkGold,  rx: 1.05, rz: 0.52 },
      { r: 2.7,  tube: 0.020, color: C.deepGold,  rx: 2.1,  rz: 1.05 },
    ],
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const target = state === "searching" ? 2.4 : state === "results" ? 1.1 : 0.3;
    speedRef.current += (target - speedRef.current) * 0.035;

    refs.current.forEach((ring, i) => {
      if (!ring) return;
      const dir = i % 2 === 0 ? 1 : -1;
      ring.rotation.y += speedRef.current * delta * dir;
      ring.rotation.x += speedRef.current * delta * 0.7 * dir;
      const m = ring.material as THREE.MeshStandardMaterial;
      const pulse = Math.sin(t * 1.8 + i * 2.1) * 0.12;
      m.emissiveIntensity = 0.28 + pulse + (speedRef.current - 0.3) * 0.1;
      m.opacity = 0.75 + pulse * 0.4;
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
            emissive={cfg.color} emissiveIntensity={0.3}
            transparent opacity={0.8}
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
      <mesh ref={scannerRef} position={[0, 1.5, 0]}>
        <torusGeometry args={[2.9, 0.065, 6, 64]} />
        <meshStandardMaterial
          color={C.gold} emissive={C.gold} emissiveIntensity={1.8}
          transparent opacity={0} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} ref={(el) => { streakRefs.current[i] = el; }}
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

function ResultsOrb({ state, products }: { state: AnimationState; products: string[] }) {
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
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.78, 32, 32]} />
        <meshStandardMaterial
          color={C.deepGold} metalness={1} roughness={0.05}
          emissive={C.gold} emissiveIntensity={0.5}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.018, 6, 64]} />
        <meshStandardMaterial
          color={C.gold} emissive={C.gold} emissiveIntensity={0.8}
          transparent opacity={0} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[1.2, 0.012, 6, 64]} />
        <meshStandardMaterial color={C.darkGold} emissive={C.darkGold} emissiveIntensity={0.5} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <group ref={orbitRef}>
        {labels.map((label, i) => {
          const angle = (i / labels.length) * Math.PI * 2;
          return (
            <Text
              key={`${label}-${i}`}
              position={[Math.cos(angle) * 2.05, Math.sin(i * 0.95) * 0.55, Math.sin(angle) * 2.05]}
              fontSize={0.17}
              color={C.gold}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.006}
              outlineColor={C.deepGold}
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
  const intensityRef = useRef(0.07);

  useFrame(() => {
    const target = state === "searching" ? 0.18 : state === "results" ? 0.14 : 0.07;
    intensityRef.current += (target - intensityRef.current) * 0.04;
    if (meshRef.current) {
      const m = meshRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = intensityRef.current;
      m.opacity = 0.1 + intensityRef.current * 0.9;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <circleGeometry args={[3.8, 64]} />
      <meshStandardMaterial
        color={C.gold} emissive={C.gold} emissiveIntensity={0.07}
        transparent opacity={0.1} depthWrite={false}
      />
    </mesh>
  );
}

// ─── DynamicLighting – dramatic amber side lighting matching the reference ─────

function DynamicLighting({ state }: { state: AnimationState }) {
  const keyLRef = useRef<THREE.PointLight>(null);
  const keyRRef = useRef<THREE.PointLight>(null);
  const rimRef  = useRef<THREE.PointLight>(null);
  const faceRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Key lights pulse warmly
    const baseInt = state === "searching" ? 3.5 : state === "results" ? 2.8 : 2.2;
    const pulse = Math.sin(t * 0.8) * 0.2;

    if (keyLRef.current) {
      keyLRef.current.intensity = baseInt + pulse;
      // Orbits slightly for cinematic movement
      keyLRef.current.position.x = -2.4 + Math.sin(t * 0.25) * 0.3;
    }
    if (keyRRef.current) {
      keyRRef.current.intensity = baseInt * 0.85 + pulse;
      keyRRef.current.position.x = 2.4 + Math.cos(t * 0.2) * 0.3;
    }
    if (rimRef.current) {
      rimRef.current.intensity = state === "searching" ? 2.0 : 0.9;
    }
    if (faceRef.current) {
      faceRef.current.intensity = 0.6 + Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <>
      {/* Ambient – very dim so gold lights dominate */}
      <ambientLight intensity={0.25} color="#180d04" />

      {/* Left amber key light (like the image – warm side fill) */}
      <pointLight
        ref={keyLRef}
        position={[-2.4, 2.8, 2.2]}
        color="#FF9020"
        intensity={2.2}
        distance={12}
      />

      {/* Right amber key light */}
      <pointLight
        ref={keyRRef}
        position={[2.4, 2.8, 2.0]}
        color="#FFA030"
        intensity={1.9}
        distance={12}
      />

      {/* Top rim light – golden */}
      <pointLight
        ref={rimRef}
        position={[0, 5.5, -1.5]}
        color="#FFD060"
        intensity={0.9}
        distance={10}
      />

      {/* Face fill – soft warm */}
      <pointLight
        ref={faceRef}
        position={[0, 2.1, 3.5]}
        color="#FF8810"
        intensity={0.6}
        distance={6}
      />

      {/* Cool blue back light for depth */}
      <pointLight
        position={[0, 1.5, -4]}
        color="#2244AA"
        intensity={0.35}
        distance={8}
      />
    </>
  );
}

// ─── Figure with Float ────────────────────────────────────────────────────────

function Figure({ state }: { state: AnimationState }) {
  const groupRef = useRef<THREE.Group>(null);
  const tiltRef  = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const tgt = state === "searching" ? 0.13 : 0;
    tiltRef.current += (tgt - tiltRef.current) * 0.04;
    groupRef.current.rotation.x = tiltRef.current;
    groupRef.current.rotation.y = Math.sin(Date.now() * 0.00025) * 0.07;
  });

  return (
    <Float speed={1.1} rotationIntensity={0} floatIntensity={0.25}>
      <group ref={groupRef}>
        <AvatarFace state={state} />
        <AvatarBody />
      </group>
    </Float>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function Scene({ state, products }: { state: AnimationState; products: string[] }) {
  const sparkleSpeed = state === "searching" ? 0.9 : state === "results" ? 0.5 : 0.15;

  return (
    <>
      <DynamicLighting state={state} />
      <Figure state={state} />
      <OrbitalRings state={state} />
      <Sparkles
        count={100}
        scale={7.5}
        size={1.4}
        speed={sparkleSpeed}
        color={C.gold}
        opacity={0.5}
        noise={0.3}
      />
      <ScannerEffect state={state} />
      <ResultsOrb state={state} products={products} />
      <GroundGlow state={state} />
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

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
        background:
          "linear-gradient(180deg, #080402 0%, #0c0804 55%, #0a0a0a 100%)",
        borderRadius: "1.25rem",
        overflow: "hidden",
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 2.0, 5.2], fov: 48 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        dpr={[1, 2]}
      >
        <Scene state={state} products={products} />
      </Canvas>
    </div>
  );
}
