import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

export const Level4Substation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [voltage, setVoltage] = useState(33); // Start high
  const activeGlowRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    setVoltMessage("We reached the city limits! Use the Step-Down Transformer dial to reduce the voltage for the neighborhood (Target: 11kV).");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    
    camera.position.set(0, 10, 20);

    // Transformer Box
    const transGeo = new THREE.BoxGeometry(8, 6, 6);
    const transMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.6 });
    const transBox = new THREE.Mesh(transGeo, transMat);
    transBox.position.set(-5, 3, 0);
    scene.add(transBox);

    // Insulators
    for(let i=0; i<3; i++) {
      const insGeo = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
      const insMat = new THREE.MeshStandardMaterial({ color: 0xaa5555, roughness: 1 });
      const ins = new THREE.Mesh(insGeo, insMat);
      ins.position.set(-7 + i*2, 7, 0);
      scene.add(ins);
    }

    // Output Power Lines to City
    const cityGeo = new THREE.BoxGeometry(4, 4, 4);
    const cityMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const city = new THREE.Mesh(cityGeo, cityMat);
    city.position.set(8, 2, 0);
    scene.add(city);

    // Glow wire
    const wireGeo = new THREE.CylinderGeometry(0.2, 0.2, 10);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 });
    activeGlowRef.current = wireMat;
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.rotation.z = Math.PI / 2;
    wire.position.set(1.5, 3, 0);
    scene.add(wire);

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
    if (activeGlowRef.current) {
      if (voltage > 15) {
        activeGlowRef.current.emissive.setHex(0xff0000); // Red - Danger
      } else if (voltage < 10) {
        activeGlowRef.current.emissive.setHex(0x333333); // Off - Underpowered
      } else {
        activeGlowRef.current.emissive.setHex(0x00ff00); // Green - Perfect
      }
    }

    const checkTimer = setTimeout(() => {
      if (voltage >= 10 && voltage <= 15) {
        setVoltMessage("Perfect! 11kV is safe for distribution around the local streets.");
        setLevelComplete(true);
        addScore(50);
        addStar();
      } else if (voltage > 15) {
        setVoltMessage("Too high! You'll blow out the neighborhood circuits!");
        setLevelComplete(false);
      } else {
        setVoltMessage("Too low! The neighborhood won't have enough power.");
        setLevelComplete(false);
      }
    }, 1000);

    return () => clearTimeout(checkTimer);
  }, [voltage, setVoltMessage, setLevelComplete, addScore, addStar]);

  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      <div className="absolute right-8 top-32 z-10 flex flex-col gap-6 w-[22rem]">
        <InfoCard 
          title="Step-Down Substation" 
          icon="🏭"
          colorClass="from-green-500 to-teal-400"
          borderColor="border-green-400"
        >
          <p>High voltage is great for travel, but dangerous for homes.</p>
          <p>A <strong className="text-teal-600">Step-Down Transformer</strong> lowers the voltage significantly before it enters residential areas.</p>
        </InfoCard>

        <div className="glass-panel p-0 rounded-2xl text-center pointer-events-auto overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 border-b border-white/10">
            <h3 className="text-xl font-display text-white font-bold">Voltage Dial (kV)</h3>
          </div>
          <div className="p-6">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 border-4 shadow-inner bg-slate-900 ${
              voltage >= 10 && voltage <= 15 
                ? 'border-green-400 shadow-[0_0_20px_rgba(0,255,0,0.4)]' 
                : voltage > 15 
                  ? 'border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.4)]' 
                  : 'border-slate-500'
            }`}>
              <h2 className={`text-4xl font-display font-bold ${voltage >= 10 && voltage <= 15 ? 'text-green-400 text-glow-cyan' : voltage > 15 ? 'text-red-500' : 'text-slate-400'}`}>
                {voltage}
              </h2>
            </div>
            
            <input 
              type="range" 
              min="1" max="33" 
              value={voltage}
              onChange={(e) => setVoltage(parseInt(e.target.value))}
              className="mb-2"
            />
            <div className="flex justify-between text-slate-400 text-xs font-bold px-1">
              <span>Low</span>
              <span className="text-green-400">11kV Target</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
