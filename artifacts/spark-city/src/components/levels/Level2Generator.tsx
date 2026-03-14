import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

const Rotor = ({ speed }: { speed: number }) => {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z -= speed * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[1.5, 3.5, 1.5]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0, -1.75, 0]}>
        <boxGeometry args={[1.5, 3.5, 1.5]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>
    </group>
  );
};

const Stator = ({ speed }: { speed: number }) => {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(({ clock }) => {
    if (matRef.current) {
      if (speed > 5) {
        matRef.current.emissive.setHex(0xffd700);
        matRef.current.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * speed) * 0.5;
      } else {
        matRef.current.emissive.setHex(0x000000);
        matRef.current.emissiveIntensity = 0;
      }
    }
  });

  return (
    <mesh>
      <torusGeometry args={[4, 0.8, 16, 32]} />
      <meshStandardMaterial ref={matRef} color="#b87333" metalness={0.8} roughness={0.3} />
    </mesh>
  );
};

const MagneticFieldLines = ({ speed }: { speed: number }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.PointsMaterial>(null!);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 5;
      positions[i + 1] = (Math.random() - 0.5) * 5;
      positions[i + 2] = (Math.random() - 0.5) * 5;
    }
    return positions;
  }, []);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = Math.min(1, speed * 0.1);
    }
    if (pointsRef.current && speed > 0) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        let x = pos[i], y = pos[i+1];
        let r = Math.sqrt(x*x + y*y);
        let theta = Math.atan2(y, x) + speed * 0.02;
        r += speed * 0.01;
        if (r > 6) r = 1;
        pos[i] = r * Math.cos(theta);
        pos[i+1] = r * Math.sin(theta);
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={300} array={particlesPosition} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} color="#00ffff" size={0.1} transparent opacity={0} />
    </points>
  );
};

export const Level2Generator = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [spinSpeed, setSpinSpeed] = useState(0);

  useEffect(() => {
    setVoltMessage("Click the SPIN button rapidly to rotate the magnet inside the copper coils!");
  }, [setVoltMessage]);

  useEffect(() => {
    if (spinSpeed > 8) {
      setVoltMessage("Incredible! The spinning magnetic field is creating an Alternating Current (AC) in the coils!");
      setLevelComplete(true);
      if (spinSpeed === 9) {
        addScore(50);
        addStar();
      }
    }

    const interval = setInterval(() => {
      setSpinSpeed(s => Math.max(0, s - 0.5));
    }, 100);

    return () => clearInterval(interval);
  }, [spinSpeed, setVoltMessage, setLevelComplete, addScore, addStar]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Environment preset="city" />
          <OrbitControls enablePan={false} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2.2} target={[0, 0, 0]} />
          
          <Stator speed={spinSpeed} />
          <Rotor speed={spinSpeed} />
          <MagneticFieldLines speed={spinSpeed} />
          
          <mesh>
            <cylinderGeometry args={[4.5, 4.5, 8, 32, 1, true]} />
            <meshStandardMaterial color="#aaccff" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </Canvas>
      </div>
      
      <div className="absolute right-4 top-16 z-10 flex flex-col gap-3 pointer-events-auto" style={{ width: 'clamp(190px, 21vw, 265px)' }}>
        <InfoCard 
          title="Electromagnetic Induction" 
          icon="🧲" 
          colorClass="from-red-500 to-blue-500"
          borderColor="border-purple-400"
        >
          <p>Faraday's Law of Electromagnetic Induction</p>
          <p>When a <strong className="text-purple-600">Magnet</strong> rotates inside coils of copper wire, it pushes electrons around creating changing magnetic flux.</p>
          <p>This changing flux induces EMF = -N dΦ/dt, and the flow of electrons is called <strong className="text-blue-600">Alternating Current (AC)</strong> electricity!</p>
        </InfoCard>

        <div className="game-panel p-0 rounded-2xl text-center overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 border-b border-white/10">
            <h3 className="text-xl font-display text-white font-bold">Rotor Speed</h3>
          </div>
          <div className="p-5 bg-slate-800">
            <svg className="w-full h-24 mb-6 bg-slate-900/80 rounded-xl border border-cyan-500/30" viewBox="0 0 200 50">
              <path 
                d={`M 0 25 Q 25 ${25 - spinSpeed*3} 50 25 T 100 25 T 150 25 T 200 25`} 
                fill="transparent" 
                stroke="#00ffff" 
                strokeWidth="3"
                className="glow-accent"
              />
            </svg>

            <button 
              onClick={() => setSpinSpeed(s => Math.min(15, s + 2))}
              className="game-btn game-btn-accent w-full py-4 text-xl justify-center shadow-[0_0_20px_rgba(0,255,255,0.6)]"
            >
              SPIN ROTOR ⚡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
