import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

const APPLIANCES = [
  { id: 'light', name: 'LED Light', color: 0xffffff, placed: false, bgClass: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { id: 'fan', name: 'Ceiling Fan', color: 0x88ccff, placed: false, bgClass: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'tv', name: 'Television', color: 0x222222, placed: false, bgClass: 'bg-purple-100 border-purple-300 text-purple-800' },
];

export const Level6Wiring = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<string[]>([]);
  
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    setVoltMessage("Select an appliance from the toolbox, then click inside the house rooms to wire it up!");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    sceneRef.current = scene;
    
    camera.position.set(0, 10, 25);

    // Floor plan
    const floorGeo = new THREE.PlaneGeometry(24, 12);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.userData = { isFloor: true };
    scene.add(floor);

    // Walls outline
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 0.5), wallMat);
    backWall.position.set(0, 4, -6);
    scene.add(backWall);

    // MCB Box
    const mcb = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 1), new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
    mcb.position.set(-10, 4, -5.5);
    scene.add(mcb);

    // Raycaster logic
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      const tool = (window as any).selectedTool;
      if (!tool) return;

      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, false);
      
      const hitFloor = intersects.find(hit => hit.object.userData.isFloor);
      if (hitFloor) {
        // Place appliance
        const pos = hitFloor.point;
        
        let mesh;
        if (tool === 'light') {
          mesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff }));
          pos.y = 5;
        } else if (tool === 'fan') {
          mesh = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.2), new THREE.MeshStandardMaterial({ color: 0x88ccff }));
          pos.y = 6;
        } else {
          mesh = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.5), new THREE.MeshStandardMaterial({ color: 0x222222 }));
          pos.y = 2;
        }
        
        mesh.position.copy(pos);
        scene.add(mesh);

        // Draw wire from MCB
        const wireGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-10, 4, -5.5),
          new THREE.Vector3(pos.x, 8, -5.5),
          pos
        ]);
        const wireLine = new THREE.Line(wireGeo, new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 }));
        scene.add(wireLine);

        setPlacedItems(prev => [...prev, tool]);
        (window as any).selectedTool = null;
        setSelectedTool(null);
        addScore(20);
      }
    };

    window.addEventListener('click', onMouseClick);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(frameId);
      cleanup();
    };
  }, []);

  useEffect(() => {
    (window as any).selectedTool = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    if (placedItems.length === 3) {
      setVoltMessage("Awesome! All appliances are correctly wired in parallel circuits back to the MCB!");
      setLevelComplete(true);
      addScore(50);
      addStar();
    }
  }, [placedItems]);

  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className={`absolute inset-0 z-0 ${selectedTool ? 'cursor-crosshair' : 'cursor-default'}`} />
      
      <div className="absolute right-8 top-32 z-10 flex flex-col gap-6 pointer-events-auto w-[22rem]">
        <InfoCard 
          title="Parallel Circuits" 
          icon="🔌"
          colorClass="from-red-500 to-orange-500"
          borderColor="border-red-400"
        >
          <p>Homes are wired in <strong className="text-red-600">Parallel</strong>. This means each appliance gets its own direct path to the power source.</p>
          <p>If one light burns out, the rest of the house stays on!</p>
        </InfoCard>

        <div className="glass-panel p-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 border-b border-white/10">
            <h3 className="text-xl font-display text-white font-bold">Toolbox</h3>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {APPLIANCES.map(app => (
              <button
                key={app.id}
                disabled={placedItems.includes(app.id)}
                onClick={() => setSelectedTool(app.id)}
                className={`py-3 px-4 rounded-xl font-bold flex justify-between items-center transition-all border-2 ${
                  placedItems.includes(app.id) 
                    ? 'bg-slate-800 border-slate-700 text-slate-500 opacity-50' 
                    : selectedTool === app.id 
                      ? 'bg-yellow-400 border-white text-slate-900 scale-105 shadow-[0_0_15px_rgba(255,204,0,0.8)]' 
                      : `${app.bgClass} hover:opacity-80`
                }`}
              >
                {app.name}
                {placedItems.includes(app.id) && <span className="text-green-500 text-xl drop-shadow-md">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
