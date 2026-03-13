import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';
import { Switch } from '../ui/switch';

const APPLIANCES = [
  { id: 'light', name: 'LED Bulb', watts: 9, icon: '💡', color: 'bg-yellow-100' },
  { id: 'fan', name: 'Ceiling Fan', watts: 70, icon: '🌀', color: 'bg-blue-100' },
  { id: 'tv', name: 'Television', watts: 120, icon: '📺', color: 'bg-purple-100' },
  { id: 'fridge', name: 'Refrigerator', watts: 300, icon: '❄️', color: 'bg-cyan-100' },
  { id: 'washer', name: 'Washing Machine', watts: 500, icon: '🌊', color: 'bg-teal-100' },
];

export const Level6Wiring = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  
  const [activeItems, setActiveItems] = useState<Set<string>>(new Set());
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const objectsRef = useRef<Record<string, any>>({});
  const lightsRef = useRef<Map<string, THREE.PointLight>>(new Map());

  useEffect(() => {
    setVoltMessage("Toggle the switches to power the house! Watch out for the total power draw.");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    sceneRef.current = scene;
    
    camera.position.set(0, 10, 20);
    controls.target.set(0, 3, 0);

    // Floor and Walls
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 16),
      new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 8;
    scene.add(ceiling);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(24, 8, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    backWall.position.set(0, 4, -8);
    scene.add(backWall);

    // MCB Panel
    const mcb = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 3.5, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x2c3e50 })
    );
    mcb.position.set(5, 4, -7.8);
    scene.add(mcb);

    const createWire = (targetPos: THREE.Vector3) => {
      const wireGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(5, 4, -7.8),
        new THREE.Vector3(targetPos.x, 8, targetPos.z),
        targetPos
      ]);
      const wireMat = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
      scene.add(new THREE.Line(wireGeo, wireMat));
    };

    // Pre-place appliances
    // 1. LED Bulb
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.5), bulbMat);
    bulb.position.set(-5, 7.5, 0);
    scene.add(bulb);
    objectsRef.current['light'] = bulb;
    createWire(bulb.position);

    // 2. Ceiling Fan
    const fanGroup = new THREE.Group();
    fanGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x8b7355 })));
    for(let i=0; i<3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 0.8), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
      blade.position.x = 2;
      const pivot = new THREE.Group();
      pivot.rotation.y = (Math.PI * 2 / 3) * i;
      pivot.add(blade);
      fanGroup.add(pivot);
    }
    fanGroup.position.set(0, 7.5, -2);
    scene.add(fanGroup);
    objectsRef.current['fan'] = fanGroup;
    createWire(fanGroup.position);

    // 3. TV
    const tvGroup = new THREE.Group();
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.3), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.6, 0.35), new THREE.MeshStandardMaterial({ color: 0x000000 }));
    tvGroup.add(tvFrame);
    tvGroup.add(tvScreen);
    tvGroup.position.set(3, 3.5, -7.6);
    scene.add(tvGroup);
    objectsRef.current['tv'] = { group: tvGroup, screen: tvScreen };
    createWire(tvGroup.position);

    // 4. Fridge
    const fridgeGroup = new THREE.Group();
    const fridge = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 2), new THREE.MeshStandardMaterial({ color: 0xd0d0d0 }));
    const innerLight = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1, 1), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
    innerLight.position.set(0, 1.5, 0.6);
    fridgeGroup.add(fridge);
    fridgeGroup.add(innerLight);
    fridgeGroup.position.set(-7, 2.5, -6.5);
    scene.add(fridgeGroup);
    objectsRef.current['fridge'] = { group: fridgeGroup, innerLight };
    createWire(fridgeGroup.position);

    // 5. Washer
    const washer = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 2.5), new THREE.MeshStandardMaterial({ color: 0xf0f0f0 }));
    washer.position.set(-4, 1.25, -6);
    scene.add(washer);
    objectsRef.current['washer'] = washer;
    createWire(washer.position);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const activeIds = (window as any).activeAppliances || new Set();

      // Animations based on state
      if (activeIds.has('fan')) {
        objectsRef.current['fan'].rotation.y += 0.1;
      }
      if (activeIds.has('washer')) {
        objectsRef.current['washer'].position.x = -4 + Math.sin(Date.now() / 50) * 0.05;
      } else {
        objectsRef.current['washer'].position.x = -4;
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
    (window as any).activeAppliances = activeItems;
    const scene = sceneRef.current;
    if (!scene) return;

    // Handle Light
    if (activeItems.has('light')) {
      (objectsRef.current['light'].material as THREE.MeshStandardMaterial).emissive.setHex(0xffff88);
      (objectsRef.current['light'].material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
      if (!lightsRef.current.has('light')) {
        const pl = new THREE.PointLight(0xffff88, 1.5, 20);
        pl.position.copy(objectsRef.current['light'].position);
        scene.add(pl);
        lightsRef.current.set('light', pl);
      }
    } else {
      (objectsRef.current['light'].material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
      (objectsRef.current['light'].material as THREE.MeshStandardMaterial).color.setHex(0x555555);
      if (lightsRef.current.has('light')) {
        scene.remove(lightsRef.current.get('light')!);
        lightsRef.current.delete('light');
      }
    }

    // Handle TV
    if (activeItems.has('tv')) {
      (objectsRef.current['tv'].screen.material as THREE.MeshStandardMaterial).emissive.setHex(0x0066ff);
      if (!lightsRef.current.has('tv')) {
        const pl = new THREE.PointLight(0x0066ff, 1, 10);
        pl.position.copy(objectsRef.current['tv'].group.position);
        scene.add(pl);
        lightsRef.current.set('tv', pl);
      }
    } else {
      (objectsRef.current['tv'].screen.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
      if (lightsRef.current.has('tv')) {
        scene.remove(lightsRef.current.get('tv')!);
        lightsRef.current.delete('tv');
      }
    }

    // Handle Fridge
    if (activeItems.has('fridge')) {
      (objectsRef.current['fridge'].innerLight.material as THREE.MeshStandardMaterial).emissive.setHex(0xaaddff);
    } else {
      (objectsRef.current['fridge'].innerLight.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
    }

    // Check completion
    if (activeItems.size === APPLIANCES.length) {
      setVoltMessage("Fully Powered! Notice how the total power draw increased. This is why we have MCBs to protect the circuits from too much current!");
      setLevelComplete(true);
      addScore(50);
      addStar();
    }

  }, [activeItems]);

  const toggleItem = (id: string) => {
    setActiveItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalWatts = Array.from(activeItems).reduce((sum, id) => {
    const item = APPLIANCES.find(a => a.id === id);
    return sum + (item ? item.watts : 0);
  }, 0);

  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      <div className="absolute right-8 top-32 z-10 flex flex-col gap-6 pointer-events-auto w-[24rem]">
        <InfoCard 
          title="Home Wiring" 
          icon="🔌"
          colorClass="from-red-500 to-orange-500"
          borderColor="border-red-200"
        >
          <p>Homes are wired in <strong className="text-red-600">Parallel</strong>. Each appliance gets its own direct path to the power source.</p>
          <p>This allows us to turn appliances on and off independently!</p>
        </InfoCard>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-100 px-5 py-4 border-b border-slate-200 flex items-center gap-2">
            <span className="text-2xl">🎛️</span>
            <h3 className="text-xl font-display text-slate-800 font-bold">Control Panel</h3>
          </div>
          
          <div className="p-4 flex flex-col gap-3">
            {APPLIANCES.map(app => (
              <div 
                key={app.id}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors border border-transparent ${activeItems.has(app.id) ? `${app.color} border-slate-200` : 'bg-slate-50 hover:bg-slate-100 border-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{app.icon}</span>
                  <div>
                    <div className="font-bold text-lg text-slate-800 leading-tight">{app.name}</div>
                    <div className="text-sm text-slate-500">{app.watts} W</div>
                  </div>
                </div>
                <Switch 
                  checked={activeItems.has(app.id)}
                  onCheckedChange={() => toggleItem(app.id)}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            ))}
          </div>

          <div className="bg-slate-800 text-white p-5 border-t-4 border-slate-900 mt-2">
            <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Power Draw</div>
            <div className="font-display text-4xl text-yellow-400 font-bold flex items-baseline gap-2">
              {totalWatts} <span className="text-xl text-slate-300">Watts</span>
            </div>
            {activeItems.size === APPLIANCES.length && (
              <div className="mt-2 text-green-400 font-bold animate-bounce-in">⚡ Fully Powered!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};