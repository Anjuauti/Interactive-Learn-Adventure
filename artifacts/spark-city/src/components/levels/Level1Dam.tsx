import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

/* ── Sub-components ── */
const AnimatedWater = ({ flow }: { flow: boolean }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    if (flow) {
      mat.color.set('#1a8cff');
      mat.opacity = 0.88;
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.15 + Math.sin(clock.getElapsedTime() * 3) * 0.05;
    }
  });
  return (
    <mesh ref={ref} position={[-10, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[22, 22]} />
      <meshStandardMaterial
        color={flow ? '#1a8cff' : '#2d6a9f'}
        transparent opacity={flow ? 0.88 : 0.55}
        emissive="#0055aa" emissiveIntensity={0}
      />
    </mesh>
  );
};

const Turbine = ({ spinning }: { spinning: boolean }) => {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (spinning && group.current) group.current.rotation.z -= dt * 6;
  });
  return (
    <group ref={group} position={[3.5, 1.2, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.9, 20]} />
        <meshStandardMaterial color="#c8820a" metalness={0.7} roughness={0.3} />
      </mesh>
      {[...Array(6)].map((_, i) => (
        <group key={i} rotation={[0, 0, (Math.PI * 2 / 6) * i]}>
          <mesh position={[0, 1.35, 0]}>
            <boxGeometry args={[0.2, 1.6, 0.5]} />
            <meshStandardMaterial color="#b87020" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const FlowParticles = ({ active }: { active: boolean }) => {
  const pts = useRef<THREE.Points>(null!);
  const COUNT = 120;
  const posRef = useRef(new Float32Array(COUNT * 3));

  useEffect(() => {
    const arr = posRef.current;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2 - 6;
      arr[i * 3 + 1] = 0.7 + Math.random() * 0.9;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
  }, []);

  useFrame((_, dt) => {
    if (!active || !pts.current) return;
    const arr = posRef.current;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] += dt * 5.5;
      if (arr[i * 3] > 4.5) {
        arr[i * 3] = -8;
        arr[i * 3 + 1] = 0.7 + Math.random() * 0.9;
      }
    }
    pts.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posRef.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#80d4ff" size={0.2} transparent opacity={active ? 0.9 : 0} />
    </points>
  );
};

const GeneratorGlow = ({ on }: { on: boolean }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = on ? 0.5 + Math.sin(clock.getElapsedTime() * 5) * 0.4 : 0;
  });
  return (
    <mesh ref={mesh} position={[7, 1.8, 0]} castShadow>
      <cylinderGeometry args={[1.1, 1.1, 2.6, 20]} />
      <meshStandardMaterial color="#1a3a5c" emissive="#00aaff" emissiveIntensity={0} metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

/* ── Main Level ── */
export const Level1Dam = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [gateOpen, setGateOpen] = useState(false);
  const [waterFlowing, setWaterFlowing] = useState(false);
  const [turbineOn, setTurbineOn] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setVoltMessage("Welcome to the Hydroelectric Dam! 💧 TAP the glowing YELLOW GATE to release the water!");
  }, [setVoltMessage]);

  const handleGate = () => {
    if (gateOpen) return;
    setGateOpen(true);
    setVoltMessage("💧 Gate OPEN! Water stored high has POTENTIAL ENERGY (PE = mgh). Watch it flow!");
    setTimeout(() => {
      setWaterFlowing(true);
      setVoltMessage("🌊 Moving water has KINETIC ENERGY! It's rushing toward the turbine at high speed!");
      setTimeout(() => {
        setTurbineOn(true);
        setVoltMessage("⚙️ Turbine SPINNING! Kinetic → Mechanical energy. By Faraday's Law, the spinning magnet creates ELECTRICITY!");
        setTimeout(() => {
          setGenerating(true);
          setVoltMessage("⭐ AMAZING! The generator is producing 240V AC electricity! You harnessed the power of water!");
          setLevelComplete(true);
          addScore(100);
          addStar();
        }, 2500);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#1a4a8a 0%,#2d7dd2 38%,#5ba3e8 68%,#87ceeb 100%)' }} />

      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        camera={{ position: [0, 8, 18], fov: 55 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[12, 15, 8]} intensity={1.2} castShadow />
        <pointLight position={[7, 4, 2]} color="#00aaff" intensity={generating ? 3.5 : 0} distance={14} />
        <Environment preset="sunset" />
        <OrbitControls enablePan={false} minDistance={6} maxDistance={22} maxPolarAngle={Math.PI / 2.1} />

        {/* Ground */}
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#5a9a4a" roughness={0.9} />
        </mesh>

        <AnimatedWater flow={waterFlowing} />

        {/* Mountains */}
        {([ [-7,3.5,-10], [7,4.5,-10], [-14,2.5,-6], [14,3,-7] ] as [number,number,number][]).map(([x,y,z], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <coneGeometry args={[4 + i * 0.5, 6 + i, 16]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#4a7a4a' : '#567a56'} roughness={0.95} />
          </mesh>
        ))}

        {/* Dam body */}
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[9, 5, 2]} />
          <meshStandardMaterial color="#888888" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0, 4.6, 0]}>
          <boxGeometry args={[9.3, 0.4, 2.2]} />
          <meshStandardMaterial color="#666666" />
        </mesh>

        {/* Gate — clickable */}
        <mesh
          position={[0, 0.8, 1.05]}
          onClick={handleGate}
          onPointerOver={() => { if (!gateOpen) document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
          castShadow
        >
          <boxGeometry args={[2.5, 2.8, 0.38]} />
          <meshStandardMaterial
            color={gateOpen ? '#22c55e' : '#ffd700'}
            emissive={gateOpen ? '#00ff00' : '#ffaa00'}
            emissiveIntensity={gateOpen ? 0.4 : 1.0}
            metalness={0.5} roughness={0.3}
          />
        </mesh>

        {/* Penstock pipe */}
        <mesh position={[1.6, 0.9, 0.7]} rotation={[0, 0, Math.PI / 8]}>
          <cylinderGeometry args={[0.35, 0.35, 3.5, 16]} />
          <meshStandardMaterial color="#555555" metalness={0.6} />
        </mesh>

        <Turbine spinning={turbineOn} />
        <FlowParticles active={waterFlowing} />
        <GeneratorGlow on={generating} />

        {/* Powerhouse */}
        <mesh position={[5.5, 2, -1.5]} castShadow>
          <boxGeometry args={[6, 4.5, 5]} />
          <meshStandardMaterial color="#c27848" roughness={0.85} />
        </mesh>
        <mesh position={[5.5, 4.6, -1.5]}>
          <boxGeometry args={[6.5, 0.5, 5.5]} />
          <meshStandardMaterial color="#a05c30" />
        </mesh>

        {/* Electricity bolt glow */}
        {generating && (
          <mesh position={[7, 5.2, 0]}>
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2.5} />
          </mesh>
        )}
      </Canvas>

      {/* Right-side info panel */}
      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(210px, 23vw, 285px)' }}
      >
        <InfoCard title="Hydroelectric Power" icon="🌊" colorClass="from-blue-700 to-blue-500">
          <p><strong>Potential Energy:</strong> Water stored high holds gravitational energy — PE = mgh</p>
          <p><strong>Kinetic Energy:</strong> Falling water converts to movement — KE = ½mv²</p>
          <p><strong>Electromagnetic Induction:</strong> Spinning turbine → Faraday's Law → 240V AC!</p>
          <div className="mt-2 pt-2 border-t border-slate-200">
            <strong>Power Formula:</strong> P (Watts) = V × I
          </div>
        </InfoCard>

        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-800 mb-3" style={{ fontSize: '1.05rem' }}>Power Generation</h3>
          <div className="flex flex-col gap-2">
            {[
              { label: '1. Open the Gate', done: gateOpen, icon: '🚪' },
              { label: '2. Water Flowing', done: waterFlowing, icon: '💧' },
              { label: '3. Turbine Spinning', done: turbineOn, icon: '⚙️' },
              { label: '4. Power Generated!', done: generating, icon: '⚡' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                <span
                  className="font-bold flex-1"
                  style={{ fontSize: '0.95rem', color: s.done ? '#059669' : '#94a3b8' }}
                >
                  {s.label}
                </span>
                {s.done && <span style={{ color: '#059669', fontSize: '1.1rem' }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {generating && (
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="game-panel text-center">
            <p className="font-display text-slate-500 mb-1" style={{ fontSize: '0.75rem' }}>OUTPUT VOLTAGE</p>
            <div className="meter-display">
              <span className="text-cyan-400 font-mono font-bold" style={{ fontSize: '1.8rem' }}>240 V AC</span>
            </div>
            <p className="mt-1.5 text-green-600 font-bold" style={{ fontSize: '0.9rem' }}>✓ Ready for Transmission!</p>
          </motion.div>
        )}
      </div>

      {/* Bouncing tap hint */}
      {!gateOpen && (
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.3, repeat: Infinity }}
        >
          <div
            className="px-5 py-3 rounded-full font-display font-bold text-slate-900 shadow-xl"
            style={{
              background: 'linear-gradient(135deg,#ffd700,#f59e0b)',
              fontSize: '1.1rem',
              boxShadow: '0 0 24px rgba(255,215,0,0.7)',
            }}
          >
            👆 TAP the YELLOW GATE on the Dam!
          </div>
        </motion.div>
      )}
    </div>
  );
};
