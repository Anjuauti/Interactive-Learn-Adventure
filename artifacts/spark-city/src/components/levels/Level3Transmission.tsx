import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

const PowerLine = ({ start, end, active }: { start: [number, number, number], end: [number, number, number], active: boolean }) => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(...start),
    new THREE.Vector3((start[0] + end[0]) / 2, Math.min(start[1], end[1]) - 2, (start[2] + end[2]) / 2),
    new THREE.Vector3(...end)
  ]);
  
  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.1, 8, false]} />
      <meshStandardMaterial color={active ? "#00ffff" : "#333333"} emissive={active ? "#00ffff" : "#000000"} emissiveIntensity={active ? 1 : 0} />
    </mesh>
  );
};

const ElectricityParticles = ({ start, end, active }: { start: [number, number, number], end: [number, number, number], active: boolean }) => {
  const ref = useRef<THREE.Points>(null!);
  const count = 30;
  
  useEffect(() => {
    if (ref.current) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const t = Math.random();
        const x = start[0] + (end[0] - start[0]) * t;
        const y = start[1] + (end[1] - start[1]) * t;
        const z = start[2] + (end[2] - start[2]) * t;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
      ref.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, [start, end]);

  useFrame((_, delta) => {
    if (!active || !ref.current) return;
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] += (end[0] - start[0]) * delta * 0.2;
      if (positions[i * 3] > end[0]) {
        positions[i * 3] = start[0];
      }
      const t = (positions[i * 3] - start[0]) / (end[0] - start[0]);
      // Approximate dip curve for particles
      const midY = Math.min(start[1], end[1]) - 2;
      const y1 = start[1] + (midY - start[1]) * (t * 2);
      const y2 = midY + (end[1] - midY) * ((t - 0.5) * 2);
      positions[i * 3 + 1] = t < 0.5 ? y1 : y2;
      positions[i * 3 + 2] = start[2] + (end[2] - start[2]) * t;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry />
      <pointsMaterial color="#ffffff" size={0.3} transparent opacity={active ? 1 : 0} />
    </points>
  );
};

const Tower = ({ position, onClick, active }: { position: [number, number, number], onClick: () => void, active: boolean }) => {
  return (
    <group position={position} onClick={onClick} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'default'}>
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[0.5, 10, 0.5]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[4, 0.2, 0.2]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      {/* Insulators */}
      <mesh position={[-1.8, 8, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshStandardMaterial color={active ? "#00ffff" : "#555555"} emissive={active ? "#00ffff" : "#000000"} />
      </mesh>
      <mesh position={[1.8, 8, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshStandardMaterial color={active ? "#00ffff" : "#555555"} emissive={active ? "#00ffff" : "#000000"} />
      </mesh>
    </group>
  );
};

export const Level3Transmission = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    setVoltMessage("Click the towers in order to string the high-voltage lines!");
  }, [setVoltMessage]);

  const handleTowerClick = (index: number) => {
    if (index === step) {
      setStep(step + 1);
      if (index === 0) setVoltMessage("Tower 1 connected! High voltage reduces heat loss.");
      if (index === 1) setVoltMessage("Tower 2 connected! Power is flowing over long distances.");
      if (index === 2) {
        setVoltMessage("⭐ All towers connected! 132kV power is reaching the city.");
        setLevelComplete(true);
        addScore(100);
        addStar();
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      <Canvas style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="park" />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={30} maxPolarAngle={Math.PI / 2.2} />

        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#7ec88e" />
        </mesh>

        {/* Step-up Transformer */}
        <mesh position={[-12, 1.5, 0]}>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color="#444444" />
        </mesh>

        <Tower position={[-8, 0, 0]} onClick={() => handleTowerClick(0)} active={step >= 1} />
        <Tower position={[0, 0, 0]} onClick={() => handleTowerClick(1)} active={step >= 2} />
        <Tower position={[8, 0, 0]} onClick={() => handleTowerClick(2)} active={step >= 3} />

        {step >= 1 && <PowerLine start={[-8, 8, 0]} end={[0, 8, 0]} active={true} />}
        {step >= 2 && <PowerLine start={[0, 8, 0]} end={[8, 8, 0]} active={true} />}

        {step >= 1 && <ElectricityParticles start={[-8, 8, 0]} end={[0, 8, 0]} active={true} />}
        {step >= 2 && <ElectricityParticles start={[0, 8, 0]} end={[8, 8, 0]} active={true} />}
      </Canvas>

      <div className="absolute right-4 top-16 z-10 flex flex-col gap-3 pointer-events-auto" style={{ width: 'clamp(190px, 21vw, 265px)' }}>
        <InfoCard title="Power Transmission" icon="🗼">
          <p><strong>High Voltage:</strong> We step up voltage (e.g. 11,000V to 132,000V) for transmission.</p>
          <p><strong>Why?</strong> P = I²R. Lower current (I) means less energy lost as heat over long distances.</p>
          <p><strong>Transformers:</strong> V1/V2 = N1/N2. More turns on the secondary coil steps up the voltage.</p>
        </InfoCard>

        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-800 mb-2">Network Status</h3>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex-1 text-center py-1 rounded font-bold ${step >= i ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
                T{i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
