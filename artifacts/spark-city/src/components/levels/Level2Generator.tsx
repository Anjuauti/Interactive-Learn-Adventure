import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

const Rotor = ({ spinning }: { spinning: boolean }) => {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (spinning && ref.current) {
      ref.current.rotation.z -= delta * 10;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>
      <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>
    </group>
  );
};

const Stator = ({ active }: { active: boolean }) => {
  const ref = useRef<THREE.Group>(null!);
  
  useFrame(({ clock }) => {
    if (active && ref.current) {
      const flicker = Math.sin(clock.getElapsedTime() * 10) * 0.5 + 0.5;
      ref.current.children.forEach(child => {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = flicker;
      });
    }
  });

  const coils = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i;
    coils.push(
      <mesh key={i} position={[Math.sin(angle) * 3, Math.cos(angle) * 3, 0]} rotation={[0, 0, -angle]}>
        <torusGeometry args={[0.5, 0.2, 16, 32]} />
        <meshStandardMaterial 
          color="#b87333" 
          emissive="#ffd700" 
          emissiveIntensity={active ? 0.8 : 0} 
        />
      </mesh>
    );
  }
  return <group ref={ref}>{coils}</group>;
};

const MagneticField = ({ active }: { active: boolean }) => {
  const ref = useRef<THREE.Points>(null!);
  const count = 200;
  
  useEffect(() => {
    if (ref.current) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 2;
        positions[i * 3] = Math.sin(angle) * radius;
        positions[i * 3 + 1] = Math.cos(angle) * radius;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
      ref.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, []);

  useFrame((_, delta) => {
    if (!active || !ref.current) return;
    ref.current.rotation.z -= delta * 5;
  });

  return (
    <points ref={ref}>
      <bufferGeometry />
      <pointsMaterial color="#00ffff" size={0.1} transparent opacity={active ? 0.6 : 0} />
    </points>
  );
};

export const Level2Generator = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    setVoltMessage("Click the SPIN button to start the rotor!");
  }, [setVoltMessage]);

  const advanceStep = () => {
    if (step === 0) {
      setStep(1);
      setVoltMessage("The rotor is spinning! Now watch the magnetic field lines appear.");
      setTimeout(() => {
        setStep(2);
        setVoltMessage("The changing magnetic flux induces an EMF in the coils.");
        setTimeout(() => {
          setStep(3);
          setVoltMessage("⭐ Electricity is flowing! We've generated Alternating Current (AC)!");
          setLevelComplete(true);
          addScore(100);
          addStar();
        }, 2000);
      }, 1500);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Canvas style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[4, 4, 6, 32, 1, true]} />
          <meshStandardMaterial color="#888888" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>

        <Rotor spinning={step > 0} />
        <Stator active={step >= 3} />
        <MagneticField active={step >= 2} />
      </Canvas>

      <div className="absolute right-4 top-16 z-10 flex flex-col gap-3 pointer-events-auto" style={{ width: 'clamp(190px, 21vw, 265px)' }}>
        <InfoCard title="Electromagnetic Induction" icon="⚡">
          <p><strong>Faraday's Law:</strong> A changing magnetic field induces an electromotive force (EMF).</p>
          <p><strong>Magnets:</strong> Rotating magnets create a changing magnetic flux.</p>
          <p><strong>Equation:</strong> EMF = -N (dΦ/dt)</p>
          <p>This creates <strong>Alternating Current (AC)</strong> as the poles switch.</p>
        </InfoCard>

        {step === 0 && (
          <button 
            className="game-btn game-btn-accent w-full justify-center text-lg py-3"
            onClick={advanceStep}
          >
            SPIN ROTOR
          </button>
        )}
      </div>
    </div>
  );
};
