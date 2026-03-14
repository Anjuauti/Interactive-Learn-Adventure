import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

const Water = ({ flow }: { flow: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    meshRef.current.position.y = 0.2 + Math.sin(clock.elapsedTime) * 0.1;
  });
  return (
    <mesh ref={meshRef} position={[-17, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[22, 18, 16, 16]} />
      <meshStandardMaterial color="#1e90ff" transparent opacity={0.7} roughness={0.1} metalness={0.1} />
    </mesh>
  );
};

const FlowParticles = ({ flow }: { flow: number }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(150 * 3);
    for (let i = 0; i < 150 * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2;
      positions[i + 1] = (Math.random() - 0.5) * 1.5;
      positions[i + 2] = (Math.random() - 0.5) * 1.5;
    }
    return positions;
  }, []);

  useFrame(() => {
    if (!pointsRef.current || flow === 0) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i] += (flow / 100) * 0.12;
      if (pos[i] > 4) pos[i] = -4;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={[-2, 1.5, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={150} array={particlesPosition} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#aaddff" size={0.18} transparent opacity={0.9} />
    </points>
  );
};

const Turbine = ({ flow }: { flow: number }) => {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z -= (flow / 100) * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={[5, 1.5, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 1.8, 20]} />
        <meshStandardMaterial color="#e8a020" metalness={0.7} roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} rotation={[0, 0, (Math.PI * 2 / 6) * i]}>
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[0.22, 3.2, 0.7]} />
            <meshStandardMaterial color="#cc8810" metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Generator = ({ flow }: { flow: number }) => {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(() => {
    if (matRef.current) {
      if (flow >= 50 && flow <= 75) {
        matRef.current.emissive.setHex(0x22bb44);
        matRef.current.emissiveIntensity = 0.8;
      } else if (flow > 75) {
        matRef.current.emissive.setHex(0xff2200);
        matRef.current.emissiveIntensity = 1.0;
      } else {
        matRef.current.emissive.setHex(0x000000);
        matRef.current.emissiveIntensity = 0;
      }
    }
  });

  return (
    <mesh position={[9.5, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.2, 1.2, 2.5, 32]} />
      <meshStandardMaterial ref={matRef} color="#334455" metalness={0.7} roughness={0.3} />
    </mesh>
  );
};

export const Level1Dam = () => {
  const [waterFlow, setWaterFlow] = useState(0);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const completedRef = useRef(false);

  useEffect(() => {
    setVoltMessage("Adjust the water gate slider! We need flow between 50–75% to generate stable electricity.");
  }, [setVoltMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (waterFlow >= 50 && waterFlow <= 75) {
        setVoltMessage("⭐ Perfect flow! Potential energy → Kinetic energy → Electrical energy! The generator is producing 100V AC!");
        if (!completedRef.current) {
          setLevelComplete(true);
          addScore(100);
          addStar();
          completedRef.current = true;
        }
      } else if (waterFlow > 75) {
        setVoltMessage("⚠️ Too much flow! The turbine is overloading. Reduce to below 75%!");
        setLevelComplete(false);
      } else if (waterFlow > 0) {
        setVoltMessage("💧 Not enough flow yet. The turbine needs at least 50% to spin fast enough.");
        setLevelComplete(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [waterFlow, setVoltMessage, setLevelComplete, addScore, addStar]);

  const zoneLabel =
    waterFlow >= 50 && waterFlow <= 75 ? '✅ Optimal — Generating Power!' :
    waterFlow > 75 ? '🔴 Overload — Too Much Flow!' :
    waterFlow > 0 ? '🟡 Too Low — Need More Flow' : '⚪ Gate Closed';

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 18, 30], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Environment preset="sunset" />
          <OrbitControls enablePan={false} minDistance={5} maxDistance={40} maxPolarAngle={Math.PI / 2.2} target={[0, 3, 0]} />

          {/* Terrain */}
          <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[80, 60]} />
            <meshStandardMaterial color="#7ec88e" roughness={0.9} />
          </mesh>

          {/* Mountains */}
          <mesh position={[-18, 5, -18]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[7, 10, 4]} />
            <meshStandardMaterial color="#6dba7d" roughness={0.9} />
          </mesh>
          <mesh position={[14, 6, -22]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[9, 12, 4]} />
            <meshStandardMaterial color="#5fac6f" roughness={0.9} />
          </mesh>
          <mesh position={[28, 7, -15]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[11, 14, 4]} />
            <meshStandardMaterial color="#78c485" roughness={0.9} />
          </mesh>

          {/* Water reservoir */}
          <Water flow={waterFlow} />

          {/* Dam wall */}
          <mesh position={[-5, 4, 0]} castShadow>
            <boxGeometry args={[3, 9, 18]} />
            <meshStandardMaterial color="#b0a090" roughness={0.85} />
          </mesh>

          {/* Gate */}
          <mesh position={[-5, 0.5, 0]} onClick={() => setWaterFlow(waterFlow === 0 ? 60 : 0)} onPointerOver={(e) => document.body.style.cursor = 'pointer'} onPointerOut={(e) => document.body.style.cursor = 'default'}>
            <boxGeometry args={[3.2, 2, 4]} />
            <meshStandardMaterial color={waterFlow > 0 ? "#4CAF50" : "#FFD700"} />
          </mesh>

          {/* Tailwater */}
          <mesh position={[8, 0.1, 0]}>
            <boxGeometry args={[28, 0.3, 12]} />
            <meshStandardMaterial color="#5dade2" transparent opacity={0.7} />
          </mesh>

          {/* Penstock */}
          <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.0, 1.0, 10, 16]} />
            <meshStandardMaterial color="#607080" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Powerhouse */}
          <mesh position={[7, 3, 0]}>
            <boxGeometry args={[6, 6, 10]} />
            <meshStandardMaterial color="#c8b8a2" roughness={0.8} />
          </mesh>
          <mesh position={[7, 6.4, 0]}>
            <boxGeometry args={[7, 0.8, 11]} />
            <meshStandardMaterial color="#5fa86e" roughness={0.9} />
          </mesh>

          <Turbine flow={waterFlow} />
          <Generator flow={waterFlow} />
          <FlowParticles flow={waterFlow} />
        </Canvas>
      </div>

      <div className="absolute right-4 top-16 z-10 flex flex-col gap-3 pointer-events-auto" style={{ width: 'clamp(200px, 22vw, 280px)' }}>
        <InfoCard
          title="Hydroelectric Power"
          icon="🌊"
          colorClass="from-blue-500 to-cyan-400"
          borderColor="border-blue-100"
        >
          <p><strong className="text-blue-600">Step 1 — Potential Energy:</strong> Water stored high = mgh gravitational PE</p>
          <p><strong className="text-cyan-600">Step 2 — Kinetic Energy:</strong> Gate opens, water falls through penstock, KE = ½mv²</p>
          <p><strong className="text-green-600">Step 3 — Electromagnetic Induction:</strong> Turbine spins generator coils, Faraday's Law creates 240V AC</p>
          <p><strong className="text-yellow-600">Formula:</strong> P = V × I (Power = Voltage × Current)</p>
        </InfoCard>

        <div className="game-panel p-0 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-800" style={{ fontSize: '0.95rem' }}>Water Gate Control</h3>
          </div>
          <div className="p-4">
            <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
              <span>0%</span>
              <span className="text-slate-700 text-sm font-bold">{waterFlow}%</span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0" max="100"
              value={waterFlow}
              onChange={e => setWaterFlow(Number(e.target.value))}
              className="w-full mb-3 accent-blue-500"
            />
            <div className="flex w-full h-2 rounded-full overflow-hidden mb-1">
              <div className="bg-red-300" style={{ width: '40%' }} />
              <div className="bg-green-400" style={{ width: '25%' }} />
              <div className="bg-red-300" style={{ width: '35%' }} />
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-red-400">Too Low</span>
              <span className="text-green-500">Optimal<br />50–75%</span>
              <span className="text-red-400">Overload</span>
            </div>
            <div className={`mt-3 text-center text-xs font-bold py-2 rounded-xl ${
              waterFlow >= 50 && waterFlow <= 75 ? 'bg-green-50 text-green-600' :
              waterFlow > 75 ? 'bg-red-50 text-red-500' :
              'bg-slate-50 text-slate-400'
            }`}>
              {zoneLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
