import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

const STEP_INFOS = [
  {
    title: "Service Pole",
    icon: "🔌",
    info: "240V AC comes from the electricity grid through overhead cables. The service pole connects the grid to your home.",
  },
  {
    title: "Electric Meter",
    icon: "⚡",
    info: "The electric meter measures how many kilowatt-hours (kWh) of electricity your home uses. It tracks consumption for billing. 1 kWh = 1000W used for 1 hour.",
  },
  {
    title: "Main Switch",
    icon: "🔴",
    info: "The Main Switch can instantly cut ALL power to the house in an emergency. Always turn this OFF before doing electrical work!",
  },
  {
    title: "MCB Panel (Distribution Board)",
    icon: "🛡️",
    info: "The MCB (Miniature Circuit Breaker) Panel is mounted inside the home. It has separate MCBs for each room/circuit. If too much current flows, the MCB trips automatically, preventing fires and damage.",
  },
  {
    title: "The 3 Wires",
    icon: "🔴🔵🟢",
    info: "Phase (Brown/Red): Carries live current at 240V. Neutral (Blue): Returns current back to grid. Earth (Green/Yellow): Safety wire — protects you from electric shock if a fault occurs.",
  }
];

export const Level5House = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [step, setStep] = useState(0);
  
  const matsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    setVoltMessage("Let's see how electricity safely enters your house. Click 'Next Step' to build the connection.");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    sceneRef.current = scene;
    
    camera.position.set(0, 8, 22);
    controls.target.set(0, 4, 0);

    // Build realistic house cross-section
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xe8d5b7, roughness: 0.8 })
    );
    floor.position.set(0, 0, 0);
    scene.add(floor);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(16, 8, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xf0e6d3 })
    );
    backWall.position.set(0, 4.25, -3.75);
    scene.add(backWall);

    const sideWallL = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xe8ddd0 })
    );
    sideWallL.position.set(-7.75, 4.25, 0);
    scene.add(sideWallL);

    const sideWallR = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xe8ddd0 })
    );
    sideWallR.position.set(7.75, 4.25, 0);
    scene.add(sideWallR);

    // Inner walls for 3 rooms
    const innerWall1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xf0e6d3 })
    );
    innerWall1.position.set(-2, 4.25, -1);
    scene.add(innerWall1);

    const innerWall2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xf0e6d3 })
    );
    innerWall2.position.set(3, 4.25, -1);
    scene.add(innerWall2);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(12, 4, 4),
      new THREE.MeshStandardMaterial({ color: 0xc0392b })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 10.25, 0);
    scene.add(roof);

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
    const scene = sceneRef.current;
    if (!scene) return;

    if (step === 0) {
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 12), poleMat);
      pole.position.set(-10, 6, 2);
      scene.add(pole);

      const wireGeo = new THREE.CylinderGeometry(0.05, 0.05, 6);
      const wireMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.position.set(-7.5, 9, 2);
      wire.rotation.z = Math.PI / 2 - 0.2;
      scene.add(wire);
      matsRef.current.push(poleMat);
    }
    else if (step === 1) {
      const meterGroup = new THREE.Group();
      const meterMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const meterBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.8), meterMat);
      
      const faceGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.9, 16);
      const faceMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1 });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.rotation.x = Math.PI / 2;
      face.position.z = 0.2;

      meterGroup.add(meterBox);
      meterGroup.add(face);
      meterGroup.position.set(-8.2, 4, 2);
      scene.add(meterGroup);
    }
    else if (step === 2) {
      const switchMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
      const mainSwitch = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), switchMat);
      mainSwitch.position.set(-6, 4, 1);
      scene.add(mainSwitch);
    }
    else if (step === 3) {
      const mcbGroup = new THREE.Group();
      const mcbMat = new THREE.MeshStandardMaterial({ color: 0x34495e });
      const panel = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.8), mcbMat);
      mcbGroup.add(panel);

      for(let i=0; i<6; i++) {
        const switchLever = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.4, 0.9),
          new THREE.MeshStandardMaterial({ color: 0x95a5a6 })
        );
        switchLever.position.set(-1 + (i * 0.4), 0, 0);
        mcbGroup.add(switchLever);
      }
      
      mcbGroup.position.set(-4, 5, -3.2);
      scene.add(mcbGroup);
    }
    else if (step === 4) {
      const createWireCurve = (color: number, offset: number) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-4, 5 + offset, -3),
          new THREE.Vector3(0, 5 + offset, -3),
          new THREE.Vector3(0, 7 + offset, -3),
          new THREE.Vector3(5, 7 + offset, -3)
        ]);
        const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({ color });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tube);
      };

      createWireCurve(0xe74c3c, 0);    // Phase
      createWireCurve(0x3498db, 0.2);  // Neutral
      createWireCurve(0x27ae60, -0.2); // Earth

      setVoltMessage("Excellent! You've traced the power into the house. Now you know how it's distributed safely.");
      setLevelComplete(true);
      addScore(50);
      addStar();
    }

  }, [step]);

  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      <div className="absolute right-8 top-32 z-10 flex flex-col gap-6 pointer-events-auto w-[24rem]">
        <InfoCard 
          title={STEP_INFOS[step].title} 
          icon={STEP_INFOS[step].icon}
          colorClass="from-indigo-500 to-purple-500"
          borderColor="border-purple-200"
        >
          <p>{STEP_INFOS[step].info}</p>
          
          {step === 4 && (
            <div className="flex flex-col gap-2 mt-4 text-sm">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-md font-bold border border-red-200">🔴 Phase Wire - 240V Live</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-bold border border-blue-200">🔵 Neutral Wire - Return Path</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md font-bold border border-green-200">🟢 Earth Wire - Safety</span>
            </div>
          )}
        </InfoCard>

        <div className="bg-white p-0 rounded-2xl overflow-hidden shadow-md border border-slate-200">
          <div className="bg-slate-100 px-5 py-3 border-b border-slate-200">
            <h3 className="text-xl font-display text-slate-800 font-bold">Installation Progress</h3>
          </div>
          <div className="p-5">
            <div className="flex justify-between mb-6">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i <= step ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                  {i+1}
                </div>
              ))}
            </div>

            {step < 4 && (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-display font-bold text-2xl rounded-xl shadow-md active:scale-95 transition-transform"
              >
                NEXT STEP ➡
              </button>
            )}
            {step === 4 && (
              <div className="text-center py-3 bg-green-50 text-green-600 font-bold rounded-xl border border-green-200 text-lg">
                Sequence Complete!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};