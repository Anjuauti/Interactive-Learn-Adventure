import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

const CONSUMERS = [
  { id: 'light', name: 'LED Light', watts: 10, color: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(255,204,0,0.6)]' },
  { id: 'fan', name: 'Ceiling Fan', watts: 70, color: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' },
  { id: 'tv', name: 'Television', watts: 120, color: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.6)]' },
  { id: 'fridge', name: 'Refrigerator', watts: 300, color: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.6)]' },
];

export const Level7Consumption = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const meshesRef = useRef<Record<string, THREE.Mesh>>({});

  const totalWatts = Array.from(activeIds).reduce((sum, id) => {
    return sum + (CONSUMERS.find(c => c.id === id)?.watts || 0);
  }, 0);

  useEffect(() => {
    setVoltMessage("Turn on the appliances to see how much power they consume! Different devices need different amounts of energy.");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    
    camera.position.set(0, 8, 20);

    const createMesh = (id: string, geo: THREE.BufferGeometry, pos: [number, number, number], baseColor: number) => {
      const mat = new THREE.MeshStandardMaterial({ color: baseColor, emissive: 0x000000 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      scene.add(mesh);
      meshesRef.current[id] = mesh;
    };

    // Representational items
    createMesh('light', new THREE.SphereGeometry(1), [-6, 5, 0], 0x555555);
    createMesh('fan', new THREE.CylinderGeometry(2, 2, 0.2), [-2, 6, 0], 0x444444);
    createMesh('tv', new THREE.BoxGeometry(4, 2.5, 0.5), [3, 2, 0], 0x111111);
    createMesh('fridge', new THREE.BoxGeometry(2.5, 5, 2.5), [8, 2.5, 0], 0xaaaaaa);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Animate fan if active
      if ((window as any).activeSet?.has('fan')) {
        meshesRef.current['fan'].rotation.y += 0.2;
      }

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
    (window as any).activeSet = activeIds;

    // Update visuals based on active state
    Object.entries(meshesRef.current).forEach(([id, mesh]) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (activeIds.has(id)) {
        if (id === 'light') mat.emissive.setHex(0xffffff);
        if (id === 'tv') mat.emissive.setHex(0xaa00ff);
        if (id === 'fan') mat.emissive.setHex(0x0088ff);
        if (id === 'fridge') mat.emissive.setHex(0x00ffff);
        mat.emissiveIntensity = 1;
      } else {
        mat.emissive.setHex(0x000000);
      }
    });

    if (activeIds.size === CONSUMERS.length) {
      setVoltMessage("Wow! Running everything at once consumes a lot of Watts! This is why energy conservation is important.");
      setLevelComplete(true);
      addScore(100);
      addStar();
    }
  }, [activeIds]);

  const toggleAppliance = (id: string) => {
    setActiveIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      <div className="absolute right-8 top-32 z-10 flex flex-col gap-6 pointer-events-auto w-[24rem]">
        <InfoCard 
          title="Power Consumption" 
          icon="💡"
          colorClass="from-cyan-500 to-blue-600"
          borderColor="border-cyan-400"
        >
          <p>Power is measured in <strong className="text-cyan-600">Watts (W)</strong>.</p>
          <p>Devices that create heat or cooling (like a Fridge) use much more power than devices that just make light or compute data.</p>
        </InfoCard>

        <div className="glass-panel p-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 border-b border-white/10">
            <h3 className="text-xl font-display text-white font-bold">Smart Meter</h3>
          </div>
          <div className="p-5">
            <div className="mb-6 p-4 bg-slate-900 rounded-xl border-2 border-cyan-500 shadow-[inset_0_0_20px_rgba(0,255,255,0.2)]">
              <h3 className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1 opacity-80">Total Current Draw</h3>
              <div className="text-5xl font-mono text-cyan-400 tracking-wider text-glow-cyan">
                {totalWatts.toString().padStart(4, '0')} <span className="text-2xl text-cyan-600">W</span>
              </div>
            </div>

            <div className="space-y-3">
              {CONSUMERS.map(app => {
                const isActive = activeIds.has(app.id);
                return (
                  <div 
                    key={app.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                      isActive ? `bg-slate-800 border-slate-600 ${app.glow}` : 'bg-slate-800/50 border-transparent'
                    }`}
                  >
                    <div>
                      <Label htmlFor={app.id} className={`font-bold text-lg cursor-pointer transition-colors ${isActive ? app.color : 'text-white'}`}>
                        {app.name}
                      </Label>
                      <p className="text-sm text-slate-400">{app.watts} W</p>
                    </div>
                    <Switch 
                      id={app.id} 
                      checked={isActive}
                      onCheckedChange={() => toggleAppliance(app.id)}
                      className={`data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-400 data-[state=checked]:to-blue-500 scale-125 mr-2`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
