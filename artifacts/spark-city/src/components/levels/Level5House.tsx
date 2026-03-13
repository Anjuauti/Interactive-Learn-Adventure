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
      
      <div className="absolute right-8 top-32 z-10 flex flex-col gap-6 pointer-events-auto w-[22rem]">
        <InfoCard 
          title="House Entry" 
          icon="🏠"
          colorClass="from-indigo-500 to-purple-500"
          borderColor="border-purple-400"
        >
          <p>Power enters safely through a sequence of protective devices.</p>
          <p><strong className="text-purple-600">Meter:</strong> Tracks usage for billing.</p>
          <p><strong className="text-indigo-600">MCB:</strong> Automatically trips (turns off) if too much current flows, preventing fires.</p>
        </InfoCard>

        <div className="glass-panel p-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 border-b border-white/10">
            <h3 className="text-xl font-display text-white font-bold">Flow Sequence</h3>
          </div>
          <div className="p-5">
            <div className="flex justify-between mb-6">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i <= step ? 'bg-yellow-400 text-slate-900 shadow-[0_0_10px_rgba(255,204,0,0.8)]' : 'bg-slate-700 text-slate-500'}`}>
                  {i+1}
                </div>
              ))}
            </div>

            {step < 4 && (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-slate-900 font-display font-bold text-2xl rounded-xl shadow-[0_0_15px_rgba(255,204,0,0.6)] active:scale-95 transition-transform"
              >
                NEXT STEP ➡
              </button>
            )}
            {step === 4 && (
              <div className="text-center py-3 bg-green-500/20 text-green-400 font-bold rounded-xl border border-green-500/50">
                Sequence Complete!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
