import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

export const Level4Substation = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [breakerOn, setBreakerOn] = useState(false);
  const [voltage, setVoltage] = useState(132);

  useEffect(() => {
    setVoltMessage("Click the circuit breaker to step down the voltage for the neighborhood!");
  }, [setVoltMessage]);

  const handleBreaker = () => {
    if (breakerOn) return;
    setBreakerOn(true);
    setVoltMessage("Breaker closed! Transforming voltage...");
    
    let v = 132;
    const interval = setInterval(() => {
      v -= 5;
      if (v <= 11) {
        v = 11;
        clearInterval(interval);
        setVoltMessage("⭐ Voltage safely stepped down to 11kV for local distribution!");
        setLevelComplete(true);
        addScore(100);
        addStar();
      }
      setVoltage(v);
    }, 100);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />

        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>

        {/* Step-down Transformer */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[4, 4, 4]} />
          <meshStandardMaterial color="#556677" />
        </mesh>
        
        {/* Coils indication */}
        <mesh position={[0, 4.5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
          <meshStandardMaterial color={breakerOn ? "#00ffff" : "#aa5555"} emissive={breakerOn ? "#00ffff" : "#000000"} />
        </mesh>

        {/* Circuit Breaker */}
        <mesh 
          position={[-4, 1, 2]} 
          onClick={handleBreaker}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'default'}
        >
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[-4, breakerOn ? 1 : 1.5, 2.6]} rotation={[breakerOn ? 0 : -Math.PI/4, 0, 0]}>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshStandardMaterial color={breakerOn ? "#00ff00" : "#ff0000"} />
        </mesh>
      </Canvas>

      <div className="absolute right-4 top-16 z-10 flex flex-col gap-3 pointer-events-auto" style={{ width: 'clamp(190px, 21vw, 265px)' }}>
        <InfoCard title="Substation" icon="🏢">
          <p><strong>Step-Down:</strong> High transmission voltages (132kV) are too dangerous for homes.</p>
          <p><strong>Transformers:</strong> They lower the voltage to 11kV for local streets, then eventually to 240V for houses.</p>
          <p><strong>Safety:</strong> Circuit breakers protect the grid from faults and overloads.</p>
        </InfoCard>

        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-800 mb-2">Voltage Display</h3>
          <div className="text-3xl font-display font-bold text-center text-cyan-500 glow-accent p-4 rounded bg-slate-900">
            {voltage} kV
          </div>
          <div className="text-xs text-center text-slate-500 mt-2 font-bold">Target: 11 kV</div>
        </div>
      </div>
    </div>
  );
};
