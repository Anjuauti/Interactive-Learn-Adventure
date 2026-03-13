import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

export const Level5House = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [step, setStep] = useState(0);
  
  const matsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    setVoltMessage("Follow the electricity into the house! Click 'Next Step' to trace the path.");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    
    camera.position.set(0, 5, 20);

    // Create sequence objects
    const createObj = (geo: THREE.BufferGeometry, pos: [number, number, number]) => {
      const mat = new THREE.MeshStandardMaterial({ color: 0x333333, emissive: 0x000000 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      scene.add(mesh);
      matsRef.current.push(mat);
      return mesh;
    };

    // 0: Pole
    createObj(new THREE.CylinderGeometry(0.5, 0.5, 15), [-8, 7.5, 0]);
    // 1: Service Wire
    const wireGeo = new THREE.CylinderGeometry(0.1, 0.1, 8);
    const wire = createObj(wireGeo, [-4, 10, 0]);
    wire.rotation.z = Math.PI / 2 + 0.2;
    // 2: Electric Meter
    createObj(new THREE.BoxGeometry(2, 3, 1), [0, 5, 0]);
    // 3: Main Switch
    createObj(new THREE.BoxGeometry(1.5, 2, 1), [3, 5, 0]);
    // 4: MCB Panel
    createObj(new THREE.BoxGeometry(3, 4, 1), [7, 5, 0]);

    // Simple House Wall
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(12, 12, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xefefef, transparent: true, opacity: 0.3 })
    );
    wall.position.set(3, 6, -1);
    scene.add(wall);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Light up materials based on step
    matsRef.current.forEach((mat, idx) => {
      if (idx <= step) {
        mat.emissive.setHex(0xffff00);
        mat.emissiveIntensity = 1;
        mat.color.setHex(0xffffaa);
      }
    });

    const messages = [
      "The Service Pole brings 240V directly to the house.",
      "The Service Wire carries Phase, Neutral, and Earth connections.",
      "The Electric Meter measures how many Kilowatt-hours (kWh) of energy you use.",
      "The Main Switch can cut all power to the house instantly in an emergency.",
      "The MCB (Miniature Circuit Breaker) Panel protects individual rooms from overloads and short circuits!"
    ];

    setVoltMessage(messages[Math.min(step, 4)]);

    if (step === 4) {
      setLevelComplete(true);
      addScore(50);
      addStar();
    }
  }, [step]);

  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      <div className="absolute right-8 top-24 z-10 flex flex-col gap-6 pointer-events-auto">
        <InfoCard title="House Entry">
          <p>Power enters safely through a sequence of protective devices.</p>
          <p><strong>Meter:</strong> Tracks usage for billing.</p>
          <p><strong>MCB:</strong> Automatically trips (turns off) if too much current flows, preventing fires.</p>
        </InfoCard>

        {step < 4 && (
          <button 
            onClick={() => setStep(s => s + 1)}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-display font-bold text-2xl rounded-xl shadow-[0_0_15px_rgba(255,204,0,0.6)] active:scale-95 transition-transform"
          >
            NEXT STEP
          </button>
        )}
      </div>
    </div>
  );
};
