import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene, createGlowingMaterial } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

export const Level2Generator = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const rotorRef = useRef<THREE.Group | null>(null);
  const [spinSpeed, setSpinSpeed] = useState(0);

  useEffect(() => {
    setVoltMessage("Click the SPIN button rapidly to rotate the magnet inside the copper coils!");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    
    camera.position.set(0, 5, 12);
    controls.target.set(0, 0, 0);

    // Stator (Coils)
    const statorGeo = new THREE.TorusGeometry(4, 0.8, 16, 32);
    const statorMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.8, roughness: 0.3 }); // Copper
    const stator = new THREE.Mesh(statorGeo, statorMat);
    scene.add(stator);

    // Rotor (Magnet)
    const rotor = new THREE.Group();
    
    const magnetGeo = new THREE.BoxGeometry(1.5, 7, 1.5);
    const matRed = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const matBlue = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    
    // Top half red, bottom half blue
    const m1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 1.5), matRed);
    m1.position.y = 1.75;
    const m2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 1.5), matBlue);
    m2.position.y = -1.75;
    
    rotor.add(m1);
    rotor.add(m2);
    scene.add(rotor);
    rotorRef.current = rotor;

    // Glowing core particles
    const glowGeo = new THREE.SphereGeometry(1, 16, 16);
    const glowMat = createGlowingMaterial(0x00ffff);
    glowMat.transparent = true;
    glowMat.opacity = 0;
    const centerGlow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(centerGlow);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      // Read current speed from closure window var (hacky but stable for ThreeJS loops interacting with React)
      const currentSpeed = (window as any).generatorSpeed || 0;
      
      if (rotorRef.current) {
        rotorRef.current.rotation.z -= currentSpeed * 0.1;
      }
      
      // Update glow based on speed
      centerGlow.scale.setScalar(1 + currentSpeed * 0.2);
      glowMat.opacity = Math.min(1, currentSpeed * 0.1);
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      cleanup();
    };
  }, []);

  // Handle spin speed logic
  useEffect(() => {
    (window as any).generatorSpeed = spinSpeed;

    if (spinSpeed > 8) {
      setVoltMessage("Incredible! The spinning magnetic field is creating an Alternating Current (AC) in the coils!");
      setLevelComplete(true);
      if (spinSpeed === 9) { // Add score once
        addScore(50);
        addStar();
      }
    }

    // Natural decay of speed
    const interval = setInterval(() => {
      setSpinSpeed(s => Math.max(0, s - 0.5));
    }, 100);

    return () => clearInterval(interval);
  }, [spinSpeed, setVoltMessage, setLevelComplete, addScore, addStar]);

  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      <div className="absolute right-8 top-24 z-10 flex flex-col gap-6">
        <InfoCard title="Electromagnetic Induction">
          <p>When a <strong>Magnet</strong> rotates inside coils of copper wire, it pushes electrons around.</p>
          <p>This flow of electrons is called <strong>Alternating Current (AC)</strong> electricity!</p>
        </InfoCard>

        <div className="glass-panel p-6 rounded-2xl text-center pointer-events-auto">
          <h3 className="text-xl font-display text-white mb-4">Rotor Speed</h3>
          
          {/* Waveform Visualization based on speed */}
          <svg className="w-full h-20 mb-4 bg-slate-900 rounded-lg" viewBox="0 0 200 50">
            <path 
              d={`M 0 25 Q 25 ${25 - spinSpeed*3} 50 25 T 100 25 T 150 25 T 200 25`} 
              fill="transparent" 
              stroke="#00ffff" 
              strokeWidth="3"
              className="glow-cyan"
            />
          </svg>

          <button 
            onClick={() => setSpinSpeed(s => Math.min(15, s + 2))}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-display font-bold text-2xl rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.6)] active:scale-95 transition-transform"
          >
            SPIN ROTOR
          </button>
        </div>
      </div>
    </div>
  );
};
