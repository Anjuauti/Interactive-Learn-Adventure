import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

const Water = ({ flow }: { flow: boolean }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });
  return (
    <mesh ref={ref} position={[-10, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1e90ff" transparent opacity={0.7} />
    </mesh>
  );
};

const Turbine = ({ waterFlowing }: { waterFlowing: boolean }) => {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (waterFlowing && ref.current) {
      ref.current.rotation.z -= delta * 5;
    }
  });
  return (
    <group ref={ref} position={[3, 1, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
        <meshStandardMaterial color="#e8a020" />
      </mesh>
      {[...Array(6)].map((_, i) => (
        <group key={i} rotation={[0, 0, (Math.PI * 2 / 6) * i]}>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.1, 1.5, 0.4]} />
            <meshStandardMaterial color="#cc8810" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const FlowParticles = ({ active }: { active: boolean }) => {
  const particlesRef = useRef<THREE.Points>(null!);
  const count = 100;
  
  useEffect(() => {
    if (particlesRef.current) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      }
      particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, []);

  useFrame((_, delta) => {
    if (!active || !particlesRef.current) return;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] += delta * 4;
      if (positions[i * 3] > 4) positions[i * 3] = -2;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} position={[-1, 1, 0]}>
      <bufferGeometry />
      <pointsMaterial color="#aaddff" size={0.15} transparent opacity={0.8} />
    </points>
  );
};

export const Level1Dam = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [waterFlowing, setWaterFlowing] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setVoltMessage("Click the yellow gate on the dam to let the water flow!");
  }, [setVoltMessage]);

  const handleGateClick = () => {
    if (isOpen) return;
    setIsOpen(true);
    setVoltMessage("Water is flowing! Potential energy is converting into kinetic energy.");
    
    setTimeout(() => {
      setWaterFlowing(true);
      setVoltMessage("The kinetic energy is spinning the turbine!");
      
      setTimeout(() => {
        setGenerating(true);
        setVoltMessage("⭐ The generator is creating electricity! We have 240V AC!");
        setLevelComplete(true);
        addScore(100);
        addStar();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="sunset" />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />

        <Water flow={waterFlowing} />
        
        {/* Terrain */}
        <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#7ec88e" />
        </mesh>

        {/* Mountains */}
        <mesh position={[-6, 2.5, -8]}>
          <coneGeometry args={[4, 6, 16]} />
          <meshStandardMaterial color="#6B8E6B" />
        </mesh>
        <mesh position={[6, 3.5, -8]}>
          <coneGeometry args={[5, 8, 16]} />
          <meshStandardMaterial color="#6B8E6B" />
        </mesh>

        {/* Dam */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[8, 4, 1.5]} />
          <meshStandardMaterial color="#8B8B8B" />
        </mesh>

        {/* Gate */}
        <mesh 
          position={[0, 0.5, 0.8]} 
          onClick={handleGateClick}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'default'}
        >
          <boxGeometry args={[2, 2, 0.3]} />
          <meshStandardMaterial color={isOpen ? "#4CAF50" : "#FFD700"} />
        </mesh>

        <Turbine waterFlowing={waterFlowing} />
        <FlowParticles active={isOpen} />

        {/* Generator */}
        <mesh position={[6, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1, 1, 2, 16]} />
          <meshStandardMaterial 
            color="#333333" 
            emissive={generating ? "#00BCD4" : "#000000"} 
            emissiveIntensity={generating ? 1 : 0} 
          />
        </mesh>

        {/* Powerhouse */}
        <mesh position={[4.5, 2, -2]}>
          <boxGeometry args={[6, 4, 4]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      </Canvas>

      <div className="absolute right-4 top-16 z-10 flex flex-col gap-3 pointer-events-auto" style={{ width: 'clamp(190px, 21vw, 265px)' }}>
        <InfoCard title="Hydroelectric Power" icon="🌊">
          <p><strong>Step 1 - Potential Energy:</strong> Water stored high = mgh gravitational PE</p>
          <p><strong>Step 2 - Kinetic Energy:</strong> Gate opens, water falls through penstock, KE = ½mv²</p>
          <p><strong>Step 3 - Electromagnetic Induction:</strong> Turbine spins generator coils, Faraday's Law creates 240V AC</p>
          <div className="mt-2 pt-2 border-t border-slate-200">
            <strong className="text-yellow-600">Formula:</strong> P = V × I
          </div>
        </InfoCard>

        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-800 mb-2">Process Status</h3>
          <div className="flex flex-col gap-2 text-sm font-bold">
            <div className={isOpen ? "text-green-500" : "text-slate-400"}>1. Gate Opened</div>
            <div className={waterFlowing ? "text-blue-500" : "text-slate-400"}>2. Water Flowing</div>
            <div className={generating ? "text-cyan-500" : "text-slate-400"}>3. Power Generated</div>
          </div>
        </div>
      </div>
    </div>
  );
};
